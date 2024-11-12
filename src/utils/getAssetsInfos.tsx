import { Helius } from "helius-sdk";
import { HELIUS_API_KEY } from "../config"
import { PublicKey } from "@solana/web3.js";
import { DigitalAsset, findMetadataPda, findTokenRecordPda, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { Pda, publicKey, Umi } from "@metaplex-foundation/umi";


export const getAssetsInfos = async (
    assets: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        amount: number
    }[],
    digitalAssets: DigitalAsset[],
    umi: Umi,
    networkSelected: string

) => {

    const assetsWithInfos: {
        account: PublicKey;
        program: PublicKey;
        lamports: number;
        mint: string;
        amount: number;
        name: string;
        image: string;
        tokenStandard: TokenStandard,
        collectionMetadata: Pda | undefined,
        tokenRecord: Pda | undefined
    }[] = [];

    try {

        const helius = new Helius(HELIUS_API_KEY, networkSelected);
        const ids = assets.map((asset) => asset.mint);
        const response = await helius.rpc.getAssetBatch({
            ids: ids,
        });

        console.log(response)
        console.log("metaplex", digitalAssets)
        for (let i = 0; i < assets.length; i++) {

            const digitalAsset = digitalAssets.find((asset) => asset.publicKey.toString() == assets[i].mint);
            const assetFromHelius = response.find((asset) => asset.id == assets[i].mint);
            let name = "Unknown Token";
            let image = "";
            let tokenStandard: number = 0;
            let collectionMetadata: Pda = undefined;
            let tokenRecord: Pda = undefined;

            if (digitalAsset) {
                if (digitalAsset.metadata.name != "") {
                    name = digitalAsset.metadata.name.trim();
                }

                if (digitalAsset.metadata.tokenStandard.__option == "Some") {
                    tokenStandard = digitalAsset.metadata.tokenStandard.value;
                    if (tokenStandard == TokenStandard.ProgrammableNonFungible) {
                        tokenRecord = findTokenRecordPda(umi, {
                            mint: publicKey(assets[i].mint),
                            token: publicKey(assets[i].account.toBase58()),
                        });
                    }
                }

                if (digitalAsset.metadata.collection.__option == "Some") {
                    const collectionMintAddress = digitalAsset.metadata.collection.value.key;
                    collectionMetadata = findMetadataPda(umi, { mint: collectionMintAddress });
                }
            }

            if (!digitalAsset && assetFromHelius) {
                if (assetFromHelius.content?.metadata.name && assetFromHelius.content?.metadata?.name != "") {
                    name = assetFromHelius.content.metadata.name.trim();
                }
            }

            if (assetFromHelius.content?.links?.image) {
                image = assetFromHelius.content.links.image;
            }

            if (!assetFromHelius.ownership.frozen) {
                assetsWithInfos.push({
                    account: assets[i].account,
                    program: assets[i].program,
                    lamports: assets[i].lamports,
                    amount: assets[i].amount,
                    mint: assets[i].mint,
                    name: name,
                    image: image,
                    tokenStandard: tokenStandard,
                    collectionMetadata: collectionMetadata,
                    tokenRecord: tokenRecord
                })
            }
        }
        assetsWithInfos.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
    } catch (error) {
        console.log(error);
    }
    return assetsWithInfos
}