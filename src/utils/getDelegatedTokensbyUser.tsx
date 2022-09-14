import { AccountLayout } from "@solana/spl-token";
import { Connection, PublicKey, AccountInfo, ParsedAccountData } from "@solana/web3.js";

type Options = {
    publicAddress: string;
    connection: Connection;
    limit?: number;
}


export const getDelegatedTokensbyUser = async ({
    publicAddress,
    connection,
    limit = 5000,
}: Options) => {

    // Get all accounts owned by user
    // and created by SPL Token Program
    // this will include all NFTs, Coins, Tokens, etc.
    const { value: splAccounts } = await connection.getTokenAccountsByOwner(
        new PublicKey(publicAddress),
        {
            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        }
    );

    // We assume delegated tokens is SPL token with delegateOption != 0
    const nftAccounts = splAccounts
        .filter((t) => {
            const data = t.account.data;
            const info = AccountLayout.decode(data);
            const delegateOption = info.delegateOption;
            console.log(delegateOption);
            return delegateOption != 0;
        })
        .map((t) => {
            const data = t.account.data;
            const info = AccountLayout.decode(data);
            const address = new PublicKey(info.mint).toBase58()
            return address;
        });

    // if user have tons of delegated tokens return first N
    const accountsSlice = nftAccounts?.slice(0, limit);

    return accountsSlice

};