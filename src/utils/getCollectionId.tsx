import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { Metaplex } from '@metaplex-foundation/js';



export async function getCollectionId(mintPublickey: PublicKey, connection:Connection) {

  const metaplex = new Metaplex(connection);
  const collectionId = (await metaplex.nfts().findByMint(mintPublickey)).collection?.key
  return collectionId
}
