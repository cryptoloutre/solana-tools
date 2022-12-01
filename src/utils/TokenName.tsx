import React, { useEffect, useState } from "react";
import { NameFT } from "./NameFT";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

export const TokenName = (props: { mint: string }) => {
  const [isNFT, setIsNFT] = useState<boolean>();
  const [name, setName] = useState("");

  useEffect(() => {
    async function isNFT() {
      const mintPublickey = new PublicKey(props.mint);
      const connection = new Connection(
        "https://rpc.helius.xyz/?api-key=24465ca6-a736-4f9b-a813-c85ab1e6928a"
      );
      // create an entry point to Metaplex SDK
      const metaplex = new Metaplex(connection);

      try {
        // get the nft object with the mint publickey address
        const nft = await metaplex
          .nfts()
          .findByMint({ mintAddress: mintPublickey });

        // get the name of the nft object
        const name = nft.name;

        // test if the name is defined
        // if it is, it means it is the token is an nft so we set its name
        // if it's not, it means it's not an nft
        if (name != undefined) {
          setIsNFT(true);
          setName(name);
        } else {
          setIsNFT(false);
        }
      } catch (error) {
        const err = (error as any)?.message;
        console.log(err);
        setIsNFT(false);
      }
    }
    isNFT();
  }, []);

  return (
    <div>
      {isNFT == false && <NameFT mint={props.mint} />}
      {isNFT == true && <div>{name}</div>}
    </div>
  );
};
