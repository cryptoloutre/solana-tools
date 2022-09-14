import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { FC, useEffect, useState } from 'react';

type Props = {
    tokenMintAddress: string;
    toRevoke: any;
    publicKey: PublicKey | null;
    connection: Connection;
};

export const SelectRevokeButton: FC<Props> = ({
    tokenMintAddress,
    toRevoke,
    publicKey,
    connection,
}) => {

    const [delegated, setDelegated] = useState<boolean>();

    useEffect(() => {

        async function isDelegated() {
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
                        // if delegateOption == 0 then the account is not delegated
                        // it is otherwise
                        const delegateOption = info.delegateOption
                        if (delegateOption == 0) {
                            setDelegated(false)
                        }
                        else {
                            setDelegated(true)
                        }
                    }

                }

            }
            catch (error) {
                setDelegated(false)
                const err = (error as any)?.message;
                console.log(err)
            }
        }
        isDelegated();
    }, []);

    const [isSelected, setIsSelected] = useState(false);


    return (
        <div>
            {!isSelected && delegated == true &&
                <button className="btn bg-[#55268e] hover:bg-[#3d1b66] uppercase mb-2 sm:mb-4 sm:mr-1" onClick={() => { setIsSelected(true); toRevoke.push(tokenMintAddress) }}>select</button>
            }
            {isSelected && delegated == true &&
                <button className="btn bg-[#3d1b66] hover:bg-[#55268e] uppercase mb-2 sm:mb-4 sm:mr-1" onClick={() => { setIsSelected(false); toRevoke.splice(toRevoke.indexOf(tokenMintAddress), 1) }}>unselect</button>
            }

            {delegated == false &&
                <button className="btn btn-primary uppercase mb-2 sm:mb-4 sm:mr-1" disabled>success!</button>
            }


        </div>
    );
};


