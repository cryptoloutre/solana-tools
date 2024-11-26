import { FC, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import {
  createGenericFileFromBrowserFile,
  GenericFile,
} from "@metaplex-foundation/umi";
import {
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { getConnection } from "utils/getConnection";
import { notify } from "utils/notifications";

export const UploadView: FC = ({ }) => {
  const wallet = useWallet();

  const networkConfig = useNetworkConfiguration();
  const networkSelected = networkConfig.networkConfiguration;

  const [connection, setConnection] = useState<Connection>();

  useEffect(() => {
    const connection = getConnection(networkSelected);
    setConnection(connection)
  }, [networkConfig]);

  const [fileIsSelected, setFileIsSelected] = useState<boolean>(false)
  const [file, setFile] = useState<GenericFile>();
  const [fileName, setFileName] = useState<string>("");
  const [uri, setURI] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadCost, setUploadCost] = useState<number>();

  const handleFileChange = async (event: any) => {
    setFileName("");
    setURI("");
    const browserFile = event.target.files[0];
    const _file = await createGenericFileFromBrowserFile(browserFile);
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
    const price = Number((await umi.uploader.getUploadPrice([_file])).basisPoints.toString()) / LAMPORTS_PER_SOL;
    setUploadCost(price);
    setFile(_file);
    setFileName(_file.fileName);
    setFileIsSelected(true);
  };

  const upload = async () => {
    try {
      setUploading(true);
      const umi = createUmi(connection);

      if (networkSelected == "devnet") {
        umi.use(
          irysUploader({
            address: "https://devnet.irys.xyz"
          })
        );
      } else {
        umi.use(irysUploader({
          address: "https://node1.irys.xyz/"
        }));
      }

      umi.use(mplTokenMetadata()).use(walletAdapterIdentity(wallet));

      const [uri]= await umi.uploader.upload([file]);
      let correctURI: string;
      if (networkSelected == "devnet") {
        correctURI = uri.replace("https://arweave.net", 'https://devnet.irys.xyz');
      }
      else {
        correctURI = uri.replace("https://arweave.net", 'https://node1.irys.xyz');
      }
      setURI(correctURI);
      setUploading(false);
      notify({ type: 'success', message: `Success!` });

    } catch (error) {
      setUploading(false);
      const err = (error as any)?.message;
      notify({ type: 'error', message: err });
    }
  };

  return (
    <div className="md:hero mx-auto w-full p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6 ">
          <h1 className="text-center text-5xl font-bold mb-8">
            Upload file to Arweave
          </h1>


          <div>
            <div className="flex justify-center  mb-10">
              <form className="mt-[20%]">
                <label htmlFor="file" className="font-bold py-2 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl uppercase hover:cursor-pointer">
                  Select file
                  <input id="file" type="file" name="file" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </form>
            </div>

            <div className="flex justify-center">
              {!fileIsSelected && uploading == false &&
                <button className="font-bold py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl hover:cursor-not-allowed	uppercase mb-4">Upload
                </button>
              }

              {fileIsSelected && uploading == false &&
                <button className="font-bold py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl uppercase mb-4" onClick={upload}>Upload
                </button>
              }

              {uploading == true &&
                <button className="font-bold py-1 px-2 bg-[#312d29] border border-[#c8ab6e] rounded-xl uppercase mb-4">
                  <svg role="status" className="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                  </svg>Uploading
                </button>
              }
            </div>

            <div className="flex justify-center">
              {fileName != '' && uri == '' && uploadCost &&
                <div className="text-white font-semibold text-lg mb-4">
                  You will upload <strong>{fileName}</strong> for {uploadCost} SOL
                </div>
              }
            </div>

            <div className="flex justify-center">
              {uri !== '' &&
                <div className="font-semibold text-xl mb-[2%]">
                  ✅ Successfuly uploaded! <br />Don&apos;t forget to copy the following link:
                </div>
              }
            </div>
            <div className="flex justify-center">
              {uri !== '' &&
                <div className="font-semibold text-xl underline">
                  <a target="_blank" rel="noreferrer" href={uri}> {uri}</a>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};