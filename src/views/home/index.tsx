import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from 'components/ui/card';
import { FlameIcon, PenLineIcon, Trash2Icon, UploadIcon, ScalingIcon, TriangleAlert } from 'lucide-react';
import useUserSOLBalanceStore from 'stores/useUserSOLBalanceStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNetworkConfiguration } from 'contexts/NetworkConfigurationProvider';
import { getConnection } from 'utils/getConnection';
import { Connection } from '@solana/web3.js';

const actionCards: Array<{
  title: string;
  href: string;
  description: React.ReactNode;
  icon: React.ReactNode;
}> = [
    {
      title: "Create",
      href: "/create",
      description: "Create your own token",
      icon: <PenLineIcon size={50} />,
    },
    {
      title: "Burn",
      href: "/burn",
      description:
        "Burn tokens and earn $SOL",
      icon: <FlameIcon size={50} />,
    },
    {
      title: "Close",
      href: "/close",
      description:
        "Close token accounts and earn $SOL",
      icon: <Trash2Icon size={50} />,
    },
    // {
    //   title: "Resize",
    //   href: "/resize",
    //   description:
    //     "Resize your NFTs and earn $SOL",
    //   icon: <ScalingIcon size={50} />,
    // },
    {
      title: "Upload",
      href: "/upload",
      description:
        "Upload file to Arweave",
      icon: <UploadIcon size={50} />,
    },
  ];

export const HomeView: FC = ({ }) => {

  const wallet = useWallet();

  const networkConfig = useNetworkConfiguration();
  const networkSelected = networkConfig.networkConfiguration;

  const balance = useUserSOLBalanceStore((s) => Math.round(s.balance * 100) / 100)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const [connection, setConnection] = useState<Connection>();

  useEffect(() => {
    const connection = getConnection(networkSelected);
    setConnection(connection)
  }, [networkConfig]);

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])
  return (

    <div className="md:hero mx-auto p-4">

      <section
        id="features"
        className={
          "space-y-12 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
        }
      >

        {balance >= 1 &&
          <div id="alert-additional-content-2" className="p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
            <div className="flex items-center">
              <svg className="flex-shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <h3 className="text-lg font-medium ml-2">High SOL Balance</h3>
            </div>
            <div className="mt-2 mb-4 text-sm">
              You have {balance} SOL. Please consider to stake it to help strengthen Solana&apos;s network decentralization. For exemple, you can stake with SolBlaze or Marinade.
            </div>
            <div className="flex">
              <a target='_blank' href='https://stake.solblaze.org/?r=944e95f397748b97' rel='noreferrer' className='mr-2'>
                <button type="button" className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                  <svg className="me-2 h-3 w-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                    <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                  </svg>
                  SolBlaze
                </button>
              </a>
              <a target='_blank' href='https://app.marinade.finance/' rel='noreferrer' className=''>
                <button type="button" className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                  <svg className="me-2 h-3 w-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                    <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                  </svg>
                  Marinade
                </button>
              </a>
            </div>
          </div>
        }

        <div className="mx-auto mt-[20%] grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {actionCards.map((item, key) => (
            <Link key={key} href={item.href} className="group">
              <Card className="border-secondary group-hover:border-white">
                <CardHeader>
                  <CardTitle className="space-y-3">
                    {item.icon}
                    <span className="block font-bold group-hover:text-pretty">
                      {item.title}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};