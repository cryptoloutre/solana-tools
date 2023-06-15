import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { Loader } from "components";
import styles from "./index.module.css";

import { PublicKey, Transaction } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { ENV, TokenListProvider } from "@solana/spl-token-registry";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getTokensMetadata } from "utils/getTokensMetadata";

export const CloseAccountView: FC = ({}) => {
  const { connection } = useConnection();

  const wallet = useWallet();
  const metaplex = new Metaplex(connection);

  const [emptyAccounts, setEmptyAccounts] = useState<any | null>(null);
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<number | null>(null);
  const [totalTx, setTotalTx] = useState<number | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [allSelected, setAllSelected] = useState(false);
  const [toClose, setToClose] = useState<string[]>([]);

  async function getUserEmptyAccount() {
    if (!wallet.publicKey) {
      setEmptyAccounts([]);
      return;
    }
    const publickey = wallet.publicKey;
    setIsFetched(false);

    const allTokens:any = [];

    const myHeaders = new Headers();
    myHeaders.append("x-api-key", "AwM0UoO6r1w8XNOA");

    const tokenResponse = await fetch(
      "https://api.shyft.to/sol/v1/wallet/all_tokens?network=mainnet-beta&wallet=" +
      publickey.toBase58(),
      { method: "GET", headers: myHeaders, redirect: "follow" }
    );
    const tokenInfo = (await tokenResponse.json()).result;

    const tokens = tokenInfo.filter((m: any) => {
      const balance = m.balance;
      return balance == 0;
    });

    tokens.map((token: any) => {
      const mint = token.address;
      const logoURI = token.info.image != "" ? token.info.image : "https://arweave.net/WCMNR4N-4zKmkVcxcO2WImlr2XBAlSWOOKBRHLOWXNA";
      const tokenAccount = token.associated_account;
      const amount = token.balance;
      let name = token.info.name.trim();
      if (name == "") {
        name = mint.slice(0, 4) + "..." + mint.slice(-4);
      }
      allTokens.push({
        name: name,
        logoURI: logoURI,
        tokenAccount: tokenAccount,
        mint: mint,
        amount: amount
      });
    });

    const { value: splAccounts } =
      await connection.getParsedTokenAccountsByOwner(
        publickey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        },
        "processed"
      );

      const myNFTEmptyAccounts:any = []

    const _myNFTEmptyAccounts = splAccounts
      .filter((m) => {
        const amount = m.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
        return amount == 0;
      })
      .map((m) => {
        const tokenAccountaddress = m.pubkey.toBase58();
        const mintAdddress = m.account?.data?.parsed?.info?.mint;
        const _tokenAccount = allTokens.find((token: any) => token.tokenAccount == tokenAccountaddress);
        if (_tokenAccount == undefined) {
          myNFTEmptyAccounts.push({ tokenAccountaddress, mintAdddress });
        }
      });

      console.log(myNFTEmptyAccounts)

      
      const myNFTEmptyAccountsMetadata = await getTokensMetadata(myNFTEmptyAccounts, connection);
      const userEmptyAccounts = allTokens.concat(myNFTEmptyAccountsMetadata)

      userEmptyAccounts.sort(function (a:any, b:any) {
        if (a.name.toUpperCase() < b.name.toUpperCase()) {
          return -1;
        }
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }
        return 0;
      });

    setEmptyAccounts(userEmptyAccounts);
    setIsFetched(true);
    console.log("my empty accounts", userEmptyAccounts);
  }

  useEffect(() => {
    getUserEmptyAccount();
  }, [wallet.publicKey]);

  function SelectButton(props: { tokenAccount: any }) {
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
      if (toClose.includes(props.tokenAccount)) {
        setIsSelected(true);
      } else {
        setIsSelected(false);
      }
    });
    return (
      <div>
        {!isSelected ? (
          <button
            className="py-2 px-2 font-bold rounded-xl text-xs bg-[#663b99] hover:bg-[#36185b] uppercase sm:ml-1 mb-2 sm:mb-4"
            onClick={() => {
              setIsSelected(true);
              toClose.push(props.tokenAccount);
            }}
          >
            Select
          </button>
        ) : (
          <button
            className="py-2 px-2 font-bold rounded-xl text-xs bg-[#36185b] hover:bg-[#663b99] uppercase sm:ml-1 mb-2 sm:mb-4"
            onClick={() => {
              setIsSelected(false);
              toClose.splice(toClose.indexOf(props.tokenAccount), 1);
            }}
          >
            Unselect
          </button>
        )}
      </div>
    );
  }

  const CloseAccounts = async () => {
    const publickey = wallet.publicKey;
    try {
      if (toClose[0] != undefined && publickey) {
        setIsClosing(true);
        setSuccess(false);
        setMessage("");
        const nbPerTx = 5;
        let nbTx: number;
        if (toClose.length % nbPerTx == 0) {
          nbTx = toClose.length / nbPerTx;
        } else {
          nbTx = Math.floor(toClose.length / nbPerTx) + 1;
        }
        setTotalTx(nbTx);

        for (let i = 0; i < nbTx; i++) {
          setCurrentTx(i + 1);
          let Tx = new Transaction();

          let bornSup: number;

          if (i == nbTx - 1) {
            bornSup = toClose.length;
          } else {
            bornSup = nbPerTx * (i + 1);
          }

          for (let j = nbPerTx * i; j < bornSup; j++) {
            const associatedAddress = new PublicKey(toClose[j]);

            const closeInstruction = await Token.createCloseAccountInstruction(
              TOKEN_PROGRAM_ID,
              associatedAddress,
              publickey,
              publickey,
              []
            );
            Tx.add(closeInstruction);
          }

          const signature = await wallet.sendTransaction(Tx, connection);
          const confirmed = await connection.confirmTransaction(
            signature,
            "processed"
          );
          console.log("confirmation", signature);
        }
        setToClose([]);
        setAllSelected(false);
        setIsClosing(false);
        setSuccess(true);
        await getUserEmptyAccount();
      } else {
        setMessage("Please choose at least one token account to close first!");
        setSuccess(false);
      }
    } catch (error) {
      await getUserEmptyAccount();
      setToClose([]);
      setAllSelected(false);
      setIsClosing(false);
      console.log(error);
    }
  };

  const SelectAll = () => {
    const _toClose = emptyAccounts.map((token: any) => {
      const tokenAccount = token.tokenAccount;
      return tokenAccount;
    });
    setToClose(_toClose);
    setAllSelected(true);
  };

  const UnselectAll = () => {
    setToClose([]);
    setAllSelected(false);
  };

  return (
    <div className="container mx-auto max-w-6xl p-8 2xl:px-0">
      <div className={styles.container}>
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box flex justify-around">
          <div className="flex-1 px-2">
            <div className="text-sm breadcrumbs">
              <ul className="text-xs sm:text-xl">
                <li>
                  <Link href="/">
                    <a>SOLANA-TOOLS</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex-none">
            <WalletMultiButton className="btn btn-ghost" />
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="hero min-h-16 p-0 pt-10">
            <div className="text-center hero-content w-full">
              <div className="w-full">
                <h1 className="mb-5 text-5xl">
                  Close empty account and get $SOL back
                </h1>

                <div className="mb-auto my-10">
                  {!wallet.publicKey && (
                    <div className="text-center text-2xl pt-16">
                      Please, connect your wallet!
                    </div>
                  )}

                  {!isFetched && wallet.publicKey && (
                    <div className="mt-[25%]">
                      <Loader text="Fetching tokens..." />
                    </div>
                  )}
                  {isFetched && wallet.publicKey && (
                    <div>
                      {emptyAccounts.length ? (
                        <div className="flex justify-center">
                          {!allSelected ? (
                            <button
                              className="btn mx-2"
                              onClick={() => SelectAll()}
                            >
                              Select All
                            </button>
                          ) : (
                            <button
                              className="btn mx-2"
                              onClick={() => UnselectAll()}
                            >
                              Unselect All
                            </button>
                          )}

                          {!isClosing ? (
                            <button
                              className="btn mx-2"
                              onClick={() => CloseAccounts()}
                            >
                              Close All Selected
                            </button>
                          ) : (
                            <button className="btn mx-2">
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
                              Closing...
                            </button>
                          )}
                        </div>
                      ) : null}
                      <div className="my-2">
                        {isClosing && currentTx != null && totalTx != null ? (
                          <div>
                            Please confirm Tx: {currentTx}/{totalTx}
                          </div>
                        ) : (
                          <div className="h-[27px]"></div>
                        )}
                      </div>

                      <div className="my-2">
                        {success ? (
                          <div className="text-[#00FF00]">
                            Successfully closed!
                          </div>
                        ) : (
                          <div className="h-[27px]"></div>
                        )}
                      </div>

                      <div className="my-2">
                        {message != "" ? (
                          <div className="text-[#FF0000]">{message}</div>
                        ) : (
                          <div className="h-[27px]"></div>
                        )}
                      </div>

                      {!emptyAccounts.length ? (
                        <div className="text-center text-2xl pt-16">
                          No empty account found in this wallet
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                          {emptyAccounts?.map((token: any) => (
                            <div
                              key={token}
                              className={`card bg-[#15263F] max-w-xs rounded-xl border-2 border-[#FFFFFF]`}
                            >
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    justifyContent: "center",
                                  }}
                                >
                                  <img
                                    src={token.logoURI}
                                    className="mt-4 rounded-xl w-[125px] h-[125px] sm:w-[200px] sm:h-[200px] md:w-[160px] md:h-[160px] lg:w-[200px] lg:h-[200px] "
                                  ></img>
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    lineHeight: "19.08px",
                                    marginLeft: "10px",
                                  }}
                                >
                                  {token.name}
                                </div>
                              </div>

                              <div className="flex justify-around my-2">
                                <SelectButton
                                  tokenAccount={token.tokenAccount}
                                />
                                <a
                                  target="_blank"
                                  rel="noreferrer"
                                  className="py-2 px-2 font-bold rounded-xl text-xs bg-[#9945FF] hover:bg-[#7a37cc] uppercase sm:ml-1 mb-2 sm:mb-4"
                                  href={
                                    "https://solscan.io/token/" + token.mint
                                  }
                                >
                                  Check Solscan
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
