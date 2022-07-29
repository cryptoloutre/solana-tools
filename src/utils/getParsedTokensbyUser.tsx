import { Connection, PublicKey, AccountInfo, ParsedAccountData } from "@solana/web3.js";

type Options = {
    publicAddress: string;
    connection: Connection;
    type: string;
    limit?: number;
}


export const getParsedTokensbyUser = async ({
    publicAddress,
    connection,
    type,
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

    // We assume tokens is SPL token with decimals !== 0 and amount !==0
    // At this point we filter out other SPL tokens, like NFT e.g.
    const nftAccounts = splAccounts
        .filter((t) => {
            const amount = t.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
            const decimals = t.account?.data?.parsed?.info?.tokenAmount?.decimals;
            if (type =='spl') {
                return decimals !== 0 && amount != 0;
            }
            else if(type == 'empty') {
                return amount == 0;
            }
        })
        .map((t) => {
            const address = t.account?.data?.parsed?.info?.mint;
            return address;
        });

    // if user have tons of tokens return first N
    const accountsSlice = nftAccounts?.slice(0, limit);

    return accountsSlice

};