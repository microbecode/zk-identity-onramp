import {
  AccountUpdate,
  Bytes,
  CircuitString,
  Hash,
  Mina,
  PrivateKey,
  PublicKey,
} from 'o1js';
import { IdentityStore } from './IdentityStore';
import jwtJson from './originalJWT.json';
import { Bigint2048, rsaVerify65537 } from './rsa';
import { generateDigestBigint, generateRsaParams, rsaSign } from './utils';
import jwt from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';
import { KeyObject, createPublicKey } from 'crypto';
import jwkToPem, { JWK } from 'jwk-to-pem';
import { changeBase, parseHexString32 } from './bigint-helpers';

const proofsEnabled = false;

describe('Identity', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: IdentityStore;

  // Retrieved on 1st of April
  // https://id.twitch.tv/oauth2/keys
  const twitchPublicKey =
    '6lq9MQ-q6hcxr7kOUp-tHlHtdcDsVLwVIw13iXUCvuDOeCi0VSuxCCUY6UmMjy53dX00ih2E4Y4UvlrmmurK0eG26b-HMNNAvCGsVXHU3RcRhVoHDaOwHwU72j7bpHn9XbP3Q3jebX6KIfNbei2MiR0Wyb8RZHE-aZhRYO8_-k9G2GycTpvc-2GBsP8VHLUKKfAs2B6sW3q3ymU6M0L-cFXkZ9fHkn9ejs-sqZPhMJxtBPBxoUIUQFTgv4VXTSv914f_YkNw-EjuwbgwXMvpyr06EyfImxHoxsZkFYB-qBYHtaMxTnFsZBr6fn8Ha2JqT1hoP7Z5r5wxDu3GQhKkHw';

  beforeAll(async () => {
    if (proofsEnabled) await IdentityStore.compile();
  });

  beforeEach(() => {
    /*     const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new IdentityStore(zkAppAddress); */
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    // await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  xit('generates and deploys the smart contract', async () => {
    await localDeploy();
  });

  xit('regular libraries work', async () => {
    const jwkClient = jwksClient({
      jwksUri: 'https://id.twitch.tv/oauth2/keys',
    });
    const jwtToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJhdWQiOiJlbXdydGJzOGhrazhlbnRkcTg0anlycGQ2emE2OTMiLCJleHAiOjE3MTMwOTg4NTYsImlhdCI6MTcxMzA5Nzk1NiwiaXNzIjoiaHR0cHM6Ly9pZC50d2l0Y2gudHYvb2F1dGgyIiwic3ViIjoiMTA1NDM2MDk4NSIsImF0X2hhc2giOiI2cUEwZk96OGctckJ2SzIzUUx0LTJRIiwiYXpwIjoiZW13cnRiczhoa2s4ZW50ZHE4NGp5cnBkNnphNjkzIiwibm9uY2UiOiJEVU1NWS0xNzEzMDk3OTMxMTE0IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibGF1cml0ZXN0In0.mc8KbPhaHFeFBmtEDXgGhbZn23v0DRRk0Pf87vPT4DAgWYFGCeg4XcW0dESze_nN9XpWY9X-Aa9OEgfsaoEbIgZxJBCMKSIOg01qDvXIA3kbXyvvpylJLmD1iDahJiofRkyBK0UiIWTmpH2xJNQVo1Qqhqh68-OdK3UR4aRgzkzZLCvLvDCeBOB6HPSdrzIc1LeQF2KXMFJe_QDLYE1cyMFvfiZX7Z-xjHHEIKnO__W0nzbBncdYhVAW9GQBieKG-wMv_WaH46eN5D580NM8cOxTDFPu1d0r_dBHEdRG-R9lmN1sOSNIpOn-xN4Hg-Ds56212kElaX1Hb1CZLK3g6w';

    let cert = '';

    const decoded = jwt.decode(jwtToken, { complete: true });
    if (decoded === null) {
      console.error('Invalid jwt token');
    } else {
      const payload = decoded.payload;
      const header = decoded.header;
      const kid = header.kid;
      console.log('dumdum');

      //const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
      const key = await jwkClient.getSigningKey(kid);
      const signingKey = key.getPublicKey();

      /* jwkClient.getSigningKey(kid, (err, key) => {
        if (err || !key) {
          console.error('somt', err, key);
        }
        cert = key!.getPublicKey(); */
      /*       cert =
        '6lq9MQ-q6hcxr7kOUp-tHlHtdcDsVLwVIw13iXUCvuDOeCi0VSuxCCUY6UmMjy53dX00ih2E4Y4UvlrmmurK0eG26b-HMNNAvCGsVXHU3RcRhVoHDaOwHwU72j7bpHn9XbP3Q3jebX6KIfNbei2MiR0Wyb8RZHE-aZhRYO8_-k9G2GycTpvc-2GBsP8VHLUKKfAs2B6sW3q3ymU6M0L-cFXkZ9fHkn9ejs-sqZPhMJxtBPBxoUIUQFTgv4VXTSv914f_YkNw-EjuwbgwXMvpyr06EyfImxHoxsZkFYB-qBYHtaMxTnFsZBr6fn8Ha2JqT1hoP7Z5r5wxDu3GQhKkHw'; */

      jwt.verify(jwtToken, signingKey, (err, verfied) => {
        if (err) {
          console.error('somt2', err);
        }
        console.log('verified!', verfied);
      });
      // });
    }
  });

  xit('o1js verification (not working yet)', async () => {
    /*     let token =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJhdWQiOiJlbXdydGJzOGhrazhlbnRkcTg0anlycGQ2emE2OTMiLCJleHAiOjE3MTE5NTI5OTcsImlhdCI6MTcxMTk1MjA5NywiaXNzIjoiaHR0cHM6Ly9pZC50d2l0Y2gudHYvb2F1dGgyIiwic3ViIjoiMTA1NDM2MDk4NSIsImF0X2hhc2giOiJrNktralVDVUEtU3VVU2Y3VUlHdkFRIiwiYXpwIjoiZW13cnRiczhoa2s4ZW50ZHE4NGp5cnBkNnphNjkzIiwibm9uY2UiOiJEVU1NWS0xNzExOTUyMDg2MDU2IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibGF1cml0ZXN0In0.YlT4gCed_Q9qo-aGn5eRTpQkwYRCJ_mbRUz2YqJj6kQNs3i3fBb-X0Ns5UZecipWS3AwT5pVu-TiCzSkYlWOKM9lfhVe4Rm_ZI2Tqmh6MYmup4WUmiDYqdVBR95IYCIra3YrArH4hVeYznHccD597INuo25o_qnGXhX6Qx88BWhRR6GQGv5UyAiKBATA2pLI8ezDqGf1NlNYQcl9mlifqm-wFowGhXteogXZ1bwbezmGA9ryZ8kf4qOf4eN7Iilv0IhnddSaQloqMpay3e8Mz8Hxg9HztInsd2zWB8dOHbJgqgvLN7I8Y2qyvSSEFu8DQFq-hw_ZqfOYEg1OI9RkLA';
    const signature =
      'YlT4gCed_Q9qo-aGn5eRTpQkwYRCJ_mbRUz2YqJj6kQNs3i3fBb-X0Ns5UZecipWS3AwT5pVu-TiCzSkYlWOKM9lfhVe4Rm_ZI2Tqmh6MYmup4WUmiDYqdVBR95IYCIra3YrArH4hVeYznHccD597INuo25o_qnGXhX6Qx88BWhRR6GQGv5UyAiKBATA2pLI8ezDqGf1NlNYQcl9mlifqm-wFowGhXteogXZ1bwbezmGA9ryZ8kf4qOf4eN7Iilv0IhnddSaQloqMpay3e8Mz8Hxg9HztInsd2zWB8dOHbJgqgvLN7I8Y2qyvSSEFu8DQFq-hw_ZqfOYEg1OI9RkLA';
 */
    /* 
    const jwtJSON =
      '{"header":{"alg":"RS256","typ":"JWT","kid":"1"},"payload":{"aud":"emwrts8hkk8endq84jyrpd6za693","exp":1711952997,"iat":1711952097,"iss":"https://id.twitch.tv/oauth2","sub":"1054360985","at_hash":"k6KjzUCA-SuUSf7UIGvAQ","azp":"emwrts8hkk8endq84jyrpd6za693","nonce":"DUMMY-1711952086056","preferred_username":"lauritest"}}';
 */
    //const jwtSignature = "YlT4gCed_Q9qo-aGn5eRTpQkwYRCJ_mbRUz2YqJj6kQNs3i3fBb-X0Ns5UZecipWS3AwT5pVu-TiCzSkYlWOKM9lfhVe4Rm_ZI2Tqmh6MYmup4WUmiDYqdVBR95IYCIra3YrArH4hVeYznHccD597INuo25o_qnGXhX6Qx88BWhRR6GQGv5UyAiKBATA2pLI8ezDqGf1NlNYQcl9mlifqm-wFowGhXteogXZ1bwbezmGA9ryZ8kf4qOf4eN7Iilv0IhnddSaQloqMpay3e8Mz8Hxg9HztInsd2zWB8dOHbJgqgvLN7I8Y2qyvSSEFu8DQFq-hw_ZqfOYEg1OI9RkLA"

    //const message = Bigint2048.from(generateDigestBigint(json));

    // Assuming JWT token and publicKey are provided
    const jwtToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJhdWQiOiJlbXdydGJzOGhrazhlbnRkcTg0anlycGQ2emE2OTMiLCJleHAiOjE3MTMwOTg4NTYsImlhdCI6MTcxMzA5Nzk1NiwiaXNzIjoiaHR0cHM6Ly9pZC50d2l0Y2gudHYvb2F1dGgyIiwic3ViIjoiMTA1NDM2MDk4NSIsImF0X2hhc2giOiI2cUEwZk96OGctckJ2SzIzUUx0LTJRIiwiYXpwIjoiZW13cnRiczhoa2s4ZW50ZHE4NGp5cnBkNnphNjkzIiwibm9uY2UiOiJEVU1NWS0xNzEzMDk3OTMxMTE0IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibGF1cml0ZXN0In0.mc8KbPhaHFeFBmtEDXgGhbZn23v0DRRk0Pf87vPT4DAgWYFGCeg4XcW0dESze_nN9XpWY9X-Aa9OEgfsaoEbIgZxJBCMKSIOg01qDvXIA3kbXyvvpylJLmD1iDahJiofRkyBK0UiIWTmpH2xJNQVo1Qqhqh68-OdK3UR4aRgzkzZLCvLvDCeBOB6HPSdrzIc1LeQF2KXMFJe_QDLYE1cyMFvfiZX7Z-xjHHEIKnO__W0nzbBncdYhVAW9GQBieKG-wMv_WaH46eN5D580NM8cOxTDFPu1d0r_dBHEdRG-R9lmN1sOSNIpOn-xN4Hg-Ds56212kElaX1Hb1CZLK3g6w';
    const publicKey = {
      alg: 'RS256',
      e: 'AQAB',
      kid: '1',
      kty: 'RSA',
      n: '6lq9MQ-q6hcxr7kOUp-tHlHtdcDsVLwVIw13iXUCvuDOeCi0VSuxCCUY6UmMjy53dX00ih2E4Y4UvlrmmurK0eG26b-HMNNAvCGsVXHU3RcRhVoHDaOwHwU72j7bpHn9XbP3Q3jebX6KIfNbei2MiR0Wyb8RZHE-aZhRYO8_-k9G2GycTpvc-2GBsP8VHLUKKfAs2B6sW3q3ymU6M0L-cFXkZ9fHkn9ejs-sqZPhMJxtBPBxoUIUQFTgv4VXTSv914f_YkNw-EjuwbgwXMvpyr06EyfImxHoxsZkFYB-qBYHtaMxTnFsZBr6fn8Ha2JqT1hoP7Z5r5wxDu3GQhKkHw',
      use: 'sig',
    };

    // Helper function to decode Base64url to Base64
    function base64urlToBase64(base64url: string) {
      const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
      const base64 = (base64url + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      return base64;
    }

    function bufferToBigInt(buf: any) {
      let result = 0n;
      for (const byte of buf) {
        result = (result << 8n) + BigInt(byte);
      }
      return result;
    }

    const getPublicKey = () => {
      const orig =
        '{"keys":[{"alg":"RS256","e":"AQAB","kid":"1","kty":"RSA","n":"6lq9MQ-q6hcxr7kOUp-tHlHtdcDsVLwVIw13iXUCvuDOeCi0VSuxCCUY6UmMjy53dX00ih2E4Y4UvlrmmurK0eG26b-HMNNAvCGsVXHU3RcRhVoHDaOwHwU72j7bpHn9XbP3Q3jebX6KIfNbei2MiR0Wyb8RZHE-aZhRYO8_-k9G2GycTpvc-2GBsP8VHLUKKfAs2B6sW3q3ymU6M0L-cFXkZ9fHkn9ejs-sqZPhMJxtBPBxoUIUQFTgv4VXTSv914f_YkNw-EjuwbgwXMvpyr06EyfImxHoxsZkFYB-qBYHtaMxTnFsZBr6fn8Ha2JqT1hoP7Z5r5wxDu3GQhKkHw","use":"sig"}]}';
      let aaa: JWK = {
        n: '6lq9MQ-q6hcxr7kOUp-tHlHtdcDsVLwVIw13iXUCvuDOeCi0VSuxCCUY6UmMjy53dX00ih2E4Y4UvlrmmurK0eG26b-HMNNAvCGsVXHU3RcRhVoHDaOwHwU72j7bpHn9XbP3Q3jebX6KIfNbei2MiR0Wyb8RZHE-aZhRYO8_-k9G2GycTpvc-2GBsP8VHLUKKfAs2B6sW3q3ymU6M0L-cFXkZ9fHkn9ejs-sqZPhMJxtBPBxoUIUQFTgv4VXTSv914f_YkNw-EjuwbgwXMvpyr06EyfImxHoxsZkFYB-qBYHtaMxTnFsZBr6fn8Ha2JqT1hoP7Z5r5wxDu3GQhKkHw',
        kty: 'RSA',
        e: 'AQAB',
      };
      return jwkToPem(aaa);

      /* function jwkToPem(webKey: JsonWebKey): Promise<string> {
        const pubKey: KeyObject = createPublicKey({
          key: webKey.toString(),
          format: 'jwk',
        });

        return pubKey.export({ format: 'pem', type: 'pkcs1' }).toString();
      } */
    };

    // Decode modulus (n) and convert to BigInt2048
    const modulusDecoded = Buffer.from(
      //base64urlToBase64(publicKey.n),
      getPublicKey(),
      'utf-8'
    );

    // Decode Base64url and convert to a Buffer
    const buffer = Buffer.from(publicKey.n, 'base64');

    // Convert Buffer to hex string
    const hexString = buffer.toString('hex');

    // Parse hex string as a BigInt
    const modulusBigInt = Bigint2048.from(BigInt(`0x${hexString}`));

    // const modulusBigInt = Bigint2048.from(bufferToBigInt(modulusDecoded));

    // Decode JWT signature and convert to BigInt2048
    const jwtSignatureBuffer = Buffer.from(jwtToken.split('.')[2], 'base64url');

    function toBase64(base64url: string) {
      base64url = base64url.toString();

      var padding = 4 - (base64url.length % 4);
      if (padding !== 4) {
        for (var i = 0; i < padding; ++i) {
          base64url += '=';
        }
      }

      return base64url.replace(/\-/g, '+').replace(/_/g, '/');
    }

    const pureSig = toBase64(jwtToken.split('.')[2]);
    const sigg = pureSig;

    const signatureBigInt = Bigint2048.from(
      bufferToBigInt(Buffer.from(sigg, 'base64'))
    );
    //Bigint2048.from(bufferToBigInt(jwtSignatureBuffer));

    // Decode JWT payload and convert to string
    const jwtPayload = Buffer.from(
      jwtToken.split('.', 2).join('.'),
      'base64url'
    );

    //const jwtPayload = jwtToken.split('.', 2).join('.');
    //const jwtPayload = toBase64(usepayload);

    console.log('payload', jwtPayload);

    // Convert DER encoded key to BigInt
    const messageInt = bufferToBigInt(jwtPayload); // BigInt('0x' + jwtPayload.toString('hex'));

    // Generate a digest BigInt from the payload
    const messageBigInt = Bigint2048.from(messageInt);

    // Verify the signature
    rsaVerify65537(messageBigInt, signatureBigInt, modulusBigInt);

    ////////////////////

    /* const [encodedJWTHeader, encodedJWTPayload, encodedJWTSignature] =
      jwtToken.split('.');
    const jwtHeader = base64urlDecode(encodedJWTHeader);
    const jwtPayload = base64urlDecode(encodedJWTPayload);
    const jwtSignature = base64urlDecode(encodedJWTSignature);

    const jwtStringPayload = Buffer.from(jwtPayload).toString('utf-8');
    const message = Bigint2048.from(generateDigestBigint(jwtStringPayload));

    const nDecoded = base64urlDecode(publicKey.n);
    const nHex = nDecoded.reduce(
      (str, byte) => str + byte.toString(16).padStart(2, '0'),
      ''
    );

    const jwtStringSignature = Buffer.from(jwtSignature).toString('utf-8');
    const sig = Bigint2048.from(generateDigestBigint(jwtStringSignature));

    const modulus = Bigint2048.from(BigInt('0x' + nHex));

    rsaVerify65537(message, sig, modulus); */

    /*     const input = generateDigestBigint(
      '{"header":{"alg":"RS256","typ":"JWT","kid":"1"},"payload":{"aud":"emwrts8hkk8endq84jyrpd6za693","exp":1711952997,"iat":1711952097,"iss":"https://id.twitch.tv/oauth2","sub":"1054360985","at_hash":"k6KjzUCA-SuUSf7UIGvAQ","azp":"emwrts8hkk8endq84jyrpd6za693","nonce":"DUMMY-1711952086056","preferred_username":"lauritest"}}'
    );
    const message = Bigint2048.from(input);

    console.log('HASHED message: ', message.value);

    const params = generateRsaParams(256);
    const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
    console.log('SIG', signature.value);
    const modulus = Bigint2048.from(params.n);

    rsaVerify65537(message, signature, modulus); */

    /*    await zkApp.verify(
      //   CircuitString.fromString(twitchPublicKey),
      //  CircuitString.fromString(token),
      CircuitString.fromString(JSON.stringify(jwtJson)),
      CircuitString.fromString(signature)
    ); */

    //let preimage = 'The quick brown fox jumps over the lazy dog';
    /* let preimage = JSON.stringify(jwtJson);
    console.log('PRE: ', preimage);

    const len = 320;

    // create a Bytes class that represents 43 bytes
    class Bytes43 extends Bytes(len) {}

    // convert the preimage to bytes
    let preimageBytes = Bytes43.fromString(preimage);

    // hash the preimage
    let hash = Hash.SHA2_256.hash(preimageBytes);

    console.log(hash.toHex()); */
  });

  it('base64 decoding', async () => {
    //let encoded = 'aGVsbG8gdGhlcmU='; // 'hello there'
    /* 
    let nums = [5n, 16n];
    let res = changeBase(nums, 10n, 16n); */
    /*     let res = parseHexString32('hello');
    console.log('RESSSSS', res); */
    // Convert a single character to its ASCII value

    // Base64url decoding function
    function base64urlDecode(encodedString: string): string {
      // Base64url characters
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
      const decodedString = String.fromCharCode(...decodedBytes);

      return decodedString;
    }

    // Example base64url-encoded string
    const base64urlEncoded: string = 'SGVsbG8gV29ybGQh';

    // Decode the base64url-encoded string
    const decoded: string = base64urlDecode(base64urlEncoded);
    console.log(decoded); // Output: "Hello World!"
  });
});
