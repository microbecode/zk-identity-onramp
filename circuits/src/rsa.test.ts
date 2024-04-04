import { Bigint2048, rsaVerify65537 } from './rsa';
import bigInt from 'big-integer';
import { generateDigestBigint, generateRsaParams, rsaSign } from './utils';

xdescribe('method', () => {
  it('should accept a simple RSA signature', () => {
    const message = Bigint2048.from(4n);
    const rsaSig = Bigint2048.from(31n);
    const modul = Bigint2048.from(33n);

    // provable RSA verification
    rsaVerify65537(message, rsaSig, modul);
  });

  // Params imported from https://github.com/rzcoder/node-rsa#:~:text=key.importKey(%7B,%2C%20%27components%27)%3B
  it('should accept RSA signature with hardcoded valid parameters', () => {
    const params = {
      n: BigInt(
        '0x0086fa9ba066685845fc03833a9699c8baefb53cfbf19052a7f10f1eaa30488cec1ceb752bdff2df9fad6c64b3498956e7dbab4035b4823c99a44cc57088a23783'
      ),
      e: 65537n,
      d: BigInt(
        '0x5d2f0dd982596ef781affb1cab73a77c46985c6da2aafc252cea3f4546e80f40c0e247d7d9467750ea1321cc5aa638871b3ed96d19dcc124916b0bcb296f35e1'
      ),
      p: BigInt(
        '0x00c59419db615e56b9805cc45673a32d278917534804171edcf925ab1df203927f'
      ),
      q: BigInt(
        '0x00aee3f86b66087abc069b8b1736e38ad6af624f7ea80e70b95f4ff2bf77cd90fd'
      ),
      dmp1: BigInt(
        '0x008112f5a969fcb56f4e3a4c51a60dcdebec157ee4a7376b843487b53844e8ac85'
      ),
      dmq1: BigInt(
        '0x1a7370470e0f8a4095df40922a430fe498720e03e1f70d257c3ce34202249d21'
      ),
      coeff: BigInt(
        '0x00b399675e5e81506b729a777cc03026f0b2119853dfc5eb124610c0ab82999e45'
      ),
    };

    const message = Bigint2048.from(13n);
    const rsaSig = Bigint2048.from(
      BigInt('0x' + bigInt(13n).modPow(params.d, params.n).toString(16))
    );
    const modul = Bigint2048.from(params.n);

    rsaVerify65537(message, rsaSig, modul);
  });

  it('should accept RSA signature with randomly generated parameters: 256-bits', () => {
    const input = generateDigestBigint('hello world!');
    const params = generateRsaParams(256);

    const message = Bigint2048.from(input);
    const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
    const modulus = Bigint2048.from(params.n);

    rsaVerify65537(message, signature, modulus);
  });

  it.skip('should accept RSA signature with randomly generated parameters: 256-bits - 100 iterations', () => {
    for (let i = 0; i < 100; i++) {
      const input = generateDigestBigint('hello world!');
      const params = generateRsaParams(256);

      const message = Bigint2048.from(input);
      const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
      const modulus = Bigint2048.from(params.n);

      rsaVerify65537(message, signature, modulus);
    }
  });

  it('should accept RSA signature with randomly generated parameters: 512-bits', () => {
    const input = generateDigestBigint('hello there!');
    const params = generateRsaParams(512);

    const message = Bigint2048.from(input);
    const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
    const modulus = Bigint2048.from(params.n);

    rsaVerify65537(message, signature, modulus);
  });

  it.skip('should accept RSA signature with randomly generated parameters: 512-bits - 100 iterations', () => {
    for (let i = 0; i < 100; i++) {
      const input = generateDigestBigint('hello there!');
      const params = generateRsaParams(512);

      const message = Bigint2048.from(input);
      const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
      const modulus = Bigint2048.from(params.n);

      rsaVerify65537(message, signature, modulus);
    }
  });

  it('should accept RSA signature with randomly generated parameters: 1024-bits', () => {
    const input = generateDigestBigint('how is it going!');
    const params = generateRsaParams(1024);

    const message = Bigint2048.from(input);
    const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
    const modulus = Bigint2048.from(params.n);

    rsaVerify65537(message, signature, modulus);
  });

  it.skip('should accept RSA signature with randomly generated parameters: 1024-bits - 50 iterations', () => {
    for (let i = 0; i < 50; i++) {
      const input = generateDigestBigint('how is it going!');
      const params = generateRsaParams(1024);

      const message = Bigint2048.from(input);
      const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
      const modulus = Bigint2048.from(params.n);

      rsaVerify65537(message, signature, modulus);
    }
  });

  it('should accept RSA signature with randomly generated parameters: 2048-bits', () => {
    const input = generateDigestBigint('how are you!');
    const params = generateRsaParams(2048);

    const message = Bigint2048.from(input);
    const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
    const modulus = Bigint2048.from(params.n);

    rsaVerify65537(message, signature, modulus);
  });

  it.skip('should accept RSA signature with randomly generated parameters: 2048-bits - 25 iterations', () => {
    for (let i = 0; i < 25; i++) {
      const input = generateDigestBigint('how are you!');
      const params = generateRsaParams(2048);

      const message = Bigint2048.from(input);
      const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
      const modulus = Bigint2048.from(params.n);

      rsaVerify65537(message, signature, modulus);
    }
  });

  it('should reject RSA signature with non-compliant modulus: 1024-bits', () => {
    const input = generateDigestBigint('hello!');
    const params = generateRsaParams(1024);

    const message = Bigint2048.from(input);
    const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
    const modulus = Bigint2048.from(params.phiN); // Tamper with modulus

    expect(() => rsaVerify65537(message, signature, modulus)).toThrowError();
  });

  it('should reject RSA signature with non-compliant input: 1024-bits', () => {
    const input = generateDigestBigint('hello!');
    const params = generateRsaParams(1024);

    const message = Bigint2048.from(35n); // Tamper with input
    const signature = Bigint2048.from(rsaSign(input, params.d, params.n));
    const modulus = Bigint2048.from(params.n);

    expect(() => rsaVerify65537(message, signature, modulus)).toThrowError();
  });

  it('should reject non compliant RSA signature: false private key: 1024-bits', () => {
    const input = generateDigestBigint('hello!');
    const params = generateRsaParams(1024);

    const message = Bigint2048.from(input);
    const signature = Bigint2048.from(rsaSign(input, params.e, params.n)); // Tamper with private key
    const modulus = Bigint2048.from(params.n);

    expect(() => rsaVerify65537(message, signature, modulus)).toThrowError();
  });

  it('should reject non-compliant RSA signature: false signature modulus : 1024-bits', () => {
    const input = generateDigestBigint('hello!');
    const params = generateRsaParams(1024);

    const message = Bigint2048.from(input);
    const signature = Bigint2048.from(rsaSign(input, params.d, 1223n)); // Tamper with signature modulus
    const modulus = Bigint2048.from(params.n);

    expect(() => rsaVerify65537(message, signature, modulus)).toThrowError();
  });
});
