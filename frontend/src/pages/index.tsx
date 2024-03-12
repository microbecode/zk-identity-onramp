import { useEffect, useState } from "react";
import { PublicKey, Field, Signature, JsonProof, verify, Mina } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { encode, decode } from "base-64";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Enter() {
  const [displayText, setDisplayText] = useState("");
  const [hasWallet, setHasWallet] = useState(false);
  const [hasBeenSetup, setHasBeenSetup] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey>();

  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div>
        Welcome {user.name}! <a href="/api/auth/logout">Logout</a>
      </div>
    );
  }

  return <a href="/api/auth/login">Login</a>;
}
