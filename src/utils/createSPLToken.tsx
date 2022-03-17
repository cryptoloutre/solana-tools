import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout } from '@solana/spl-token';
import { Connection, PublicKey, Transaction, SystemProgram, Keypair, TransactionInstruction } from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Dispatch, SetStateAction } from 'react';



export async function createSPLToken(owner: PublicKey, wallet: WalletContextState, connection: Connection, quantity: number, decimals: number, isChecked: boolean, setIscreating: Dispatch<SetStateAction<boolean>>, setTokenAddresss: Dispatch<SetStateAction<string>>, setQuantityCreated: Dispatch<SetStateAction<number>>, setSignature: Dispatch<SetStateAction<string>>) {
    try {
        setIscreating(true)

        const mint_rent = await Token.getMinBalanceRentForExemptMint(connection);

        const mint_account = Keypair.generate();

        let InitMint: TransactionInstruction

        const createMintAccountInstruction = await SystemProgram.createAccount({
            fromPubkey: owner,
            newAccountPubkey: mint_account.publicKey,
            space: MintLayout.span,
            lamports: mint_rent,
            programId: TOKEN_PROGRAM_ID,
        });

        if (isChecked) {
            InitMint = await Token.createInitMintInstruction(
                TOKEN_PROGRAM_ID,
                mint_account.publicKey,
                decimals,
                owner,
                owner
            );

        } else {
            InitMint = await Token.createInitMintInstruction(
                TOKEN_PROGRAM_ID,
                mint_account.publicKey,
                decimals,
                owner,
                null
            );

        };

        const associatedTokenAccount = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint_account.publicKey,
            owner
        );

        const createATAInstruction = await Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint_account.publicKey,
            associatedTokenAccount,
            owner,
            owner
        );

        const mintInstruction = await Token.createMintToInstruction(
            TOKEN_PROGRAM_ID,
            mint_account.publicKey,
            associatedTokenAccount,
            owner,
            [],
            quantity * 10 ** decimals
        );

        const createAccountTransaction = new Transaction().add(createMintAccountInstruction, InitMint, createATAInstruction, mintInstruction);

        const createAccountSignature = await wallet.sendTransaction(createAccountTransaction, connection, { signers: [mint_account] });

        const createAccountconfirmed = await connection.confirmTransaction(createAccountSignature, 'processed');

        const signature = createAccountSignature.toString()
        
        if (createAccountconfirmed) {
            setIscreating(false);
            setTokenAddresss(mint_account.publicKey.toBase58());
            setQuantityCreated(quantity);
            setSignature(signature)
        }
    } catch (error) {
        setIscreating(false);
    }

}