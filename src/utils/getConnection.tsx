import { Connection } from "@solana/web3.js";

export function getConnection(networkSelected: string) {
    let connection: Connection;

    if (networkSelected == "devnet") {
        connection = new Connection("https://api.devnet.solana.com", {
            commitment: "confirmed",
        });
    } else {
        connection = new Connection(
            "https://rpc.helius.xyz/?api-key=57bfd2f0-4693-4ab1-9f5b-d0301c16b90b",
            { commitment: "confirmed" }
        );
    }

    return connection;
}