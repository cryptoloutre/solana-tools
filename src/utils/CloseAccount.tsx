import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Dispatch, SetStateAction } from 'react';



export async function CloseAccount(AccountstoClose: string[], owner: PublicKey, wallet: WalletContextState, connection: Connection, setIsburning: Dispatch<SetStateAction<boolean>>, setMessage: Dispatch<SetStateAction<string>>, setRefresh: Dispatch<SetStateAction<boolean>>, setCurrentTx: Dispatch<SetStateAction<number | undefined>>, setTotalTx: Dispatch<SetStateAction<number | undefined>>) {
    try {
        if (AccountstoClose[0] != undefined) {
            
            setMessage('')
            setIsburning(true)

            // define the number of burn/close done in one Tx
            const nbPerTx = 10

            // calculate the number of Tx to do
            let nbTx: number
            if (AccountstoClose.length % 10 == 0) {
                nbTx = AccountstoClose.length / nbPerTx
            }
            else {
                nbTx = Math.floor(AccountstoClose.length / nbPerTx) + 1;
            }

            setTotalTx(nbTx)

            for (let i = 0; i < nbTx; i++) {

                // Create a transaction
                let Tx = new Transaction()

                let bornSup: number

                if (i == nbTx - 1) {
                    bornSup = AccountstoClose.length
                }

                else {
                    bornSup = 10 * (i + 1)
                }

                // for each NFT selected
                for (let j = 10 * i; j < bornSup; j++) {

                    // get the publickey of the token account
                    const accountPubKey = new PublicKey(AccountstoClose[j]);


                    // create the close account instruction
                    const closeInstruction = await Token.createCloseAccountInstruction(
                        TOKEN_PROGRAM_ID,
                        accountPubKey,
                        owner,
                        owner,
                        []
                    );

                    // add the instructions to the transaction
                    Tx.add(closeInstruction)

                }

                // incremente the current transaction
                setCurrentTx(i + 1)

                // send the transaction
                const signature = await wallet.sendTransaction(Tx, connection);

                // get the confirmation of the transaction
                const confirmed = await connection.confirmTransaction(signature, 'processed');
                console.log('success')

            }
            setIsburning(false)
            setRefresh(true)
            setRefresh(false)
        }

        else {
            setMessage('Please, select first at least one token to burn')
        }
    } catch (error) {
        const err = (error as any)?.message;
        console.log(err)
        setIsburning(false)
    }
}
