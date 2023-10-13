import { BitcoinNetwork, BitcoinScriptType } from '../interface';
import { SupportedCoins } from './supportedCoins';

export const EXTENDED_PUBKEY_PATH = {
  [BitcoinNetwork.Main]: {
    [BitcoinScriptType.P2PKH]: 'M/44\'/0\'/0\'',
    [BitcoinScriptType.P2SH_P2WPKH]: 'M/49\'/0\'/0\'',
    [BitcoinScriptType.P2WPKH]: 'M/84\'/0\'/0\'',
    [BitcoinScriptType.P2TR]: 'M/86\'/0\'/0\'',
  },
  [BitcoinNetwork.Test]: {
    [BitcoinScriptType.P2PKH]: 'M/44\'/1\'/0\'',
    [BitcoinScriptType.P2SH_P2WPKH]: 'M/49\'/1\'/0\'',
    [BitcoinScriptType.P2WPKH]: 'M/84\'/1\'/0\'',
    [BitcoinScriptType.P2TR]: 'M/86\'/1\'/0\'',
  }
};
export const EXTENDED_HD_PATH = {
  [BitcoinNetwork.Main]: {
    [BitcoinScriptType.P2PKH]: 'M/44\'/0\'/0\'/0/0',
    [BitcoinScriptType.P2SH_P2WPKH]: 'M/49\'/0\'/0\'/0/0',
    [BitcoinScriptType.P2WPKH]: 'M/84\'/0\'/0\'/0/0',
    [BitcoinScriptType.P2TR]: 'm/86\'/0\'/0\'/0/0',
  },
  [BitcoinNetwork.Test]: {
    [BitcoinScriptType.P2PKH]: 'm/44\'/1\'/0\'/0/0',
    [BitcoinScriptType.P2SH_P2WPKH]: 'm/49\'/1\'/0\'/0/0',
    [BitcoinScriptType.P2WPKH]: 'm/84\'/1\'/0\'/0/0',
    [BitcoinScriptType.P2TR]: 'm/86\'/1\'/0\'/0/0',
  }
};
export const EXTENDED_UNCHANGE_HD_PATH = {
  [BitcoinNetwork.Main]: {
    [BitcoinScriptType.P2PKH]: 'M/44\'/0\'/0\'/1/0',
    [BitcoinScriptType.P2SH_P2WPKH]: 'M/49\'/0\'/0\'/1/0',
    [BitcoinScriptType.P2WPKH]: 'M/84\'/0\'/0\'/1/0',
    [BitcoinScriptType.P2TR]: 'M/86\'/0\'/0\'/1/0',
  },
  [BitcoinNetwork.Test]: {
    [BitcoinScriptType.P2PKH]: 'M/44\'/1\'/0\'/1/0',
    [BitcoinScriptType.P2SH_P2WPKH]: 'M/49\'/1\'/0\'/1/0',
    [BitcoinScriptType.P2WPKH]: 'M/84\'/1\'/0\'/1/0',
    [BitcoinScriptType.P2TR]: 'M/86\'/1\'/0\'/1/0',
  }
};

export const NETWORK_SCRIPT_TO_COIN: Record<BitcoinNetwork, Record<BitcoinScriptType, SupportedCoins>> = {
  [BitcoinNetwork.Main]: {
    [BitcoinScriptType.P2PKH]: SupportedCoins.BTC_LEGACY,
    [BitcoinScriptType.P2SH_P2WPKH]: SupportedCoins.BTC,
    [BitcoinScriptType.P2WPKH]: SupportedCoins.BTC_NATIVE_SEGWIT,
    [BitcoinScriptType.P2TR]: SupportedCoins.BTC_TAPROOT,
  },
  [BitcoinNetwork.Test]: {
    [BitcoinScriptType.P2PKH]: SupportedCoins.BTC_TESTNET_LEGACY,
    [BitcoinScriptType.P2SH_P2WPKH]: SupportedCoins.BTC_TESTNET_SEGWIT,
    [BitcoinScriptType.P2WPKH]: SupportedCoins.BTC_TESTNET_NATIVE_SEGWIT,
    [BitcoinScriptType.P2TR]: SupportedCoins.BTC_TAPROOT,
  }
};
