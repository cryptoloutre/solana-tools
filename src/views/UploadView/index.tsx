import Link from "next/link";
import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { ConnectWallet } from "components";
import styles from "./index.module.css";

import { Metaplex, bundlrStorage, MetaplexFile, toMetaplexFileFromBrowser, walletAdapterIdentity, MetaplexFileTag } from "@metaplex-foundation/js";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const walletPublicKey = "";

export const UploadView: FC = ({ }) => {
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

  const [fileIsSelected, setFileIsSelected] = useState(false)
  const [file, setFile] = useState<Readonly<{
    buffer: Buffer;
    fileName: string;
    displayName: string;
    uniqueName: string;
    contentType: string | null;
    extension: string | null;
    tags: MetaplexFileTag[];
  }>>()
  const [fileName, setFileName] = useState('');
  const [uri, setUri] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadCost, setUploadCost] = useState<number>();
  const [error, setError] = useState('');

  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet))
    .use(bundlrStorage());

  let _file: MetaplexFile;

  const handleFileChange = async (event: any) => {
    setFileIsSelected(true);
    setUri('');
    setError('');
    setUploading(false);
    const browserFile = event.target.files[0];
    _file = await toMetaplexFileFromBrowser(browserFile);
    setFile(_file);
    setFileName(_file.displayName);
    const getUploadCost = await (await metaplex.storage().getUploadPriceForFile(_file)).basisPoints.toString(10)
    const cost = parseInt(getUploadCost, 10)
    setUploadCost(cost / LAMPORTS_PER_SOL)
  }

  const UploadFile = async () => {
    try {
      setError('');
      setUploading(true);
      if (file) {
        const uri = await metaplex.storage().upload(file);
        console.log(uri);
        if (uri) {
          setUri(uri);
          setFileIsSelected(false);
          setUploading(false);
        }

      }
    }
    catch (error) {
      const err = (error as any)?.message;
      setError(err);
      setUploading(false);
    }
  }

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
                  Upload File To Arweave
                </h1>

                <div>
                  <form className="mt-[20%] mb-[3%]">
                    <label htmlFor="file" className="text-white font-semibold text-xl rounded-full shadow-xl bg-[#414e63] border px-6 py-2 h-[40px] mb-[3%] uppercase hover:bg-[#2C3B52] hover:cursor-pointer">
                      Select file
                      <input id="file" type="file" name="file" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                  </form>

                  {fileName != '' && uri == '' && uploadCost &&
                    <div className="text-white font-semibold text-xl mb-[3%]">
                      You will upload <strong>{fileName}</strong> for {uploadCost} SOL
                    </div>
                  }

                  {fileIsSelected && uploading == false &&
                    <button className="text-white font-semibold text-xl rounded-full shadow-xl bg-[#414e63] hover:bg-[#2C3B52] border w-[160px] h-[40px] mb-[3%] uppercase" onClick={UploadFile}>Upload
                    </button>
                  }


                  {uploading == true &&
                    <button className="text-white font-semibold text-xl rounded-full shadow-xl bg-[#2C3B52] border w-[160px] h-[40px] mb-[3%] uppercase" onClick={UploadFile}>
                      <svg role="status" className="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                      </svg>Uploading </button>}

                  {error != '' && <div>❌ Ohoh.. An error occurs: {error}</div>}

                  {uri !== '' &&
                    <div className="font-semibold text-xl mb-[2%]">
                      ✅ Successfuly uploaded! <br />Don't forget to copy the following link:
                    </div>}
                  <div className="font-semibold text-xl underline">
                    <a target="_blank" rel="noreferrer" href={uri}> {uri}</a>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};