import { RequestType } from '../types';
import { query } from '../request-utils/query';



export type UtxoListResponse = any[];
export interface UtxoTxResponse {
  [key:string]:any
};

export const queryUtxoMem = (address: string, isTest: boolean): Promise<UtxoListResponse> => {
  return query(`${isTest ?'/testnet':''}/api/address/${address}/utxo`, RequestType.Get, {});
};

export const queryTxMem = (txid: string, isTest:boolean): Promise<UtxoTxResponse> => {
  return query(`${isTest ? '/testnet' : ''}/api/tx/${txid}`, RequestType.Get, {});
};
