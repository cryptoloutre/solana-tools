import { FC, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import {
  percentAmount,
  generateSigner,
  createGenericFileFromBrowserFile,
  GenericFile,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  TokenStandard,
  createAndMint,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { AuthorityType, setAuthority } from "@metaplex-foundation/mpl-toolbox";
import { getConnection } from "utils/getConnection";
import { notify } from "utils/notifications";

export const CreateView: FC = ({ }) => {
  const wallet = useWallet();

  const networkConfig = useNetworkConfiguration();
  const networkSelected = networkConfig.networkConfiguration;

  const [connection, setConnection] = useState<Connection>();

  useEffect(() => {
    const connection = getConnection(networkSelected);
    setConnection(connection)
  }, [networkConfig]);

  const [quantity, setQuantity] = useState(0);
  const [decimals, setDecimals] = useState(9);
  const [tokenName, setTokenName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [metadataURL, setMetadataURL] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [disableMintIsChecked, setDisableMintIsChecked] = useState(false);
  const [metadataMethod, setMetadataMethod] = useState("url");
  const [tokenDescription, setTokenDescription] = useState("");
  const [file, setFile] = useState<GenericFile>();
  const [fileName, setFileName] = useState("");
  const [iscreating, setIscreating] = useState(false);

  const handleFileChange = async (event: any) => {
    const browserFile = event.target.files[0];
    const _file = await createGenericFileFromBrowserFile(browserFile);
    setFile(_file);
    setFileName(_file.fileName);
  };

  const create = async () => {
    console.log("create");
    try {
      setIscreating(true);
      const umi = createUmi(connection);

      if (networkSelected == "devnet") {
        umi.use(
          irysUploader({
            providerUrl: "https://turbo.ardrive.io",
            timeout: 60000,
          })
        );
      } else {
        umi.use(irysUploader());
      }

      umi.use(mplTokenMetadata()).use(walletAdapterIdentity(wallet));

      const mint = generateSigner(umi);
      const owner = wallet.publicKey;

      let URI: string = "";

      if (metadataMethod == "url") {
        if (metadataURL != "") {
          URI = metadataURL;
        } else {
          setIscreating(false);
          notify({ type: 'error', message: 'Please provide a metadata URL!' });
        }
      } else {
        if (file) {
          const [ImageUri] = await umi.uploader.upload([file]);

          if (ImageUri) {
            const uri = await umi.uploader.uploadJson({
              name: tokenName,
              symbol: symbol,
              description: tokenDescription,
              image: ImageUri,
            });
            if (uri) {
              URI = uri;
            }
          }
        } else {
          setIscreating(false);
          notify({ type: 'error', message: 'Please provide an image file!' });
        }
      }

      if (URI != "") {
        const ixs = [];

        if (disableMintIsChecked) {
          console.log("disable mint");
          ixs.push(
            setAuthority(umi, {
              authorityType: AuthorityType.MintTokens,
              newAuthority: null,
              owned: mint.publicKey,
              owner: umi.identity,
            })
          );
        }

        if (!isChecked) {
          console.log("disable freeze");
          ixs.push(
            setAuthority(umi, {
              authorityType: AuthorityType.FreezeAccount,
              newAuthority: null,
              owned: mint.publicKey,
              owner: umi.identity,
            })
          );
        }

        const tx = await createAndMint(umi, {
          mint,
          name: tokenName,
          symbol: symbol,
          uri: URI,
          sellerFeeBasisPoints: percentAmount(0),
          decimals: decimals,
          amount: quantity * 10 ** decimals,
          tokenOwner: publicKey(owner),
          tokenStandard: TokenStandard.Fungible,
        })
          .add(ixs)
          .sendAndConfirm(umi, {
            confirm: { commitment: "confirmed" },
          });

        const signature = base58.deserialize(tx.signature)[0];
        console.log(signature);
        notify({ type: 'success', message: `Success!`, txid: signature });
        setIscreating(false);
      }
    } catch (error) {
      setIscreating(false);
      const err = (error as any)?.message;
      notify({ type: 'error', message: err });
    }
  };

  return (
    <div className="md:hero mx-auto w-full p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6 ">
          <h1 className="text-center text-5xl font-bold mb-8">
            Create your own token
          </h1>

          <div className="md:w-[480px] flex flex-col m-auto">
            <div className="my-2 uppercase underline flex font-bold text-2xl">
              Token infos
            </div>
            <label className="underline flex font-bold">Token Name</label>
            <input
              className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
              type="text"
              placeholder="Token Name"
              onChange={(e) => setTokenName(e.target.value)}
            />

            <label className="underline flex font-bold">Symbol</label>
            <input
              className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
              type="text"
              placeholder="Symbol"
              onChange={(e) => setSymbol(e.target.value)}
            />

            <label className="underline flex font-bold">
              Number of tokens to mint
            </label>
            <input
              className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />

            <label className="underline flex font-bold">
              Number of decimals
            </label>
            <input
              className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
              type="number"
              min="0"
              value={decimals}
              onChange={(e) => setDecimals(parseInt(e.target.value))}
            />

            <div className="mt-5 mb-2 uppercase underline flex font-bold text-2xl">
              Metadatas
            </div>
            <div className="flex justify-center">
              {metadataMethod == "url" ? (
                <button className="mx-2 py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl font-semibold shadow-xl md:w-[280px]">
                  Use an existing medatata URL
                </button>
              ) : (
                <button
                  className="mx-2 py-1 px-2 bg-[#4f4b48] border border-[#c8ab6e] rounded-xl font-semibold shadow-xl md:w-[280px]"
                  onClick={() => {
                    setMetadataMethod("url"), setTokenDescription("");
                  }}
                >
                  Use an existing medatata URL
                </button>
              )}
              {metadataMethod == "upload" ? (
                <button className="mx-2 py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl font-semibold shadow-xl md:w-[200px]">
                  Create the metadata
                </button>
              ) : (
                <button
                  className="mx-2 py-1 px-2 bg-[#4f4b48] border border-[#c8ab6e] rounded-xl font-semibold shadow-xl md:w-[200px]"
                  onClick={() => {
                    setMetadataMethod("upload"),
                      setMetadataURL(""),
                      setFile(undefined),
                      setFileName("");
                  }}
                >
                  Create the metadata
                </button>
              )}
            </div>

            {metadataMethod == "url" && (
              <div>
                <div>
                  <label className="underline mt-2 flex font-bold">
                    Metadata Url
                  </label>
                  <input
                    className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                    type="text"
                    placeholder="Metadata Url"
                    onChange={(e) => setMetadataURL(e.target.value)}
                  />
                </div>
              </div>
            )}

            {metadataMethod == "upload" && (
              <div>
                <div>
                  <label className="underline mt-2 flex font-bold">
                    Description
                  </label>
                  <input
                    className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                    type="text"
                    placeholder="Description of the token/project"
                    onChange={(e) => setTokenDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="underline mt-2 flex font-bold mb-2">Image</label>
                  <div className="flex justify-center">
                    <label
                      htmlFor="file"
                      className="mx-2 py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl text-white font-semibold shadow-xl uppercase hover:cursor-pointer"
                    >
                      Upload image
                      <input
                        id="file"
                        type="file"
                        name="file"
                        accept="image/*, video/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  {fileName != "" && <div className="mt-2 flex justify-center">{fileName}</div>}
                </div>
              </div>
            )}

            <div className="mt-5 mb-2 uppercase underline font-bold text-2xl">
              Authority
            </div>
            <div className="mb-4">
              <label className="mx-2">Enable freeze authority</label>
              <input
                className="mx-2"
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(!isChecked)}
              />
            </div>
            <div className="mb-4">
              <label className="mx-2">Disable mint authority</label>
              <input
                className="mx-2"
                type="checkbox"
                checked={disableMintIsChecked}
                onChange={(e) => setDisableMintIsChecked(!disableMintIsChecked)}
              />
            </div>
          </div>

          <div className="flex justify-center">
            {iscreating ? (
              <button className="mx-2 font-bold text-lg py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl">
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
                Creating...
              </button>
            ) : (
              <button
                className="mx-2 font-bold text-lg py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl"
                onClick={create}
              >
                Create Token
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};