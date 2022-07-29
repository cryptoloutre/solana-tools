import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Dispatch, SetStateAction } from 'react';



export async function burnTokenAndCloseAccount(NFTstoBurn: string[], owner: PublicKey, wallet: WalletContextState, connection: Connection, setIsburning: Dispatch<SetStateAction<boolean>>, setMessage: Dispatch<SetStateAction<string>>, setRefresh: Dispatch<SetStateAction<boolean>>, setCurrentTx: Dispatch<SetStateAction<number | undefined>>, setTotalTx: Dispatch<SetStateAction<number | undefined>>) {
    try {
        if (NFTstoBurn[0] != undefined) {

            setMessage('')
            setIsburning(true)

            // define the number of burn/close done in one Tx
            const nbPerTx = 10

            // calculate the number of Tx to do
            let nbTx: number
            if (NFTstoBurn.length % 10 == 0) {
                nbTx = NFTstoBurn.length / nbPerTx
            }
            else {
                nbTx = Math.floor(NFTstoBurn.length / nbPerTx) + 1;
            }

            setTotalTx(nbTx)

            for (let i = 0; i < nbTx; i++) {

                // Create a transaction
                let Tx = new Transaction()

                let bornSup: number

                if (i == nbTx - 1) {
                    bornSup = NFTstoBurn.length
                }

                else {
                    bornSup = 10 * (i + 1)
                }

                // for each NFT selected
                for (let j = 10 * i; j < bornSup; j++) {

                    // get the publickey of the NFT
                    const mintPublickey = new PublicKey(NFTstoBurn[j]);


                    // determine the associated token account of the NFT
                    const associatedAddress = await Token.getAssociatedTokenAddress(
                        ASSOCIATED_TOKEN_PROGRAM_ID,
                        TOKEN_PROGRAM_ID,
                        mintPublickey,
                        owner,
                    );

                    // determine the balance and decimals of the token to burn
                    const getbalance = await connection.getTokenAccountBalance(associatedAddress)
                    const decimals = getbalance.value.decimals
                    const balance = getbalance.value.uiAmount

                    // create the burn instruction
                    const burnInstruction = await Token.createBurnInstruction(
                        TOKEN_PROGRAM_ID,
                        mintPublickey,
                        associatedAddress,
                        owner,
                        [],
                        balance! * 10 ** decimals
                    );

                    // create the close account instruction
                    const closeInstruction = await Token.createCloseAccountInstruction(
                        TOKEN_PROGRAM_ID,
                        associatedAddress,
                        owner,
                        owner,
                        []
                    );

                    // add the instructions to the transaction
                    Tx.add(burnInstruction, closeInstruction)
                }


                setCurrentTx(i + 1)
                const signature = await wallet.sendTransaction(Tx, connection);

                const confirmed = await connection.confirmTransaction(signature, 'processed');

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