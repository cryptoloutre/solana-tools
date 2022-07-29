import React, { useEffect, useState } from 'react';
import { TokenListProvider, TokenInfo, ENV } from '@solana/spl-token-registry';


export const NameFT = (props: { mint: string }) => {
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  useEffect(() => {
    new TokenListProvider().resolve().then(tokens => {
      const tokenList = tokens.filterByChainId(ENV.MainnetBeta).getList();

      setTokenMap(tokenList.reduce((map, item) => {
        map.set(item.address, item);
        return map;
      },new Map()));
    });
  }, [setTokenMap]);

  const token = tokenMap.get(props.mint);
  if (!token || !token.name) return <div>Unknown token</div>;

  return <div>{token.name}</div>;}