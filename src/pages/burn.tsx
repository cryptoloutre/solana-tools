import type { NextPage } from "next";
import Head from "next/head";
import { BurnView } from "../views";

const Burn: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana-Tools</title>
        <meta
          name="description"
          content="Burn your asset and earn SOL"
        />
      </Head>
      <BurnView />
    </div>
  );
};

export default Burn;
