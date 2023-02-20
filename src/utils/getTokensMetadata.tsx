import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey, Connection } from "@solana/web3.js";
import { ENV, TokenListProvider } from "@solana/spl-token-registry";

export const getTokensMetadata = async (
  tokens: {
    tokenAccountaddress: string;
    mintAdddress: any;
    amount?: number;
  }[],
  connection: Connection
) => {
  const metaplex = new Metaplex(connection);
  const provider = await new TokenListProvider().resolve();
  const tokenList = provider.filterByChainId(ENV.MainnetBeta).getList();
  const tokenMap = tokenList.reduce((map, item) => {
    map.set(item.address, item);
    return map;
  }, new Map());

  const tokensMetadata = await Promise.all(
    tokens.map(async (token) => {
      const tokenAccount = token.tokenAccountaddress;
      const mint = token.mintAdddress;
      const mintPublickey = new PublicKey(mint);
      const amount = token.amount;
      let name = "";
      let logoURI = "";
      try {
        const token = await metaplex
          .nfts()
          .findByMint({ mintAddress: mintPublickey });
        name = token.name;
        if (name == "") {
          const _name = token.json?.name;
          if (_name != undefined && _name != "") {
            name = _name;
          } else {
            name = "Unknown token";
          }
        }
        const _logoURI = token.json?.image;
        if (_logoURI != undefined && _logoURI != "") {
          logoURI = _logoURI;
        } else {
          const _token = tokenMap.get(mint);
          if (!_token || !_token.logoURI) {
            logoURI =
              "https://arweave.net/WCMNR4N-4zKmkVcxcO2WImlr2XBAlSWOOKBRHLOWXNA";
          } else {
            logoURI = _token.logoURI;
          }
        }
      } catch (error) {
        const token = tokenMap.get(mint);
        if (!token || !token.logoURI) {
          logoURI =
            "https://arweave.net/WCMNR4N-4zKmkVcxcO2WImlr2XBAlSWOOKBRHLOWXNA";
        } else {
          logoURI = token.logoURI;
        }
        if (!token || !token.name) {
          name = "Unknown token";
        } else {
          name = token.name;
        }
      }
      return { name, logoURI, tokenAccount, mint, amount };
    })
  );
  tokensMetadata.sort(function (a, b) {
    if (a.name.toUpperCase() < b.name.toUpperCase()) {
      return -1;
    }
    if (a.name.toUpperCase() > b.name.toUpperCase()) {
      return 1;
    }
    return 0;
  });

  return tokensMetadata;
};
