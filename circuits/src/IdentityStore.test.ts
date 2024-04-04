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

  it('Hmm', async () => {
    /*     let token =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJhdWQiOiJlbXdydGJzOGhrazhlbnRkcTg0anlycGQ2emE2OTMiLCJleHAiOjE3MTE5NTI5OTcsImlhdCI6MTcxMTk1MjA5NywiaXNzIjoiaHR0cHM6Ly9pZC50d2l0Y2gudHYvb2F1dGgyIiwic3ViIjoiMTA1NDM2MDk4NSIsImF0X2hhc2giOiJrNktralVDVUEtU3VVU2Y3VUlHdkFRIiwiYXpwIjoiZW13cnRiczhoa2s4ZW50ZHE4NGp5cnBkNnphNjkzIiwibm9uY2UiOiJEVU1NWS0xNzExOTUyMDg2MDU2IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibGF1cml0ZXN0In0.YlT4gCed_Q9qo-aGn5eRTpQkwYRCJ_mbRUz2YqJj6kQNs3i3fBb-X0Ns5UZecipWS3AwT5pVu-TiCzSkYlWOKM9lfhVe4Rm_ZI2Tqmh6MYmup4WUmiDYqdVBR95IYCIra3YrArH4hVeYznHccD597INuo25o_qnGXhX6Qx88BWhRR6GQGv5UyAiKBATA2pLI8ezDqGf1NlNYQcl9mlifqm-wFowGhXteogXZ1bwbezmGA9ryZ8kf4qOf4eN7Iilv0IhnddSaQloqMpay3e8Mz8Hxg9HztInsd2zWB8dOHbJgqgvLN7I8Y2qyvSSEFu8DQFq-hw_ZqfOYEg1OI9RkLA';
    const signature =
      'YlT4gCed_Q9qo-aGn5eRTpQkwYRCJ_mbRUz2YqJj6kQNs3i3fBb-X0Ns5UZecipWS3AwT5pVu-TiCzSkYlWOKM9lfhVe4Rm_ZI2Tqmh6MYmup4WUmiDYqdVBR95IYCIra3YrArH4hVeYznHccD597INuo25o_qnGXhX6Qx88BWhRR6GQGv5UyAiKBATA2pLI8ezDqGf1NlNYQcl9mlifqm-wFowGhXteogXZ1bwbezmGA9ryZ8kf4qOf4eN7Iilv0IhnddSaQloqMpay3e8Mz8Hxg9HztInsd2zWB8dOHbJgqgvLN7I8Y2qyvSSEFu8DQFq-hw_ZqfOYEg1OI9RkLA';
 */
    const input = generateDigestBigint('hello world!');
    const message = Bigint2048.from(input);

    const params = generateRsaParams(256);
    const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
    const modulus = Bigint2048.from(params.n);

    rsaVerify65537(message, signature, modulus);

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
