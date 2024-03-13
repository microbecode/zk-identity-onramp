// pages/api/auth/[auth0].ts
import { handleAuth, handleLogin, handleProfile } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    console.log("MYYYY Request object:", req);
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          nonce: "MYNONCE" + Date.now(),
        },
        returnTo: "/",
      });
    } catch (error: any) {
      console.error("Error during login:", error);
      res.status(error.status || 400).end();
    }
  },
  // ... other handlers
});
