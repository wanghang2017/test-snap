import { getAppStore } from '../../mobx';
import { storeAccount } from './storeAccount';
// import { register as registerMFP } from '../../api';
import { logger } from '../../logger';
import { BitcoinScriptType, BitcoinNetwork } from '../../interface';
import { coinManager } from '../CoinManager';
interface Account {
  xpub: string;
  scriptType: BitcoinScriptType;
  network: 'main'|'test';
  address: string;
}

export const register = async (xpubs: string[], mfp: string, params:Array<Account>) => {
  const appStore = getAppStore();
  try {
    const registeredMfp = appStore.registeredMfp();
    const registerAnotherMFP = registeredMfp !== '' && registeredMfp !== mfp;
    if (registerAnotherMFP) {
      appStore.resetStore();
    }
    // const MfpRegistered = registeredMfp === mfp;
    // if (!MfpRegistered) {
    //   await registerMFP(mfp);
    // }
    
    await Promise.all(params.map(async ({ xpub,
      scriptType,
      network,
    }) => {
      const targetAccount = appStore.getAccount(xpub);
      if (targetAccount && targetAccount.hasSyncXPub) {
        const { scriptType, network } = appStore.settings;
        if(targetAccount.network === network && targetAccount.scriptType === scriptType) {
          appStore.switchAccount(targetAccount.xpub);
        }
      } else {
        const net = network === 'main' ? BitcoinNetwork.Main : BitcoinNetwork.Test;
        const address = coinManager.getAddressFromXpub(xpub, scriptType, net) || '';
        await storeAccount(xpub, mfp, scriptType, net, address);
      }
    }));
  } catch (e) {
    logger.error(e);
    throw e;
  }
};
