import { ComputeBudgetProgram, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, createWithdrawWithheldTokensFromAccountsInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { AUTHORITY } from "config";
import { ADD_COMPUTE_UNIT_PRICE_CU, ADD_COMPUTE_UNIT_LIMIT_CU, WITHDRAW_TRANSFER_FEES_FOR_ADDITIONAL_ACCOUNT_CU, WITHDRAW_TRANSFER_FEES_FOR_ONE_ACCOUNT_CU } from "./CUPerInstruction";

export async function getWithdrawTransactions(
    accounts: PublicKey[],
    tokenAddress: string,
    connection: Connection,
    publicKey: PublicKey) {

    const transactions: Transaction[] = [];
    const mint = new PublicKey(tokenAddress);
    const destinationAccount = await getAssociatedTokenAddress(mint, publicKey, undefined, TOKEN_2022_PROGRAM_ID);
    const info = await connection.getAccountInfo(destinationAccount);

    if (info == null) {
        const createTransaction = new Transaction().add(ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 1000,
        }),
            ComputeBudgetProgram.setComputeUnitLimit({
                units: 25000 + ADD_COMPUTE_UNIT_LIMIT_CU + ADD_COMPUTE_UNIT_PRICE_CU
            }),
            createAssociatedTokenAccountInstruction(publicKey, destinationAccount, publicKey, mint, TOKEN_2022_PROGRAM_ID));
        transactions.push(createTransaction);
    }

    const nbWithdrawsPerTx = 25;

    // calculate the total number of transactions to do
    let nbTx: number;
    if (accounts.length % nbWithdrawsPerTx == 0) {
        nbTx = accounts.length / nbWithdrawsPerTx;
    } else {
        nbTx = Math.floor(accounts.length / nbWithdrawsPerTx) + 1;
    }

    // for each transaction
    for (let i = 0; i < nbTx; i++) {
        let bornSup: number;
        if (i == nbTx - 1) {
            bornSup = accounts.length;
        } else {
            bornSup = nbWithdrawsPerTx * (i + 1);
        }

        const start = nbWithdrawsPerTx * i; // index of the begining of the sub array
        const end = bornSup; // index of the end of the sub array

        const transaction = new Transaction();
        transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1000,
            }),
            ComputeBudgetProgram.setComputeUnitLimit({
                units: ADD_COMPUTE_UNIT_LIMIT_CU + ADD_COMPUTE_UNIT_PRICE_CU + WITHDRAW_TRANSFER_FEES_FOR_ONE_ACCOUNT_CU + (end - start) * WITHDRAW_TRANSFER_FEES_FOR_ADDITIONAL_ACCOUNT_CU
            }),
            createWithdrawWithheldTokensFromAccountsInstruction(mint, destinationAccount, publicKey, [], accounts.slice(start, end), TOKEN_2022_PROGRAM_ID)
        );

        const NON_MEMO_IX_INDEX = 0;

        // inject an authority key to track this transaction on chain
        transaction.instructions[NON_MEMO_IX_INDEX].keys.push({
            pubkey: AUTHORITY,
            isWritable: false,
            isSigner: false,
        });
        transactions.push(transaction);
    }

    const latestBlockhash = await connection.getLatestBlockhash();
    for (let k = 0; k < transactions.length; k++) {
        transactions[k].recentBlockhash = latestBlockhash.blockhash;
        transactions[k].feePayer = publicKey;
    }

    return transactions
}