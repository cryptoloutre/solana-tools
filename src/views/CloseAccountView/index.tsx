import Link from "next/link";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { ConnectWallet, Loader } from "components";
import styles from "./index.module.css";
import { FetchTokensButton } from "components/FetchTokensButton";

import { useWalletTokens} from "../../utils/useWalletTokens"

import { TokenCard } from "./TokenCard";
import { CloseButton } from "utils/CloseButton";

const walletPublicKey = "";

export const CloseAccountView: FC = ({ }) => {
  const { connection } = useConnection();

  const [walletToParsePublicKey, setWalletToParsePublicKey] =
    useState<string>(walletPublicKey);

  const { publicKey } = useWallet();

  const [refresh, setRefresh] = useState(false)

  const onUseWalletClick = () => {
    if (publicKey) {
      setWalletToParsePublicKey(publicKey?.toBase58());
    }
  };

  const { tokens, isLoading, error } = useWalletTokens({
    publicAddress: walletToParsePublicKey,
    connection,
    type : 'empty'
  });


  let errorMessage
  if (error) {
    errorMessage = error.message
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
                Close empty account and get $SOL back
                </h1>
                <div className="w-full min-w-full">
                  <div>
                    <div className="form-control mt-8">
                      <label className="input-group input-group-vertical input-group-lg">

                        <div className="flex space-x-2">
                          <input
                            readOnly
                            type="text"
                            placeholder="Please, connect your wallet"
                            className="w-full input input-bordered input-lg"
                            value={walletToParsePublicKey}
                            style={{
                              borderRadius:
                                "0 0 var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                            }}
                          />

                          <FetchTokensButton
                            onUseWalletClick={onUseWalletClick}
                          />

                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-auto my-10">
                  {error && errorMessage != "Invalid address: " ? (
                    <div>
                      <h1>Error Occures</h1>
                      {(error as any)?.message}
                    </div>
                  ) : null}

                  {!error && isLoading &&
                    <div>
                      <Loader />
                    </div>
                  }
                  {!error && !isLoading && !refresh &&
                    <AccountList accounts={tokens} error={error} setRefresh={setRefresh} />
                  }

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type AccountListProps = {
  accounts: string[] | undefined;
  error?: Error;
  setRefresh: Dispatch<SetStateAction<boolean>>;
};

const AccountList = ({ accounts, error, setRefresh}: AccountListProps) => {
  if (error) {
    return null;
  }

  if (!accounts?.length) {
    return (
      <div className="text-center text-2xl pt-16">
        No empty account found in this wallet
      </div>
    );
  }

  const AccountstoClose: string[] = []
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useWallet();

  return (
    <div>

      <CloseButton toClose={AccountstoClose} connection={connection} publicKey={publicKey} wallet={wallet} setRefresh={setRefresh} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
        {accounts?.map((token) => (
          <TokenCard key={token} account={token} toClose={AccountstoClose} />
        ))}
      </div>
    </div>
  );
};
