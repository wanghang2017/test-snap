import { useEffect, useState } from 'react';
import { fromHdPathToObj } from '../lib/cryptoPath';
import { coinManager } from '../services/CoinManager';
import { BitcoinNetwork, Utxo } from '../interface';
import { useAppStore } from '../mobx';
import { logger } from '../logger';
import { queryTxHex, queryUtxoMem } from '../api/mempool/uxto';
import { EXTENDED_HD_PATH, EXTENDED_UNCHANGE_HD_PATH } from '../constant/bitcoin';

export const useUtxo = () => {
  const { current, settings:{ isTest, network } } = useAppStore();
  const [utxoList, setUtxoList] = useState<Utxo[]>([]);
  const [nextChangePath, setNextChangePath] = useState<string>('');
  const [pendingValue, setPendingValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (current) {
      setLoading(true);
      queryUtxoMem(current.receiveAddress.address, isTest).then(data => {
        const res={
          spendables: data.filter(item => item.status.confirmed),
          pending: data.filter(item => !item.status.confirmed)
        };
        const utxoList = res.spendables
          .map(utxo => {
  
            const hdPath = EXTENDED_HD_PATH[network][current.scriptType];
            const { change, index } = fromHdPathToObj(hdPath);
            const pubkey = coinManager.xpubToPubkey(current.xpub, Number(change), Number(index));
            return {
              transactionHash: utxo.txid,
              index: utxo.vout,
              address: coinManager.deriveAddress(pubkey, current.scriptType, current.network),
              value: utxo.value,
              path: hdPath,
              pubkey,
            };
          });
        const pendingValue = res.pending.reduce((total, tx) => total + tx.value, 0);
        setPendingValue(pendingValue);
        return { utxoList, nextChange: EXTENDED_UNCHANGE_HD_PATH[network][current.scriptType], pendingValue };
      // }).then(data => {
      //   setLoading(false);
      //   return fetchRawTx(data['utxoList'], data['nextChange'], current.network);
      })
        .then(data => {
          setLoading(false);
          const { utxoList, nextChange } = data;
          setUtxoList(utxoList);
          setNextChangePath(nextChange);
        })
        .catch(e => {
          setLoading(false);
          logger.error(e);
        });
    }
  }, [current]);

  return {
    utxoList,
    nextChange: nextChangePath,
    loading,
    pendingValue,
  };
};

export const fetchRawTx = (utxoList: any[], nextChange: string, network: BitcoinNetwork) =>
  Promise.all(utxoList.map(each => {
    const isTest = network == BitcoinNetwork.Main ?false : true;
    return queryTxHex(each.transactionHash || each.txId, isTest).then(
      data => ({
        ...each,
        rawHex: data,
      }),
    );
  })).then(newUtxoList => {
    return {
      utxoList: newUtxoList,
      nextChange,
    };
  });
