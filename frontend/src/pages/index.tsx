import { useEffect, useState } from "react";
import { PublicKey, Field, Signature, JsonProof, verify, Mina } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { createPortal } from "react-dom";

export default function Enter() {
  const [displayText, setDisplayText] = useState("");
  const [hasWallet, setHasWallet] = useState(false);
  const [hasBeenSetup, setHasBeenSetup] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey>();

  //let hasWallet;
  if (hasWallet != null && !hasWallet) {
    const auroLink = "https://www.aurowallet.com/";
    const auroLinkElem = (
      <a href={auroLink} target="_blank" rel="noreferrer">
        Install Auro wallet here
      </a>
    );
    //hasWallet = <div>Could not find a wallet. {auroLinkElem}</div>;
  }

  const testing = async () => {
    const TESTNET = "https://proxy.testworld.minaexplorer.com/graphql";
    const network = Mina.Network({
      mina: TESTNET,
    });
    Mina.setActiveInstance(network);

    const mina = (window as any).mina;

    if (mina == null) {
      console.error("No Mina wallet");
      return;
    }

    const publicKeyBase58: string = (await mina.requestAccounts())[0];
    //const publicKey = PublicKey.fromBase58(publicKeyBase58);

    console.log("Using wallet", publicKey);
  };
  testing();
  /*   const stepDisplay = transactionlink ? (
    <a href={displayText} target="_blank" rel="noreferrer">
      View transaction
    </a>
  ) : (
    displayText
  ); */

  let setup = (
    <div
      className={styles.start}
      style={{ fontWeight: "bold", fontSize: "1.5rem", paddingBottom: "5rem" }}
    >
      {/* {stepDisplay} */}
      {hasWallet}
    </div>
  );

  let accountDoesNotExist;
  if (hasBeenSetup && !accountExists) {
    const faucetLink =
      "https://faucet.minaprotocol.com/?address=" + publicKey!.toBase58();
    accountDoesNotExist = (
      <div>
        <span style={{ paddingRight: "1rem" }}>Account does not exist.</span>
        <a href={faucetLink} target="_blank" rel="noreferrer">
          Visit the faucet to fund this fee payer account
        </a>
      </div>
    );
  }

  return <>hello{setup}</>;
}
