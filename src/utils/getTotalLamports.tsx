import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const getTotalLamports = (
    assets: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string
    }[]

) => {

    let maxRedeem = 0;
    assets.map((asset) => maxRedeem += asset.lamports);
    maxRedeem = maxRedeem / LAMPORTS_PER_SOL;
    return maxRedeem
}