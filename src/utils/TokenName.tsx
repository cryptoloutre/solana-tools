import React, { useEffect, useState } from 'react';
import { NameFT } from './NameFT';
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

export const TokenName = (props: { mint: string }) => {

  const [isNFT, setIsNFT] = useState<boolean>()
  const [name, setName] = useState('')

  useEffect(() => {

    async function isNFT() {
      const mintPublickey = new PublicKey(props.mint);
      const connection = new Connection("https://ssc-dao.genesysgo.net");
      const metaplex = new Metaplex(connection);

      try {
        const nft = await metaplex.nfts().findByMint(mintPublickey);
        const name = nft.metadata.name

        if (name != undefined) {
          setIsNFT(true)
          setName(name)
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
        <NameFT mint={props.mint} />
      }
      {isNFT == true &&
        <div>{name}</div>
      }

    </div>
  )
}