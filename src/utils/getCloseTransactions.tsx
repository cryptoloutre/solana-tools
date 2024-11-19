import { ComputeBudgetProgram, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createCloseAccountInstruction } from "@solana/spl-token";
import { AUTHORITY } from "config";
import { CLOSE_ACCOUNT_CU, ADD_COMPUTE_UNIT_PRICE_CU, ADD_COMPUTE_UNIT_LIMIT_CU } from "./CUPerInstruction";
import { Pda } from "@metaplex-foundation/umi";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

export async function getCloseTransactions(
    assets: {
        account: PublicKey;
        program: PublicKey;
        image: string;
        name: string;
        mint: string;
        lamports: number;
        amount: number;
        tokenStandard: TokenStandard;
        collectionMetadata: Pda | undefined;
        tokenRecord: Pda | undefined;
    }[],
    connection: Connection,
    publicKey: PublicKey) {

    const transactions: Transaction[] = [];
    const nbPerTx = 20;

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
                createCloseAccountInstruction(
                    assets[j].account,
                    publicKey,
                    publicKey,
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

    const latestBlockhash = await connection.getLatestBlockhash();
    for (let k = 0; k < transactions.length; k++) {
        transactions[k].recentBlockhash = latestBlockhash.blockhash;
        transactions[k].feePayer = publicKey;
    }

    return transactions
}