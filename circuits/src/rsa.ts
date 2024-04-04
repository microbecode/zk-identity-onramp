/**
 * RSA signature verification with o1js
 *
 * Edited from https://github.com/o1-labs/o1js/blob/feature/advanced-range-check/src/examples/provable-methods/rsa.ts
 */

import { Field, Gadgets, Provable, Struct, ZkProgram, provable } from 'o1js';

export { Bigint2048, rsaVerify65537, rsaZkProgram };

const mask = (1n << 116n) - 1n;

function bitSlice(x: bigint, start: number, length: number) {
  return (x >> BigInt(start)) & ((1n << BigInt(length)) - 1n);
}

/**
 * We use 116-bit limbs, which means 18 limbs for a 2048-bit numbers as used in RSA.
 */
const Field18 = Provable.Array(Field, 18);

class Bigint2048 extends Struct({ fields: Field18, value: BigInt }) {
  modmul(x: Bigint2048, y: Bigint2048) {
    return multiply(x, y, this);
  }

  modsquare(x: Bigint2048) {
    return multiply(x, x, this, { isSquare: true });
  }

  toBigInt() {
    return this.value;
  }

  static from(x: bigint) {
    let fields = [];
    let value = x;
    for (let i = 0; i < 18; i++) {
      fields.push(Field(x & mask));
      x >>= 116n;
    }
    return new Bigint2048({ fields, value });
  }

  static check(x: { fields: Field[] }) {
    for (let i = 0; i < 18; i++) {
      rangeCheck116(x.fields[i]);
    }
  }
}

/**
 * x*y mod p
 */
function multiply(
  x: Bigint2048,
  y: Bigint2048,
  p: Bigint2048,
  { isSquare = false } = {}
) {
  if (isSquare) y = x;
  // witness q, r so that x*y = q*p + r
  // this also adds the range checks in `check()`
  let { q, r } = Provable.witness(
    provable({ q: Bigint2048, r: Bigint2048 }),
    () => {
      let xy = x.toBigInt() * y.toBigInt();
      let p0 = p.toBigInt();
      let q = xy / p0;
      let r = xy - q * p0;
      return { q: Bigint2048.from(q), r: Bigint2048.from(r) };
    }
  );

  // compute res = xy - qp - r
  // we can use a sum of native field products for each result limb, because
  // input limbs are range-checked to 116 bits, and 2*116 + log(2*18-1) = 232 + 6 fits the native field.
  let res: Field[] = Array.from({ length: 2 * 18 - 1 }, () => Field(0));
  let [X, Y, Q, R, P] = [x.fields, y.fields, q.fields, r.fields, p.fields];

  for (let i = 0; i < 18; i++) {
    // when squaring, we can save constraints by not computing xi * xj twice
    if (isSquare) {
      for (let j = 0; j < i; j++) {
        res[i + j] = res[i + j].add(X[i].mul(X[j]).mul(2n));
      }
      res[2 * i] = res[2 * i].add(X[i].mul(X[i]));
    } else {
      for (let j = 0; j < 18; j++) {
        res[i + j] = res[i + j].add(X[i].mul(Y[j]));
      }
    }

    for (let j = 0; j < 18; j++) {
      res[i + j] = res[i + j].sub(Q[i].mul(P[j]));
    }

    res[i] = res[i].sub(R[i]);
  }

  // perform carrying on res to show that it is zero
  let carry = Field(0);
  for (let i = 0; i < 2 * 18 - 2; i++) {
    let res_i = res[i].add(carry);

    carry = Provable.witness(Field, () => {
      let res_in = res_i.toBigInt();
      if (res_in > 1n << 128n) {
        res_in -= Field.ORDER;
        res_in = Field(-res_in).toBigInt();
      }
      return Field(res_in >> 116n);
    });
    //! This implementation is underconstrained because the following checks have bugs
    // rangeCheck128Signed(carry);

    // (xy - qp - r)_i + c_(i-1) === c_i * 2^116
    // proves that bits i*116 to (i+1)*116 of res are zero
    // res_i.assertEquals(carry.mul(1n << 116n));
  }

  // last carry is 0 ==> all of res is 0 ==> x*y = q*p + r as integers
  // res[2 * 18 - 2].add(carry).assertEquals(0n);

  return r;
}

/**
 * RSA signature verification
 *
 * TODO this is a bit simplistic; according to RSA spec, message must be 256 bits
 * and the remaining bits must follow a specific pattern.
 */
function rsaVerify65537(
  message: Bigint2048,
  signature: Bigint2048,
  modulus: Bigint2048
) {
  // compute signature^(2^16 + 1) mod modulus
  // square 16 times
  let x = signature;
  for (let i = 0; i < 16; i++) {
    x = modulus.modsquare(x);
  }
  // multiply by signature
  x = modulus.modmul(x, signature);

  // check that x == message
  Provable.assertEqual(Bigint2048, message, x);
}

/**
 * Custom range check for a single limb, x in [0, 2^116)
 */
function rangeCheck116(x: Field) {
  let [x0, x1] = Provable.witness(Provable.Array(Field, 2), () => {
    const x0 = x.toBigInt() & ((1n << 64n) - 1n);
    const x1 = x.toBigInt() >> 64n;
    return [x0, x1].map(Field);
  });

  Gadgets.rangeCheck64(x0);

  let x52 = Provable.witness(Field, () =>
    Field(bitSlice(x.toBigInt(), 52, 12))
  );
  Gadgets.rangeCheck64(x52);
  x52.assertEquals(0n);

  // 64 + 52 = 116
  x0.add(x1.mul(1n << 64n)).assertEquals(x);
}

/**
 * Custom range check for carries, x in [-2^127, 2^127)
 */
function rangeCheck128Signed(xSigned: Field) {
  let x = xSigned.add(1n << 127n);
  Gadgets.isInRangeN(128, x).assertTrue();
}

let rsaZkProgram = ZkProgram({
  name: 'rsa-verify',

  methods: {
    verify: {
      privateInputs: [Bigint2048, Bigint2048, Bigint2048],

      method(message: Bigint2048, signature: Bigint2048, modulus: Bigint2048) {
        rsaVerify65537(message, signature, modulus);
      },
    },
  },
});

// let { verify } = rsaZkProgram.analyzeMethods();

// console.log(verify.summary());
// rows: 15782
// console.log('rows', verify.rows);

// await rsaZkProgram.compile();
