import { FC, useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SelectCloseButton } from '../../utils/SelectCloseButton';
import { TokenIconEA } from "utils/TokenIconEA";
import { TokenNameEA } from "utils/TokenNameEA";
import {getMintFromTokenAccount} from "utils/getMintFromTokenAccount"
import { Metaplex } from "@metaplex-foundation/js";


type Props = {
  account: string;
  toClose: any;
};

export const TokenCard: FC<Props> = ({
  account,
  toClose,
}) => {


  const wallet = useWallet();

  const { connection } = useConnection();

  const { publicKey } = useWallet();
  const metaplex = new Metaplex(connection);

  // get the mint address of the token account
  const mint = getMintFromTokenAccount({account, connection})


  return (
    <div className={`card bordered max-w-xs compact rounded-md`}>
      <figure className="min-h-16 animation-pulse-color">
        <TokenIconEA account={account} connection={connection} metaplex={metaplex} />
      </figure>
      <div className="card-body h-20 sm:h-16 mb-4">
        <h2 className="card-title text-sm text-left">
          <TokenNameEA account={account} connection={connection} metaplex={metaplex} />
        </h2>
      </div>
      <div className="sm:flex justify-center">
        <SelectCloseButton tokenAccount={account} connection={connection} publicKey={publicKey} toClose={toClose} />

        <a target="_blank" className="btn text-xs bg-[#9945FF] hover:bg-[#7a37cc] uppercase sm:w-[50%] sm:ml-1 mb-2 sm:mb-4" href={"https://solscan.io/token/" + mint}>Check Solscan</a>
      </div>
    </div>
  );
};
