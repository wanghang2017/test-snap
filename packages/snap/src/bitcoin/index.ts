export * from './accountSinger';
export * from './simpleKeyring';
export * from './transaction';
export * from './getNetwork';
export * from './hdKeyring';
export * from './xpubConverter';
export * from './PsbtHelper';
export * from './PsbtValidator';
import ecc from '@bitcoinerlab/secp256k1';
import { initEccLib } from 'bitcoinjs-lib';

initEccLib(ecc);
