import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { FC, useEffect, useState } from 'react';

type Props = {
    tokenMintAddress: string;
    publicKey: PublicKey | null;
    connection: Connection;
};

export const DelegatedAddress: FC<Props> = ({
    tokenMintAddress,
    publicKey,
    connection,
}) => {

    const [delegateAddress, setDelegateAddress] = useState('');

    useEffect(() => {

        async function getDelegatedAddress() {
            const mintPublickey = new PublicKey(tokenMintAddress);
            try {

                if (publicKey) {

                    // get the associated token address
                    const associatedAddress = await Token.getAssociatedTokenAddress(
                        ASSOCIATED_TOKEN_PROGRAM_ID,
                        TOKEN_PROGRAM_ID,
                        mintPublickey,
                        publicKey,
                    );


                    // get the token account info
                    const tokenAccountInfo = await connection.getAccountInfo(associatedAddress)

                    if (tokenAccountInfo) {
                        const info = AccountLayout.decode(tokenAccountInfo.data)
                        const delegate = new PublicKey(info.delegate).toBase58()
                        setDelegateAddress(delegate)
                    }

                }

            }
            catch (error) {
                const err = (error as any)?.message;
                console.log(err)
            }
        }
        getDelegatedAddress();
    }, []);

    return (
        <div>
            <a target="_blank" className="flex font-bold underline" href={"https://solscan.io/token/" + delegateAddress}>Check delegate address</a>


        </div>
    );
};