import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';



export async function isNFT(mintPublickey: PublicKey, connection: Connection) {


    const editionPdaInfo = await PublicKey.findProgramAddress(
        
        [
          Buffer.from('metadata'),
          PROGRAM_ID.toBuffer(),
          mintPublickey.toBuffer(),
          Buffer.from('edition'),
        ],
        PROGRAM_ID
      );
      const editionPDA = editionPdaInfo[0];
      const masterEditionAccountInfo = await connection.getAccountInfo(editionPDA);
      
      if(masterEditionAccountInfo){
        return true
      }
      else {
        return false
      }
}
