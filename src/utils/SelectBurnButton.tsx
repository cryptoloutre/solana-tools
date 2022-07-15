import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react";
import { FC, useEffect, useState } from 'react';
import { burnTokenAndCloseAccount } from './burnTokenAndCloseAccount';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

type Props = {
    tokenMintAddress: string;
    NFTstoBurn: any;
    publicKey: PublicKey | null;
    connection: Connection
};

export const SelectBurnButton: FC<Props> = ({
    tokenMintAddress,
    NFTstoBurn,
    publicKey,
    connection
}) => {

    const [amount, setAmount] = useState(0);

    useEffect(() => {

        async function BalanceIsNull() {
            const mintPublickey = new PublicKey(tokenMintAddress);
            try {

                if (publicKey) {

                    const associatedAddress = await Token.getAssociatedTokenAddress(
                        ASSOCIATED_TOKEN_PROGRAM_ID,
                        TOKEN_PROGRAM_ID,
                        mintPublickey,
                        publicKey,
                    );

                    const getbalance = await connection.getTokenAccountBalance(associatedAddress)

                    const quantity = getbalance.value.amount;
                    setAmount(parseInt(quantity, 10))
                }
            }
            catch (error) {
                const err = (error as any)?.message;
                if (err.includes('could not find account')) {
                    setAmount(0)
                }
            }
        }
        BalanceIsNull();
    }, []);

    const [isSelected, setIsSelected] = useState(false);

    return (
        <div>
            {!isSelected && amount != 0 &&
                <button className="btn bg-[#55268e] hover:bg-[#3d1b66] uppercase mb-2 sm:mb-4 sm:mr-1" onClick={() => { setIsSelected(true); NFTstoBurn.push(tokenMintAddress) }}>select</button>
            }
            {isSelected && amount != 0 &&
                <button className="btn bg-[#3d1b66] hover:bg-[#55268e] uppercase mb-2 sm:mb-4 sm:mr-1" onClick={() => { setIsSelected(false); NFTstoBurn.splice(NFTstoBurn.indexOf(tokenMintAddress), 1) }}>unselect</button>
            }

            {amount == 0 &&
                <button className="btn btn-primary uppercase mb-2 sm:mb-4 sm:mr-1" disabled>success!</button>
            }


        </div>
    );
};


