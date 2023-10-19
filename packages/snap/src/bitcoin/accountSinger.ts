import ECPairFactory, { ECPairInterface } from 'ecpair';
import { BIP32Interface } from 'bip32';
import { Signer, HDSigner, crypto } from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';

const ECPair = ECPairFactory(ecc);
export class AccountSigner implements Signer, HDSigner {
  publicKey: Buffer;
  fingerprint: Buffer;

  private readonly node: BIP32Interface;
  private readonly keyPair: ECPairInterface;

  constructor(accountNode: BIP32Interface, mfp?: Buffer) {
    this.node = accountNode;
    this.publicKey = this.node.publicKey;
    this.fingerprint = mfp || this.node.fingerprint;

    this.keyPair = ECPair.fromPrivateKey(this.node.privateKey, {
      compressed: true,
    });
  }

  getTapRootSinger(path = '0/0') {
    const tapAccountSinger = this.derivePath(path);
    const tweakedSinger = tapAccountSinger.node.tweak(
      crypto.taggedHash('TapTweak', tapAccountSinger.node.publicKey.slice(1)),
    );

    return tweakedSinger;
  }

  derivePath(path: string): AccountSigner {
    try {
      let splitPath = path.split('/');
      if (splitPath.length > 2) {
        splitPath = splitPath.slice(-2);
      }
      const childNode = splitPath.reduce((prevHd, indexStr) => {
        let index;
        if (indexStr.slice(-1) === `'`) {
          index = parseInt(indexStr.slice(0, -1), 10);
          return prevHd.deriveHardened(index);
        } else {
          index = parseInt(indexStr, 10);
          const node = prevHd.derive(index);
          return node;
        }
      }, this.node);
      return new AccountSigner(childNode, this.fingerprint);
    } catch (e) {
      throw new Error('invalid path');
    }
  }

  sign(hash: Buffer): Buffer {
    return this.keyPair.sign(hash);
  }

  signSchnorr(hash: Buffer): Buffer {
    return this.keyPair.signSchnorr(hash);
  }
}

export const validator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer,
): boolean => {
  return ECPair.fromPublicKey(pubkey).verify(msghash, signature);
};

export const schnorrValidator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer,
): boolean => ecc.verifySchnorr(msghash, pubkey, signature);
