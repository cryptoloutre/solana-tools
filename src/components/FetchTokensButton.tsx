import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

type Props = {
  onUseWalletClick: () => void;
};

export const FetchTokensButton: FC<Props> = ({
  onUseWalletClick,
}) => {
  const { setVisible } = useWalletModal();
  const { wallet, connect, connecting, publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey && wallet) {
      try {
        connect();
      } catch (error) {
        console.log("Error connecting to the wallet: ", (error as any).message);
      }
    }
  }, [wallet]);

  const handleWalletClick = () => {
    try {
      if (!wallet) {
        setVisible(true);
      } else {
        connect();
      }
      onUseWalletClick();
    } catch (error) {
      console.log("Error connecting to the wallet: ", (error as any).message);
    }
  };

  return (
    <div> {publicKey ?
      <button
        className="btn btn-primary btn-lg w-40"
        onClick={handleWalletClick}
        disabled={connecting}
      >
        <div>Show tokens</div>
      </button> : null}
    </div> 
  );
};