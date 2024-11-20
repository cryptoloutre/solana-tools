import { PublicKey, Connection } from "@solana/web3.js";
import { SCAM_TOKEN_LIST } from "./scamToken";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { Pda } from "@metaplex-foundation/umi";

export function filterByScamsAndLegit(
    assets: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        name: string;
        image: string;
        amount: number;
        hasWithheldAmount: boolean;
        tokenStandard: TokenStandard;
        collectionMetadata: Pda | undefined;
        tokenRecord: Pda | undefined
    }[]
) {
    const scamAssets: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        name: string;
        image: string;
        amount: number;
        hasWithheldAmount: boolean;
        tokenStandard: TokenStandard;
        collectionMetadata: Pda | undefined;
        tokenRecord: Pda | undefined
    }[] = [];
    const legitAssets: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        name: string;
        image: string;
        amount: number;
        hasWithheldAmount: boolean;
        tokenStandard: TokenStandard;
        collectionMetadata: Pda | undefined;
        tokenRecord: Pda | undefined
    }[] = [];

    assets.map((asset) => {
        if (SCAM_TOKEN_LIST.includes(asset.mint)) {
            scamAssets.push(asset)
        }
        else {
            legitAssets.push(asset)
        }
    })

    return [scamAssets, legitAssets];
}