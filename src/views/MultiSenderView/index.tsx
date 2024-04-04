import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { SolanaLogo, ConnectWallet, Loader } from "components";
import styles from "./index.module.css";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Connection
} from "@solana/web3.js";
import {
  getAllDomains,
  performReverseLookup,
  getHashedName,
  getNameAccountKey,
  getTwitterRegistry,
  NameRegistryState,
  transferNameOwnership,
} from "@bonfida/spl-name-service";

import Papa from "papaparse";
import { TldParser } from "@onsol/tldparser";
import { Metaplex } from "@metaplex-foundation/js";
import { endpoint } from "pages/_app";

const walletPublicKey = "";

export const MultiSenderView: FC = ({}) => {
  const wallet = useWallet();
  const [walletToParsePublicKey, setWalletToParsePublicKey] =
    useState<string>(walletPublicKey);
  const { publicKey } = useWallet();

  const onUseWalletClick = () => {
    if (publicKey) {
      setWalletToParsePublicKey(publicKey?.toBase58());
    }
  };

  const [sendingType, setSendingType] = useState("");

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
            <ConnectWallet onUseWalletClick={onUseWalletClick} />
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="hero min-h-16 p-0 pt-10">
            <div className="text-center hero-content w-full">
              <div className="w-full">
                <h1 className="mb-5 text-5xl">
                  Multi Send Token <SolanaLogo />
                </h1>
                <h3 className="font-semibold text-xl pb-5">
                  Supports public address, .sol domain name,{" "}
                  <a
                    className="text-[#9B2DCA] underline"
                    target="_blank"
                    href="https://twitter.com/onsol_labs"
                    rel="noreferrer"
                  >
                    ANS
                  </a>{" "}
                  and Twitter handle with @
                </h3>

                {sendingType == "" && (
                  <div>
                    <div className="max-w-4xl mx-auto">
                      <ul className="text-left leading-10">
                        <li
                          className="m-5"
                          onClick={() => {
                            setSendingType("oneToken");
                          }}
                        >
                          <div className="p-4 hover:border">
                            <a className="text-4xl font-bold mb-5">
                              1 token - Multiple receivers
                            </a>
                            <div>Send one token to multiple receivers</div>
                          </div>
                        </li>

                        <li
                          className="m-5"
                          onClick={() => {
                            setSendingType("oneReceiver");
                          }}
                        >
                          <div className="p-4 hover:border">
                            <a className="text-4xl font-bold mb-5">
                              Multiple tokens - 1 receiver
                            </a>
                            <div>Send multiple tokens to one receiver</div>
                          </div>
                        </li>

                        <li
                          className="m-5"
                          onClick={() => {
                            setSendingType("csv");
                          }}
                        >
                          <div className="p-4 hover:border">
                            <a className="text-4xl font-bold mb-5">
                              Upload CSV file
                            </a>
                            <div>
                              Use a CSV file to multi send tokens and solana
                              domains
                            </div>
                          </div>
                        </li>
                        <li
                          className="m-5"
                          onClick={() => {
                            setSendingType("emergency");
                          }}
                        >
                          <div className="p-4 hover:border">
                            <a className="text-4xl font-bold mb-5">
                              Emergency send
                            </a>
                            <div>
                              Send all of your tokens and NFTS in a new wallet
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {sendingType != "" && (
                  <div className="flex">
                    <button
                      className="text-white font-semibold text-xl w-[6rem] h-[2rem] mb-2 bg-[#2C3B52] hover:bg-[#566274] rounded-xl border"
                      onClick={() => {
                        setSendingType("");
                      }}
                    >
                      ← Back
                    </button>
                  </div>
                )}

                {sendingType == "oneToken" && <OneToken />}
                {sendingType == "oneReceiver" && <OneReceiver />}
                {sendingType == "csv" && <CSV />}
                {sendingType == "emergency" && <Emergency />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function LoadingIndicator() {
  return (
    <div
      className="mt-[15%]"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Loader text="Fetching tokens..." />
    </div>
  );
}

function OneToken() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<any | null>();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [receiverList, setReceiverList] = useState([
    { receiver: "", amount: "1" },
    { receiver: "", amount: "1" },
    { receiver: "", amount: "1" },
    { receiver: "", amount: "1" },
    { receiver: "", amount: "1" },
  ]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const metaplex = new Metaplex(connection);
  const parser = new TldParser(connection);

  async function getUserTokens() {
    if (!wallet.publicKey) {
      setTokens([]);
      return;
    }

    const _userTokens = [{ tokenMint: "", tokenName: "Select a token" }];
    const allTokens: any = [];

    const myHeaders = new Headers();
    myHeaders.append("x-api-key", "AwM0UoO6r1w8XNOA");

    const tokenResponse = await fetch(
      "https://api.shyft.to/sol/v1/wallet/all_tokens?network=mainnet-beta&wallet=" +
      wallet.publicKey.toBase58(),
      { method: "GET", headers: myHeaders, redirect: "follow" }
    );
    const tokenInfo = (await tokenResponse.json()).result;

    const tokens = tokenInfo.filter((m: any) => {
      const balance = m.balance;
      return balance != 0;
    });

    tokens.map((token: any) => {
      const mint = token.address;
      let name = token.info.name.trim();
      if (name == "") {
        name = mint.slice(0, 4) + "..." + mint.slice(-4);
      }
      allTokens.push({
        tokenMint: mint,
        tokenName: name,
      });
    });

    console.log("User tokens", tokens);

    const NFTresponse = await fetch(
      "https://api.shyft.to/sol/v1/wallet/get_portfolio?network=mainnet-beta&wallet=" +
      wallet.publicKey.toBase58(),
      { method: "GET", headers: myHeaders, redirect: "follow" }
    );
    const NFTinfo = (await NFTresponse.json()).result.nfts;

    await Promise.all(
      NFTinfo.map(async (nft: any) => {
        const mint = nft.mintAddress;
        let name = nft.name.trim();
        if (name == "") {
          const NFTloaded = await metaplex
            .nfts()
            .findByMint({ mintAddress: new PublicKey(mint) });
          if (NFTloaded.json?.name && NFTloaded.json?.name != "") {
            name = NFTloaded.json?.name.trim();
          } else {
            name = mint.slice(0, 4) + "..." + mint.slice(-4);
          }
        }
        const index = allTokens.find((token: any) => token.tokenMint == mint);
        if (index == undefined) {
          allTokens.push({
            tokenMint: mint,
            tokenName: name,
          });
        }
      })
    );
    console.log("user NFT", NFTinfo);

    const domainResponse = await fetch(
      "https://api.shyft.to/sol/v1/wallet/get_domains?network=mainnet-beta&wallet=" +
      wallet.publicKey.toBase58(),
      { method: "GET", headers: myHeaders, redirect: "follow" }
    );
    const domainInfo = (await domainResponse.json()).result;
    domainInfo.map((domain: any) => {
      const mint = domain.name;
      const name = domain.name;
      allTokens.push({
        tokenMint: mint,
        tokenName: name,
      });
    });
    console.log("Bonfida domain: ", domainInfo);

    allTokens.push({
      tokenMint: "So11111111111111111111111111111111111111112",
      tokenName: "Solana",
    });

    allTokens.sort(function (a: any, b: any) {
      if (a.tokenName.toUpperCase() < b.tokenName.toUpperCase()) {
        return -1;
      }
      if (a.tokenName.toUpperCase() > b.tokenName.toUpperCase()) {
        return 1;
      }
      return 0;
    });
    const userTokens = _userTokens.concat(allTokens);
    console.log("user tokens: ", userTokens);
    setTokens(userTokens);
    setIsFetched(true);
  }

  useEffect(() => {
    getUserTokens();
  }, [wallet.publicKey]);

  const handleReceiverChange = (e: any, index: any) => {
    const { name, value } = e.target;
    const list: any = [...receiverList];
    list[index][name] = value;
    setReceiverList(list);
  };

  const send = async () => {
    if (publicKey != null) {
      try {
        const Receivers: any[] = [];
        for (let i = 0; i < receiverList.length; i++) {
          if (
            receiverList[i]["receiver"] != "" &&
            receiverList[i]["amount"] != ""
          ) {
            Receivers.push(receiverList[i]);
          }
        }

        if (Receivers.length != 0) {
          setIsSending(true);
          setError("");
          setSuccess(false);
          let Tx = new Transaction();
          for (let i = 0; i < Receivers.length; i++) {
            let receiverPubkey: PublicKey;
            if (Receivers[i]["receiver"].includes(".sol")) {
              const hashedName = await getHashedName(
                Receivers[i]["receiver"].replace(".sol", "")
              );
              const nameAccountKey = await getNameAccountKey(
                hashedName,
                undefined,
                new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
              );
              const owner = await NameRegistryState.retrieve(
                connection,
                nameAccountKey
              );
              receiverPubkey = owner.registry.owner;
            } else if (
              !Receivers[i]["receiver"].includes(".sol") &&
              Receivers[i]["receiver"].includes(".")
            ) {
              const owner = await parser.getOwnerFromDomainTld(
                Receivers[i]["receiver"]
              );
              if (owner != undefined) {
                receiverPubkey = owner;
                console.log(receiverPubkey.toBase58());
              } else {
                receiverPubkey = new PublicKey("");
              }
            } else if (Receivers[i]["receiver"].includes("@")) {
              const handle = Receivers[i]["receiver"].replace("@", "");
              const registry = await getTwitterRegistry(connection, handle);
              receiverPubkey = registry.owner;
            }
            // else if (
            //   !Receivers[i]["receiver"].includes(".") &&
            //   !Receivers[i]["receiver"].includes("@") &&
            //   !isValidSolanaAddress(Receivers[i]["receiver"])
            // ) {
            //   const url =
            //     "https://xnft-api-server.xnfts.dev/v1/users/fromUsername?username=" +
            //     Receivers[i]["receiver"];
            //   const response = await fetch(url);
            //   const responseData = await response.json();
            //   receiverPubkey = new PublicKey(
            //     responseData.user.public_keys.find(
            //       (key: any) => key.blockchain == "solana"
            //     ).public_key
            //   );
            // }
            else {
              receiverPubkey = new PublicKey(Receivers[i]["receiver"]);
            }

            if (token == "So11111111111111111111111111111111111111112") {
              Tx.add(
                SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: receiverPubkey,
                  lamports: Receivers[i]["amount"] * LAMPORTS_PER_SOL,
                })
              );
            } else {
              const mint = new PublicKey(token);
              const destination_account = await Token.getAssociatedTokenAddress(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                receiverPubkey
              );
              const account = await connection.getAccountInfo(
                destination_account
              );

              if (account == null) {
                const createIx = Token.createAssociatedTokenAccountInstruction(
                  ASSOCIATED_TOKEN_PROGRAM_ID,
                  TOKEN_PROGRAM_ID,
                  mint,
                  destination_account,
                  receiverPubkey,
                  publicKey
                );

                Tx.add(createIx);
              }
              const source_account = await Token.getAssociatedTokenAddress(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                publicKey
              );
              const balanceResp = await connection.getTokenAccountBalance(
                source_account
              );
              const decimals = balanceResp.value.decimals;
              const transferIx = Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                source_account,
                destination_account,
                publicKey,
                [],
                parseFloat(Receivers[i]["amount"]) * 10 ** decimals
              );
              Tx.add(transferIx);
            }
          }
          const signature = await wallet.sendTransaction(Tx, connection);
          const confirmed = await connection.confirmTransaction(
            signature,
            "processed"
          );
          console.log("confirmation", signature);
          getUserTokens();
          setIsSending(false);
          setSuccess(true);
          setSignature(signature);
        } else {
          setError("Please enter at least one receiver and one amount!");
        }
      } catch (error) {
        console.log(error);
        setIsSending(false);
        setSuccess(false);
        const err = (error as any)?.message;
        if (
          err.includes(
            "Cannot read properties of undefined (reading 'public_keys')"
          )
        ) {
          setError("It is not a valid Backpack username");
        } else {
          setError(err);
        }
      }
    }
  };

  if (isFetched == false) {
    return <LoadingIndicator />;
  } else {
    return (
      <div className="">
        <div className="mt-[4%] mb-[2%]">
          <select
            className="mb-[2%] md:w-[480px] text-left mx-4 text-black pl-1 border-2 border-black"
            required
            onChange={(e) => setToken(e.target.value)}
            style={{
              borderRadius: "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
            }}
          >
            {tokens.map((token: any) => {
              return (
                <option
                  key={token.tokenMint}
                  value={token.tokenMint}
                  label={token.tokenName}
                />
              );
            })}
          </select>
          <div className="mt-4">
            {receiverList.map((x, i) => {
              return (
                <div className="flex justify-center" key={i}>
                  <div>
                    <input
                      className="mb-[2%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                      name={"receiver"}
                      type="text"
                      placeholder="Receiver"
                      value={x.receiver}
                      onChange={(e) => handleReceiverChange(e, i)}
                      style={{
                        borderRadius:
                          "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                      }}
                    />

                    <input
                      className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                      name={"amount"}
                      type="text"
                      placeholder="Amount"
                      value={x.amount}
                      onChange={(e) => handleReceiverChange(e, i)}
                      style={{
                        borderRadius:
                          "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isSending ? (
          <button
            className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border"
            onClick={send}
          >
            Send
          </button>
        ) : (
          <button className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border">
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
            Sending
          </button>
        )}

        {success && (
          <div className="font-semibold text-xl mt-4">
            ✅ Successfuly sent! Check it{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={"https://solscan.io/tx/" + signature}
            >
              <strong className="underline">here</strong>
            </a>
          </div>
        )}

        {error != "" && (
          <div className="mt-4 font-semibold text-xl">❌ {error}</div>
        )}
      </div>
    );
  }
}

function OneReceiver() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<any | null>();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [receiver, setReceiver] = useState<string>("");
  const [tokensList, setTokenList] = useState([
    { token: "", amount: "1" },
    { token: "", amount: "1" },
    { token: "", amount: "1" },
    { token: "", amount: "1" },
    { token: "", amount: "1" },
  ]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const metaplex = new Metaplex(connection);
  const parser = new TldParser(connection);

  async function getUserTokens() {
    if (!wallet.publicKey) {
      setTokens([]);
      return;
    }

    const _userTokens = [{ tokenMint: "", tokenName: "Select a token" }];
    const allTokens: any = [];

    const myHeaders = new Headers();
    myHeaders.append("x-api-key", "AwM0UoO6r1w8XNOA");

    const tokenResponse = await fetch(
      "https://api.shyft.to/sol/v1/wallet/all_tokens?network=mainnet-beta&wallet=" +
      wallet.publicKey.toBase58(),
      { method: "GET", headers: myHeaders, redirect: "follow" }
    );
    const tokenInfo = (await tokenResponse.json()).result;

    const tokens = tokenInfo.filter((m: any) => {
      const balance = m.balance;
      return balance != 0;
    });

    tokens.map((token: any) => {
      const mint = token.address;
      let name = token.info.name.trim();
      if (name == "") {
        name = mint.slice(0, 4) + "..." + mint.slice(-4);
      }
      allTokens.push({
        tokenMint: mint,
        tokenName: name,
      });
    });

    console.log("User tokens", tokens);

    const NFTresponse = await fetch(
      "https://api.shyft.to/sol/v1/wallet/get_portfolio?network=mainnet-beta&wallet=" +
      wallet.publicKey.toBase58(),
      { method: "GET", headers: myHeaders, redirect: "follow" }
    );
    const NFTinfo = (await NFTresponse.json()).result.nfts;

    await Promise.all(
      NFTinfo.map(async (nft: any) => {
        const mint = nft.mintAddress;
        let name = nft.name.trim();
        if (name == "") {
          const NFTloaded = await metaplex
            .nfts()
            .findByMint({ mintAddress: new PublicKey(mint) });
          if (NFTloaded.json?.name && NFTloaded.json?.name != "") {
            name = NFTloaded.json?.name.trim();
          } else {
            name = mint.slice(0, 4) + "..." + mint.slice(-4);
          }
        }
        const index = allTokens.find((token: any) => token.tokenMint == mint);
        if (index == undefined) {
          allTokens.push({
            tokenMint: mint,
            tokenName: name,
          });
        }
      })
    );
    console.log("user NFT", NFTinfo);

    const domainResponse = await fetch(
      "https://api.shyft.to/sol/v1/wallet/get_domains?network=mainnet-beta&wallet=" +
      wallet.publicKey.toBase58(),
      { method: "GET", headers: myHeaders, redirect: "follow" }
    );
    const domainInfo = (await domainResponse.json()).result;
    domainInfo.map((domain: any) => {
      const mint = domain.name;
      const name = domain.name;
      allTokens.push({
        tokenMint: mint,
        tokenName: name,
      });
    });
    console.log("Bonfida domain: ", domainInfo);

    allTokens.push({
      tokenMint: "So11111111111111111111111111111111111111112",
      tokenName: "Solana",
    });

    allTokens.sort(function (a: any, b: any) {
      if (a.tokenName.toUpperCase() < b.tokenName.toUpperCase()) {
        return -1;
      }
      if (a.tokenName.toUpperCase() > b.tokenName.toUpperCase()) {
        return 1;
      }
      return 0;
    });
    const userTokens = _userTokens.concat(allTokens);
    console.log("user tokens: ", userTokens);
    setTokens(userTokens);
    setIsFetched(true);
  }

  useEffect(() => {
    getUserTokens();
  }, [wallet.publicKey]);

  const handleTokenChange = (e: any, index: any) => {
    const { name, value } = e.target;
    const list: any = [...tokensList];
    list[index][name] = value;
    setTokenList(list);
  };

  const send = async () => {
    if (publicKey != null) {
      try {
        const Tokens: any[] = [];
        for (let i = 0; i < tokensList.length; i++) {
          if (tokensList[i]["token"] != "" && tokensList[i]["amount"] != "") {
            Tokens.push(tokensList[i]);
          }
        }
        if (Tokens.length != 0) {
          setIsSending(true);
          setError("");
          setSuccess(false);

          let receiverPubkey: PublicKey;
          if (receiver.includes(".sol")) {
            const hashedName = await getHashedName(
              receiver.replace(".sol", "")
            );
            const nameAccountKey = await getNameAccountKey(
              hashedName,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
            );
            const owner = await NameRegistryState.retrieve(
              connection,
              nameAccountKey
            );
            receiverPubkey = owner.registry.owner;
          } else if (receiver.includes(".") && !receiver.includes(".sol")) {
            const owner = await parser.getOwnerFromDomainTld(receiver);
            if (owner != undefined) {
              receiverPubkey = owner;
              console.log(receiverPubkey.toBase58());
            } else {
              receiverPubkey = new PublicKey("");
            }
          } else if (receiver.includes("@")) {
            const handle = receiver.replace("@", "");
            const registry = await getTwitterRegistry(connection, handle);
            receiverPubkey = registry.owner;
          }
          // else if (
          //   !receiver.includes(".") &&
          //   !receiver.includes("@") &&
          //   !isValidSolanaAddress(receiver)
          // ) {
          //   const url =
          //     "https://xnft-api-server.xnfts.dev/v1/users/fromUsername?username=" +
          //     receiver;
          //   const response = await fetch(url);
          //   const responseData = await response.json();
          //   receiverPubkey = new PublicKey(
          //     responseData.user.public_keys.find(
          //       (key: any) => key.blockchain == "solana"
          //     ).public_key
          //   );
          // }
          else {
            receiverPubkey = new PublicKey(receiver);
          }

          let Tx = new Transaction();
          for (let i = 0; i < Tokens.length; i++) {
            const token = Tokens[i]["token"];
            const amount = Tokens[i]["amount"];

            if (token == "So11111111111111111111111111111111111111112") {
              Tx.add(
                SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: receiverPubkey,
                  lamports: amount * LAMPORTS_PER_SOL,
                })
              );
            } else if (token.includes(".sol")) {
              const domain = token.replace(".sol", "");
              const transferDomainIx = await transferNameOwnership(
                connection,
                domain,
                receiverPubkey,
                undefined,
                new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx")
              );
              Tx.add(transferDomainIx);
            } else {
              const mint = new PublicKey(token);
              const destination_account = await Token.getAssociatedTokenAddress(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                receiverPubkey
              );
              const account = await connection.getAccountInfo(
                destination_account
              );
              if (account == null) {
                const createIx = Token.createAssociatedTokenAccountInstruction(
                  ASSOCIATED_TOKEN_PROGRAM_ID,
                  TOKEN_PROGRAM_ID,
                  mint,
                  destination_account,
                  receiverPubkey,
                  publicKey
                );
                Tx.add(createIx);
              }
              const source_account = await Token.getAssociatedTokenAddress(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                publicKey
              );
              const balanceResp = await connection.getTokenAccountBalance(
                source_account
              );
              const decimals = balanceResp.value.decimals;
              const transferIx = Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                source_account,
                destination_account,
                publicKey,
                [],
                amount * 10 ** decimals
              );
              Tx.add(transferIx);
            }
          }
          const signature = await wallet.sendTransaction(Tx, connection);
          const confirmed = await connection.confirmTransaction(
            signature,
            "processed"
          );
          console.log("confirmation", signature);
          getUserTokens();
          setIsSending(false);
          setSuccess(true);
          setSignature(signature);
        } else {
          setError("Please enter at least one receiver and one amount!");
        }
      } catch (error) {
        console.log(error);
        setIsSending(false);
        setSuccess(false);
        const err = (error as any)?.message;
        if (
          err.includes(
            "Cannot read properties of undefined (reading 'public_keys')"
          )
        ) {
          setError("It is not a valid Backpack username");
        } else {
          setError(err);
        }
      }
    }
  };

  if (isFetched == false) {
    return <LoadingIndicator />;
  } else {
    return (
      <div className="">
        <div className="mt-[4%] mb-[2%]">
          <input
            className="mb-[2%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
            type="text"
            required
            placeholder="Receiver Address"
            onChange={(e) => setReceiver(e.target.value)}
            style={{
              borderRadius: "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
            }}
          />
          <div className="mt-4">
            {tokensList.map((x, i) => {
              return (
                <div className="flex justify-center" key={i}>
                  <div>
                    <select
                      className="mb-[2%] md:w-[480px] text-left mx-4 text-black pl-1 border-2 border-black"
                      name={"token"}
                      placeholder="Token"
                      value={x.token}
                      onChange={(e) => handleTokenChange(e, i)}
                      style={{
                        borderRadius:
                          "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                      }}
                    >
                      {tokens.map((token: any) => {
                        return (
                          <option
                            key={token.tokenMint}
                            value={token.tokenMint}
                            label={token.tokenName}
                          />
                        );
                      })}
                    </select>

                    <input
                      className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                      name={"amount"}
                      type="text"
                      placeholder="Amount"
                      value={x.amount}
                      onChange={(e) => handleTokenChange(e, i)}
                      style={{
                        borderRadius:
                          "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isSending ? (
          <button
            className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border"
            onClick={send}
          >
            Send
          </button>
        ) : (
          <button className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border">
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
            Sending
          </button>
        )}

        {success && (
          <div className="font-semibold text-xl mt-4">
            ✅ Successfuly sent! Check it{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={"https://solscan.io/tx/" + signature}
            >
              <strong className="underline">here</strong>
            </a>
          </div>
        )}

        {error != "" && (
          <div className="mt-4 font-semibold text-xl">❌ {error}</div>
        )}
      </div>
    );
  }
}

function CSV() {
  // const { connection } = useConnection();
  const connection = new Connection(endpoint);
  const wallet = useWallet();
  const { publicKey } = useWallet();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [currentTx, setCurrentTx] = useState<number | null>(null);
  const [totalTx, setTotalTx] = useState<number | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const parser = new TldParser(connection);

  const handleFileChange = async (event: any) => {
    setError("");
    setSuccess(false);
    const csvFile = event.target.files[0];
    const fileName = csvFile["name"];
    setFileName(fileName);
    const fileType = csvFile["type"];

    if (fileType != "text/csv") {
      setError("It is not a CSV file!");
    } else {
      setIsUploaded(true);
      Papa.parse(event.target.files[0], {
        header: false,
        skipEmptyLines: true,
        complete: function (results) {
          const rowsArray: any = [];

          // Iterating data to get column name
          results.data.map((d: any) => {
            rowsArray.push(Object.keys(d));
          });

          // Parsed Data Response in array format
          // @ts-ignore
          setCsvData(results.data);

          // get the headers of the CSV file
          setCsvHeaders(rowsArray[0]);
        },
      });
    }
  };

  const send = async () => {
    if (publicKey != null) {
      try {
        if (csvData.length != 0) {
          setIsSending(true);
          setSuccess(false);
          setError("");

          const nbTransferPerTx = 5;
          let nbTx: number;
          if (csvData.length % nbTransferPerTx == 0) {
            nbTx = csvData.length / nbTransferPerTx;
          } else {
            nbTx = Math.floor(csvData.length / nbTransferPerTx) + 1;
          }
          setTotalTx(nbTx);

          for (let i = 0; i < nbTx; i++) {
            let Tx = new Transaction();

            let bornSup: number;

            if (i == nbTx - 1) {
              bornSup = csvData.length;
            } else {
              bornSup = nbTransferPerTx * (i + 1);
            }

            setCurrentTx(i + 1);
            for (let j = nbTransferPerTx * i; j < bornSup; j++) {
              const receiver = csvData[j][csvHeaders[0]];
              console.log(receiver)
              let receiverPubkey: PublicKey;
              if (receiver.includes(".sol")) {
                const hashedName = await getHashedName(
                  receiver.replace(".sol", "")
                );
                const nameAccountKey = await getNameAccountKey(
                  hashedName,
                  undefined,
                  new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
                );
                const owner = await NameRegistryState.retrieve(
                  connection,
                  nameAccountKey
                );
                receiverPubkey = owner.registry.owner;
              } else if (!receiver.includes(".sol") && receiver.includes(".")) {
                const owner = await parser.getOwnerFromDomainTld(receiver);
                if (owner != undefined) {
                  receiverPubkey = owner;
                  console.log(receiverPubkey.toBase58());
                } else {
                  receiverPubkey = new PublicKey("");
                }
              } else if (receiver.includes("@")) {
                const handle = receiver.replace("@", "");
                const registry = await getTwitterRegistry(connection, handle);
                receiverPubkey = registry.owner;
              }
              // else if (
              //   !receiver.includes(".") &&
              //   !receiver.includes("@") &&
              //   !isValidSolanaAddress(receiver)
              // ) {
              //   const url =
              //     "https://xnft-api-server.xnfts.dev/v1/users/fromUsername?username=" +
              //     receiver;
              //   const response = await fetch(url);
              //   const responseData = await response.json();
              //   receiverPubkey = new PublicKey(
              //     responseData.user.public_keys.find(
              //       (key: any) => key.blockchain == "solana"
              //     ).public_key
              //   );
              // }
              else {
                receiverPubkey = new PublicKey(receiver);
              }

              const token = csvData[j][csvHeaders[1]];
              const amount = parseFloat(csvData[j][csvHeaders[2]]);

              if (token == "So11111111111111111111111111111111111111112") {
                Tx.add(
                  SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: receiverPubkey,
                    lamports: amount * LAMPORTS_PER_SOL,
                  })
                );
              } else if (token.includes(".sol")) {
                const transferDomainIx = await transferNameOwnership(
                  connection,
                  token.replace(".sol", ""),
                  receiverPubkey,
                  undefined,
                  new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
                );

                Tx.add(transferDomainIx);
              } else {
                const mint = new PublicKey(token);
                const destination_account =
                  await Token.getAssociatedTokenAddress(
                    ASSOCIATED_TOKEN_PROGRAM_ID,
                    TOKEN_PROGRAM_ID,
                    mint,
                    receiverPubkey
                  );
                const account = await connection.getAccountInfo(
                  destination_account
                );

                if (account == null) {
                  const createIx =
                    Token.createAssociatedTokenAccountInstruction(
                      ASSOCIATED_TOKEN_PROGRAM_ID,
                      TOKEN_PROGRAM_ID,
                      mint,
                      destination_account,
                      receiverPubkey,
                      publicKey
                    );

                  Tx.add(createIx);
                }
                const source_account = await Token.getAssociatedTokenAddress(
                  ASSOCIATED_TOKEN_PROGRAM_ID,
                  TOKEN_PROGRAM_ID,
                  mint,
                  publicKey
                );
                const balanceResp = await connection.getTokenAccountBalance(
                  source_account
                );
                const decimals = balanceResp.value.decimals;
                const TransferIx = Token.createTransferInstruction(
                  TOKEN_PROGRAM_ID,
                  source_account,
                  destination_account,
                  publicKey,
                  [],
                  amount * 10 ** decimals
                );
                Tx.add(TransferIx);
              }
            }
            const signature = await wallet.sendTransaction(Tx, connection)
            // const confirmed = await connection.confirmTransaction(
            //   signature,
            //   "processed"
            // );
            console.log("confirmation", signature);
          }
          setSuccess(true);
          setIsSending(false);
        } else {
          setError("The CSV file is empty");
        }
      } catch (error) {
        console.log(error);
        setIsSending(false);
        setSuccess(false);
        const err = (error as any)?.message;
        if (
          err.includes(
            "Cannot read properties of undefined (reading 'public_keys')"
          )
        ) {
          setError("It is not a valid Backpack username");
        } else {
          setError(err);
        }
      }
    }
  };

  return (
    <div>
      <h1 className="font-bold mb-5 text-3xl uppercase">Upload CSV file</h1>
      <div className="font-semibold text-xl">
        The file has to respect the following order:
        <br />{" "}
        <strong>receiver&apos;s address, token address, amount to send</strong>
      </div>
      <form className="mt-[5%] mb-4">
        <label
          htmlFor="file"
          className="text-white font-semibold text-xl rounded-full shadow-xl bg-[#414e63] border px-6 py-2 h-[40px] mb-[3%] uppercase hover:bg-[#2C3B52] hover:cursor-pointer"
        >
          Select file
          <input
            id="file"
            type="file"
            name="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      </form>

      {fileName != "" && (
        <div className="text-white font-semibold text-xl mb-2">
          {fileName} uploaded!
        </div>
      )}

      {!isSending && isUploaded && (
        <button
          className="mt-4 text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border"
          onClick={send}
        >
          Send
        </button>
      )}
      {isSending && (
        <button className="mt-4 text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border">
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
          Sending
        </button>
      )}

      {success && (
        <div className="font-semibold text-xl mt-4">✅ Successfuly sent!</div>
      )}

      {isSending && currentTx != 0 && totalTx != 0 && (
        <div className="font-semibold mt-4 mb-2 text-xl">
          Please confirm Tx: {currentTx}/{totalTx}
        </div>
      )}

      {error != "" && (
        <div className="mt-4 font-semibold text-xl">❌ {error}</div>
      )}
    </div>
  );
}

function Emergency() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = useWallet();
  const [receiver, setReceiver] = useState<string>("");
  const [currentTx, setCurrentTx] = useState<number | undefined>();
  const [nbTotalTx, setNbTotalTx] = useState<number | undefined>();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const nbTransferPerTx = 5;

  async function send() {
    if (publicKey != null) {
      try {
        setIsSending(true);
        setSuccess(false);
        setError("");

        const { value: splAccounts } =
          await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ),
          });
        const userTokens = splAccounts
          .filter((m) => {
            const amount = m.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
            return amount != 0;
          })
          .map((m) => {
            const mintAddress = m.account?.data?.parsed?.info?.mint;
            const account = m.pubkey.toBase58();
            const amount = parseInt(
              m.account?.data?.parsed?.info?.tokenAmount?.amount
            );
            return { mintAddress, account, amount };
          });

        const domains = await getAllDomains(connection, publicKey);
        for (let i = 0; i < domains.length; i++) {
          const domainName = await performReverseLookup(
            connection,
            new PublicKey(domains[i])
          );
          const domain = domainName + ".sol";
          userTokens.push({ mintAddress: domain, account: "", amount: 1 });
        }

        userTokens.push({
          mintAddress: "So11111111111111111111111111111111111111112",
          account: "",
          amount: 0,
        });

        const nbTokens = userTokens.length;

        let nbTx: number;

        if (nbTokens % nbTransferPerTx == 0) {
          nbTx = nbTokens / nbTransferPerTx;
        } else {
          nbTx = Math.floor(nbTokens / nbTransferPerTx) + 1;
        }

        setNbTotalTx(nbTx);

        const receiverPubkey = new PublicKey(receiver);

        for (let i = 0; i < nbTx; i++) {
          const Tx = new Transaction();

          let bornSup: number;

          if (i == nbTx - 1) {
            bornSup = nbTokens;
          } else {
            bornSup = nbTransferPerTx * (i + 1);
          }

          setCurrentTx(i + 1);
          for (let j = nbTransferPerTx * i; j < bornSup; j++) {
            if (
              userTokens[j].mintAddress ==
              "So11111111111111111111111111111111111111112"
            ) {
              const SOLBalance = await connection.getBalance(publicKey);
              Tx.add(
                SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: receiverPubkey,
                  lamports:
                    SOLBalance - (0.00001 + 0.00203928) * LAMPORTS_PER_SOL,
                })
              );
            } else if (userTokens[j].mintAddress.includes(".sol")) {
              const domain = userTokens[j].mintAddress.replace(".sol", "");
              const transferDomainIx = await transferNameOwnership(
                connection,
                domain,
                receiverPubkey,
                undefined,
                new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx")
              );
              Tx.add(transferDomainIx);
            } else {
              const mint = new PublicKey(userTokens[j].mintAddress);
              const source_account = new PublicKey(userTokens[j].account);
              const amount = userTokens[j].amount;

              const destination_account = await Token.getAssociatedTokenAddress(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                receiverPubkey
              );

              const account = await connection.getAccountInfo(
                destination_account
              );

              if (account == null) {
                const createIx = Token.createAssociatedTokenAccountInstruction(
                  ASSOCIATED_TOKEN_PROGRAM_ID,
                  TOKEN_PROGRAM_ID,
                  mint,
                  destination_account,
                  receiverPubkey,
                  publicKey
                );

                Tx.add(createIx);
              }

              const TransferIx = Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                source_account,
                destination_account,
                publicKey,
                [],
                amount
              );
              Tx.add(TransferIx);
            }
          }
          const signature = await wallet.sendTransaction(Tx, connection);
          const confirmed = await connection.confirmTransaction(
            signature,
            "processed"
          );
        }
        setSuccess(true);
        setIsSending(false);
      } catch (error) {
        console.log(error);
        setIsSending(false);
        setSuccess(false);
        const err = (error as any)?.message;
        if (
          err.includes(
            "Cannot read properties of undefined (reading 'public_keys')"
          )
        ) {
          setError("It is not a valid Backpack username");
        } else {
          setError(err);
        }
      }
    }
  }

  return (
    <div className="">
      <div className="font-semibold mt-[5%] mb-2 text-2xl">
        Send all your tokens, NFTs and domain names to a new wallet address
      </div>
      <input
        className="w-[400px] mx-4 mt-[5%] mb-2 text-black pl-1 border-2 border-black rounded-xl"
        type="text"
        placeholder="New wallet address"
        onChange={(e) => setReceiver(e.target.value)}
      />
      {!isSending ? (
        <button
          className="px-4 h-[2rem] text-white font-semibold text-xl rounded-xl bg-[#F00020] hover:bg-[#850606]"
          onClick={send}
        >
          Send
        </button>
      ) : (
        <button className="px-4 h-[2rem] text-white font-semibold text-xl rounded-xl bg-[#F00020] hover:bg-[#850606]">
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
          Sending
        </button>
      )}

      {success && (
        <div className="font-semibold text-xl mt-4">✅ Successfuly sent!</div>
      )}
      {isSending && currentTx != undefined && nbTotalTx != undefined && (
        <div className="font-semibold mt-4 mb-2 text-xl">
          Please confirm Tx: {currentTx}/{nbTotalTx}
        </div>
      )}

      {error != "" && (
        <div className="mt-4 font-semibold text-xl">❌ {error}</div>
      )}
    </div>
  );
}

const isValidSolanaAddress = (address: string) => {
  try {
    // this fn accepts Base58 character
    // and if it pass we suppose Solana address is valid
    new PublicKey(address);
    return true;
  } catch (error) {
    // Non-base58 character or can't be used as Solana address
    return false;
  }
};
