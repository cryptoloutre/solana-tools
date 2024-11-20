import { getTransferFeeAmount, unpackAccount } from "@solana/spl-token";
import { PublicKey, Connection } from "@solana/web3.js";

export async function getNonEmptyTokenAccounts(owner: PublicKey, connection: Connection, program: PublicKey) {

    const nonEmptyAccounts: { account: PublicKey; program: PublicKey, lamports: number, mint: string, amount: number, hasWithheldAmount: boolean }[] = [];
    const accounts = (await connection.getTokenAccountsByOwner(owner, { programId: program })).value;

    accounts.map((account) => {
        const mintBuffer = account.account.data.slice(0, 32);
        const mint = new PublicKey(mintBuffer);
        const amount = account.account.data.readBigInt64LE(64);
        const unpackedAccount = unpackAccount(account.pubkey, account.account, program);
        const transferFeeAmount = getTransferFeeAmount(unpackedAccount);
        let hasWithheldAmount = false;
        if (
            transferFeeAmount != null &&
            transferFeeAmount.withheldAmount > BigInt(0)
        ) {
            hasWithheldAmount = true;
        }
        if (amount != BigInt(0)) {
            nonEmptyAccounts.push({
                mint: mint.toBase58(),
                account: account.pubkey,
                amount: Number(amount),
                program: program,
                lamports: account.account.lamports,
                hasWithheldAmount: hasWithheldAmount
            });
        }
    })

    return nonEmptyAccounts;
}