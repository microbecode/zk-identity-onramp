// pages/api/auth/[auth0].ts
import { handleAuth, handleLogin, handleProfile } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

//export default handleAuth();

export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Log before handleLogin call
      console.log("Before handleLogin call");

      // Prepare authorizationParams with state and nonce
      const state = Buffer.from("DUMMY" + Date.now()).toString("base64");
      const nonce = Buffer.from("DUMMY2" + Date.now()).toString("base64");
      const authorizationParams = {
        // state: state,
        nonce: nonce,
      };

      // Log authorizationParams
      console.log("Authorization params:", authorizationParams);

      /*       // Log specific properties of the request object
      console.log("Request Method:", req.method);
      console.log("Request URL:", req.url); */
      console.log("Request Headers:", req.headers);

      // Call handleLogin with authorizationParams
      const loginResponse = await handleLogin(req, res, {
        authorizationParams: authorizationParams,
      });

      // Log the response object from handleLogin
      console.log("Login response:", loginResponse);

      // Log after handleLogin call
      console.log("After handleLogin call");
    } catch (error: any) {
      // Handle errors
      console.error("Error during login:", error);
      res.status(error.status || 400).end();
    }
  },
});
