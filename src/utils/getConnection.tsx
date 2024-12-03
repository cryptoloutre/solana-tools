import { Connection } from "@solana/web3.js";
import { RPC_URL } from "config";

export function getConnection(networkSelected: string) {
    let connection: Connection;

    if (networkSelected == "devnet") {
        connection = new Connection("https://api.devnet.solana.com", {
            commitment: "confirmed",
        });
    } else {
        connection = new Connection(
            RPC_URL,
            { commitment: "confirmed" }
        );
    }

    return connection;
}