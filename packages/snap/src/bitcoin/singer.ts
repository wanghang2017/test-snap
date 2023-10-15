import ECPairFactory, { ECPairInterface } from 'ecpair';
import { BIP32Interface } from 'bip32';
import { Signer, HDSigner } from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';

const ECPair = ECPairFactory(ecc);
export class AccountSigner implements Signer, HDSigner {
  publicKey: Buffer;
  fingerprint: Buffer;

  private readonly node: BIP32Interface
  private readonly keyPair: ECPairInterface

  constructor(accountNode: BIP32Interface, mfp?: Buffer) {
    this.node = accountNode;
    this.publicKey = this.node.publicKey
    this.fingerprint = mfp || this.node.fingerprint

    this.keyPair = ECPair.fromPrivateKey(this.node.privateKey, { compressed: true });
  }

  derivePath(path: string): HDSigner {
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
          return prevHd.derive(index);
        }
      }, this.node)
      return new AccountSigner(childNode, this.fingerprint);
    } catch (e) {
      throw new Error('invalid path')
    }
  }

  sign(hash: Buffer): Buffer {
    return this.keyPair.sign(hash)
  }

  signSchnorr(hash: Buffer): Buffer {
    return this.keyPair.signSchnorr(hash)
  }
}


export const validator = (pubkey: Buffer, msghash: Buffer, signature: Buffer): boolean => {
  return ECPair.fromPublicKey(pubkey).verify(msghash, signature)
}

export const schnorrValidator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer,
): boolean => ecc.verifySchnorr(msghash, pubkey, signature);