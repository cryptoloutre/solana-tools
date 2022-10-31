import type { WalletProviderProps } from "@solana/wallet-adapter-react";
import { WalletProvider } from "@solana/wallet-adapter-react";

import {
  PhantomWalletAdapter,
  BackpackWalletAdapter,
  LedgerWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  SolongWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { useMemo } from "react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import('@solana/wallet-adapter-react-ui/styles.css' as any);

export function ClientWalletProvider(
  props: Omit<WalletProviderProps, "wallets">
): JSX.Element {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new BackpackWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter(),
      new SolongWalletAdapter()
    ],
    []
  );

  return (
    <WalletProvider wallets={wallets} {...props}>
      <WalletModalProvider {...props} />
    </WalletProvider>
  );


}

export default ClientWalletProvider;
