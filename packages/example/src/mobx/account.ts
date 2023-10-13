import { types } from 'mobx-state-tree';
import { Coins } from '../constant/supportedCoins';
import Address from './address';
import { BitcoinNetwork, BitcoinScriptType } from '../interface';
import { IAddressIn } from './types';
import { coinManager } from '../services/CoinManager';
import { generateAddressId } from './utils';


const Account = types
  .model('Account', {
    id: types.identifier,
    mfp: types.string,
    xpub: types.string,
    path: types.string,
    coinCode: types.enumeration(Coins),
    addresses: types.array(Address),
    scriptType: types.enumeration(Object.values(BitcoinScriptType)),
    network: types.enumeration(Object.values(BitcoinNetwork)),
    receiveAddressIndex: types.number,
    hasSyncXPub: false,
  })
  .actions((self) => ({
    setHasXpubSynced: (synced: boolean) => {
      self.hasSyncXPub = synced;
    },
  }))
  .actions((self) => ({
    setReceiveAddressIndex: (receiveAddressIndex: number) => {
      self.receiveAddressIndex = receiveAddressIndex;
    }
  }))
  .views((self) => ({
    getAddress: (address: string) => {
      return self.addresses.find((a) => a.address === address);
    },
  }))
  .actions((self) => ({
    addAddress: (addressIn: IAddressIn, isDynamic: boolean) => {
      const storeAddress = self.getAddress(addressIn.address);
      if (storeAddress) return storeAddress;
      const address = Address.create(addressIn);
      self.addresses.push(address);
      self.addresses.sort((a1, a2) => {
        return a1.index - a2.index;
      });
      if(isDynamic) {
        self.setReceiveAddressIndex(address.index);
      }
      return address;
    },
    deriveAddress: (index: number) => {
      const addressPub = coinManager.xpubToPubkey(self.xpub, 0, index);
      const addressValue = coinManager.deriveAddress(addressPub, self.scriptType, self.network);

      const addressIn = {
        id: generateAddressId(),
        address: addressValue,
        parent: self.id,
        coinCode: self.coinCode,
        change: 0,
        index,
      };
      return Address.create(addressIn);
    },
  }))
  .views((self) => ({
    get receiveAddress() {
      const receiveAddress = self.addresses.find((addr) => addr.index === self.receiveAddressIndex);
      if(receiveAddress){
        return receiveAddress;
      } else {
        const address = self.deriveAddress(0);
        self.addAddress(address, false);
        return address;
      }
    }
  }))
  .actions((self) => ({
    validateAndAddAddress: (addressIn: IAddressIn, isDynamic: boolean) => {
      return self.addAddress({ ...addressIn, parent: self.id }, isDynamic);

    }
  }))
;

export default Account;
