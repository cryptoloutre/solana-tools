import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Dispatch, SetStateAction } from 'react';



export async function burnTokenAndCloseAccount(NFTstoBurn: string[], owner: PublicKey, wallet: WalletContextState, connection: Connection, setIsburning: Dispatch<SetStateAction<boolean>>, setMessage: Dispatch<SetStateAction<string>>, setRefresh: Dispatch<SetStateAction<boolean>>) {
    try {
        if (NFTstoBurn[0] != undefined) {

            setMessage('')
            setIsburning(true)

            // Create a transaction
            let Tx = new Transaction()

            // for each NFT selected
            for (let i in NFTstoBurn) {

                // get the publickey of the NFT
                const mintPublickey = new PublicKey(NFTstoBurn[i]);


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


            const signature = await wallet.sendTransaction(Tx, connection);

            const confirmed = await connection.confirmTransaction(signature, 'processed');

            if (confirmed) {
                setIsburning(false)
                setRefresh(true)
                setRefresh(false)

            }
        }
        else {
            setMessage('Please, select first at least one NFT to burn')
        }
    } catch (error) {
        setIsburning(false)
    }


}