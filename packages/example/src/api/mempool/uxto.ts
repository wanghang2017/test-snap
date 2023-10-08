import { RequestType } from '../types';
import { query } from '../request-utils/query';



export type UtxoListResponse = any[];
export interface UtxoTxResponse {
  [key:string]:any
};

export const queryUtxoMem = (address: string): Promise<UtxoListResponse> => {
  return query(`/api/address/${address}/utxo`, RequestType.Get, {});
};

export const queryTxMem = (txid: string): Promise<UtxoTxResponse> => {
  return query(`/api/tx/${txid}`, RequestType.Get, {});
};
