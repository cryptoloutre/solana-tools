import { PublicKey, Connection } from "@solana/web3.js";
import { SCAM_TOKEN_LIST } from "./scamToken";

export function filterByScamsAndLegit(
    assets: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        name: string;
        image: string;
        amount: number
    }[]
) {
    const scamAssets: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        name: string;
        image: string;
        amount: number
    }[] = [];
    const legitAssets: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        name: string;
        image: string;
        amount: number
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