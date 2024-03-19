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

  const prefix = "https://dev-8p0g8j7gy5jcno33.us.auth0.com/authorize";
  const redirect = "&redirect_uri=http://localhost:3000/api/auth/callback";
  const client = "wBobus191Izqqog1Z2vJFnLu76nYO6c5";
  let nonce = "&nonce=" + Buffer.from("DUMMY" + Date.now()).toString("base64");
  const scope = "&scope=openid profile email";
  const response = "&response_type=code";
  const state = "&state=eyJyZXR1cm5UbyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJ9";
  const method = "&code_challenge_method=S256";
  const challenge =
    "&code_challenge=9NT0L1T2c8Ovw-OfpdOjuQ2eGScRSr7eGohtgT4gNBw";

  nonce = "&nonce=RFVNTVkxNzEwNjAyNjIzNTI1";

  const rand = "LALA" + Date.now();

  //const authUrl =

  /*
  "https://dev-8p0g8j7gy5jcno33.us.auth0.com/authorize?
  client_id=wBobus191Izqqog1Z2vJFnLu76nYO6c5&
  scope=openid profile email&
  response_type=code&
  redirect_uri=http://localhost:3000/api/auth/callback&
  nonce=RItWb3f5sO_gpxJAsV3xlXuQBPbzr_bh5VL7vgtenVs&
  state=eyJyZXR1cm5UbyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJ9&
  code_challenge_method=S256&
  code_challenge=9NT0L1T2c8Ovw-OfpdOjuQ2eGScRSr7eGohtgT4gNBw";


  */
  // "https://dev-8p0g8j7gy5jcno33.us.auth0.com/authorize?client_id=wBobus191Izqqog1Z2vJFnLu76nYO6c5&scope=openid profile email&response_type=code&redirect_uri=http://localhost:3000/api/auth/callback&nonce=RItWb3f5sO_gpxJAsV3xlXuQBPbzr_bh5VL7vgtenVs&state=eyJyZXR1cm5UbyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJ9&code_challenge_method=S256&code_challenge=9NT0L1T2c8Ovw-OfpdOjuQ2eGScRSr7eGohtgT4gNBw";
  const authUrl =
    "https://id.twitch.tv/oauth2/authorize?response_type=token+id_token&client_id=emwrtbs8hkk8entdq84jyrpd6za693&redirect_uri=http://localhost:3000&scope=user%3Aread%3Aemail+openid&state=abc123&nonce=" +
    rand;

  //`${prefix}?client_id=${client}${scope}${response}${redirect}${nonce}${state}${method}${challenge}`;
  //window.location.href = authUrl;

  return (
    <>
      <a href="/api/auth/login">Original login (works)</a>
      <br />
      <a href={authUrl}>Custom login (fails)</a>
    </>
  );
}
