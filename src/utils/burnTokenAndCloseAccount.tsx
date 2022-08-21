import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Dispatch, SetStateAction } from 'react';
import { isNFT } from './isNFT';
import { utils } from '@project-serum/anchor';
import { PROGRAM_ID, createBurnNftInstruction, PROGRAM_ADDRESS } from '@metaplex-foundation/mpl-token-metadata';
import { getCollectionId } from './getCollectionId';


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

            const seed1 = Buffer.from(utils.bytes.utf8.encode("metadata"));
            const seed2 = Buffer.from(PROGRAM_ID.toBytes());
            const seed4 = Buffer.from(utils.bytes.utf8.encode("edition"));

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


                    // determine if the token is a real NFT i.e. is a master edition
                    const IsNFT = await isNFT(mintPublickey, connection)

                    if (IsNFT) {

                        let burnAccount

                        const seed3 = Buffer.from(mintPublickey.toBytes());

                        const [metadataPDA, _bump] = PublicKey.findProgramAddressSync([seed1, seed2, seed3], PROGRAM_ID);
                        const [masterEditionPDA, _bump2] = PublicKey.findProgramAddressSync([seed1, seed2, seed3, seed4], PROGRAM_ID);

                        // determine if the NFT is part of a collection
                        const collectionMint = await getCollectionId(mintPublickey, connection)
                        
                        // if the NFT is part of a collection, determine the collectionmetadatPDA and build the burnAccount with it
                        if (collectionMint != undefined) {
                            const [collectionMetadataPDA, _bump3] = PublicKey.findProgramAddressSync([seed1, seed2, Buffer.from(collectionMint.toBytes())], PROGRAM_ID);
                            burnAccount = {
                                metadata: metadataPDA,
                                owner: owner,
                                mint: mintPublickey,
                                tokenAccount: associatedAddress,
                                masterEditionAccount: masterEditionPDA,
                                splTokenProgram: TOKEN_PROGRAM_ID,
                                collectionMetadata: collectionMetadataPDA
                            };
                        }

                        // if the NFT is not part of a collection, build the burnAccount without the collectionMetadataPda
                        else {
                            burnAccount = {
                                metadata: metadataPDA,
                                owner: owner,
                                mint: mintPublickey,
                                tokenAccount: associatedAddress,
                                masterEditionAccount: masterEditionPDA,
                                splTokenProgram: TOKEN_PROGRAM_ID,
                            };
                        }
                        // create the burn instruction
                        const burnInstruction = createBurnNftInstruction(burnAccount, new PublicKey(PROGRAM_ADDRESS))

                        // add the burn instruction to the transaction
                        Tx.add(burnInstruction)
                    }

                    
                    else {
                    
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
                        Tx.add(burnInstruction)

                        // create the close account instruction
                        const closeInstruction = await Token.createCloseAccountInstruction(
                            TOKEN_PROGRAM_ID,
                            associatedAddress,
                            owner,
                            owner,
                            []
                        );

                        // add the instructions to the transaction
                        Tx.add(closeInstruction)
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
