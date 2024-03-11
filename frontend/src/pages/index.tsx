import { useEffect, useState } from "react";
import { PublicKey, Field, Signature, JsonProof, verify, Mina } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { encode, decode } from "base-64";

export default function Enter() {
  const [displayText, setDisplayText] = useState("");
  const [hasWallet, setHasWallet] = useState(false);
  const [hasBeenSetup, setHasBeenSetup] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey>();

  return <>hello, you are now logged in</>;
}
