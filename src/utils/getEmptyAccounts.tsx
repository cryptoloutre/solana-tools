import { PublicKey, Connection } from "@solana/web3.js";

export async function getEmptyTokenAccounts(
    owner: PublicKey,
    connection: Connection,
    program: PublicKey,
) {
    const emptyTokenAccounts: { account: PublicKey; program: PublicKey, lamports: number, mint: string, amount: number }[] = [];
    const accounts = (
        await connection.getTokenAccountsByOwner(owner, { programId: program }, { commitment: "confirmed" })
    ).value;

    accounts.map((account) => {
        if (account.account.data.readBigInt64LE(64) == BigInt(0)) {
            const mintBuffer = account.account.data.slice(0, 32);
            const mint = new PublicKey(mintBuffer).toBase58();
            emptyTokenAccounts.push({
                account: account.pubkey,
                program: program,
                lamports: account.account.lamports,
                mint: mint,
                amount: 0
            });
        }
    });

    return emptyTokenAccounts;
}