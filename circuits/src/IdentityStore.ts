import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  Signature,
  CircuitString,
} from 'o1js';

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

  @method verify(publicKey: CircuitString, jwtToken: CircuitString) {
    /* TODO:
    - Store public keys in merkle tree and provide proof
    - Verify JWT token's signature: https://discord.com/channels/484437221055922177/1203469437320171610
    - base64 decode JWT token: https://discord.com/channels/484437221055922177/1047214314349658172/threads/1204658424462180362
    - Locate and retrieve 'nonce' from JSON: https://discord.com/channels/484437221055922177/1203469170210250762
    - Store nonce <-> address connection in merkle tree
    */
  }
}
