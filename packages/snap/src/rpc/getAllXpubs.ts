import { panel, text, heading } from '@metamask/snaps-ui';
import { networks, address } from 'bitcoinjs-lib';
import { BitcoinNetwork, ScriptType, Snap } from '../interface';
import { convertXpub } from '../bitcoin/xpubConverter';
import { RequestErrors, SnapError } from '../errors';
import { getHDRootNode } from '../bitcoin/hdKeyring';
import { getAddress } from '../bitcoin/simpleKeyring';
interface Account{
  xpub: string;
  scriptType: ScriptType;
  network: BitcoinNetwork;
  address: string;
}

export async function getAllXpubs(origin: string, snap: Snap): Promise<{xpubs: string[], accounts: {}, mfp: string}> {
  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Access your extended public key'),
        text(`${origin} is trying to access your Bitcoin Legacy, SegWit and Native SegWit extended public keys.`),
      ]),
    },
  });

  if (result) {
    try{
      let xfp = '';
      const xpubs: string[] = [];
      const accounts: Array<Account>=[];
      const xpubsInNetworks = await Promise.all(Object.values(BitcoinNetwork).map(async (bitcoinNetwork: BitcoinNetwork) => {
        const network = bitcoinNetwork === BitcoinNetwork.Main ? networks.bitcoin : networks.testnet;
        const account = await Promise.all(Object.values(ScriptType).map(async (scriptType: ScriptType) => {
          const { node: accountNode, mfp } = await getHDRootNode(snap, network, scriptType);
          xfp = xfp || mfp;
          const extendedPublicKey = accountNode.neutered();

          const address = getAddress(
            network,
            accountNode.publicKey.toString('hex'),
            scriptType,
          ) as string;
          
          let xpub = extendedPublicKey.toBase58();
          if (scriptType !== ScriptType.P2TR) {
              xpub = convertXpub(xpub, scriptType, network);
          }
          xpubs.push(xpub);
          accounts.push({
            xpub,
            scriptType,
            network: bitcoinNetwork,
            address,
          })
        }));
      }));
      return {
        mfp: xfp,
        xpubs,
        accounts,
      };
    }catch(e){
      console.log('e...', e);
    }
  }
  throw SnapError.of(RequestErrors.RejectKey);
}
