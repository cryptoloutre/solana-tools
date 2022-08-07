import Link from "next/link";
import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { SolanaLogo, ConnectWallet } from "components";
import styles from "./index.module.css";

import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, Transaction, TransactionInstruction, LAMPORTS_PER_SOL, SystemProgram, Connection } from '@solana/web3.js';
import { getDomainKey, getHashedName, getNameAccountKey, getTwitterRegistry, NameRegistryState, transferNameOwnership } from "@bonfida/spl-name-service";

const walletPublicKey = "";

export const MultiSenderView: FC = ({ }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [walletToParsePublicKey, setWalletToParsePublicKey] =
    useState<string>(walletPublicKey);
  const { publicKey } = useWallet();

  const onUseWalletClick = () => {
    if (publicKey) {
      setWalletToParsePublicKey(publicKey?.toBase58());
    }
  };

  const [nbToken, setNbToken] = useState('');
  const [CurrencyType, setCurrencyType] = useState('');
  const [mintAddress, setMintAddress] = useState('');
  const [ReceiverAddress, setReceiverAddress] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isSOLChecked, setIsSOLChecked] = useState(false);
  const [Error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [signature, setSignature] = useState('')

  const [quantity, setQuantity] = useState<number>();
  const [quantity1, setQuantity1] = useState<number>();
  const [quantity2, setQuantity2] = useState<number>();
  const [quantity3, setQuantity3] = useState<number>();
  const [quantity4, setQuantity4] = useState<number>();
  const [quantity5, setQuantity5] = useState<number>();
  const [quantity6, setQuantity6] = useState<number>();
  const [quantity7, setQuantity7] = useState<number>();
  const [quantity8, setQuantity8] = useState<number>();
  const [quantity9, setQuantity9] = useState<number>();
  const [quantity10, setQuantity10] = useState<number>();

  const [receiver1, setReceiver1] = useState('');
  const [receiver2, setReceiver2] = useState('');
  const [receiver3, setReceiver3] = useState('');
  const [receiver4, setReceiver4] = useState('');
  const [receiver5, setReceiver5] = useState('');
  const [receiver6, setReceiver6] = useState('');
  const [receiver7, setReceiver7] = useState('');
  const [receiver8, setReceiver8] = useState('');
  const [receiver9, setReceiver9] = useState('');
  const [receiver10, setReceiver10] = useState('');

  const [token1, setToken1] = useState('');
  const [token2, setToken2] = useState('');
  const [token3, setToken3] = useState('');
  const [token4, setToken4] = useState('');
  const [token5, setToken5] = useState('');
  const [token6, setToken6] = useState('');
  const [token7, setToken7] = useState('');
  const [token8, setToken8] = useState('');
  const [token9, setToken9] = useState('');
  const [token10, setToken10] = useState('');


  // allow to reset the states
  const reset = () => {
    setIsChecked(false);
    setIsSOLChecked(false);
    setError('');
    setSignature('');
    setMintAddress('');
    setQuantity(undefined);
    setQuantity1(undefined);
    setQuantity2(undefined);
    setQuantity3(undefined);
    setQuantity4(undefined);
    setQuantity5(undefined);
    setQuantity6(undefined);
    setQuantity7(undefined);
    setQuantity8(undefined);
    setQuantity9(undefined);
    setQuantity10(undefined);
    setReceiver1('');
    setReceiver2('');
    setReceiver3('');
    setReceiver4('');
    setReceiver5('');
    setReceiver6('');
    setReceiver7('');
    setReceiver8('');
    setReceiver9('');
    setReceiver10('');
    setToken1('');
    setToken2('');
    setToken3('');
    setToken4('');
    setToken5('');
    setToken6('');
    setToken7('');
    setToken8('');
    setToken9('');
    setToken10('');
  }


  // allow to check if the sender has enough tokens in his wallet
  // return true in this case
  const checkBalance = async (Receivers: string[], Amounts: (number | undefined)[], mintAddress: string) => {

    let Balance: number | null

    // SPL TOKEN CASE

    if (CurrencyType == 'SPL') {
      const mint = new PublicKey(mintAddress);

      // get the owner's token account of the token to send in order to get the number of decimals
      const ownerTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        publicKey!,
      );

      // determine the balance of the token to send
      const getBalance = await connection.getTokenAccountBalance(ownerTokenAccount);
      Balance = getBalance.value.uiAmount;
    }

    // SOL CASE
    else {
      Balance = (await connection.getBalance(publicKey!)) / LAMPORTS_PER_SOL;
    };

    let sendAmount: number = 0;

    // determine the quantity of token that the user wants to send
    if (!isChecked) {
      // in the case where the user wants to send different amount
      for (let i = 0; i < Amounts.length; i++) {
        sendAmount += Amounts[i]!
      };
    }
    // in the case where the user wants to send the same amount to everybody
    else {
      sendAmount = quantity! * Receivers.length;
    }

    if (sendAmount <= Balance!) {
      return true
    };
  };

  const checkBalanceMulti = async (Tokens: string[], Amounts: (number | undefined)[]) => {

    if (isSOLChecked) {
      const SOLBalance = (await connection.getBalance(publicKey!)) / LAMPORTS_PER_SOL;

      if (SOLBalance < quantity!) {
        return false
      }

    }


    for (let i = 0; i < Tokens.length; i++) {
      const ownerTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(Tokens[i]),
        publicKey!,
      );

      const getBalance = await connection.getTokenAccountBalance(ownerTokenAccount);
      const Balance = getBalance.value.uiAmount;
      if (Balance! < Amounts[i]!) {
        return false
      }
    }
    return true


  }

  // allow to check if the user owns the solana domain it wants to transfer
  const checkDomainOwnership = async (Domains: string[]) => {


    for (let i = 0; i < Domains.length; i++) {
      const domainName = Domains[i].replace(".sol", "")

      // get the key of the domain name
      const { pubkey } = await getDomainKey(domainName);

      // get the owner 
      const owner = await NameRegistryState.retrieve(
        connection,
        pubkey
      );
      const ownerAddress = owner.registry.owner.toBase58();
      if (ownerAddress != publicKey?.toBase58()) {
        setError('You are not the owner of ' + Domains[i])
        return false
      }
    }
    return true
  }



  // allow to multi send one token to multiple wallets
  const SendOnClick = async () => {
    if (publicKey) {
      setError('');
      setSignature('');

      // init temp lists in order to clean them and remove the inputs with no value
      const _Receivers = [receiver1, receiver2, receiver3, receiver4, receiver5, receiver6, receiver7, receiver8, receiver9, receiver10];
      const _Amounts = [quantity1, quantity2, quantity3, quantity4, quantity5, quantity6, quantity6, quantity7, quantity8, quantity9, quantity10];
      const Receivers: string[] = [];
      const Amounts: (number | undefined)[] = [];

      if (!isChecked) {
        for (let i = 0; i < _Receivers.length; i++) {
          if (_Receivers[i] != '' && _Amounts[i] != undefined) {
            Receivers.push(_Receivers[i]);
            Amounts.push(_Amounts[i]);
          }
        };
      }
      else {
        for (let i = 0; i < _Receivers.length; i++) {
          if (_Receivers[i] != '') {
            Receivers.push(_Receivers[i]);
          }
        }
      }

      // check if the sender has enough tokens
      const enoughToken = await checkBalance(Receivers, Amounts, mintAddress)
      if (enoughToken) {

        try {
          setIsSending(true)

          let Tx = new Transaction()

          //SPL TOKEN CASE

          if (CurrencyType == 'SPL') {
            const mint = new PublicKey(mintAddress);

            // get the owner's token account of the token to send in order to get the number of decimals
            const ownerTokenAccount = await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              mint,
              publicKey,
            );

            // determine the number of decimals of the token to send
            const balance = await connection.getTokenAccountBalance(ownerTokenAccount)
            const decimals = balance.value.decimals

            for (let i = 0; i < Receivers.length; i++) {
              // determine the token account pubkey of the user
              const source_account = await Token.getAssociatedTokenAddress(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                publicKey,
              );

              let destPubkey: PublicKey;

              // check if it is a SOL domain name
              if (Receivers[i].includes('.sol')) {
                const hashedName = await getHashedName(Receivers[i].replace(".sol", ""));
                const nameAccountKey = await getNameAccountKey(
                  hashedName,
                  undefined,
                  new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
                );
                const owner = await NameRegistryState.retrieve(
                  connection,
                  nameAccountKey
                );
                destPubkey = owner.registry.owner;

              }

              // check if it is a twitter handle
              else if (Receivers[i].includes('@')) {
                const handle = Receivers[i].replace("@", "")
                const registry = await getTwitterRegistry(connection, handle);
                destPubkey = registry.owner;

              }
              else {
                destPubkey = new PublicKey(Receivers[i]);
              }

              // determine the token account pubkey of the receiver
              const destination_account = await Token.getAssociatedTokenAddress(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                destPubkey
              );

              // get the info of the destination account
              const account = await connection.getAccountInfo(destination_account)

              if (account == null) {
                // if account == null it means that it doesn't exist
                // we have to create it
                // create associate token account instruction
                const createIx = Token.createAssociatedTokenAccountInstruction(
                  ASSOCIATED_TOKEN_PROGRAM_ID,
                  TOKEN_PROGRAM_ID,
                  mint,
                  destination_account,
                  destPubkey,
                  publicKey
                )

                let transferIx: TransactionInstruction;

                if (!isChecked) {
                  // create transfer token instruction
                  transferIx = Token.createTransferInstruction(
                    TOKEN_PROGRAM_ID,
                    source_account,
                    destination_account,
                    publicKey,
                    [],
                    Amounts[i]! * 10 ** decimals
                  )
                }
                else {
                  transferIx = Token.createTransferInstruction(
                    TOKEN_PROGRAM_ID,
                    source_account,
                    destination_account,
                    publicKey,
                    [],
                    quantity! * 10 ** decimals
                  )
                }
                // Add the instructions in a transaction
                Tx.add(createIx, transferIx);


              }

              else {

                let transferIx: TransactionInstruction;

                if (!isChecked) {

                  // create transfer token instruction
                  transferIx = Token.createTransferInstruction(
                    TOKEN_PROGRAM_ID,
                    source_account,
                    destination_account,
                    publicKey,
                    [],
                    Amounts[i]! * 10 ** decimals
                  )
                }
                else {
                  transferIx = Token.createTransferInstruction(
                    TOKEN_PROGRAM_ID,
                    source_account,
                    destination_account,
                    publicKey,
                    [],
                    quantity! * 10 ** decimals
                  )
                }

                // Add the instructions in a transaction
                Tx.add(transferIx);
              }
            }
          }
          // SOL CASE
          else {
            for (let i = 0; i < Receivers.length; i++) {

              let transferSOLIx: TransactionInstruction;

              let destPubkey: PublicKey;

              // check if it is a SOL domain name
              if (Receivers[i].includes('.sol')) {
                const hashedName = await getHashedName(Receivers[i].replace(".sol", ""));
                const nameAccountKey = await getNameAccountKey(
                  hashedName,
                  undefined,
                  new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
                );
                const owner = await NameRegistryState.retrieve(
                  connection,
                  nameAccountKey
                );
                destPubkey = owner.registry.owner;

              }

              // check if it is a twitter handle
              else if (Receivers[i].includes('@')) {
                const handle = Receivers[i].replace("@", "")
                const registry = await getTwitterRegistry(connection, handle);
                destPubkey = registry.owner;

              }
              else {
                destPubkey = new PublicKey(Receivers[i]);
              }

              if (!isChecked) {

                transferSOLIx = SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: destPubkey,
                  lamports: Amounts[i]! * LAMPORTS_PER_SOL,
                })
              }
              else {
                transferSOLIx = SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: destPubkey,
                  lamports: quantity! * LAMPORTS_PER_SOL,
                })
              };

              Tx.add(transferSOLIx);
            }
          }


          //send the transaction
          const sendSignature = await wallet.sendTransaction(Tx, connection);
          // wait the confirmation
          const confirmed = await connection.confirmTransaction(sendSignature, 'processed');


          if (confirmed) {
            const signature = sendSignature.toString();
            setIsSending(false);
            setSignature(signature)
          }

        } catch (error) {
          const err = (error as any)?.message;
          setError(err);
          setIsSending(false);
        }
      }
      else {
        setError('Not enough token in wallet')
      }
    }
  };

  // allow to multi send multiple tokens to one wallet
  const SendOnClickMulti = async () => {
    if (publicKey) {
      setError('');
      setSignature('');

      // init temp lists in order to clean them and remove the inputs with no value
      const _Tokens = [token1, token2, token3, token4, token5, token6, token7, token8, token9, token10];
      const _Amounts = [quantity1, quantity2, quantity3, quantity4, quantity5, quantity6, quantity6, quantity7, quantity8, quantity9, quantity10];
      const Tokens: string[] = [];
      const Amounts: (number | undefined)[] = [];

      for (let i = 0; i < _Tokens.length; i++) {
        if (_Tokens[i] != '' && _Amounts[i] != undefined) {
          Tokens.push(_Tokens[i]);
          Amounts.push(_Amounts[i]);
        }
      };
      const enoughToken = await checkBalanceMulti(Tokens, Amounts)
      if (enoughToken) {

        try {
          setIsSending(true)

          let destPubkey: PublicKey;

          // check if it is a SOL domain name
          if (ReceiverAddress.includes('.sol')) {
            const hashedName = await getHashedName(ReceiverAddress.replace(".sol", ""));
            const nameAccountKey = await getNameAccountKey(
              hashedName,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
            );
            const owner = await NameRegistryState.retrieve(
              connection,
              nameAccountKey
            );
            destPubkey = owner.registry.owner;

          }
          // check if it is a twitter handle
          else if (ReceiverAddress.includes('@')) {
            const handle = ReceiverAddress.replace("@", "")
            const registry = await getTwitterRegistry(connection, handle);
            destPubkey = registry.owner;

          }
          else {
            destPubkey = new PublicKey(ReceiverAddress);
          }


          let Tx = new Transaction()

          for (let i = 0; i < Tokens.length; i++) {

            // determine the token account pubkey of the user
            // allow to get the number of decimals
            const source_account = await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              new PublicKey(Tokens[i]),
              publicKey,
            );

            // determine the number of decimals of the token to send
            const balance = await connection.getTokenAccountBalance(source_account)
            const decimals = balance.value.decimals

            // determine the token account pubkey of the receiver
            const destination_account = await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              new PublicKey(Tokens[i]),
              destPubkey
            );

            // get the info of the destination account
            const account = await connection.getAccountInfo(destination_account)

            if (account == null) {
              // if account == null it means that it doesn't exist
              // we have to create it
              // create associate token account instruction
              const createIx = Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                new PublicKey(Tokens[i]),
                destination_account,
                destPubkey,
                publicKey
              )

              // create transfer token instruction
              const transferIx = Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                source_account,
                destination_account,
                publicKey,
                [],
                Amounts[i]! * 10 ** decimals
              )

              // Add the instructions in a transaction
              Tx.add(createIx, transferIx);
            }
            else {
              // create transfer token instruction
              const transferIx = Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                source_account,
                destination_account,
                publicKey,
                [],
                Amounts[i]! * 10 ** decimals
              )
              Tx.add(transferIx);
            }
          }
          if (isSOLChecked) {
            const transferSOLIx = SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: destPubkey,
              lamports: quantity! * LAMPORTS_PER_SOL,
            })

            Tx.add(transferSOLIx)
          }
          //send the transaction
          const sendSignature = await wallet.sendTransaction(Tx, connection);
          // wait the confirmation
          const confirmed = await connection.confirmTransaction(sendSignature, 'processed');


          if (confirmed) {
            const signature = sendSignature.toString();
            setIsSending(false);
            setSignature(signature)
          }
        }

        catch (error) {
          const err = (error as any)?.message;
          setError(err);
          setIsSending(false);
        }

      }
      else {
        setError('Not enough token in wallet')
      }

    }
  }

  const SendOnClickDomain = async () => {
    if (publicKey) {
      setError('');
      setSignature('');

      // init temp lists in order to clean them and remove the inputs with no value
      const _Domains = [token1, token2, token3, token4, token5, token6, token7, token8, token9, token10];
      const Domains: string[] = [];

      for (let i = 0; i < _Domains.length; i++) {
        if (_Domains[i] != '') {
          Domains.push(_Domains[i]);

        }
      };
      const isOwner = await checkDomainOwnership(Domains);

      if (isOwner) {

        try {
          setIsSending(true)

          let destPubkey: PublicKey;

          // check if it is a SOL domain name
          if (ReceiverAddress.includes('.sol')) {
            const hashedName = await getHashedName(ReceiverAddress.replace(".sol", ""));
            const nameAccountKey = await getNameAccountKey(
              hashedName,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
            );
            const owner = await NameRegistryState.retrieve(
              connection,
              nameAccountKey
            );
            destPubkey = owner.registry.owner;

          }
          // check if it is a twitter handle
          else if (ReceiverAddress.includes('@')) {
            const handle = ReceiverAddress.replace("@", "")
            const registry = await getTwitterRegistry(connection, handle);
            destPubkey = registry.owner;

          }
          else {
            destPubkey = new PublicKey(ReceiverAddress);
          }


          let Tx = new Transaction()

          for (let i = 0; i < Domains.length; i++) {

            const ix = await transferNameOwnership(
              connection,
              Domains[i].replace(".sol", ""),
              destPubkey,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
            );

            Tx.add(ix)

          }
          //send the transaction
          const sendSignature = await wallet.sendTransaction(Tx, connection);
          // wait the confirmation
          const confirmed = await connection.confirmTransaction(sendSignature, 'processed');


          if (confirmed) {
            const signature = sendSignature.toString();
            setIsSending(false);
            setSignature(signature)
          }
        }

        catch (error) {
          const err = (error as any)?.message;
          setError(err);
          setIsSending(false);
        }
      }

    }
  }


  return (
    <div className="container mx-auto max-w-6xl p-8 2xl:px-0">
      <div className={styles.container}>
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box flex justify-around">
          <div className="flex-1 px-2">
            <div className="text-sm breadcrumbs">
              <ul className="text-xs sm:text-xl">
                <li>
                  <Link href="/">
                    <a>SOLANA-TOOLS</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex-none">
            <WalletMultiButton className="btn btn-ghost" />
            <ConnectWallet onUseWalletClick={onUseWalletClick} />
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="hero min-h-16 p-0 pt-10">
            <div className="text-center hero-content w-full">
              <div className="w-full">
                <h1 className="mb-5 text-5xl">
                  Multi Send Token <SolanaLogo />
                </h1>
                <h3 className="font-semibold text-xl pb-5" >Supports public address, .sol domain name and Twitter handle with @</h3>

                {nbToken == '' && CurrencyType == '' &&
                  <div>
                    <div className="max-w-4xl mx-auto">
                      <ul className="text-left leading-10">
                        <li className="m-5" onClick={() => { setNbToken('one'); reset() }}>
                          <div className="p-4 hover:border">
                            <a className="text-4xl font-bold mb-5">
                              1 token - Multiple receivers
                            </a>
                            <div>Send one token to multiple receivers</div>
                          </div>
                        </li>

                        <li className="m-5" onClick={() => { setNbToken('multi'); reset() }}>
                          <div className="p-4 hover:border">
                            <a className="text-4xl font-bold mb-5">
                              Multiple token - 1 receiver
                            </a>
                            <div>Send multiple tokens to one receiver</div>
                          </div>
                        </li>
                        <li className="m-5" onClick={() => { setCurrencyType('domain'); reset() }}>
                          <div className="p-4 hover:border">
                            <a className="text-4xl font-bold mb-5">
                              Domains transfer
                            </a>
                            <div>Transfer multiple Solana domains name to one receiver</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                }

                {nbToken != '' && CurrencyType == '' &&
                  <div className="flex">
                    <button className="text-white font-semibold text-xl w-[6rem] h-[2rem] mb-2 bg-[#2C3B52] hover:bg-[#566274] rounded-xl border"
                      onClick={() => { setNbToken(''); setCurrencyType('') }}>← Back</button>
                  </div>
                }
                {CurrencyType != '' &&
                  <div className="flex">
                    <button className="text-white font-semibold text-xl w-[6rem] h-[2rem] mb-2 bg-[#2C3B52] hover:bg-[#566274] rounded-xl border"
                      onClick={() => { setCurrencyType('') }}>← Back</button>
                  </div>
                }

                {nbToken == 'one' &&
                  <div>
                    {CurrencyType == '' &&
                      <div className="max-w-4xl mx-auto">
                        <ul className="text-left leading-10">
                          <li className="m-5" onClick={() => { setCurrencyType('SOL'); reset() }}>
                            <div className="p-4 hover:border">
                              <a className="text-4xl font-bold mb-5">
                                SOL sending
                              </a>
                              <div>Send SOL to multiple receivers</div>
                            </div>
                          </li>

                          <li className="m-5" onClick={() => { setCurrencyType('SPL'); reset() }}>
                            <div className="p-4 hover:border">
                              <a className="text-4xl font-bold mb-5">
                                SPL token sending
                              </a>
                              <div>Send one SPL token type to multiple receivers</div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    }

                    <div>

                      {/* form when SOL is selected */}
                      {CurrencyType == 'SOL' &&
                        <div>

                          <h1 className="font-bold mb-5 text-3xl uppercase">SOL sending</h1>
                          <form className="mt-[3%] mb-[2%]">

                            <div className="flex justify-center mb-[2%]">
                              <div className="my-auto mx-2">Send same amount</div>
                              <input className="my-auto mx-2"
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => { setIsChecked(!isChecked); setQuantity(undefined) }}
                              />
                              {isChecked &&
                                <div className="flex items-center">
                                  <input className="w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                    type="number"
                                    step="any"
                                    min="0"
                                    required
                                    placeholder="Amount"
                                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                    style={{
                                      borderRadius:
                                        "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                    }}
                                  /></div>
                              }

                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #1"
                                onChange={(e) => setReceiver1(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked &&
                                <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                  type="number"
                                  step="any"
                                  min="0"
                                  required
                                  placeholder="Amount #1"
                                  onChange={(e) => setQuantity1(parseFloat(e.target.value))}
                                  style={{
                                    borderRadius:
                                      "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                  }}
                                />}

                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #2"
                                onChange={(e) => setReceiver2(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #2"
                                onChange={(e) => setQuantity2(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>
                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #3"
                                onChange={(e) => setReceiver3(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #3"
                                onChange={(e) => setQuantity3(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #4"
                                onChange={(e) => setReceiver4(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #4"
                                onChange={(e) => setQuantity4(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #5"
                                onChange={(e) => setReceiver5(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #5"
                                onChange={(e) => setQuantity5(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #6"
                                onChange={(e) => setReceiver6(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #6"
                                onChange={(e) => setQuantity6(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #7"
                                onChange={(e) => setReceiver7(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #7"
                                onChange={(e) => setQuantity7(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #8"
                                onChange={(e) => setReceiver8(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #8"
                                onChange={(e) => setQuantity8(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #9"
                                onChange={(e) => setReceiver9(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #9"
                                onChange={(e) => setQuantity9(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #10"
                                onChange={(e) => setReceiver10(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #10"
                                onChange={(e) => setQuantity10(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>


                          </form>
                        </div>
                      }

                      {/* form when SPL is selected */}
                      {CurrencyType == 'SPL' &&
                        <div>

                          <h1 className="font-bold mb-5 text-3xl uppercase">SPL token sending</h1>
                          <form className="mt-[3%] mb-[2%]">

                            <input className="mb-[2%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                              type="text"
                              required
                              placeholder="Token Mint Address"
                              onChange={(e) => setMintAddress(e.target.value)}
                              style={{
                                borderRadius:
                                  "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                              }}
                            />
                            <div className="flex justify-center mb-[2%]">
                              <div className="my-auto mx-2">Send same amount</div>
                              <input className="my-auto mx-2"
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(!isChecked)}
                              />
                              {isChecked &&
                                <div className="flex items-center">
                                  <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                    type="number"
                                    step="any"
                                    min="0"
                                    required
                                    placeholder="Amount"
                                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                    style={{
                                      borderRadius:
                                        "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                    }}
                                  /></div>
                              }

                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #1"
                                onChange={(e) => setReceiver1(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked &&
                                <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                  type="number"
                                  step="any"
                                  min="0"
                                  required
                                  placeholder="Amount #1"
                                  onChange={(e) => setQuantity1(parseFloat(e.target.value))}
                                  style={{
                                    borderRadius:
                                      "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                  }}
                                />}

                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #2"
                                onChange={(e) => setReceiver2(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #2"
                                onChange={(e) => setQuantity2(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>
                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #3"
                                onChange={(e) => setReceiver3(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #3"
                                onChange={(e) => setQuantity3(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #4"
                                onChange={(e) => setReceiver4(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #4"
                                onChange={(e) => setQuantity4(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #5"
                                onChange={(e) => setReceiver5(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #5"
                                onChange={(e) => setQuantity5(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #6"
                                onChange={(e) => setReceiver6(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #6"
                                onChange={(e) => setQuantity6(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #7"
                                onChange={(e) => setReceiver7(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #7"
                                onChange={(e) => setQuantity7(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #8"
                                onChange={(e) => setReceiver8(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #8"
                                onChange={(e) => setQuantity8(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #9"
                                onChange={(e) => setReceiver9(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #9"
                                onChange={(e) => setQuantity9(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>

                            <div>

                              <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                                type="text"
                                required
                                placeholder="Receiver #10"
                                onChange={(e) => setReceiver10(e.target.value)}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />

                              {!isChecked && <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                                type="number"
                                step="any"
                                min="0"
                                required
                                placeholder="Amount #10"
                                onChange={(e) => setQuantity10(parseFloat(e.target.value))}
                                style={{
                                  borderRadius:
                                    "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                                }}
                              />}
                            </div>
                          </form>
                        </div>}

                      {!isSending && CurrencyType != '' &&
                        <button className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border" onClick={SendOnClick}>Send</button>
                      }
                      {isSending && CurrencyType != '' &&
                        <button className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border">
                          <svg role="status" className="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                          </svg>Sending</button>}


                      {signature != '' && <div className="font-semibold text-xl mt-4">
                        ✅ Successfuly sent! Check it <a target="_blank" href={'https://solscan.io/tx/' + signature}><strong className="underline">here</strong></a>
                      </div>
                      }


                      {Error != '' && <div className="mt-4 font-semibold text-xl">❌ {Error}</div>}
                    </div>
                  </div>
                }

                {nbToken == 'multi' &&
                  <div>

                    <form className="mt-[3%] mb-[2%]">

                      <input className="mb-[2%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                        type="text"
                        required
                        placeholder="Receiver Address"
                        onChange={(e) => setReceiverAddress(e.target.value)}
                        style={{
                          borderRadius:
                            "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                        }}
                      />
                      <div className="flex justify-center mb-[2%]">
                        <div className="my-auto mx-2">Send SOL</div>
                        <input className="my-auto mx-2"
                          type="checkbox"
                          checked={isSOLChecked}
                          onChange={(e) => { setIsSOLChecked(!isSOLChecked); setQuantity(undefined) }}
                        />
                        {isSOLChecked &&
                          <div className="flex items-center">
                            <input className="mb-[1%] w-[150px] mx-4 text-black pl-1 border-2 border-black"
                              type="number"
                              step="any"
                              min="0"
                              required
                              placeholder="Amount"
                              onChange={(e) => setQuantity(parseFloat(e.target.value))}
                              style={{
                                borderRadius:
                                  "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                              }}
                            /></div>
                        }

                      </div>

                      <div>

                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #1"
                          onChange={(e) => setToken1(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                        <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #1"
                          onChange={(e) => setQuantity1(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                      </div>

                      <div>

                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #2"
                          onChange={(e) => setToken2(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                        <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #2"
                          onChange={(e) => setQuantity2(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>
                      <div>

                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #3"
                          onChange={(e) => setToken3(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                        <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #3"
                          onChange={(e) => setQuantity3(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>

                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #4"
                          onChange={(e) => setToken4(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                        <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #4"
                          onChange={(e) => setQuantity4(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>

                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #5"
                          onChange={(e) => setToken5(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                        <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #5"
                          onChange={(e) => setQuantity5(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>

                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #6"
                          onChange={(e) => setToken6(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                        <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #6"
                          onChange={(e) => setQuantity6(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>

                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #7"
                          onChange={(e) => setToken7(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                        <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #7"
                          onChange={(e) => setQuantity7(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>

                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #8"
                          onChange={(e) => setToken8(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                        <input className="sm:mb-[1%] mb-2 w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #8"
                          onChange={(e) => setQuantity8(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>

                        <input className="sm:mb-[1%] mb-2 md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #9"
                          onChange={(e) => setToken9(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                        <input className="mb-[1%] w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #9"
                          onChange={(e) => setQuantity9(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>

                        <input className="sm:mb-[1%] mb-2 md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder="Token Mint Address #10"
                          onChange={(e) => setToken10(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />

                        <input className="mb-[1%] w-[150px] mx-4 text-black pl-1 border-2 border-black"
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Amount #10"
                          onChange={(e) => setQuantity10(parseFloat(e.target.value))}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>


                    </form>

                    {!isSending &&
                      <button className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border" onClick={SendOnClickMulti}>Send</button>
                    }
                    {isSending &&
                      <button className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border">
                        <svg role="status" className="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                        </svg>Sending</button>}


                    {signature != '' &&
                      <div className="font-semibold text-xl mt-4">
                        ✅ Successfuly sent! Check it <a target="_blank" href={'https://solscan.io/tx/' + signature}><strong className="underline">here</strong></a>
                      </div>
                    }

                    {Error != '' && <div className="mt-4 font-semibold text-xl">❌ {Error}</div>}
                  </div>}

                {CurrencyType == 'domain' &&
                  <div>

                    <h1 className="font-bold mb-5 text-3xl uppercase">Domains sending</h1>
                    <form className="mt-[3%] mb-[2%]">

                      <input className="mb-[2%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                        type="text"
                        required
                        placeholder="Receiver Address"
                        onChange={(e) => setReceiverAddress(e.target.value)}
                        style={{
                          borderRadius:
                            "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                        }}
                      />

                      <div>
                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #1"
                          onChange={(e) => setToken1(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>
                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #2"
                          onChange={(e) => setToken2(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>
                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #3"
                          onChange={(e) => setToken3(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>
                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #4"
                          onChange={(e) => setToken4(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>
                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #5"
                          onChange={(e) => setToken5(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>
                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #6"
                          onChange={(e) => setToken6(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>
                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #7"
                          onChange={(e) => setToken7(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>
                        <input className="mb-[1%] md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #8"
                          onChange={(e) => setToken8(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>
                        <input className="sm:mb-[1%] mb-2 md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #9"
                          onChange={(e) => setToken9(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>

                      <div>
                        <input className="sm:mb-[1%] mb-2 md:w-[480px] text-center mx-4 text-black pl-1 border-2 border-black"
                          type="text"
                          required
                          placeholder=".sol domain name #10"
                          onChange={(e) => setToken10(e.target.value)}
                          style={{
                            borderRadius:
                              "var(--rounded-btn,.5rem) var(--rounded-btn,.5rem)",
                          }}
                        />
                      </div>
                    </form>

                    {!isSending &&
                      <button className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border" onClick={SendOnClickDomain}>Send</button>
                    }
                    {isSending &&
                      <button className="text-white font-semibold text-xl bg-[#414e63] hover:bg-[#2C3B52] w-[160px] rounded-full shadow-xl border">
                        <svg role="status" className="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                        </svg>Sending</button>}


                    {signature != '' &&
                      <div className="font-semibold text-xl mt-4">
                        ✅ Successfuly sent! Check it <a target="_blank" href={'https://solscan.io/tx/' + signature + '?cluster=devnet'}><strong className="underline">here</strong></a>
                      </div>
                    }

                    {Error != '' && <div className="mt-4 font-semibold text-xl">❌ {Error}</div>}
                  </div>}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};