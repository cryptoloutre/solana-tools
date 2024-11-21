import type { NextPage } from "next";
import Head from "next/head";
import { ClaimFeesView } from "../views";

const ClaimFees: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana-Tools</title>
        <meta
          name="description"
          content="Upload file to arweave"
        />
      </Head>
      <ClaimFeesView />
    </div>
  );
};

export default ClaimFees;
