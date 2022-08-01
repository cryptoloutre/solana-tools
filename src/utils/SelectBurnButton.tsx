import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { FC, useEffect, useState } from 'react';

type Props = {
    tokenMintAddress: string;
    toBurn: any;
    publicKey: PublicKey | null;
    connection: Connection;
};

export const SelectBurnButton: FC<Props> = ({
    tokenMintAddress,
    toBurn,
    publicKey,
    connection,
}) => {

    const [accountExist, setAccountExist] = useState<boolean>();

    useEffect(() => {

        async function BalanceIsNull() {
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


                    // get the token balance 
                    // if this balance != 0 the ATA is not closed, it's closed otherwise 
                    const getBalance = await connection.getTokenAccountBalance(associatedAddress)
                    const balance = getBalance.value.uiAmount
                    if (balance != 0) {
                        setAccountExist(true)
                    }
                    else {
                        setAccountExist(false)
                    }
                }
            }
            catch (error) {
                setAccountExist(false)
                const err = (error as any)?.message;
                console.log(err)
            }
        }
        BalanceIsNull();
    }, []);

    const [isSelected, setIsSelected] = useState(false);


    return (
        <div>
            {!isSelected && accountExist == true &&
                <button className="btn bg-[#55268e] hover:bg-[#3d1b66] uppercase mb-2 sm:mb-4 sm:mr-1" onClick={() => { setIsSelected(true); toBurn.push(tokenMintAddress) }}>select</button>
            }
            {isSelected && accountExist == true &&
                <button className="btn bg-[#3d1b66] hover:bg-[#55268e] uppercase mb-2 sm:mb-4 sm:mr-1" onClick={() => { setIsSelected(false); toBurn.splice(toBurn.indexOf(tokenMintAddress), 1) }}>unselect</button>
            }

            {accountExist == false &&
                <button className="btn btn-primary uppercase mb-2 sm:mb-4 sm:mr-1" disabled>success!</button>
            }


        </div>
    );
};


