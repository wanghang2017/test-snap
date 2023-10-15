import * as bitcoin from 'bitcoinjs-lib';
import { networks } from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';
import { detectNetworkAndScriptType, networkAndScriptMap } from '../../lib';
import * as bip32 from 'bip32';
import { BitcoinNetwork, BitcoinScriptType } from '../../interface';
import { EXTENDED_HD_PATH } from '../../constant/bitcoin';
import { fromHdPathToObj } from '../../lib/cryptoPath';

export class Bitcoin {


  public getAddressFromXpub(xpub: string, scriptType: BitcoinScriptType, network: BitcoinNetwork) {
    const derivationPath = EXTENDED_HD_PATH[network][scriptType];
    const { index } = fromHdPathToObj(derivationPath);
    const { config } = detectNetworkAndScriptType(xpub);

    const node = bip32.fromBase58(xpub, { bip32: config, wif: 0 });

    const changeAddressPubkey= node.derive(Number(0)).derive(Number(index)).publicKey;
    // const changeAddressPubkey = this.xpubToPubkey(xpub, Number(0), Number(index));


    // 生成比特币地址
    return this.deriveAddress(changeAddressPubkey, scriptType, network);
  }
  public deriveAddress(publicKey: Buffer, scriptType: BitcoinScriptType, network: BitcoinNetwork): string {
    const networkConfig = this.getNetworkConfig(network);
    let address: string | undefined = '';
    switch (scriptType) {
      case BitcoinScriptType.P2PKH:
        address = bitcoin.payments.p2pkh({ pubkey: publicKey, network: networkConfig }).address;
        break;
      case BitcoinScriptType.P2SH_P2WPKH:
        address = bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({ pubkey: publicKey, network: networkConfig }),
          network: networkConfig,
        }).address;
        break;
      case BitcoinScriptType.P2WPKH:
        address = bitcoin.payments.p2wpkh({ pubkey: publicKey, network: networkConfig }).address;
        break;
      case BitcoinScriptType.P2TR:
        bitcoin.initEccLib(ecc);
        address = bitcoin.payments.p2tr({
          internalPubkey: publicKey.slice(1),
          network: networkConfig,
        }).address;
        break;
      default:
        address = '';
    }
    if (address) {
      return address;
    } else {
      throw new Error('generate address failed');
    }
  }

  public xpubToPubkey(xpub: string, change: number, index: number) {
    const { pubKey, network } = this.convertPubKeyFormat(xpub);
    const node = bip32.fromBase58(pubKey, network);
    return node.derive(change).derive(index).publicKey;
  }

  public convertPubKeyFormat(extendedPubKey: string){
    const { network, config } = detectNetworkAndScriptType(extendedPubKey);
    const networkConfig = this.getNetworkConfig(network);
    const targetPrefix = network === BitcoinNetwork.Main ? 'xpub' : 'tpub';
    return {
      pubKey: this.transferNode(extendedPubKey, targetPrefix, config),
      network: networkConfig
    };
  }
  
  private getNetworkConfig(network: BitcoinNetwork) {
    let networkConfig = networks.bitcoin;
    if(network === BitcoinNetwork.Test) {
      networkConfig = networks.testnet;
    }
    return networkConfig;
  }

  private transferNode(
    extendedPubKey: string,
    prefix: string,
    config: { private: number; public: number },
  ){
    const node = bip32.fromBase58(extendedPubKey, { bip32: config, wif: 0 });
    const mainConfig = networkAndScriptMap[prefix]['config'];
    const transferNode = bip32.fromPublicKey(node.publicKey, node.chainCode, {
      bip32: mainConfig,
      wif: 0,
    });
    return transferNode.toBase58();
  }
}
