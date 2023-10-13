import { getAppStore, utils } from '../../mobx';
import { BitcoinNetwork, BitcoinScriptType } from '../../interface';
import { IAccountIn } from '../../mobx/types';
import { EXTENDED_PUBKEY_PATH, NETWORK_SCRIPT_TO_COIN } from '../../constant/bitcoin';
import { logger } from '../../logger';

const constructAccount = (mfp: string, xpub: string, scriptType: BitcoinScriptType, network: BitcoinNetwork): IAccountIn => ({
  id: utils.generateAccountId(),
  mfp,
  xpub,
  path: EXTENDED_PUBKEY_PATH[network][scriptType],
  coinCode: NETWORK_SCRIPT_TO_COIN[network][scriptType],
  addresses: [],
  scriptType,
  network,
  receiveAddressIndex: 0,
});

export const storeAccount = async (
  xpub: string,
  mfp: string,
  scriptType: BitcoinScriptType,
  network: BitcoinNetwork,
  address: string,
) => {
  const appStore = getAppStore();
  try {
    const accountData = constructAccount(mfp, xpub, scriptType, network);
    const storeAccount = await appStore.createAccount(accountData);
    if(network === BitcoinNetwork.Main && scriptType === BitcoinScriptType.P2WPKH){
      appStore.applyAccount(storeAccount);
    } else {
      appStore.addAccount(storeAccount);
    }


    const receiveAddressIndex = 0;
    storeAccount.setReceiveAddressIndex(receiveAddressIndex);

    const storeReceiveAddress = {
      id: utils.generateAddressId(),
      parent: '',
      address,
      coinCode: NETWORK_SCRIPT_TO_COIN[network][scriptType],
      change: 0,
      index: receiveAddressIndex
    };
    storeAccount.validateAndAddAddress(storeReceiveAddress, appStore.settings.dynamicAddress);
  } catch (e) {
    logger.error(e);
    throw e;
  }
};
