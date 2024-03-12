import { Auth0Provider } from "@auth0/auth0-react";
import { Html, Head, Main, NextScript } from "next/document";
import React from "react";

export default function Document() {
  console.log("IN DOC");

  return (
    <Html lang="en">
      <Head />
      {/*       <Auth0Provider
        domain="dev-8p0g8j7gy5jcno33.us.auth0.com"
        clientId="wBobus191Izqqog1Z2vJFnLu76nYO6c5"
        authorizationParams={{
          redirect_uri: "https://minaidentity.serveo.net/some", //window.location.origin,
        }}
      > */}
      <body>
        <Main />

        <NextScript />
      </body>
      {/* </Auth0Provider> */}
    </Html>
  );
}
