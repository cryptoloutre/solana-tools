import Link from "next/link";
import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletNfts, NftTokenAccount } from "@nfteyez/sol-rayz-react";
import { useConnection } from "@solana/wallet-adapter-react";

import { Loader, SolanaLogo, SelectAndConnectWalletButton } from "components";
import { NftCard } from "./NftCard";
import styles from "./index.module.css";

const walletPublicKey = "";

export const GalleryView: FC = ({ }) => {
  const { connection } = useConnection();
  const [walletToParsePublicKey, setWalletToParsePublicKey] =
    useState<string>(walletPublicKey);
  const { publicKey } = useWallet();

  const { nfts, isLoading, error } = useWalletNfts({
    publicAddress: walletToParsePublicKey,
    connection,
  });

  let errorMessage
  if (error) {
    errorMessage = error.message
  }

  console.log("nfts", nfts);

  const onUseWalletClick = () => {
    if (publicKey) {
      setWalletToParsePublicKey(publicKey?.toBase58());
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-8 2xl:px-0">
      <div className={styles.container}>
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box">
          <div className="flex-1 px-2 mx-2">
            <div className="text-sm breadcrumbs">
              <ul className="text-xl">
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
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="hero min-h-16 p-0 pt-10">
            <div className="text-center hero-content w-full">
              <div className="w-full">
                <h1 className="mb-5 text-5xl">
                  Burn your Solana <SolanaLogo /> NFTs and get $SOL back
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

                          <SelectAndConnectWalletButton
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

                  {!error && isLoading ? (
                    <div>
                      <Loader />
                    </div>
                  ) : (
                    <NftList nfts={nfts} error={error} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type NftListProps = {
  nfts: NftTokenAccount[];
  error?: Error;
};

const NftList = ({ nfts, error }: NftListProps) => {
  if (error) {
    return null;
  }

  if (!nfts?.length) {
    return (
      <div className="text-center text-2xl pt-16">
        No NFTs found in this wallet
      </div>
    );
  }

  return (
    <div>
        <ul className="text-left font-semibold text-xl mb-4">
          <li className=" mb-1"><span className='text-[#16c60c] font-semibold'>✔ Verified</span> : means the NFT does not want to drain your wallet. It does not guarantee the quality of the project. It stiil be a rug or a poor project.</li>
          <li className=" mb-1"><span className='text-[#F03A17] font-semibold'>❗ Scam</span> : means the NFT wants to drain your wallet. <strong>Do not go on its website</strong> and burn it!</li>
          <li className=" mb-1"><span className='text-[#ff7f00] font-semibold'><strong>?</strong> No information</span> : means not enough information about this NFT. Feel free to send to <a target="_blank" href="https://twitter.com/laloutre"><strong className="text-[#0080FF]">@laloutre</strong></a> the mint address in order to be add in one of the 2 others categories.</li>
        </ul>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
        {nfts?.map((nft) => (
          <NftCard key={nft.mint} details={nft} onSelect={() => { }} />
        ))}
      </div>
    </div>
  );
};
