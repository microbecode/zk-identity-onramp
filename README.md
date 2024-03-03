# Identity onramp

This project aims to on-ramp off-chain identities.

This project is loosely based on a non-funded [ZkIgnite proposal](https://zkignite.minaprotocol.com/zkignite/zkapp-cohort-3/finalfundingdecisions/suggestion/703), which in turn is based on [Bonday Pay](https://www.risczero.com/blog/bonsai-pay). We mostly leave the asset management things out and focus on the identity.

The project is divided into two phases: the first phase aims to implement the basic functionality, in a PoC style. The second phase adds required ZK privacy and succinctness.

## Phase 1

The flow goes something like this:

1. User authenticates with their web2 identity provider, such as Google. The authentication flow is just what the user is used to. The only difference is that we embed an on-chain address (public key) into the flow (in the _nonce_ field).
1. User gets a JWT authentication token that has the on-chain address embedded in it.
1. The JWT token is sent on-chain
1. On-chain smart contract verifies its signature (using a stored public key for the identity provider) and associates the web2 identity with the web3 address.

### Issues

Note that this phase implements a very insecure an inefficient version, and can be considered a Proof of Concept.

Mainly it's not a good idea to upload a full functioning identity token to an on-chain contract. And it's not a good idea to upload the full token when only a portion of it is needed in reality.

## Phase 2

This phase aims to bring the project beyond the PoC phase and to make it more realistic to use.

Add ZK proofs to:

1. Add ZK privacy. Instead of uploading the real token, only generate a proof of the needed parts and send the proof.
1. Related to the previous point: generating a proof makes the process also more succinct. Two birds with one stone.
1. Some of the JWT token verification on-chain is expensive. Do some of it off-chain and just prove it.

## Overall recognized issues

There are a few open issues that don't have a good solution thought of, currently.

1. The used tokens are signed by a private key from the identity provider. The identity provider changes their keys, making the old data obsolete. The cycle can be as fast as a week. This means the on-chain verification keys need to be updated as well. How to do this?
1. How to handle timestamps in the tokens. Which time to use and how to handle token expiry.
1. How to handle reuse of old JWT tokens. Maybe we need nullifiers?
