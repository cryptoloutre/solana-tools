import React, { useEffect, useState } from 'react';
import { TokenListProvider, TokenInfo, ENV } from '@solana/spl-token-registry';
import { Connection } from "@solana/web3.js";
import proxy from './proxy.png'
import { getMintFromTokenAccount } from './getMintFromTokenAccount';

export const IconFTEA = (props: { account: string, connection: Connection }) => {
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  useEffect(() => {

    new TokenListProvider().resolve().then(tokens => {
      const tokenList = tokens.filterByChainId(ENV.MainnetBeta).getList();

      setTokenMap(tokenList.reduce((map, item) => {
        map.set(item.address, item);
        return map;
      }, new Map()));
    });
  }, [setTokenMap]);
  const connection = props.connection
  const account = props.account

  const mint = getMintFromTokenAccount({account, connection})
  const token = tokenMap.get(mint);
  if (!token || !token.logoURI) return (<img className="bg-gray-800 object-cover h-40 lg:h-60" src={proxy.src} />);

  return (<img className="bg-gray-800 object-cover h-40 lg:h-60" src={token.logoURI} />);
}