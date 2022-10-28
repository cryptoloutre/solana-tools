import React, { useEffect, useState } from 'react';
import { IconFTEA } from './IconFTEA';
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import proxy from './proxy.png'

export const TokenIconEA = (props: { account: string, connection: Connection, metaplex: Metaplex }) => {

  const [isNFT, setIsNFT] = useState<boolean>()
  const [isClosed, setIsClosed] = useState<boolean>(false)
  const [uri, setURI] = useState('')

  useEffect(() => {

    async function isNFT() {
      const account = props.account
      const connection = props.connection
      const accountPubKey = new PublicKey(account);

      // get the token account info of the token account
      const accountInfo = await connection.getParsedAccountInfo(accountPubKey);

      let data: any

      // get the data of the token account
      data = accountInfo.value?.data


      try {
        // get the mint address associated to the token account
        const _mint = data.parsed.info.mint
        const mintPublickey = new PublicKey(_mint);
        const metaplex = props.metaplex;

        // get the nft object with the mint publickey address
        const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublickey });

        // get the logo of the nft object
        const logo = nft.json?.image

        // test if the logo is defined
        // if it is, it means it is the token is an nft so we set its URI
        // if it's not, it means it's not an nft
        if (logo != undefined) {
          setIsNFT(true)
          setURI(logo)
        }
        else {
          setIsNFT(false)
        }

      }
      catch (error) {
        const err = (error as any)?.message;
        // the token is not an nft if there is no metadata account associated
        if (err.includes('No Metadata account could be found for the provided mint address')) {
          setIsNFT(false)
        }
        else {
          setIsClosed(true)
        }
      }
    }
    isNFT();
  }, []);

  return (
    <div>
      {isNFT == false &&
        <IconFTEA account={props.account} connection={props.connection} />
      }
      {isNFT == true &&
        <img className="bg-gray-800 object-cover h-40 lg:h-60" src={uri} />
      }
      {isClosed == true &&
        <img className="bg-gray-800 object-cover h-40 lg:h-60" src={proxy.src} />
      }

    </div>
  )
}
