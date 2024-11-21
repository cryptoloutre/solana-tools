import { FC, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import { getConnection } from "utils/getConnection";
import { notify } from "utils/notifications";
import { TOKEN_2022_PROGRAM_ID, unpackAccount, getTransferFeeAmount } from "@solana/spl-token";
import { confirmTransaction } from "utils/confirmTransaction";
import { getWithdrawTransactions } from "utils/getWithdrawTransactions";

export const ClaimFeesView: FC = ({ }) => {
  const wallet = useWallet();

  const networkConfig = useNetworkConfiguration();
  const networkSelected = networkConfig.networkConfiguration;

  const [connection, setConnection] = useState<Connection>();

  useEffect(() => {
    const connection = getConnection(networkSelected);
    setConnection(connection)
  }, [networkConfig]);

  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [feesAmount, setFeesAmount] = useState<number>(0);
  const [feesChecked, setFeesChecked] = useState<boolean>(false);
  const [checkingFees, setCheckingFees] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<PublicKey[]>([]);


  const checkFees = async () => {
    try {
      console.log("checking...");
      setCheckingFees(true);
      setFeesChecked(false);
      setSuccess(false);
      let amount = BigInt(0);
      const tokenInfo = await connection.getParsedAccountInfo(new PublicKey(tokenAddress));
      console.log(tokenInfo)

      // @ts-ignore
      const decimals = tokenInfo.value?.data.parsed.info.decimals;
      // grabs all of the token accounts for a given mint
      const accounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
        commitment: "confirmed",
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: tokenAddress,
            },
          },
        ],
      });

      const accountsToWithdrawFrom = [];
      for (const accountInfo of accounts) {
        const unpackedAccount = unpackAccount(
          accountInfo.pubkey,
          accountInfo.account,
          TOKEN_2022_PROGRAM_ID,
        );

        // If there is withheld tokens add it to our list
        const transferFeeAmount = getTransferFeeAmount(unpackedAccount);
        if (
          transferFeeAmount != null &&
          transferFeeAmount.withheldAmount > BigInt(0)
        ) {
          accountsToWithdrawFrom.push(accountInfo.pubkey);
          amount += transferFeeAmount.withheldAmount;
        }
      }
      setFeesAmount(Number(amount) / (10 ** decimals));
      setAccounts(accountsToWithdrawFrom);
      setCheckingFees(false);
      setFeesChecked(true);
    } catch (error) {
      setCheckingFees(false);
      const err = (error as any)?.message;
      notify({ type: 'error', message: err });
    }
  }

  const claim = async () => {
    try {
      setClaiming(true);
      setSuccess(false);

      const transactions = await getWithdrawTransactions(accounts, tokenAddress, connection, wallet.publicKey);

      notify({ type: 'information', message: `Please sign the transactions` });
      const signedTransactions = await wallet.signAllTransactions(transactions);
      for (let n = 0; n < signedTransactions.length; n++) {
        const signature = await connection.sendRawTransaction(signedTransactions[n].serialize(), {
          skipPreflight: true
        });
        await confirmTransaction(connection, signature);
      }

      setClaiming(false);
      setSuccess(true);
    } catch (error) {
      setClaiming(false);
      const err = (error as any)?.message;
      notify({ type: 'error', message: err });
    }
  };

  return (
    <div className="md:hero mx-auto w-full p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6 ">
          <h1 className="text-center text-5xl font-bold mb-8">
            Claim Token2022&apos;s transfer fees
          </h1>

          <div>
            <div className="flex justify-center mt-[20%]">
              <input
                className="md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                type="text"
                placeholder="Token Address"
                onChange={(e) => {
                  setTokenAddress(e.target.value);
                  setFeesChecked(false);
                }}
              />
            </div>
            <div className="flex justify-center">
              {!checkingFees ?
                <button className="mx-2 mt-4 font-bold text-lg py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl" onClick={checkFees}>
                  Check fees amount
                </button> :
                <button className="mx-2 mt-4 font-bold text-lg py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl">
                  <svg
                    role="status"
                    className="inline mr-3 w-4 h-4 text-white animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                  Checking fees...
                </button>
              }
            </div>
            {feesChecked &&
              <div>
                {feesAmount != 0 ?
                  <div>
                    <div className="flex justify-center">
                      {!success ?
                        <div className="flex items-center w-[50%] justify-center p-4 mt-4 font-bold text-lg text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                          <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                          </svg>
                          <span className="sr-only">Info</span>
                          <div className="ml-2">
                            You can claim {feesAmount} tokens!
                          </div>
                        </div> :
                        <div className="flex items-center w-[50%] justify-center p-4 mt-4 font-bold text-lg text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                          <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                          </svg>
                          <span className="sr-only">Info</span>
                          <div className="ml-2">
                            {feesAmount} tokens claimed!
                          </div>
                        </div>
                      }
                    </div>
                    <div className="flex justify-center">
                      {!claiming ?
                        <button className="mx-2 mt-4 font-bold text-lg py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl" onClick={claim}>
                          Claim fees
                        </button> :
                        <button className="mx-2 mt-4 font-bold text-lg py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl" onClick={claim}>
                          <svg
                            role="status"
                            className="inline mr-3 w-4 h-4 text-white animate-spin"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="#E5E7EB"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentColor"
                            />
                          </svg>
                          Claiming...
                        </button>
                      }
                    </div>
                  </div> :
                  <div className="flex justify-center">
                    <div className="flex items-center w-[50%] justify-center p-4 mt-4 font-bold text-lg text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                      <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                      </svg>
                      <span className="sr-only">Info</span>
                      <div className="ml-2">
                        No token to claim!
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div >
  );
};