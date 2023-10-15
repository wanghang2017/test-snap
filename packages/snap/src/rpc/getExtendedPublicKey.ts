import { Network, networks } from 'bitcoinjs-lib';
import { ScriptType, Snap } from '../interface';
import { convertXpub } from '../bitcoin/xpubConverter';
import { RequestErrors, SnapError } from '../errors';
import { heading, panel, text } from '@metamask/snaps-ui';
import { getHDRootNode } from '../bitcoin/hdKeyring';
import { getAddress } from '../bitcoin/simpleKeyring';

export async function getExtendedPublicKey(
  origin: string,
  snap: Snap,
  scriptType: ScriptType,
  network: Network,
): Promise<{ xpub: string; mfp: string; address: string }> {
  const networkName = network == networks.bitcoin ? 'mainnet' : 'testnet';
  switch (scriptType) {
    case ScriptType.P2PKH:
    case ScriptType.P2WPKH:
    case ScriptType.P2SH_P2WPKH:
    case ScriptType.P2TR:
      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Access your extended public key'),
            text(
              `Do you want to allow ${origin} to access Bitcoin ${networkName} ${scriptType} extended public key?`,
            ),
          ]),
        },
      });

      if (result) {
        const { node: accountNode, mfp } = await getHDRootNode(
          snap,
          network,
          scriptType,
        );

        const address = getAddress(
          network,
          accountNode.publicKey.toString('hex'),
          scriptType,
        ) as string;

        const extendedPublicKey = accountNode.neutered();
        let xpub = extendedPublicKey.toBase58();
        if (scriptType !== ScriptType.P2TR) {
          xpub = convertXpub(xpub, scriptType, network);
        }

        return { mfp, xpub, address };
      } else {
        throw SnapError.of(RequestErrors.RejectKey);
      }

    default:
      throw SnapError.of(RequestErrors.ScriptTypeNotSupport);
  }
}
