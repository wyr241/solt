import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Solt } from "../target/types/solt";
import assert from "assert";


import "regenerator-runtime/runtime"
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js"
import Wallet from "@project-serum/sol-wallet-adapter"
import lo from "buffer-layout"
import BN from "bn.js"

declare global {
  interface Window {
    solana: any
  }
}


describe("solt", () => {

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);


  let solletWallet = new Wallet("https://www.sollet.io")
  solletWallet.on("connect", (publicKey) => console.log("sollet connected", publicKey.toBase58()))

  export async function connectSolletWallet() {
    await solletWallet.connect()
  }

  async function prepareTransaction(userPubkey: PublicKey): Promise<Transaction> {
    const bobPubkey = new PublicKey("9C8ARBpAqcmoDfqZTDtvB1JgZC7gjvcq48xRJoR7Wpeq")
    const programId = new PublicKey("FrcTaQLfMqkPyrtQGFxLSy7NH1h5o7WANTkbH2wjVqdx")

    // encode 0.5 SOL as an input_data
    const data = Buffer.alloc(64)
    lo.ns64("value").encode(new BN("2000000000"), data)

    const ix = new TransactionInstruction({
      keys: [
        { pubkey: userPubkey, isSigner: true, isWritable: true },
        { pubkey: bobPubkey, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: programId,
      data: data,
    })
    let tx = new Transaction()
    tx.add(ix)
    tx.feePayer = userPubkey
    tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

    return tx
  }

  export async function sendViaSollet() {
    console.log("sendViaSollet called")
    const tx = await prepareTransaction(solletWallet.publicKey)
    let signed = await solletWallet.signTransaction(tx)
    await broadcastSignedTransaction(signed)
  }

  async function broadcastSignedTransaction(signed) {
    let signature = await connection.sendRawTransaction(signed.serialize())
    console.log("Submitted transaction " + signature + ", awaiting confirmation")
    await connection.confirmTransaction(signature)
    console.log("Transaction " + signature + " confirmed")
  }



  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const idl = JSON.parse(
    require("fs").readFileSync("./target/idl/solt.json", "utf8")
  );

  const programId = new anchor.web3.PublicKey("FrcTaQLfMqkPyrtQGFxLSy7NH1h5o7WANTkbH2wjVqdx");

  const program = new anchor.Program<Solt>(idl, programId, provider);

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.process_instruction();
    // const tx = await program.rpc.initialize();
    console.log("Your transaction signature", tx);
  });
});
