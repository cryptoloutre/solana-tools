import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana-Tools</title>
        <meta
          name="description"
          content="Bunch of free and open source tools to help you on Solana."
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
