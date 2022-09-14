import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { isValidSolanaAddress } from "@nfteyez/sol-rayz";
import { getDelegatedTokensbyUser } from './getDelegatedTokensbyUser'

type Options = {
    publicAddress: string;
    connection: Connection;
}

type WalletResult = {
    delegatedTokens: string[];
    error: Error | undefined;
    isLoading: boolean;
};

export const useWalletDelegated = ({
    publicAddress,
    connection,
}: Options): WalletResult => {
    const [delegatedTokens, setDelegatedTokens] = useState<string[]>([]);
    const [error, setError] = useState<Error | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchTokensAccounts();
    }, [publicAddress]);

    const fetchTokensAccounts = async () => {

        // check if the address provided is a valid one
        const isValidAddress: boolean = isValidSolanaAddress(publicAddress);

        if (!isValidAddress) {
            setDelegatedTokens([]);
            setError(new Error(`Invalid address: ${publicAddress}`));
            return;
        }

        setIsLoading(true);
        setError(undefined);

        try {
            const tokens = await getDelegatedTokensbyUser({ publicAddress, connection })
            setDelegatedTokens(tokens as any);

        } catch (error) {
            const err = (error as any).message
            console.log(
                "Error ocurred while token list fetched:",
                err
            );
            setDelegatedTokens([]);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };


    return {
        delegatedTokens,
        error,
        isLoading,
    };
};