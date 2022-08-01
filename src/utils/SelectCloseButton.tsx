import { Connection, PublicKey } from '@solana/web3.js';
import { FC, useEffect, useState } from 'react';

type Props = {
    tokenAccount: string;
    toClose: any;
    publicKey: PublicKey | null;
    connection: Connection;
};

export const SelectCloseButton: FC<Props> = ({
    tokenAccount,
    toClose,
    publicKey,
    connection,
}) => {

    const [accountExist, setAccountExist] = useState<boolean>();

    useEffect(() => {

        async function BalanceIsNull() {

            // get the publickey of the Token account
            const accountPubKey = new PublicKey(tokenAccount)
            try {

                if (publicKey) {

                    // get the SOL balance of the ATA
                    // if this balance != 0 the ATA is not closed, it's closed otherwise
                    const balance = await connection.getBalance(accountPubKey)
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
                <button className="btn bg-[#55268e] hover:bg-[#3d1b66] uppercase mb-2 sm:mb-4 sm:mr-1" onClick={() => { setIsSelected(true); toClose.push(tokenAccount) }}>select</button>
            }
            {isSelected && accountExist == true &&
                <button className="btn bg-[#3d1b66] hover:bg-[#55268e] uppercase mb-2 sm:mb-4 sm:mr-1" onClick={() => { setIsSelected(false); toClose.splice(toClose.indexOf(tokenAccount), 1) }}>unselect</button>
            }

            {accountExist == false &&
                <button className="btn btn-primary uppercase mb-2 sm:mb-4 sm:mr-1" disabled>success!</button>
            }


        </div>
    );
};


