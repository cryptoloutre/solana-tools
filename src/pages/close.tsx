import type { NextPage } from "next";
import Head from "next/head";
import { CloseView } from "../views";

const Close: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana-Tools</title>
        <meta
          name="description"
          content="Close your empty token account and earn SOL"
        />
      </Head>
      <CloseView />
    </div>
  );
};

export default Close;
