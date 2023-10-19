import { Psbt, Transaction as bTransaction, script, Signer } from 'bitcoinjs-lib';
import { BitcoinNetwork, ScriptType } from '../interface';
import { PsbtValidator } from '../bitcoin/PsbtValidator';
import { PsbtHelper } from '../bitcoin/PsbtHelper';
import { getNetwork } from './getNetwork';
import { AccountSigner, validator, schnorrValidator } from './accountSinger';

export class Transaction {
  private tx: Psbt;
  private network: BitcoinNetwork;

  constructor(base64Psbt: string, network: BitcoinNetwork) {
    this.tx = Psbt.fromBase64(base64Psbt, { network: getNetwork(network) });
    this.network = network;
  }

  validateTx(accountSigner: AccountSigner) {
    const validator = new PsbtValidator(this.tx, this.network);
    return validator.validate(accountSigner);
  }

  extractPsbtJson() {
    const psbtHelper = new PsbtHelper(this.tx, this.network);
    const changeAddress = psbtHelper.changeAddresses;
    const unit = this.network === BitcoinNetwork.Main ? 'sats' : 'tsats';

    const transaction = {
      from: psbtHelper.fromAddresses.join(','),
      to: psbtHelper.toAddresses.join(','),
      value: `${psbtHelper.sendAmount} ${unit}`,
      fee: `${psbtHelper.fee} ${unit}`,
      network: `${this.network}net`,
    };

    if (changeAddress.length > 0) {
      return { ...transaction, changeAddress: changeAddress.join(',') };
    }
    return transaction;
  }

  extractPsbtJsonString() {
    return Object.entries(this.extractPsbtJson())
      .map(([key, value]) => `${key}: ${value}\n`)
      .join('');
  }

  isDefinedSignType(signType: number) {
    return (
      signType === bTransaction.SIGHASH_DEFAULT ||
      script.isDefinedHashType(signType)
    );
  }

  signTx(
    accountSigner: AccountSigner,
    signInputIndex: number,
    signType: number,
    scriptType: ScriptType,
  ) {
    let signHashTypes;
    if (signType && this.isDefinedSignType(signType)) {
      signHashTypes = [signType];
    }
    
    let signer: Signer;
    if (scriptType === ScriptType.P2TR) {
      signer = accountSigner.getTapRootSinger('0/0');
    }

    try {

      if (signInputIndex && !this.isDefinedSignType(signInputIndex)) {
        if (scriptType === ScriptType.P2TR) {
          this.tx.signInput(signInputIndex, signer, signHashTypes);
        } else {
          this.tx.signInputHD(signInputIndex, accountSigner, signHashTypes);
        }
      } else {
        if (scriptType === ScriptType.P2TR) {
          this.tx.signAllInputs(signer, signHashTypes);
        } else {
          this.tx.signAllInputsHD(accountSigner, signHashTypes);
        }
      }

      const txValidator = scriptType === ScriptType.P2TR?schnorrValidator: validator;
      if (this.tx.validateSignaturesOfAllInputs(txValidator)) {
        this.tx.finalizeAllInputs();
        const txId = this.tx.extractTransaction().getId();
        const txHex = this.tx.extractTransaction().toHex();
        // TODO: sendTransaction to memoPool
        return {
          finally: true,
          txId,
          txHex,
        };
      } else {
        return {
          finally: false,
          psbt: this.tx.toBase64(),
        };
      }
    } catch (e) {
      throw new Error(`Sign transaction failed...${JSON.stringify(e)}`);
    }
  }
}
