import React, { useEffect, useState } from 'react';
import { IconFT } from './IconFT';
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

export const TokenIcon = (props: { mint: string }) => {

  const [isNFT, setIsNFT] = useState<boolean>()
  const [uri, setURI] = useState('')

  useEffect(() => {

    async function isNFT() {
      // define the mint publickey address
      const mintPublickey = new PublicKey(props.mint);

      // define the connection
      const connection = new Connection("https://rpc.helius.xyz/?api-key=24465ca6-a736-4f9b-a813-c85ab1e6928a");

      // create an entry point to Metaplex SDK
      const metaplex = new Metaplex(connection);

      try {

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
        console.log(err);
        setIsNFT(false);
      }
    }
    isNFT();
  }, []);

  return (
    <div>
      {isNFT == false &&
        <IconFT mint={props.mint} />
      }
      {isNFT == true &&
        <img className="bg-gray-800 object-cover h-40 lg:h-60" src={uri} />
      }

    </div>
  )
}
