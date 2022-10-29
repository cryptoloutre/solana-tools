import Link from "next/link";
import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { SolanaLogo, ConnectWallet } from "components";
import styles from "./index.module.css";

import { bundlrStorage, Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { PublicKey } from '@solana/web3.js';

const walletPublicKey = "";

export const UpdateNFTMetadataView: FC = ({ }) => {
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

  const [NFTAddress, setNFTAddress] = useState('');
  const [NFTName, setNFTName] = useState('');
  const [NFTSymbol, setNFTSymbol] = useState('');
  const [NFTuri, setNFTuri]= useState('');
  const [NFTSellerFee, setNFTSellerFee] = useState(0);
  const [NFTDescription, setNFTDescription] = useState('');
  const [NFTImage, setNFTImage] = useState('');
  const [isUpdateAuthority, setIsUpdateAuthority] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRoyalties, setNewRoyalties] = useState('');
  const [newImageURI, setNewImageURI] = useState('');
  const [newAnimationURI, setNewAnimationURI] = useState('');
  const [newExternalURL, setNewExternalURL] = useState('');
  const [attributesList, setAttributesList] = useState([{ trait_type: "", value: "" }]);

  const [imageFormat, setImageFormat] = useState('png');
  const [animationFormat, setAnimationFormat] = useState('mp4');

  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet))
    .use(bundlrStorage());


  // allow to fetch the current metadata of the NFT
  const fetchMetadata = async () => {
    setError('')

    try {
      const mintPublickey = new PublicKey(NFTAddress);
      //get the nft object of the NFT
      const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublickey })
      //get the update authority of the NFT
      const authority = nft.updateAuthorityAddress.toBase58()
      // get the current NFT name
      const name = nft.name
      setNFTName(name)
      // get the current NFT symbol
      const symbol = nft.symbol
      setNFTSymbol(symbol)
      // get the current NFT uri
      const uri = nft.uri
      setNFTuri(uri)
      // get the current NFT seller fee
      const sellerFee = nft.sellerFeeBasisPoints
      setNFTSellerFee(sellerFee)
      // get the current NFT description
      const description = nft.json?.description
      if (description != undefined && description != '') {
        setNFTDescription(description)
      }
      else {
        setNFTDescription('No description provided for this NFT')
      }

      // get the current NFT image
      const image = nft.json?.image
      if (image != undefined) {
        setNFTImage(image)
      }

      // check if the user is the update authority of the NFT
      if (authority == publicKey?.toBase58()) {
        setIsUpdateAuthority(true)
      }
      else {
        setIsUpdateAuthority(false)
      }

    }

    catch (error) {
      const err = (error as any)?.message;
      console.log(err)
      setError(err)
    }
  }

  // allow to reset the states
  const reset = () => {
    setNFTAddress('')
    setNFTName('')
    setNFTDescription('')
    setNFTImage('')
    setError('')
    setIsUpdateAuthority(false)
    setNewName('')
    setNewDescription('')
    setNewRoyalties('')
    setNewSymbol('')
    setNewImageURI('')
    setNewAnimationURI('')
    setNewExternalURL('')
    setAttributesList([{ trait_type: "", value: "" }])
    setSuccess(false)
    setIsUpdating(false)
  }

  // handle when the user changes an attribute field
  const handleAttributesChange = (e: any, index: any) => {
    const { name, value } = e.target;
    const list: any = [...attributesList];
    list[index][name] = value;
    setAttributesList(list);
  };

  // handle when the user deletes an attribute field
  const handleRemoveClick = (index: any) => {
    const list = [...attributesList];
    list.splice(index, 1);
    setAttributesList(list);
  };

  //handle when the user adds an attribute field
  const handleAddClick = () => {
    setAttributesList([...attributesList, { trait_type: "", value: "" }]);
  };


  // allow to update the NFT metadata
  const update = async () => {
    try {
      setIsUpdating(true)
      setSuccess(false)
      setError('')
      const mintPublickey = new PublicKey(NFTAddress);
      // get the current NFT metadata
      const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublickey })
      const jsonMetadata = nft.json

      // define the object which contains the current NFT metadata
      const newMetadata = { ...jsonMetadata }
      // define the object which contains the files attached to the NFT
      const newFiles: any[] = []

      let newOnChainName: string = NFTName
      let newOnChainSymbol: string = NFTSymbol
      let newOnChainuri: string = NFTuri
      let newOnChainSellerFee: number = NFTSellerFee

      // if a field is not empty, we change its value in the appropriate object
      if (newName != '') {
        newMetadata.name = newName
        newOnChainName = newName
      }

      if (newSymbol != '') {
        newMetadata.symbol = newSymbol
        newOnChainSymbol = newSymbol

      }

      if (newDescription != '') {
        newMetadata.description = newDescription
      }

      if (newRoyalties != '') {
        newMetadata.seller_fee_basis_points = parseFloat(newRoyalties) * 100
        newOnChainSellerFee = parseFloat(newRoyalties) * 100
      }

      if (newImageURI != '') {
        newMetadata.image = newImageURI + '?ext=' + imageFormat
        newFiles.push({
          uri: newImageURI + '?ext=' + imageFormat,
          type: "image/" + imageFormat
        })
      }
      else {
        const currentfiles = jsonMetadata!.properties?.files
        if (currentfiles != undefined) {
          for (let i = 0; i < currentfiles.length; i++) {
            if (currentfiles[i]['type']?.includes('image/')) {
              newFiles.push(currentfiles[i])
            }
          }
        }
      }

      if (newAnimationURI != '') {
        newMetadata['animation_url'] = newAnimationURI + '?ext=' + animationFormat
        let animationType: string = ''

        if (animationFormat == 'mp4' || animationFormat == 'mov') {
          animationType = "video/"
        }

        else if (animationFormat == 'glb' || animationFormat == 'gltf') {
          animationType = "model/"
        }

        newFiles.push({
          uri: newAnimationURI + '?ext=' + animationFormat,
          type: animationType + animationFormat
        })
      }
      else {
        const currentfiles = jsonMetadata!.properties?.files
        if (currentfiles != undefined) {
          for (let i = 0; i < currentfiles.length; i++) {
            if (currentfiles[i]['type']?.includes('video/') || currentfiles[i]['type']?.includes('model/')) {
              newFiles.push(currentfiles[i])
            }
          }
        }
      }

      if (newExternalURL != '') {
        newMetadata.external_url = newExternalURL
      }

      if (newFiles.length != 0) {
        newMetadata.properties!.files = newFiles
      }

      // define the object which will contains the new attributes
      const Attributes: any[] = []

      // allow to filter the fields where information is missing
      for (let i = 0; i < attributesList.length; i++) {
        if (attributesList[i]['trait_type'] != '' && attributesList[i]['value'] != '') {
          Attributes.push(attributesList[i])
        }
      }

      if (Attributes.length != 0) {
        newMetadata.attributes = Attributes
      }

      // upload the new NFT metadata and get the new uri
      const { uri: newUri } = await metaplex
        .nfts()
        .uploadMetadata(newMetadata);

      if (newUri) {
        console.log(newUri)
        newOnChainuri = newUri

      }

      // update the NFT metadata with the new uri
      const updatedNft = await metaplex
        .nfts()
        .update({
          nftOrSft: nft,
          name: newOnChainName,
          symbol: newOnChainSymbol,
          uri: newOnChainuri,
          sellerFeeBasisPoints: newOnChainSellerFee,
        });

      if (updatedNft) {
        fetchMetadata()
        setIsUpdating(false)
        setSuccess(true)
        console.log('success')
      }
    }
    catch (error) {
      const err = (error as any)?.message;
      console.log(err)
      setError(err)
      setIsUpdating(false)
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

                {NFTName != '' &&
                  <div className="flex">
                    <button className="text-white font-semibold text-xl w-[6rem] h-[2rem] mt-2 mb-2 bg-[#2C3B52] hover:bg-[#566274] rounded-xl border"
                      onClick={reset} >← Back</button>
                  </div>
                }


                {NFTName == '' &&
                  <div>
                    <form className="mt-[20%] mb-[3%]">
                      <input className="mb-[1%] md:w-[480px] w-full h-[40px] text-center mx-4 text-black pl-1 border-2 border-black rounded-2xl"
                        type="text"
                        required
                        placeholder="NFT mint address"
                        onChange={(e) => { setNFTAddress(e.target.value); setError('') }}

                      />
                    </form>

                    <button className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] h-[35px] rounded-full shadow-xl border uppercase" onClick={fetchMetadata}>search NFT</button>
                  </div>
                }

                {NFTName != '' &&
                  <div className="md:w-[600px] mx-auto">

                    {isUpdateAuthority ? <div className="text-white font-semibold text-3xl mb-5" >You want to update</div> :
                      <div className="text-white font-semibold text-3xl mb-5" >You are not the update authority <br /> You can't update the following NFT</div>
                    }

                    <div className="flex justify-center" >
                      <figure>
                        <img className="md:w-[250px] md:h-[250px] w-[150px] h-[150px] " src={NFTImage}></img>
                        <figcaption className="font-bold" >{NFTName}</figcaption>
                      </figure>
                      <div className="md:w-[400px] w-[200px] ml-5 ">
                        <div className="text-left font-bold text-sm md:text-lg underline ">Description</div>
                        <div className="text-left text-sm md:text-lg">{NFTDescription}</div>
                      </div>
                    </div>
                  </div>
                }

                {isUpdateAuthority == true &&

                  <div className="md:w-[600px] mx-auto">
                    <div className="my-5 md:w-[600px] mx-auto font-semibold text-3xl">Fill in the inputs you want to update</div>
                    <div className="md:w-[480px] flex flex-col m-auto">

                      <label className="underline flex font-bold">Name</label>
                      <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                        type="text"
                        placeholder="Name of the asset"
                        maxLength={32}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                      <label className="underline flex font-bold">Symbol</label>
                      <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                        type="text"
                        placeholder="Symbol of the asset"
                        maxLength={11}
                        onChange={(e) => setNewSymbol(e.target.value)}
                      />
                      <label className="underline flex font-bold">Description</label>
                      <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                        type="text"
                        placeholder="Description of the asset"
                        onChange={(e) => setNewDescription(e.target.value)}
                      />

                      <label className="underline flex font-bold">Royalties</label>
                      <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                        type="text"
                        placeholder="Percentage you will receive on secondary sales"
                        onChange={(e) => setNewRoyalties(e.target.value)}
                      />

                      <div className="md:w-[550px] flex items-center">
                        <div className="mr-2">
                          <label className="underline flex font-bold">Image URI</label>
                          <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                            type="text"
                            placeholder="URI pointing to the asset's logo"
                            onChange={(e) => setNewImageURI(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="flex font-semibold text-lg">Format</label>
                          <select className="text-black border-2 border-black rounded-lg" value={imageFormat} onChange={(e) => setImageFormat(e.target.value)}>
                            <option className="font-semibold text-lg" value="png">png</option>
                            <option className="font-semibold text-lg" value="jpeg">jpg</option>
                            <option className="font-semibold text-lg" value="gif">gif</option>
                          </select>
                        </div>
                      </div>

                      <div className="md:w-[550px] flex items-center">
                        <div className="mr-2">
                          <label className="underline flex font-bold">Animation URI</label>
                          <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                            type="text"
                            placeholder="URI pointing to the asset's animation"
                            onChange={(e) => setNewAnimationURI(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="flex font-semibold text-lg">Format</label>
                          <select className="text-black border-2 border-black rounded-lg" value={animationFormat} onChange={(e) => setAnimationFormat(e.target.value)}>
                            <option className="font-semibold text-lg" value="mp4">mp4</option>
                            <option className="font-semibold text-lg" value="mov">mov</option>
                            <option className="font-semibold text-lg" value="glb">glb</option>
                            <option className="font-semibold text-lg" value="gltf">gltf</option>
                          </select>
                        </div>

                      </div>

                      <label className="underline flex font-bold">External URL</label>
                      <input className="my-[1%] md:w-[480px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                        type="text"
                        placeholder="URL pointing to an external URL defining the asset"
                        onChange={(e) => setNewExternalURL(e.target.value)}
                      />


                      <div className="">
                        <div className="mt-5 underline flex font-bold text-2xl">Attributes</div>
                        <div className="flex font-bold">Attributes defining the characteristics of the asset</div>


                        {attributesList.map((x, i) => {
                          return (
                            <div className="md:flex items-center mt-2">
                              <div className="flex flex-col mx-2">
                                <label className="font-bold">Trait type</label>
                                <input
                                  className="my-1 md:w-[210px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                                  name="trait_type"
                                  type="text"
                                  placeholder="The type of attribute"
                                  value={x.trait_type}
                                  onChange={e => handleAttributesChange(e, i)}
                                />
                              </div>
                              <div className="flex flex-col mx-2">
                                <label className="font-bold">Value</label>
                                <input
                                  className="my-1 md:w-[210px] text-left text-black pl-1 border-2 rounded-2xl border-black"
                                  name="value"
                                  type="text"
                                  placeholder="The value for that attribute"
                                  value={x.value}
                                  onChange={e => handleAttributesChange(e, i)}
                                />
                              </div>
                              <button className="h-[35px] w-[35px] rounded-full font-bold bg-[#414e63] hover:bg-[#2C3B52]" onClick={() => handleRemoveClick(i)}>x</button>
                            </div>
                          );
                        })}

                      </div>

                      <button className="mt-3 text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[200px] h-[40px] rounded-full shadow-xl border uppercase" onClick={handleAddClick}>Add attributes</button>
                      {!isUpdating ?
                        <button className="mt-[30px] mx-auto text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] h-[35px] rounded-full shadow-xl border uppercase" onClick={update} >update</button>
                        : <button className="mt-[30px] mx-auto text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] h-[35px] rounded-full shadow-xl border uppercase cursor-not-allowed" >
                          <svg role="status" className="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                          </svg>updating...</button>}
                    </div>
                  </div>
                }

                {success && <div className="mt-[1%]">✅ Metadata successfuly updated!</div>}


                {error != '' && <div className="mt-[1%]">❌ Ohoh.. An error occurs: {error}</div>}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};