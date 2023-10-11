import { networks } from 'bitcoinjs-lib';
import { Snap } from '../interface';
import { getHDRootNode } from '../bitcoin/hdKeyring';

export async function getMasterFingerprint(snap: Snap): Promise<string | void> {
  const {mfp} = await getHDRootNode(snap, networks.bitcoin);

  return mfp;
}
