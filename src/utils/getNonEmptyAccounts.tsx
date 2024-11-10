import { PublicKey, Connection } from "@solana/web3.js";

export async function getNonEmptyTokenAccounts(owner: PublicKey, connection: Connection, program: PublicKey) {

    const nonEmptyAccounts: { account: PublicKey; program: PublicKey, lamports: number, mint: string, amount: number }[] = [];
    const accounts = (await connection.getTokenAccountsByOwner(owner, { programId: program })).value;

    accounts.map((account) => {
        const mintBuffer = account.account.data.slice(0, 32);
        const mint = new PublicKey(mintBuffer).toBase58();
        const amount = account.account.data.readBigInt64LE(64);
        if (amount != BigInt(0)) {
            nonEmptyAccounts.push({
                mint: mint,
                account: account.pubkey,
                amount: Number(amount),
                program: program,
                lamports: account.account.lamports
            });
        }
    })

    return nonEmptyAccounts;
}