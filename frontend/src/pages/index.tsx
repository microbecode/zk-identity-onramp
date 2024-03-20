import { useEffect, useState } from "react";
import { ReactNode } from "react";

export default function Enter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [content, setContent] = useState<ReactNode>(null); // Update the type to ReactNode

  useEffect(() => {
    // Check if window and document objects are available (client-side)
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const hash = document.location.hash;

      // Check if hash contains the id_token parameter
      const idTokenIndex = hash.indexOf("id_token=");
      if (idTokenIndex !== -1) {
        // Extract the id_token value
        let idToken = hash.substring(idTokenIndex + "id_token=".length);
        // Check if there are more parameters after id_token
        const nextParamIndex = idToken.indexOf("&");
        if (nextParamIndex !== -1) {
          idToken = idToken.substring(0, nextParamIndex);
        }
        // Now idToken contains only the id_token value
        console.log("ID Token:", idToken);
        setIsLoggedIn(true);
        setContent(<div>Welcome, you are now logged in</div>);
      } else {
        console.log("ID Token not found in the URL hash.");

        const prefix = "https://id.twitch.tv/oauth2/authorize";
        const clientId = "&client_id=emwrtbs8hkk8entdq84jyrpd6za693";
        const redirect = "&redirect_uri=http://localhost:3000";
        const nonce = "&nonce=DUMMY" + Date.now();

        const authUrl = `${prefix}?response_type=token+id_token${clientId}${redirect}&scope=user%3Aread%3Aemail+openid${nonce}`;

        setContent(<a href={authUrl}>Custom login</a>);
      }
    }
  }, []); // Empty dependency array ensures this effect runs only once, similar to componentDidMount

  return <div>{content}</div>;
}
