import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

type Options = {
    account: string;
    connection: Connection;
}

export const getMintFromTokenAccount = ({
    account,
    connection,
}: Options): string => {
    const [mint, setMint] = useState<string>('');

    useEffect(() => {
        getMint();
    }, [account]);

    const getMint = async () => {

        // get the publicket of the token account
        const accountPubKey = new PublicKey(account);

        // fetch the info of the token account
        const accountInfo = await connection.getParsedAccountInfo(accountPubKey);

        let data:any

        try {

        // get the data
        data = accountInfo.value?.data

        // get the mint address
        const _mint = data.parsed.info.mint

        if (_mint) {
            setMint(_mint)
        }
    }
        catch(error) {
        }
    };
    
    return (
        mint
    )
};