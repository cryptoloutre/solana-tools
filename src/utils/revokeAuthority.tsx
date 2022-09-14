import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Dispatch, SetStateAction } from 'react';

export async function revokeAuthority(AccountsToRevoke: string[], owner: PublicKey, wallet: WalletContextState, connection: Connection, setIsRevoking: Dispatch<SetStateAction<boolean>>, setMessage: Dispatch<SetStateAction<string>>, setRefresh: Dispatch<SetStateAction<boolean>>, setCurrentTx: Dispatch<SetStateAction<number | undefined>>, setTotalTx: Dispatch<SetStateAction<number | undefined>>) {
    try {
        if (AccountsToRevoke[0] != undefined) {

            setMessage('')
            setIsRevoking(true)

            // define the number of burn/close done in one Tx
            const nbPerTx = 10

            // calculate the number of Tx to do
            let nbTx: number
            if (AccountsToRevoke.length % 10 == 0) {
                nbTx = AccountsToRevoke.length / nbPerTx
            }
            else {
                nbTx = Math.floor(AccountsToRevoke.length / nbPerTx) + 1;
            }

            setTotalTx(nbTx)

            for (let i = 0; i < nbTx; i++) {

                // Create a transaction
                let Tx = new Transaction()

                let bornSup: number

                if (i == nbTx - 1) {
                    bornSup = AccountsToRevoke.length
                }

                else {
                    bornSup = 10 * (i + 1)
                }

                // for each tokens selected
                for (let j = 10 * i; j < bornSup; j++) {

                    // get the publickey of the token
                    const mintPublickey = new PublicKey(AccountsToRevoke[j]);

                    // determine the associated token account of the token
                    const associatedAddress = await Token.getAssociatedTokenAddress(
                        ASSOCIATED_TOKEN_PROGRAM_ID,
                        TOKEN_PROGRAM_ID,
                        mintPublickey,
                        owner,
                    );

                    // get the token account info of the ATA
                    const tokenAccountInfo = await connection.getAccountInfo(associatedAddress)

                    if (tokenAccountInfo) {
                        const info = AccountLayout.decode(tokenAccountInfo.data)
                        console.log(new PublicKey(info.delegate).toBase58())
                        const revokeIx = Token.createRevokeInstruction(
                            TOKEN_PROGRAM_ID,
                            associatedAddress,
                            owner,
                            []
                        )
                        Token.createApproveInstruction
                        Tx.add(revokeIx)
                    }

                }


                // incremente the current transaction
                setCurrentTx(i + 1)

                // send the transaction
                const signature = await wallet.sendTransaction(Tx, connection);

                // get the confirmation of the transaction
                const confirmed = await connection.confirmTransaction(signature, 'processed');
                console.log('success')

            }
            setIsRevoking(false)
            setRefresh(true)
            setRefresh(false)
        }

        else {
            setMessage('Please, select first at least one token to burn')
        }
    } catch (error) {
        const err = (error as any)?.message;
        console.log(err)
        setIsRevoking(false)
    }
}
