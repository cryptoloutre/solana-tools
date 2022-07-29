import React, { useEffect, useState } from 'react';
import { IconFT } from './IconFT';
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

export const TokenIcon = (props: { mint: string }) => {

  const [isNFT, setIsNFT] = useState<boolean>()
  const [uri, setURI] = useState('')

  useEffect(() => {

    async function isNFT() {
      const mintPublickey = new PublicKey(props.mint);
      const connection = new Connection("https://ssc-dao.genesysgo.net");
      const metaplex = new Metaplex(connection);

      try {
        const nft = await metaplex.nfts().findByMint(mintPublickey);
        const logo = nft.metadata.image

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
        if (err.includes('No Metadata account could be found for the provided mint address')) {
          setIsNFT(false)
        }
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
