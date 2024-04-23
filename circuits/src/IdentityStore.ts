import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  Signature,
  CircuitString,
  Bytes,
  Hash,
  Provable,
} from 'o1js';
import { Bigint2048 } from './rsa';

// Add a basic Mina smart contract to verify the token and store the identity connection on-chain

export class IdentityStore extends SmartContract {
  //@state(PublicKey) providerPublicKey = State<String>();

  init() {
    super.init();
    // Initialize contract state
    //this.providerPublicKey.set(PROVIDER_PUBLIC_KEY);

    // Specify that caller should include signature with tx instead of proof
    //this.requireSignature();
  }

  /* TODO:
    - Store public keys in merkle tree and provide proof
    - Verify JWT token's signature: https://discord.com/channels/484437221055922177/1203469437320171610
    - base64 decode JWT token: https://discord.com/channels/484437221055922177/1047214314349658172/threads/1204658424462180362
    - Locate and retrieve 'nonce' from JSON: https://discord.com/channels/484437221055922177/1203469170210250762
    - Store nonce <-> address connection in merkle tree
    */

  @method
  verify /*     originalJSON: Bigint2048, //  jwtToken: CircuitString, //   publicKey: CircuitString,
    signature: Bigint2048 */() {
    const delimitedString =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJhdWQiOiJlbXdydGJzOGhrazhlbnRkcTg0anlycGQ2emE2OTMiLCJleHAiOjE3MTMwOTg4NTYsImlhdCI6MTcxMzA5Nzk1NiwiaXNzIjoiaHR0cHM6Ly9pZC50d2l0Y2gudHYvb2F1dGgyIiwic3ViIjoiMTA1NDM2MDk4NSIsImF0X2hhc2giOiI2cUEwZk96OGctckJ2SzIzUUx0LTJRIiwiYXpwIjoiZW13cnRiczhoa2s4ZW50ZHE4NGp5cnBkNnphNjkzIiwibm9uY2UiOiJEVU1NWS0xNzEzMDk3OTMxMTE0IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibGF1cml0ZXN0In0.mc8KbPhaHFeFBmtEDXgGhbZn23v0DRRk0Pf87vPT4DAgWYFGCeg4XcW0dESze_nN9XpWY9X-Aa9OEgfsaoEbIgZxJBCMKSIOg01qDvXIA3kbXyvvpylJLmD1iDahJiofRkyBK0UiIWTmpH2xJNQVo1Qqhqh68-OdK3UR4aRgzkzZLCvLvDCeBOB6HPSdrzIc1LeQF2KXMFJe_QDLYE1cyMFvfiZX7Z-xjHHEIKnO__W0nzbBncdYhVAW9GQBieKG-wMv_WaH46eN5D580NM8cOxTDFPu1d0r_dBHEdRG-R9lmN1sOSNIpOn-xN4Hg-Ds56212kElaX1Hb1CZLK3g6w';

    let parts = delimitedString.split('.');
    let result = this.decode(parts[1]);
    Provable.log('Decoded', result);
  }

  decode(encodedString: string): string {
    const base64urlChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    // Initialize an array to store the decoded characters
    const decodedChars: string[] = [];

    // Loop through each character in the encoded string
    for (let i = 0; i < encodedString.length; i++) {
      // Find the index of the character in the base64url characters string
      const char = encodedString[i];
      const index = base64urlChars.indexOf(char);

      // Convert the index to a binary string and pad it with zeros to ensure it's 6 characters long
      const binary = index.toString(2).padStart(6, '0');

      // Append the binary string to the decoded characters array
      decodedChars.push(binary);
    }

    // Join the decoded characters into a single binary string
    const binaryString = decodedChars.join('');

    // Initialize an array to store the decoded bytes
    const decodedBytes: number[] = [];

    // Split the binary string into 8-bit chunks
    for (let i = 0; i < binaryString.length; i += 8) {
      // Get the current 8-bit chunk
      const chunk = binaryString.slice(i, i + 8);

      // Convert the chunk to a number and push it to the decoded bytes array
      decodedBytes.push(parseInt(chunk, 2));
    }

    // Convert the decoded bytes to characters and join them into a string
    const decoded = String.fromCharCode(...decodedBytes);
    //return decoded;
    return decoded;
  }
}
