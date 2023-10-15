import { panel, text, heading } from '@metamask/snaps-ui';
import { networks, address } from 'bitcoinjs-lib';
import { BitcoinNetwork, ScriptType, Snap } from '../interface';
import { convertXpub } from '../bitcoin/xpubConverter';
import { RequestErrors, SnapError } from '../errors';
import { getHDRootNode } from '../bitcoin/hdKeyring';
import { getAddress } from '../bitcoin/simpleKeyring';
interface Account {
  xpub: string;
  scriptType: ScriptType;
  network: BitcoinNetwork;
  privateKey: string;
  wif: string;
  address: string;
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

  try {
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
          const deriveAccount = accountNode.derive(0).derive(0);


          let xpub = extendedPublicKey.toBase58();
          if (scriptType !== ScriptType.P2TR) {
            xpub = convertXpub(xpub, scriptType, network);
          }
          xpubs.push(xpub);
          accounts.push({
            xpub,
            scriptType,
            network: bitcoinNetwork,
            privateKey: deriveAccount.privateKey.toString('hex'),
            wif: deriveAccount.toWIF(),
            address: getAddress(network, deriveAccount.publicKey.toString('hex'), scriptType) as string
          })
        }));
      }));
      console.log('accounts', accounts);
      return {
        mfp: xfp,
        xpubs,
        accounts,
      };
    }
    throw SnapError.of(RequestErrors.RejectKey);
  } catch (e) {
    console.log('error', e)
    return {
      mfp: '',
      xpubs: [],
      accounts: []
    }
  }
}
