import Link from "next/link";
import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { SolanaLogo, ConnectWallet } from "components";
import styles from "./index.module.css";

import { bundlrStorage, Metaplex, MetaplexFileTag, toMetaplexFileFromBrowser, walletAdapterIdentity } from "@metaplex-foundation/js";
import { PublicKey, Transaction } from '@solana/web3.js';
import { utils } from "@project-serum/anchor";
import { PROGRAM_ID, createUnverifyCollectionInstruction, createSetAndVerifySizedCollectionItemInstruction, createSetAndVerifyCollectionInstruction, createUnverifySizedCollectionItemInstruction } from "@metaplex-foundation/mpl-token-metadata";
import Papa from "papaparse";

const walletPublicKey = "";

export const CreateNFTCollectionView: FC = ({ }) => {
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const [createMethod, setCreateMethod] = useState('existing');
  const [addItemMethod, setAddItemMethod] = useState('individual')

  const [CollectionNFTMint, setCollectionNFTMint] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [collectionSymbol, setCollectionSymbol] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [collectionLogo, setCollectionLogo] = useState<Readonly<{
    buffer: Buffer;
    fileName: string;
    displayName: string;
    uniqueName: string;
    contentType: string | null;
    extension: string | null;
    tags: MetaplexFileTag[];
  }>>();
  const [collectionFileName, setCollectionFileName] = useState('');

  const [csvHeaders, setCsvHeaders] = useState([])
  const [csvData, setCsvData] = useState<any[]>([]);
  const [CSVfileName, setCSVFileName] = useState('')

  const [NFTMintList, setNFTMintList] = useState([{ NFT_mint: "" }]);

  const [isCollectionSized, setIsCollectionSized] = useState(true);

  const [currentTx, setCurrentTx] = useState<number>(0);
  const [totalTx, setTotalTx] = useState<number>(0);
  const [collectionNFTsuccess, setCollectionNFTSuccess] = useState(false);


  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet))
    .use(bundlrStorage());


  // allow to reset the states
  const resetCollectionNFT = () => {
    setError('')
    setSuccess(false)
    setCollectionName('')
    setCollectionSymbol('')
    setCollectionDescription('')
    setCollectionFileName('')
    setCollectionLogo(undefined)
  }
  const handleLogoChange = async (event: any) => {
    const logoFile = event.target.files[0];
    const _file = await toMetaplexFileFromBrowser(logoFile);
    setCollectionLogo(_file);
    setCollectionFileName(_file.fileName)
  }
  const handleCSVChange = async (event: any) => {
    const csvFile = event.target.files[0];
    setCSVFileName(csvFile.name)

    const fileType = csvFile['type']
    console.log(fileType)

    if (fileType != 'text/csv') {
      setError('It is not a CSV file!')
    }
    else {
      Papa.parse(event.target.files[0], {
        header: true,
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
  }

  // handle when the user changes an NFT field
  const handleAttributesChange = (e: any, index: any) => {
    const { name, value } = e.target;
    const list: any = [...NFTMintList];
    list[index][name] = value;
    setNFTMintList(list);
  };

  // handle when the user deletes an NFT field
  const handleRemoveClick = (index: any) => {
    const list = [...NFTMintList];
    list.splice(index, 1);
    setNFTMintList(list);
  };

  //handle when the user adds an NFT field
  const handleAddClick = () => {
    setNFTMintList([...NFTMintList, { NFT_mint: "" }]);
  };


  // create and migrate collection
  const migrate = async () => {
    setIsMigrating(true);
    setSuccess(false);
    setCollectionNFTSuccess(false);
    setCurrentTx(0);
    setTotalTx(0);
    setError('')

    let mint: PublicKey | undefined

    // case where the user use an existing collection NFT
    if (createMethod == 'existing') {
      try {
        // get the NFT object of the already existing collection NFT
        mint = new PublicKey(CollectionNFTMint)
        const nft = await metaplex.nfts().findByMint({ mintAddress: mint })
        // get the collection details of the NFT
        // if collectionDetails == null then the collection in not sized
        // the collection is sized otherwise
        const collectionDetails = nft.collectionDetails
        if (collectionDetails == null) {
          setIsCollectionSized(false)
        }
        else {
          setIsCollectionSized(true)
        }
      }
      catch (error) {
        setIsMigrating(false)
        const err = (error as any)?.message;
        setError(err)
      }
    }

    // case where the user create the collection NFT
    else if (createMethod == 'create') {
      if (collectionLogo) {
        try {
          // upload the image NFT
          const ImageUri = await metaplex.storage().upload(collectionLogo);

          if (ImageUri) {
            // upload the metadata NFT
            const { uri } = await metaplex.nfts().uploadMetadata({
              name: collectionName,
              symbol: collectionSymbol,
              description: collectionDescription,
              image: ImageUri,
            })

            if (uri) {
              // create the NFT
              const { nft } = await metaplex.nfts().create({
                name: collectionName,
                symbol: collectionSymbol,
                uri: uri,
                sellerFeeBasisPoints: 0,
                isCollection: true,
                collectionIsSized: true
              });

              if (nft) {
                mint = nft.address
                setIsCollectionSized(true)
                setCollectionNFTSuccess(true)
              }
            }
          }
        }
        catch (error) {
          setIsMigrating(false)
          const err = (error as any)?.message;
          setError(err)
        }

      }
      else {
        setIsMigrating(false)
        setError('Please provide an image file!')

      }
    }

    // define the useful seeds to get the needed PDA
    const seed1 = Buffer.from(utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint!.toBytes());
    const seed4 = Buffer.from(utils.bytes.utf8.encode("edition"));


    const [metadataCollectionPDA, _bump] = PublicKey.findProgramAddressSync([seed1, seed2, seed3], PROGRAM_ID);
    const [masterEditionCollectionPDA, _bump2] = PublicKey.findProgramAddressSync([seed1, seed2, seed3, seed4], PROGRAM_ID);

    // define the number of migration done in one Tx
    const nbPerTx = 5

    // calculate the number of Tx to do
    let nbTx: number

    // add individual NFT case
    if (mint != undefined && addItemMethod == 'individual') {
      try {

        if (NFTMintList.length % nbPerTx == 0) {
          nbTx = NFTMintList.length / nbPerTx
        }
        else {
          nbTx = Math.floor(NFTMintList.length / nbPerTx) + 1;
        }
        setTotalTx(nbTx);
        for (let i = 0; i < nbTx; i++) {

          // Create a transaction
          let Tx = new Transaction()

          let bornSup: number

          if (i == nbTx - 1) {
            bornSup = NFTMintList.length
          }

          else {
            bornSup = nbTx * (i + 1)
          }
          // for each NFT in the list
          for (let j = 6 * i; j < bornSup; j++) {
            const NFTMintPubkey = new PublicKey(NFTMintList[j]['NFT_mint'])
            const seed5 = Buffer.from(NFTMintPubkey.toBytes())
            const [metadataItemPDA, _bump] = PublicKey.findProgramAddressSync([seed1, seed2, seed5], PROGRAM_ID);

            // get the NFT object of the NFT to add in the new collection in order to know if it is already in a collection
            const NFTToAdd = await metaplex.nfts().findByMint({ mintAddress: NFTMintPubkey });
            const oldCollection = NFTToAdd.collection?.address;

            // if oldCollection != undefined then the NFT is already in a collection
            // we have to unverify it before add it in the new collection
            if (oldCollection != undefined) {
              console.log('the nft is already in a collection')
              // get the NFT object of the old collection NFT to get its collection details
              const oldCollectionNFT = await metaplex.nfts().findByMint({ mintAddress: oldCollection });
              const oldCollectionDetails = oldCollectionNFT.collectionDetails

              // define the useful seed and get the needed PDAs
              const seed6 = Buffer.from(oldCollection.toBytes());
              const [masterEditionOldCollectionPDA, _bump2] = PublicKey.findProgramAddressSync([seed1, seed2, seed6, seed4], PROGRAM_ID);
              const [metadataOldCollectionPDA, _bump3] = PublicKey.findProgramAddressSync([seed1, seed2, seed6], PROGRAM_ID);

              // if oldCollectionDetails == null then the old collection is not sized
              // it sized otherwise
              if (oldCollectionDetails == null) {
                console.log('unverify collection')
                const unverifyTx = createUnverifyCollectionInstruction({
                  collection: metadataOldCollectionPDA,
                  collectionAuthority: publicKey!,
                  collectionMasterEditionAccount: masterEditionOldCollectionPDA,
                  collectionMint: oldCollection,
                  metadata: metadataItemPDA
                })
                Tx.add(unverifyTx)
              }
              else {
                console.log('unverify sized collection')
                const unverifyTx = createUnverifySizedCollectionItemInstruction({
                  collection: metadataOldCollectionPDA,
                  collectionAuthority: publicKey!,
                  collectionMasterEditionAccount: masterEditionOldCollectionPDA,
                  collectionMint: oldCollection,
                  metadata: metadataItemPDA,
                  payer: publicKey!,
                })
                Tx.add(unverifyTx)
              }
            }

            if (isCollectionSized == true) {
              console.log('the new collection is sized')
              const setAndVerifyIx = createSetAndVerifySizedCollectionItemInstruction({
                collection: metadataCollectionPDA,
                collectionAuthority: publicKey!,
                collectionMasterEditionAccount: masterEditionCollectionPDA,
                collectionMint: mint,
                metadata: metadataItemPDA,
                payer: publicKey!,
                updateAuthority: publicKey!,
              }
              )
              Tx.add(setAndVerifyIx)

            }
            else {
              console.log('the new collection is not sized')
              const setAndVerifyIx = createSetAndVerifyCollectionInstruction({
                collection: metadataCollectionPDA,
                collectionAuthority: publicKey!,
                collectionMasterEditionAccount: masterEditionCollectionPDA,
                collectionMint: mint,
                metadata: metadataItemPDA,
                payer: publicKey!,
                updateAuthority: publicKey!,
              }
              )
              Tx.add(setAndVerifyIx)
            }
          }
          // incremente the current transaction
          setCurrentTx(i + 1)
          // send the transaction
          const signature = await wallet.sendTransaction(Tx, connection);

          // get the confirmation of the transaction
          const confirmed = await connection.confirmTransaction(signature, 'processed');
          console.log('success')
        }
        setIsMigrating(false)
        setSuccess(true)
      }
      catch (error) {
        setIsMigrating(false)
        const err = (error as any)?.message;
        setError(err)
      }

    }

    // use csv file case
    else if (mint != undefined && addItemMethod == 'csv') {
      try {

        if (csvData.length % nbPerTx == 0) {
          nbTx = csvData.length / nbPerTx
        }
        else {
          nbTx = Math.floor(csvData.length / nbPerTx) + 1;
        }

        setTotalTx(nbTx);
        for (let i = 0; i < nbTx; i++) {

          // Create a transaction
          let Tx = new Transaction()

          let bornSup: number

          if (i == nbTx - 1) {
            bornSup = csvData.length
          }

          else {
            bornSup = nbTx * (i + 1)
          }

          // for each csv line
          for (let j = 6 * i; j < bornSup; j++) {
            const NFTMintPubkey = new PublicKey(csvData[j][csvHeaders[0]]);
            const seed5 = Buffer.from(NFTMintPubkey.toBytes());
            const [metadataItemPDA, _bump] = PublicKey.findProgramAddressSync([seed1, seed2, seed5], PROGRAM_ID);

            // get the NFT object of the NFT to add in the new collection in order to know if it is already in a collection
            const NFTToAdd = await metaplex.nfts().findByMint({ mintAddress: NFTMintPubkey });
            const oldCollection = NFTToAdd.collection?.address;

            // if oldCollection != undefined then the NFT is already in a collection
            // we have to unverify it before add it in the new collection
            if (oldCollection != undefined) {
              console.log('the nft is already in a collection')
              // get the NFT object of the old collection NFT to get its collection details
              const oldCollectionNFT = await metaplex.nfts().findByMint({ mintAddress: oldCollection });
              const oldCollectionDetails = oldCollectionNFT.collectionDetails

                            // define the useful seed and get the needed PDAs
              const seed6 = Buffer.from(oldCollection.toBytes());
              const [masterEditionOldCollectionPDA, _bump2] = PublicKey.findProgramAddressSync([seed1, seed2, seed6, seed4], PROGRAM_ID);
              const [metadataOldCollectionPDA, _bump3] = PublicKey.findProgramAddressSync([seed1, seed2, seed6], PROGRAM_ID);

                            // if oldCollectionDetails == null then the old collection is not sized
              // it sized otherwise
              if (oldCollectionDetails == null) {
                console.log('unverify collection')
                const unverifyTx = createUnverifyCollectionInstruction({
                  collection: metadataOldCollectionPDA,
                  collectionAuthority: publicKey!,
                  collectionMasterEditionAccount: masterEditionOldCollectionPDA,
                  collectionMint: oldCollection,
                  metadata: metadataItemPDA
                })
                Tx.add(unverifyTx)
              }
              else {
                console.log('unverify sized collection')
                const unverifyTx = createUnverifySizedCollectionItemInstruction({
                  collection: metadataOldCollectionPDA,
                  collectionAuthority: publicKey!,
                  collectionMasterEditionAccount: masterEditionOldCollectionPDA,
                  collectionMint: oldCollection,
                  metadata: metadataItemPDA,
                  payer: publicKey!,
                })
                Tx.add(unverifyTx)
              }
            }

            if (isCollectionSized == true) {
              console.log('the new collection is sized')
              const setAndVerifyIx = createSetAndVerifySizedCollectionItemInstruction({
                collection: metadataCollectionPDA,
                collectionAuthority: publicKey!,
                collectionMasterEditionAccount: masterEditionCollectionPDA,
                collectionMint: mint,
                metadata: metadataItemPDA,
                payer: publicKey!,
                updateAuthority: publicKey!,
              }
              )
              Tx.add(setAndVerifyIx)

            }
            else {
              console.log('the new collection is not sized')
              const setAndVerifyIx = createSetAndVerifyCollectionInstruction({
                collection: metadataCollectionPDA,
                collectionAuthority: publicKey!,
                collectionMasterEditionAccount: masterEditionCollectionPDA,
                collectionMint: mint,
                metadata: metadataItemPDA,
                payer: publicKey!,
                updateAuthority: publicKey!,
              }
              )
              Tx.add(setAndVerifyIx)
            }
          }


          // incremente the current transaction
          setCurrentTx(i + 1)
          // send the transaction
          const signature = await wallet.sendTransaction(Tx, connection);

          // get the confirmation of the transaction
          const confirmed = await connection.confirmTransaction(signature, 'processed');
          console.log('success')
        }
        setIsMigrating(false)
        setSuccess(true)
      }

      catch (error) {
        setIsMigrating(false)
        const err = (error as any)?.message;
        setError(err)
      }

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
                  Update the metadata of your <SolanaLogo /> NFT
                </h1>

                <div className="md:w-[600px] mx-auto">
                  <div className="md:w-[480px] flex flex-col m-auto">

                    <div className="mt-5 mb-2 uppercase underline flex font-bold text-2xl">Collection NFT</div>
                    <div className="flex justify-center">
                      {createMethod == 'existing' ?
                        <button className="text-white m-2 font-semibold bg-[#343e4f] md:w-[280px] rounded-full shadow-xl border">Use an existing NFT</button>
                        : <button className="text-white m-2 font-semibold bg-[#667182] md:w-[280px] rounded-full shadow-xl border" onClick={() => { setCreateMethod('existing'), resetCollectionNFT() }}>Use an existing NFT</button>
                      }
                      {createMethod == 'create' ?
                        <button className="text-white m-2 font-semibold bg-[#343e4f] md:w-[300px] rounded-full shadow-xl border">Create the Collection NFT</button>
                        : <button className="text-white m-2 font-semibold bg-[#667182] md:w-[300px] rounded-full shadow-xl border" onClick={() => { setCreateMethod('create'), setCollectionNFTMint('') }}>Create the Collection NFT</button>}
                    </div>

                    {createMethod == 'existing' &&
                      <div>
                        <div>
                          <label className="underline mt-2 flex font-bold">NFT Mint Address</label>
                          <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                            type="text"
                            placeholder="NFT Mint Address"
                            onChange={(e) => setCollectionNFTMint(e.target.value)}
                          />
                        </div>

                      </div>
                    }

                    {createMethod == 'create' &&
                      <div>
                        <div>
                          <label className="underline mt-2 flex font-bold">Name</label>
                          <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                            type="text"
                            placeholder="Collection Name"
                            onChange={(e) => setCollectionName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="underline mt-2 flex font-bold">Symbol</label>
                          <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                            type="text"
                            placeholder="Collection Symbol"
                            onChange={(e) => setCollectionSymbol(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="underline mt-2 flex font-bold">Description</label>
                          <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                            type="text"
                            placeholder="Description of your collection"
                            onChange={(e) => setCollectionDescription(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="underline my-2 flex font-bold">Logo</label>
                          <label htmlFor="file" className="text-white font-semibold  shadow-xl bg-[#414e63] border px-2 py-1 h-[40px] uppercase hover:bg-[#2C3B52] hover:cursor-pointer">
                            Upload Logo
                            <input
                              id="file"
                              type="file"
                              name="file"
                              accept="image/*, video/*"
                              onChange={handleLogoChange}
                              style={{ display: 'none' }} />
                          </label>
                          {collectionFileName != '' && <div className="mt-2" >{collectionFileName}</div>}
                        </div>
                      </div>
                    }
                    <div className="">
                      <div className="mt-5 mb-2 uppercase underline flex font-bold text-2xl">Add Collection Items</div>
                      <div className="font-bold mb-2 text-left"> Add individual NFTs or import a CSV file to migrate them to your Collection.</div>

                      <div className="flex justify-center mb-2">
                        {addItemMethod == 'individual' ?
                          <button className="text-white m-2 font-semibold bg-[#343e4f] md:w-[280px] rounded-full shadow-xl border">Add individual NFTs</button>
                          : <button className="text-white m-2 font-semibold bg-[#667182] md:w-[280px] rounded-full shadow-xl border" onClick={() => { setAddItemMethod('individual'), setCSVFileName('') }}>Add individual NFTs</button>
                        }
                        {addItemMethod == 'csv' ?
                          <button className="text-white m-2 font-semibold bg-[#343e4f] md:w-[300px] rounded-full shadow-xl border">Use csv File</button>
                          : <button className="text-white m-2 font-semibold bg-[#667182] md:w-[300px] rounded-full shadow-xl border" onClick={() => { setAddItemMethod('csv'), setNFTMintList([{ NFT_mint: "" }]) }}>Use csv File</button>}
                      </div>

                      {addItemMethod == 'individual' &&

                        <div>
                          {NFTMintList.map((x, i) => {
                            return (
                              <div className="md:flex items-center mt-2">
                                <div className="flex flex-col mx-2">
                                  <label className="font-bold">NFT Mint Address</label>
                                  <input
                                    className="my-1 md:w-[400px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                                    name="NFT_mint"
                                    type="text"
                                    placeholder="NFT Mint Address"
                                    value={x.NFT_mint}
                                    onChange={e => handleAttributesChange(e, i)}
                                  />
                                </div>
                                <button className="h-[35px] w-[35px] rounded-full font-bold bg-[#414e63] hover:bg-[#2C3B52]" onClick={() => handleRemoveClick(i)}>x</button>
                              </div>
                            );
                          })}

                          <button className="mt-3 text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[200px] h-[40px] rounded-full shadow-xl border uppercase" onClick={handleAddClick}>Add NFT</button>
                        </div>
                      }

                      {addItemMethod == 'csv' &&
                        <div className="mt-5">
                          <label htmlFor="csvfile" className="text-white font-semibold shadow-xl bg-[#414e63] border px-2 py-1 h-[40px] uppercase hover:bg-[#2C3B52] hover:cursor-pointer">
                            Upload csv File
                            <input
                              id="csvfile"
                              type="file"
                              name="csvfile"
                              accept=".csv"
                              onChange={handleCSVChange}
                              style={{ display: 'none' }} />
                          </label>
                          {CSVfileName != '' && <div className="mt-2" >{CSVfileName}</div>}
                        </div>
                      }
                    </div>


                  </div>
                </div>

                {!isMigrating ?
                  <button className="mt-[30px] mx-auto text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] h-[35px] rounded-full shadow-xl border uppercase" onClick={migrate}>migrate</button>
                  : <button className="mt-[30px] mx-auto text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] h-[35px] rounded-full shadow-xl border uppercase cursor-not-allowed" >
                    <svg role="status" className="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                    </svg>migrating...</button>}
              </div>

            </div>
          </div>
          {collectionNFTsuccess && <div className="mt-[1%]">✅ Collection NFT successfuly created!</div>}
          {isMigrating && currentTx != 0 && totalTx != 0 &&
            <div className='font-semibold mt-4 mb-2 text-xl'>Please confirm Tx: {currentTx}/{totalTx}</div>

          }
          {success && <div className="mt-[1%]">✅ NFT(s) successfuly migrated!</div>}
          {error != '' && <div className="mt-[1%]">❌ Ohoh.. An error occurs: {error}</div>}
        </div>
      </div>
    </div>
  );
};