import { useEffect, useState } from 'react';
import { TransactionDetail, TransactionStatus, TransactionTypes } from '../types';
import { useAppStore } from '../mobx';
import { logger } from '../logger';
import { WalletType } from '../interface';
import { queryTxsMem } from '../api/mempool/uxto';

interface UseTransaction {
  size: number;
  offset?: number;
}

export const useTransaction = ({ size }: UseTransaction) => {
  const { current, currentWalletType, settings:{ isTest } } = useAppStore();
  const [txList, setTxList] = useState<TransactionDetail[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastTx, setLastTx] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string>();

  const refresh = () => {
    setError(undefined);
    if (!loading) {
      setCount(count + 1);
    }
  };

  const loadMore = () => {
    setLastTx(txList[txList.length - 1].ID);
  };

  useEffect(() => {
    if (current && currentWalletType === WalletType.BitcoinWallet) {
      setLoading(true);
      queryTxsMem(current.receiveAddress.address, isTest,  lastTx )
        .then(res =>
          res.map((tx:any) => {
            // console.log(current.receiveAddress.address);
            const address = current.receiveAddress.address;
            const isReceive = !tx.vin.some((vin: any) => vin.prevout.scriptpubkey_address === address);
            const senderAddresses = tx.vin?.[0]?.prevout?.scriptpubkey_address || '';
            const receiveAddress = tx.vout?.[1]?.scriptpubkey_address || '';
            const senderAmount = tx.vin.filter((item: any) => item.prevout.scriptpubkey_address === address).reduce((p: any, n: any) => p + n.prevout.value, 0);
            const receiveAmount = tx.vout.filter((item: any) => item.scriptpubkey_address === address).reduce((p: any, n: any) => p + n.value, 0);
            return {
              ID: tx.txid,
              type: isReceive ? TransactionTypes.Received : TransactionTypes.Sent,
              status: tx.status.confirmed ? TransactionStatus.Confirmed : TransactionStatus.Pending,
              amount: isReceive ? Math.abs(receiveAmount) : senderAmount || 0,
              address: isReceive ? senderAddresses : receiveAddress || '',
              date: Math.floor(tx.status.block_time * 1000),
              fee: tx.fee,
              url: `https://mempool.space/${isTest ?'testnet/':''}tx/${tx.txid}`,
              from: senderAddresses,
              to: isReceive? address:receiveAddress
              // marker: tx.modifiedTime,
              // confirmedNum: tx.confirmedNum,
              // confirmThreshold: tx.confirmThreshold,
            };
          })
            .reduce((list:any, cur:any) => {
              if (list.some((tx:any) => tx.ID === cur.ID)) {
                // filter out the transaction indicates receiving, which is actually the transaction sent to change address,
                // only keep the sending one for the same ID
                return [...list, cur].filter(tx => tx.ID !== cur.ID || tx.type !== TransactionTypes.Received);
              }
              return [...list, cur];
            }, [] as TransactionDetail[])
            .slice(0, size)
        )
        .then((txList: TransactionDetail[]) => {
          setTxList(txList);
          setLoading(false);
          setHasMore(txList.length !== 0);
        })
        .catch(e => {
          setLoading(false);
          setTxList([]);
          setError(e);
          logger.error(e);
        });
    } else {
      setTxList([]);
    }
  }, [current, count, lastTx, currentWalletType]);

  return {
    txList,
    loading,
    refresh,
    loadMore,
    hasMore,
    error
  };
};
