import { FC, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ComputeBudgetProgram, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import { getConnection } from "utils/getConnection";
import { getAssetsInfos } from "utils/getAssetsInfos";
import { Loader } from "components/Loader";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createCloseAccountInstruction } from "@solana/spl-token";
import { getEmptyTokenAccounts } from "utils/getEmptyAccounts";
import { Card } from "components/ui/card";
import { ADD_COMPUTE_UNIT_LIMIT_CU, ADD_COMPUTE_UNIT_PRICE_CU, CLOSE_ACCOUNT_CU } from "utils/CUPerInstruction";
import { AUTHORITY } from "config";
import { notify } from "utils/notifications";
import { getTotalLamports } from "utils/getTotalLamports";

export const CloseView: FC = ({ }) => {
  const wallet = useWallet();

  const networkConfig = useNetworkConfiguration();
  const networkSelected = networkConfig.networkConfiguration;

  const [connection, setConnection] = useState<Connection>();
  const [emptyAccounts, setEmptyAccounts] = useState<{ account: PublicKey, program: PublicKey, image: string, name: string, mint: string, lamports: number }[]>([]);
  const [assetsSelected, setAssetSelected] = useState<{ account: PublicKey, program: PublicKey, image: string, name: string, mint: string, lamports: number }[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [currentTx, setCurrentTx] = useState<number>();
  const [totalTx, setTotalTx] = useState<number>();
  const [totalLamports, setTotalLamports] = useState<number>();

  const nbPerTx = 20;

  useEffect(() => {
    const connection = getConnection(networkSelected);
    getEmptyAccounts();
    setConnection(connection);
  }, [networkConfig, wallet]);


  const getEmptyAccounts = async () => {
    if (wallet.publicKey) {
      setIsFetched(false);
      const connection = getConnection(networkSelected);
      const emptyTokenAccountsRegular = await getEmptyTokenAccounts(
        wallet.publicKey,
        connection,
        TOKEN_PROGRAM_ID,
      );
      const emptyTokenAccounts2022 = await getEmptyTokenAccounts(
        wallet.publicKey,
        connection,
        TOKEN_2022_PROGRAM_ID,
      );

      const emptyTokenAccounts = emptyTokenAccountsRegular.concat(
        emptyTokenAccounts2022,
      );

      const assetsWithInfos = await getAssetsInfos(emptyTokenAccounts, networkSelected);
      console.log(assetsWithInfos);
      const totalLamports = getTotalLamports(emptyTokenAccounts);
      setTotalLamports(totalLamports);
      setEmptyAccounts(assetsWithInfos);
      setIsFetched(true);
    }
  }

  function SelectButton(props: { assetsWithInfos: { account: PublicKey, program: PublicKey, image: string, name: string, mint: string, lamports: number } }) {
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
      if (assetsSelected.includes(props.assetsWithInfos)) {
        setIsSelected(true);
      } else {
        setIsSelected(false);
      }
    });
    return (
      <div>
        {!isSelected ? (
          <button
            className="font-bold py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl"
            onClick={() => {
              setIsSelected(true);
              assetsSelected.push(props.assetsWithInfos);
            }}
          >
            Select
          </button>
        ) : (
          <button
            className="font-bold py-1 px-2 bg-[#095228] border border-[#c8ab6e] rounded-xl"
            onClick={() => {
              setIsSelected(false);
              assetsSelected.splice(assetsSelected.indexOf(props.assetsWithInfos), 1);
            }}
          >
            Unselect
          </button>
        )}
      </div>
    );
  }

  const closeAccounts = async (assets: { account: PublicKey, program: PublicKey, image: string, name: string, mint: string, lamports: number }[]) => {

    if (assets.length == 0) {
      notify({ type: 'error', message: `Please choose at least one token account to close first!` });
    }
    else {
      setIsClosing(true);
      try {
        let nbTx: number;
        if (assets.length % nbPerTx == 0) {
          nbTx = assets.length / nbPerTx;
        } else {
          nbTx = Math.floor(assets.length / nbPerTx) + 1;
        }
        setTotalTx(nbTx);

        for (let i = 0; i < nbTx; i++) {
          setCurrentTx(i + 1);
          let bornSup: number;

          if (i == nbTx - 1) {
            bornSup = assets.length;
          } else {
            bornSup = nbPerTx * (i + 1);
          }

          let Tx = new Transaction().add(
            ComputeBudgetProgram.setComputeUnitPrice({
              microLamports: 1000,
            }),
            ComputeBudgetProgram.setComputeUnitLimit({
              units:
                bornSup * CLOSE_ACCOUNT_CU +
                ADD_COMPUTE_UNIT_PRICE_CU +
                ADD_COMPUTE_UNIT_LIMIT_CU
            }),);

          const NON_MEMO_IX_INDEX = 1;

          // inject an authority key to track this transaction on chain
          Tx.instructions[NON_MEMO_IX_INDEX].keys.push({
            pubkey: AUTHORITY,
            isWritable: false,
            isSigner: false,
          });

          for (let j = nbPerTx * i; j < bornSup; j++) {
            Tx.add(
              createCloseAccountInstruction(
                assets[j].account,
                wallet.publicKey,
                wallet.publicKey,
                [],
                assets[j].program,
              ),
            );
          }
          const signature = await wallet.sendTransaction(Tx, connection, { preflightCommitment: "confirmed" });
          let confirmed = false;
          let timeout = 0;
          while (!confirmed && timeout < 10000) {
            let status = await connection.getSignatureStatuses([signature]);
            if (status.value[0]?.confirmationStatus == "confirmed") {
              notify({ type: 'success', message: `Success!`, txid: signature });
              confirmed = true;
            }
            else {
              timeout += 500;
              await new Promise(r => setTimeout(r, 500));
            }
          }

          if (timeout == 1000) {
            notify({ type: 'error', message: `Tx timed-out. Try again` });
          }
        }
        await getEmptyAccounts();
        setIsClosing(false);
        setAssetSelected([]);
      }
      catch (error) {
        setIsClosing(false);
        const err = (error as any)?.message;
        notify({ type: 'error', message: err });
        setAssetSelected([]);
      }
    }
  }

  return (
    <div className="md:hero mx-auto w-full p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6 ">
          <h1 className="text-center text-5xl font-bold mb-8">
            Close token accounts and earn $SOL
          </h1>

          <div className="flex justify-center mb-4">
            <button onClick={() => closeAccounts(emptyAccounts)} className="mx-2 font-bold text-lg py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl">Close all accounts</button>
            <button onClick={() => closeAccounts(assetsSelected)} className="mx-2 font-bold text-lg py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl">Close accounts selected</button>
          </div>

          {isClosing &&
            <div className="flex justify-center mb-4">
              <div>
                <Loader text="Closing..." />
                <div> Please confirm Tx: {currentTx}/{totalTx}</div>
              </div>
            </div>
          }

          {wallet.publicKey && isFetched && <div className="text-center mb-4 font-bold text-lg">You can get up to {totalLamports} SOL!</div>}
          {wallet.publicKey && isFetched && emptyAccounts.length == 0 ?
            <div className="text-center">No account to close</div> :
            <div className="grid grid-cols-4 gap-4">
              {emptyAccounts.map((account, key) => {
                return (
                  <Card key={key} className="flex justify-center">
                    <div>
                      <img src={account.image} className="w-[160px] h-[160px] mt-2"></img>
                      <div className="text-center mt-2 text-xs">
                        {account.name != undefined ? account.name : "Unknown token"}
                      </div>
                      <div className="flex justify-center my-2">
                        <SelectButton assetsWithInfos={account} />
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`https://solscan.io/token/${account.mint}`}
                          className="mx-2 font-bold py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl">
                          Info
                        </a>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          }

          {!wallet.publicKey && <div className="text-center font-bold mt-4 text-xl">Please, connect your wallet!</div>}

          {wallet.publicKey && !isFetched && <Loader text="Fetching assets..." />}
        </div>
      </div>
    </div>
  );
};