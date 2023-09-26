import Link from "next/link";
import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { ConnectWallet } from "components";
import styles from "./index.module.css";

import {
  Metaplex,
  bundlrStorage,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import html2canvas from "html2canvas";
import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@bonfida/spl-name-service";
import { TldParser } from "@onsol/tldparser";

const walletPublicKey = "";

export const SUATMMView: FC = ({}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [walletToParsePublicKey, setWalletToParsePublicKey] =
    useState<string>(walletPublicKey);
  const { publicKey } = useWallet();

  const onUseWalletClick = () => {
    if (publicKey) {
      setWalletToParsePublicKey(publicKey?.toBase58());
    }
  };
  const parser = new TldParser(connection);
  const [wanted, setWanted] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  // const [NFTImage, setNFTImage] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [toAddress, setToAddress] = useState("");

  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet))
    .use(bundlrStorage());

  //Generate the design of the NFT message
  const generateImg = async () => {
    const canvas = await html2canvas(document.getElementById("canvas")!);
    const img = canvas.toDataURL("image/png");
    return img;
  };

  const HandleMintChange = async (e: any) => {
    setWanted(e.target.value);
    setIsGenerated(false);
    setError("");
    setIsSent(false);
  };

  const HandleUsernameChange = async (e: any) => {
    setUsername(e.target.value);
    setIsGenerated(false);
    setError("");
    setIsSent(false);
  };

  // Generate the info of the NFT message
  const GenerateNFT = async () => {
    try {
      setIsSent(false);
      setError("");
      setIsGenerating(true);
      const _NFTName = await getNFTName();
      // const _NFTImage = await getNFTImage();
      setName(_NFTName);
      // if (_NFTImage != undefined) {
      //   setNFTImage(_NFTImage)
      // }
      setToAddress("");
      let data: any;
      let owner: string;
      if (wanted.includes(".sol")) {
        const hashedName = await getHashedName(wanted.replace(".sol", ""));
        const nameAccountKey = await getNameAccountKey(
          hashedName,
          undefined,
          new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
        );
        const _owner = await NameRegistryState.retrieve(
          connection,
          nameAccountKey
        );
        owner = _owner.registry.owner.toBase58();
      } else if (!wanted.includes(".sol") && wanted.includes(".")) {
        const _owner = await parser.getOwnerFromDomainTld(wanted);
        if (_owner != undefined) {
          owner = _owner.toBase58();
          console.log(owner);
        } else {
          owner = "";
        }
      } else {
        const largestAccounts = await connection.getTokenLargestAccounts(
          new PublicKey(wanted)
        );
        const largestAccountInfo = await connection.getParsedAccountInfo(
          largestAccounts.value[0].address
        );

        data = largestAccountInfo.value?.data;
        const _owner = data.parsed.info.owner;
        const _ownerPK = new PublicKey(_owner);
        const isOnCurve = PublicKey.isOnCurve(_ownerPK.toBytes()); // if false, _owner is a PDA = marketplace
        console.log(_owner);
        console.log(isOnCurve);

        if (isOnCurve) {
          owner = _owner;
        } else {
          const url =
            "https://api.helius.xyz/v0/addresses/" +
            wanted +
            "/transactions?api-key=634713f0-b4f2-41dc-af7f-ed7d60bd70e2";
          try {
            const response = await fetch(url);
            const data = await response.json();
            let isAListing = false;
            let item = 0;
            while (!isAListing) {
              const txInfo = data[item];
              if (txInfo.type == "NFT_LISTING") {
                owner = txInfo.feePayer;
                isAListing = true;
              } else {
                item += 1;
              }
            }
            console.log("parsed transactions: ", data);
          } catch (error) {
            console.log(error);
            owner = "";
          }
        }

        // @ts-ignore
        console.log("real owner", owner);
      }
      // @ts-ignore
      setToAddress(owner);
      setIsGenerated(true);
      setIsGenerating(false);
    } catch (error) {
      const err = (error as any)?.message;
      setError(err);
      setIsGenerating(false);
    }
  };

  // Get the name of the wanted NFT
  const getNFTName = async () => {
    let name;
    if (wanted.includes(".")) {
      name = wanted;
    } else {
      const mint = new PublicKey(wanted);
      const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
      name = nft.name;
    }
    return name;
  };
  // // Get the image of the wanted NFT
  // const getNFTImage = async () => {
  //   const mint = new PublicKey(NFTWanted);
  //   const nft = await metaplex.nfts().findByMint(mint);
  //   const image = nft.metadata.image
  //   return image
  // };

  const CreateAndSendNFT = async () => {
    try {
      setSending(true);
      const image = await generateImg();
      console.log(image);

      const _name = "SUATM² " + name;
      const description =
        "I want to buy your " +
        name +
        ", please contact me on twitter @" +
        username +
        " ( Made with https://solanatools.vercel.app/suatmm)";
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: _name,
        description: description,
        image: image,
        external_url: "https://solanatools.vercel.app/",
      });
      if (uri) {
        console.log(uri);

        const { nft } = await metaplex.nfts().create({
          name: _name,
          uri: uri,
          sellerFeeBasisPoints: 0,
          tokenOwner: new PublicKey(toAddress),
        });

        if (nft) {
          setSending(false);
          setIsSent(true);
          setIsGenerated(false);
        }
      }
    } catch (error) {
      setSending(false);
      const err = (error as any)?.message;
      if (err.includes("could not find mint")) {
        setError("The mint address seems to be wrong, verify it");
      } else if (err.includes("Invalid name account provided")) {
        setError("This solana domain name does not exist");
      }
    }
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
            <ConnectWallet onUseWalletClick={onUseWalletClick} />
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="hero min-h-16 p-0 pt-10">
            <div className="text-center hero-content w-full">
              <div className="w-full">
                <h1 className="mb-5 text-5xl">
                  Send a NFT Message to the desired NFT, .sol domain name or{" "}
                  <a
                    className="text-[#9B2DCA] underline"
                    target="_blank"
                    href="https://twitter.com/onsol_labs"
                    rel="noreferrer"
                  >
                    ANS
                  </a>{" "}
                  owner
                </h1>

                <div>
                  <form className="mt-[5%] mb-[3%]">
                    <label className="input-group input-group-vertical input-group-lg"></label>
                    <input
                      className="mb-[1%] text-black pl-1 border-2 border-black sm:w-[520px] w-[100%] text-center"
                      type="text"
                      required
                      placeholder="NFT mint address/.sol/ANS"
                      onChange={HandleMintChange}
                      style={{
                        borderRadius:
                          "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                      }}
                    />
                    <label className="input-group input-group-vertical input-group-lg"></label>
                    <input
                      className="mb-[1%] text-black pl-1 border-2 border-black sm:w-[520px] w-[100%] text-center"
                      type="text"
                      required
                      placeholder="Twitter username (without @)"
                      onChange={HandleUsernameChange}
                      style={{
                        borderRadius:
                          "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                      }}
                    />
                  </form>
                  {wanted != "" && username != "" && !isGenerating &&(
                    <button
                      className="text-white font-semibold text-xl rounded-full px-2 py-1 ml-2 bg-[#9945FF]"
                      onClick={GenerateNFT}
                    >
                      Generate message
                    </button>
                  )}
                  {wanted != "" && username != "" && isGenerating && (
                    <button
                      className="text-white font-semibold text-xl rounded-full px-2 py-1 ml-2 bg-[#9945FF]"
                      onClick={GenerateNFT}
                    >
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
                      </svg> Message generating...
                    </button>
                  )}

                  {isGenerated && (
                    <div>
                      <div className="flex justify-center mt-4">
                        <div
                          className="sm:w-[250px] sm:h-[250px] w-[150px] h-[150px] bg-[#FF0000]"
                          id="canvas"
                        >
                          <p className="mt-[25%] text-sm sm:text-lg">
                            I want to buy your <br /> <strong>{name}</strong>
                          </p>
                          <p className="mt-[5%] text-sm sm:text-lg">
                            Contact me on Twitter <br />
                            <strong>@{username}</strong>
                          </p>
                        </div>
                      </div>
                      <div>
                        {toAddress != "" && (
                          <div className="mt-2">
                            Your message will be sent to{" "}
                            <span className="font-bold">{toAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {sending == false && isGenerated && (
                    <button
                      className="text-white font-semibold text-xl rounded-full shadow-xl bg-[#414e63] hover:bg-[#2C3B52] p-3 border mt-[3%] uppercase"
                      onClick={CreateAndSendNFT}
                    >
                      Send NFT Message
                    </button>
                  )}

                  {sending == true && isGenerated && (
                    <button className="text-white font-semibold text-xl rounded-full shadow-xl bg-[#2C3B52] border p-3 mt-[3%] uppercase">
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
                      Sending{" "}
                    </button>
                  )}

                  {error != "" && (
                    <div className="mt-[1%]">
                      ❌ Ohoh.. An error occurs: {error}
                    </div>
                  )}

                  {isSent && (
                    <div className="font-semibold text-xl mt-[5%]">
                      ✅ Successfuly sent!
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
