import { RequestType } from '../types';
import { query } from '../request-utils/query';


import axios from 'axios';
export type UtxoListResponse = any[];
export interface UtxoTxResponse {
  [key:string]:any
};
export interface FeeRateResponse {
  fastestFee: number,
  economyFee: number,
  minimumFee:number
};

export const queryUtxoMem = (address: string, isTest: boolean): Promise<UtxoListResponse> => {
  return query(`${isTest ?'/testnet':''}/api/address/${address}/utxo`, RequestType.Get, {});
};

export const queryTxMem = (txid: string, isTest:boolean): Promise<UtxoTxResponse> => {
  return query(`${isTest ? '/testnet' : ''}/api/tx/${txid}`, RequestType.Get, {});
};

export const queryTxHex = (txid: string, isTest: boolean): Promise<UtxoTxResponse> =>{
  return query(`${isTest ? '/testnet' : ''}/api/tx/${txid}/hex`, RequestType.Get, {});
};


export const queryFeeRate = (isTest: boolean): Promise<UtxoTxResponse> => {
  return query(`${isTest ? '/testnet' : ''}/api/v1/fees/recommended`, RequestType.Get, {});
};

export const queryTxsMem = (address: string, isTest: boolean, loadMoreTxs:string): Promise<UtxoTxResponse> => {
  return query(`${isTest ? '/testnet' : ''}/api/address/${address}/txs?after_txid=${loadMoreTxs}`, RequestType.Get, {});
};



export const pushTransaction = (txHex: string, isTest: boolean): Promise<UtxoTxResponse> => {
  const url = `${isTest ? '/testnet' : ''}/api/tx`;
  return axios.post(url, txHex);
};

