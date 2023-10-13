import { panel, text, heading } from '@metamask/snaps-ui';
import { networks } from 'bitcoinjs-lib';
import { BitcoinNetwork, ScriptType, Snap } from '../interface';
import { convertXpub } from '../bitcoin/xpubConverter';
import { RequestErrors, SnapError } from '../errors';
import { getHDRootNode } from '../bitcoin/hdKeyring';
interface Account {
  xpub: string;
  scriptType: ScriptType;
  network: BitcoinNetwork;
}

export async function getAllXpubs(origin: string, snap: Snap): Promise<{ xpubs: string[], accounts: {}, mfp: string }> {
  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Access your extended public key'),
        text(`${origin} is trying to access your Bitcoin Legacy, SegWit, TapRoot and Native SegWit extended public keys.`),
      ]),
    },
  });

  if (result) {
    let xfp = '';
    const xpubs: string[] = [];
    const accounts: Array<Account> = [];
    await Promise.all(Object.values(BitcoinNetwork).map(async (bitcoinNetwork: BitcoinNetwork) => {
      const network = bitcoinNetwork === BitcoinNetwork.Main ? networks.bitcoin : networks.testnet;
      await Promise.all(Object.values(ScriptType).map(async (scriptType: ScriptType) => {
        const { node: accountNode, mfp } = await getHDRootNode(snap, network, scriptType);
        xfp = xfp || mfp;
        const extendedPublicKey = accountNode.neutered();

        let xpub = extendedPublicKey.toBase58();
        if (scriptType !== ScriptType.P2TR) {
          xpub = convertXpub(xpub, scriptType, network);
        }
        xpubs.push(xpub);
        accounts.push({
          xpub,
          scriptType,
          network: bitcoinNetwork,
        })
      }));
    }));
    return {
      mfp: xfp,
      xpubs,
      accounts,
    };
  }
  throw SnapError.of(RequestErrors.RejectKey);
}
