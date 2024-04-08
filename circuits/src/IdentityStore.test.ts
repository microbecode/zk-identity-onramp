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
import NodeRSA, { Format } from 'node-rsa';
import * as crypto from 'crypto';
import { Ber, BerReader, BerWriter } from 'asn1.js';

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

  it('other', async () => {
    interface PublicKey {
      alg: string;
      e: string;
      kid: string;
      kty: string;
      n: string;
      use: string;
    }

    const publicKey: PublicKey = {
      alg: 'RS256',
      e: 'AQAB',
      kid: '1',
      kty: 'RSA',
      n: '6lq9MQ-q6hcxr7kOUp-tHlHtdcDsVLwVIw13iXUCvuDOeCi0VSuxCCUY6UmMjy53dX00ih2E4Y4UvlrmmurK0eG26b-HMNNAvCGsVXHU3RcRhVoHDaOwHwU72j7bpHn9XbP3Q3jebX6KIfNbei2MiR0Wyb8RZHE-aZhRYO8_-k9G2GycTpvc-2GBsP8VHLUKKfAs2B6sW3q3ymU6M0L-cFXkZ9fHkn9ejs-sqZPhMJxtBPBxoUIUQFTgv4VXTSv914f_YkNw-EjuwbgwXMvpyr06EyfImxHoxsZkFYB-qBYHtaMxTnFsZBr6fn8Ha2JqT1hoP7Z5r5wxDu3GQhKkHw',
      use: 'sig',
    };

    function convertPublicKeyToPem(publicKey: PublicKey): string {
      const n = Buffer.from(publicKey.n, 'base64');
      const e = Buffer.from(publicKey.e, 'base64');

      const writer = new BerWriter();
      writer.startSequence();

      // Write the modulus
      writer.writeBuffer(n, Ber.OctetString);

      // Write the public exponent
      writer.writeBuffer(e, Ber.Integer);

      writer.endSequence();

      const publicKeyDer = writer.data;

      const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyDer.toString(
        'base64'
      )}\n-----END PUBLIC KEY-----`;

      return publicKeyPem;
    }

    const jwtToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJhdWQiOiJlbXdydGJzOGhrazhlbnRkcTg0anlycGQ2emE2OTMiLCJleHAiOjE3MTIzMDI2NDQsImlhdCI6MTcxMjMwMTc0NCwiaXNzIjoiaHR0cHM6Ly9pZC50d2l0Y2gudHYvb2F1dGgyIiwic3ViIjoiMTA1NDM2MDk4NSIsImF0X2hhc2giOiIycXRtVUNsZVd6Mm9iZlFwLVlmdWp3IiwiYXpwIjoiZW13cnRiczhoa2s4ZW50ZHE4NGp5cnBkNnphNjkzIiwibm9uY2UiOiJEVU1NWS0xNzEyMzAxNzMyOTk4IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibGF1cml0ZXN0In0.o5KsUTrr1TWz_sZVsjMvcJCBZInV3MlJO9nN0y7BOZjsAVw5Zv71twV3KQ3-0gBhr8lCXkqIXwfTstUSUyqM67GMDMskbahgg4w612uzvK7_kXZCjld9ynqCNyvz69g1vN7WAhojMZCjsGUEGfZ-Dthh1E4Bt-CyWmCXmtcMkY1ZMKa4MaCGPxbbulX8gNbM3B3aUHMFUVyZJ18PSbpqXzq0MZcBEZY4zdRTvM5gnE2M3FTcGvh8S3wfwoUFAy0rrEEnlAGD6t6PaFWkHxFcUW4uy3p01I9GgOjMO6sN25xZnOqSBMQl41h9IYx5sJNQEJe_AB8nDndNYeMAS-4LOw';
    /*    const pubKey = {
      alg: 'RS256',
      e: 'AQAB',
      kid: '1',
      kty: 'RSA',
      n: '6lq9MQ-q6hcxr7kOUp-tHlHtdcDsVLwVIw13iXUCvuDOeCi0VSuxCCUY6UmMjy53dX00ih2E4Y4UvlrmmurK0eG26b-HMNNAvCGsVXHU3RcRhVoHDaOwHwU72j7bpHn9XbP3Q3jebX6KIfNbei2MiR0Wyb8RZHE-aZhRYO8_-k9G2GycTpvc-2GBsP8VHLUKKfAs2B6sW3q3ymU6M0L-cFXkZ9fHkn9ejs-sqZPhMJxtBPBxoUIUQFTgv4VXTSv914f_YkNw-EjuwbgwXMvpyr06EyfImxHoxsZkFYB-qBYHtaMxTnFsZBr6fn8Ha2JqT1hoP7Z5r5wxDu3GQhKkHw',
      use: 'sig',
    }; */

    const jwtParts = jwtToken.split('.');
    const header = JSON.parse(
      Buffer.from(jwtParts[0], 'base64url').toString('utf8')
    );
    const payload = Buffer.from(jwtParts[1], 'base64url').toString('utf8');
    const signature = Buffer.from(jwtParts[2], 'base64url');

    /*  const pubKey = new NodeRSA(publicKey.n, 'base64' as Format, {
      encryptionScheme: 'pkcs1',
    }); */
    const publicKeyPem = convertPublicKeyToPem(publicKey);
    const publicKeyInstance = new NodeRSA(publicKeyPem, 'public');

    const crypto = require('crypto');
    const hash = crypto.createHash(header.alg.replace('RS', 'sha'));
    const messageDigest = hash
      .update(Buffer.from(`${jwtParts[0]}.${jwtParts[1]}`))
      .digest();

    const isSignatureValid = publicKeyInstance.verify(messageDigest, signature);
    console.log(`Signature is ${isSignatureValid ? 'valid' : 'invalid'}`);
  });

  xit('Hmm', async () => {
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
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJhdWQiOiJlbXdydGJzOGhrazhlbnRkcTg0anlycGQ2emE2OTMiLCJleHAiOjE3MTIzMDI2NDQsImlhdCI6MTcxMjMwMTc0NCwiaXNzIjoiaHR0cHM6Ly9pZC50d2l0Y2gudHYvb2F1dGgyIiwic3ViIjoiMTA1NDM2MDk4NSIsImF0X2hhc2giOiIycXRtVUNsZVd6Mm9iZlFwLVlmdWp3IiwiYXpwIjoiZW13cnRiczhoa2s4ZW50ZHE4NGp5cnBkNnphNjkzIiwibm9uY2UiOiJEVU1NWS0xNzEyMzAxNzMyOTk4IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibGF1cml0ZXN0In0.o5KsUTrr1TWz_sZVsjMvcJCBZInV3MlJO9nN0y7BOZjsAVw5Zv71twV3KQ3-0gBhr8lCXkqIXwfTstUSUyqM67GMDMskbahgg4w612uzvK7_kXZCjld9ynqCNyvz69g1vN7WAhojMZCjsGUEGfZ-Dthh1E4Bt-CyWmCXmtcMkY1ZMKa4MaCGPxbbulX8gNbM3B3aUHMFUVyZJ18PSbpqXzq0MZcBEZY4zdRTvM5gnE2M3FTcGvh8S3wfwoUFAy0rrEEnlAGD6t6PaFWkHxFcUW4uy3p01I9GgOjMO6sN25xZnOqSBMQl41h9IYx5sJNQEJe_AB8nDndNYeMAS-4LOw';
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

    // Decode modulus (n) and convert to BigInt2048
    const modulusDecoded = Buffer.from(
      base64urlToBase64(publicKey.n),
      'base64'
    );
    const modulusBigInt = Bigint2048.from(bufferToBigInt(modulusDecoded));

    // Decode JWT signature and convert to BigInt2048
    const jwtSignatureBuffer = Buffer.from(jwtToken.split('.')[2], 'base64');
    const signatureBigInt = Bigint2048.from(bufferToBigInt(jwtSignatureBuffer));

    // Decode JWT payload and convert to string
    const jwtPayload = Buffer.from(
      base64urlToBase64(jwtToken.split('.')[1]),
      'base64'
    ).toString();

    // Generate a digest BigInt from the payload
    const messageBigInt = Bigint2048.from(generateDigestBigint(jwtPayload));

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
});

function base64urlDecode(input: string) {
  // Replace character encoding for URL compatibility
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if necessary
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  // Decode Base64
  const decoded = atob(base64 + padding);
  // Convert to Uint8Array
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; ++i) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}
