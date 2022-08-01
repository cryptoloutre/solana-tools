import React, { useEffect, useState } from 'react';
import { NameFTEA } from './NameFTEA';
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

export const TokenNameEA = (props: { account: string, connection: Connection, metaplex: Metaplex }) => {

  const [isNFT, setIsNFT] = useState<boolean>()
  const [isClosed, setIsClosed] = useState<boolean>(false)
  const [name, setName] = useState('')

  useEffect(() => {

    async function isNFT() {
      const account = props.account
      const connection = props.connection
      const metaplex = props.metaplex
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

        // get the nft object with the mint publickey address
        const nft = await metaplex.nfts().findByMint(mintPublickey);

        // get the name of the nft object
        const name = nft.metadata.name

        // test if the name is defined
        // if it is, it means it is the token is an nft so we set its name
        // if it's not, it means it's not an nft
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
        <NameFTEA account={props.account} connection={props.connection} />
      }
      {isNFT == true &&
        <div>{name}</div>
      }
      {isClosed == true &&
        <div>Unknown token</div>
      }

    </div>
  )
}