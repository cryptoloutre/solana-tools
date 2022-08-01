import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { isValidSolanaAddress } from "@nfteyez/sol-rayz";
import { getParsedTokensbyUser } from './getParsedTokensbyUser'
import { getParsedEmptyAccountsbyUser } from './getParsedEmptyAccountsbyUser'

type Options = {
    publicAddress: string;
    connection: Connection;
    type: string;
}

type WalletResult = {
    tokens: string[];
    error: Error | undefined;
    isLoading: boolean;
  };

export const useWalletTokens = ({
    publicAddress,
    connection,
    type
}: Options): WalletResult => {
    const [tokens, setTokens] = useState<string[]>([]);
    const [error, setError] = useState<Error | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchTokensAccounts();
    }, [publicAddress]);

    const fetchTokensAccounts = async () => {

        // check if the address provided is a valid one
        const isValidAddress: boolean = isValidSolanaAddress(publicAddress);

        if (!isValidAddress) {
            setTokens([]);
            setError(new Error(`Invalid address: ${publicAddress}`));
            return;
        }

        setIsLoading(true);
        setError(undefined);

        try {
            if (type == 'spl') {
                const tokens = await getParsedTokensbyUser({ publicAddress, connection})
                setTokens(tokens as any);
            }
            else if (type == 'empty') {
                const tokens = await getParsedEmptyAccountsbyUser({ publicAddress, connection})
                setTokens(tokens as any);
            }
        } catch (error) {
            const err = (error as any).message
            console.log(
                "Error ocurred while token list fetched:",
                err
            );
            setTokens([]);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };


    return {
        tokens,
        error,
        isLoading,
    };
};