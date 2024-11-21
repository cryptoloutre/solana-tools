import { ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction, TransactionMessage } from "@solana/web3.js";
import { createBurnInstruction, createCloseAccountInstruction, createHarvestWithheldTokensToMintInstruction } from "@solana/spl-token";
import { AUTHORITY } from "config";
import { CLOSE_ACCOUNT_CU, ADD_COMPUTE_UNIT_PRICE_CU, ADD_COMPUTE_UNIT_LIMIT_CU } from "./CUPerInstruction";
import { Pda, publicKey, transactionBuilder } from "@metaplex-foundation/umi";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { burnV1, mplTokenMetadata, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { setComputeUnitPrice } from "@metaplex-foundation/mpl-toolbox";

export async function getBurnAndCloseTransactions(
    assets: {
        account: PublicKey;
        program: PublicKey;
        image: string;
        name: string;
        mint: string;
        lamports: number;
        amount: number;
        hasWithheldAmount: boolean;
        tokenStandard: TokenStandard;
        collectionMetadata: Pda | undefined;
        tokenRecord: Pda | undefined;
    }[],
    connection: Connection,
    wallet: WalletContextState,
    type: string) {

    const transactions: Transaction[] = [];

    if (type == "scams") {
        const nbPerTx = 10;

        let nbTx: number;
        if (assets.length % nbPerTx == 0) {
            nbTx = assets.length / nbPerTx;
        } else {
            nbTx = Math.floor(assets.length / nbPerTx) + 1;
        }

        for (let i = 0; i < nbTx; i++) {
            let bornSup: number;

            if (i == nbTx - 1) {
                bornSup = assets.length;
            } else {
                bornSup = nbPerTx * (i + 1);
            }

            let Tx = new Transaction().add(
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 1000,
                }));

            let n = 0;
            for (let j = nbPerTx * i; j < bornSup; j++) {
                n += 1;
                Tx.add(
                    createBurnInstruction(
                        assets[j].account,
                        new PublicKey(assets[j].mint),
                        wallet.publicKey,
                        assets[j].amount,
                        [],
                        assets[j].program,
                    ),
                    createCloseAccountInstruction(
                        assets[j].account,
                        wallet.publicKey,
                        wallet.publicKey,
                        [],
                        assets[j].program,
                    ),
                );
            }
            Tx.add(
                ComputeBudgetProgram.setComputeUnitLimit({
                    units: n * CLOSE_ACCOUNT_CU + ADD_COMPUTE_UNIT_PRICE_CU + ADD_COMPUTE_UNIT_LIMIT_CU
                }));

            const NON_MEMO_IX_INDEX = 0;

            // inject an authority key to track this transaction on chain
            Tx.instructions[NON_MEMO_IX_INDEX].keys.push({
                pubkey: AUTHORITY,
                isWritable: false,
                isSigner: false,
            });
            transactions.push(Tx);
        }


    }

    if (type == "assets") {
        const umi = createUmi(connection);
        umi.use(mplTokenMetadata()).use(walletAdapterIdentity(wallet));
        const nbPerTx = 4;
        let nbTx: number;
        if (assets.length % nbPerTx == 0) {
            nbTx = assets.length / nbPerTx;
        } else {
            nbTx = Math.floor(assets.length / nbPerTx) + 1;
        }
        for (let i = 0; i < nbTx; i++) {
            let bornSup: number;

            if (i == nbTx - 1) {
                bornSup = assets.length;
            } else {
                bornSup = nbPerTx * (i + 1);
            }

            const burnIXs = [];
            const instructions: TransactionInstruction[] = [];

            for (let j = nbPerTx * i; j < bornSup; j++) {
                if (assets[j].program.toBase58() == "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
                    if (assets[j].hasWithheldAmount) {
                        instructions.push(
                            createHarvestWithheldTokensToMintInstruction(
                                new PublicKey(assets[j].mint),
                                [assets[j].account],
                                assets[j].program
                            ))
                    }
                    instructions.push(
                        createBurnInstruction(
                            assets[j].account,
                            new PublicKey(assets[j].mint),
                            wallet.publicKey,
                            assets[j].amount,
                            [],
                            assets[j].program,
                        ),
                        createCloseAccountInstruction(
                            assets[j].account,
                            wallet.publicKey,
                            wallet.publicKey,
                            [],
                            assets[j].program,
                        ))
                }
                else {
                    burnIXs.push(burnV1(umi, {
                        mint: publicKey(assets[j].mint),
                        tokenOwner: publicKey(wallet.publicKey.toBase58()),
                        collectionMetadata: assets[j].collectionMetadata,
                        token: publicKey(assets[j].account),
                        tokenRecord: assets[j].tokenRecord,
                        tokenStandard: assets[j].tokenStandard,
                    }))
                }
            }


            const umiInstructions = transactionBuilder()
                .add(burnIXs)
                .add(setComputeUnitPrice(umi, { microLamports: 100000 }))
                .getInstructions();

            for (let i = 0; i < umiInstructions.length; i++) {
                const ix = umiInstructions[i]
                instructions.push({
                    data: Buffer.from(ix.data),
                    keys: ix.keys.map((key) => {
                        return {
                            pubkey: new PublicKey(key.pubkey.toString()),

                            isSigner: key.isSigner,

                            isWritable: key.isWritable,
                        }
                    }),
                    programId: new PublicKey(ix.programId.toString())
                })
            };

            let latestBlockhash = await connection.getLatestBlockhash();
            const transactionMessage = new TransactionMessage({
                payerKey: wallet.publicKey,
                recentBlockhash: latestBlockhash.blockhash,
                instructions: instructions,
            });;

            const simulation = await connection.simulateTransaction(transactionMessage.compileToLegacyMessage());
            const units = simulation.value.unitsConsumed;

            instructions.push(ComputeBudgetProgram.setComputeUnitLimit({
                units: (units + ADD_COMPUTE_UNIT_LIMIT_CU) * 1.05
            }))

            const Tx = new Transaction();
            Tx.instructions = instructions;

            const NON_MEMO_IX_INDEX = instructions.length - 1;

            // inject an authority key to track this transaction on chain
            Tx.instructions[NON_MEMO_IX_INDEX].keys.push({
                pubkey: AUTHORITY,
                isWritable: false,
                isSigner: false,
            });
            transactions.push(Tx);

        }
    }

    const latestBlockhash = await connection.getLatestBlockhash();
    for (let k = 0; k < transactions.length; k++) {
        transactions[k].recentBlockhash = latestBlockhash.blockhash;
        transactions[k].feePayer = wallet.publicKey;
    }

    return transactions
}