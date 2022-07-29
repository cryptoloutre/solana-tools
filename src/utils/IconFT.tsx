import React, { useEffect, useState } from 'react';
import { TokenListProvider, TokenInfo, ENV } from '@solana/spl-token-registry';
import proxy from './proxy.png'

export const IconFT = (props: { mint: string }) => {
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

  const token = tokenMap.get(props.mint);
  if (!token || !token.logoURI) return (<img className="bg-gray-800 object-cover h-40 lg:h-60" src={proxy.src} />);

  return (<img className="bg-gray-800 object-cover h-40 lg:h-60" src={token.logoURI} />);
}