import {
  Network,
  networks,
} from 'bitcoinjs-lib';
import { ScriptType, Snap } from '../interface';
import { RequestErrors, SnapError } from '../errors';
import { heading, panel, text } from '@metamask/snaps-ui';
import { getHDRootNode } from '../bitcoin/hdKeyring';
import { getAddress, privateKeyToWIF } from '../bitcoin/simpleKeyring';

export async function getSimpleAddress(
  origin: string,
  snap: Snap,
  network: Network,
): Promise<Record<string, string> | string> {
  const networkName = network == networks.bitcoin ? 'mainnet' : 'testnet';

  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Access your account addresses'),
        text(
          `Do you want to allow ${origin} to access Bitcoin ${networkName} addresses?`,
        ),
      ]),
    },
  });

  if (result) {
    const { node } = await getHDRootNode(snap, network, ScriptType.P2PKH);

    const publicKey = node.publicKey.toString('hex');
    console.log('node public key...', publicKey, node.privateKey.toString('hex'));
    console.log('wif privateKey...', privateKeyToWIF(node.privateKey.toString('hex')));

    return getAddress(network, publicKey);
  } else {
    throw SnapError.of(RequestErrors.RejectKey);
  }
}
