import { BIP32Factory, BIP32Interface } from 'bip32';
import { Network, networks } from 'bitcoinjs-lib';
import { ScriptType, SLIP10Node, Snap } from '../interface';
import ecc from '@bitcoinerlab/secp256k1';
import { trimHexPrefix } from '../utils';

const bip32 = BIP32Factory(ecc);
export const pathMap: Record<ScriptType, string[]> = {
  [ScriptType.P2PKH]: ['m', "44'", "0'"],
  [ScriptType.P2SH_P2WPKH]: ['m', "49'", "0'"],
  [ScriptType.P2WPKH]: ['m', "84'", "0'"],
  [ScriptType.P2TR]: ['m', "86'", "0'"],
};

export const CRYPTO_CURVE = 'secp256k1';

export const toXOnly = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

export async function getHDRootNode(
  snap: Snap,
  network: Network,
  scriptType: ScriptType = ScriptType.P2PKH,
): Promise<{ node: BIP32Interface; mfp: string }> {
  const path = [...pathMap[scriptType]];
  if (network != networks.bitcoin) {
    path[path.length - 1] = "1'";
  }

  const slip10Node = (await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      path,
      curve: CRYPTO_CURVE,
    },
  })) as SLIP10Node;

  const privateKeyBuffer = Buffer.from(trimHexPrefix(slip10Node.privateKey), 'hex');
  const chainCodeBuffer = Buffer.from(trimHexPrefix(slip10Node.chainCode), 'hex');

  const node: BIP32Interface = bip32.fromPrivateKey(
    privateKeyBuffer,
    chainCodeBuffer,
    network,
  );
  //@ts-ignore
  // ignore checking since no function to set depth for node
  node.__DEPTH = slip10Node.depth;
  //@ts-ignore
  // ignore checking since no function to set index for node
  node.__INDEX = slip10Node.index;

  const mfp = slip10Node.masterFingerprint.toString(16).padStart(8, '0');

  return {
    node: node.deriveHardened(0),
    mfp,
  };
}
