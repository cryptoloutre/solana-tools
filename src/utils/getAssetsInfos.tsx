import { DAS, Helius } from "helius-sdk";
import { HELIUS_API_KEY } from "../config"
import { PublicKey } from "@solana/web3.js";


export const getAssetsInfos = async (
    assets: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        amount: number
    }[],
    networkSelected: string

) => {

    const assetsWithInfos: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        name: string;
        image: string;
        amount: number
    }[] = [];
    const helius = new Helius(HELIUS_API_KEY, networkSelected);
    const ids = assets.map((asset) => asset.mint);

    try {
        const response = await helius.rpc.getAssetBatch({
            ids: ids,
        });
        for (let i = 0; i < response.length; i++) {
            assetsWithInfos.push({
                account: assets[i].account,
                program: assets[i].program,
                lamports: assets[i].lamports,
                amount: assets[i].amount,
                mint: assets[i].mint,
                name: response[i].content?.metadata?.name,
                image: response[i].content?.links?.image,
            })
        }
    } catch (error) {
        console.log(error);
    }
    return assetsWithInfos
}