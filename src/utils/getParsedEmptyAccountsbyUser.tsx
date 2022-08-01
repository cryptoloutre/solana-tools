import { Connection, PublicKey } from "@solana/web3.js";

type Options = {
    publicAddress: string;
    connection: Connection;
    limit?: number;
}


export const getParsedEmptyAccountsbyUser = async ({
    publicAddress,
    connection,
    limit = 5000,
}: Options) => {

    // Get all accounts owned by user
    // and created by SPL Token Program
    // this will include all NFTs, Coins, Tokens, etc.
    const { value: splAccounts } = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(publicAddress),
        {
            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        }
    );

    // We assume empty accounts is SPL token with amount == 0
    const EmptyAccounts = splAccounts
        .filter((t) => {
            const amount = t.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
            return amount == 0;
        })
        .map((t) => {
            const address = t.pubkey.toBase58();
            return address;
        });

    // if user have tons of empty accounts return first N
    const accountsSlice = EmptyAccounts?.slice(0, limit);

    return accountsSlice

};