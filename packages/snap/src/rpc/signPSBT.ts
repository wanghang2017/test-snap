import { BitcoinNetwork, ScriptType, Snap } from '../interface';
import { AccountSigner, Transaction } from '../bitcoin';
import { getNetwork } from '../bitcoin/getNetwork';
import { SnapError, RequestErrors } from "../errors";
import { heading, panel, text, divider } from "@metamask/snaps-ui";
import { getHDRootNode } from '../bitcoin/hdKeyring';

interface ISignResult{
  finally: boolean;
  txId?: string;
  txHex?: string;
  psbt?: string;
}
export async function signPsbt(domain: string, snap: Snap, psbt: string, network: BitcoinNetwork, scriptType: ScriptType, signInputIndex: number, signType: number): Promise<ISignResult> {
  const tx = new Transaction(psbt, network);


  
  const txDetails = tx.extractPsbtJson()

  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Sign Bitcoin Transaction'),
        text(`Please verify this ongoing Transaction from ${domain}`),
        divider(),
        panel(Object.entries(txDetails).map(([key, value]) => text(`**${key}**:\n ${value}`))),
      ]),
    },
  });
  

  if (result) {
    try{
      const {node, mfp} = await getHDRootNode(snap, getNetwork(network), scriptType)
      const signer = new AccountSigner(node, Buffer.from(mfp, 'hex'));
      tx.validateTx(signer)

      return tx.signTx(signer, signInputIndex, signType, scriptType)
    }catch(e){
      console.log('sign failed...', e);
    }
  
    return { finally: false, txId: '123', txHex: '123' }
  } else {
    throw SnapError.of(RequestErrors.RejectSign);
  }
}
