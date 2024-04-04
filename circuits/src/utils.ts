import { createHash } from 'crypto';
import bigInt from 'big-integer';

export {
  generateDigestBigint,
  toBigInt,
  generateRandomPrime,
  generateRsaParams,
  rsaSign,
  parseKey,
};

/**
 * Generates a SHA-256 digest of the input message and returns the hash as a native bigint.
 * @param {string} message - The input message to be hashed.
 * @returns {bigint} The SHA-256 hash of the input message as a native bigint.
 */
function generateDigestBigint(message: string) {
  const digest = createHash('sha256').update(message, 'utf8').digest('hex');
  return BigInt('0x' + digest);
}

/**
 * Converts a big-integer object to a native bigint.
 * @param {bigInt.BigInteger} x - The big-integer object to be converted.
 * @returns {bigint} The big-integer value converted to a native bigint.
 */
function toBigInt(x: bigInt.BigInteger): bigint {
  return BigInt('0x' + x.toString(16));
}

/**
 * Generates a random prime number with the specified bit length.
 * @param {number} bitLength - The desired bit length of the prime number. Default is 1024.
 * @returns {bigInt.BigInteger} A random prime number with the specified bit length.
 */
function generateRandomPrime(bitLength = 1024): bigInt.BigInteger {
  let primeCandidate;
  do {
    // Generate a random number with the desired bit length
    primeCandidate = bigInt.randBetween(
      bigInt(2).pow(bitLength - 1), // Lower bound
      bigInt(2).pow(bitLength).minus(1) // Upper bound
    );

    // Ensure the number is odd
    if (!primeCandidate.isOdd()) {
      primeCandidate = primeCandidate.add(1);
    }
  } while (!primeCandidate.isPrime());
  return primeCandidate;
}

/**
 * Generates RSA parameters including prime numbers, public exponent, and private exponent.
 * @param {number} [primeSize] - The bit size of the prime numbers used for generating the RSA parameters. Default is undefined.
 * @returns {Object} An object containing the RSA parameters: p (prime), q (prime), n (modulus), phiN (Euler's totient function), e (public exponent), and d (private exponent).
 */
function generateRsaParams(primeSize?: number) {
  // Generate two random prime numbers
  const p = toBigInt(generateRandomPrime(primeSize));
  const q = toBigInt(generateRandomPrime(primeSize));

  // Public exponent
  const e = 65537n;

  // Euler's totient function
  const phiN = (p - 1n) * (q - 1n);

  // Private exponent
  const d = toBigInt(bigInt(e).modInv(phiN));

  return { p, q, n: p * q, phiN, e, d };
}

/**
 * Generates an RSA signature for the given message using the private key and modulus.
 * @param {bigint} message - The message to be signed.
 * @param {bigint} privateKey - The private exponent used for signing.
 * @param {bigint} modulus - The modulus used for signing.
 * @returns {bigint} The RSA signature of the message.
 */
function rsaSign(message: bigint, privateKey: bigint, modulus: bigint): bigint {
  // Calculate the signature using modular exponentiation
  return toBigInt(bigInt(message).modPow(privateKey, modulus));
}

/**
 * Parses a private key string in PEM or PKCS format and returns it as a BigInt.
 * @param {string} key - The private key string to be parsed.
 * @returns {bigint} The private key parsed as a BigInt.
 */
function parseKey(key: string): bigint {
  // Remove header and footer
  const pemEncodedKey = key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');

  // Decode PEM or PKCS encoded key
  const derEncodedKey = Buffer.from(pemEncodedKey, 'base64');

  // Convert DER encoded key to BigInt
  const privateKeyBigInt = BigInt('0x' + derEncodedKey.toString('hex'));

  return privateKeyBigInt;
}
