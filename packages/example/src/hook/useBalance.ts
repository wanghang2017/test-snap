import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../mobx';
import { AppStatus } from '../mobx/runtime';
import { IAccount } from '../mobx/types';
import { logger } from '../logger';
import { BitcoinNetwork, WalletType } from '../interface';
import { balance as queryLightningBalance } from '../api/lightning/balance';
import { queryUtxoMem } from '../api/mempool/uxto';

interface Props {
  type?: WalletType
}

export const useBalance = (props?: Props) => {
  const {
    current,
    currentWalletType,
    settings: { network },
    runtime: { setStatus, getWallet, setBalanceForWallet },
    lightning,
  } = useAppStore();
  const [count, setCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const hasFetched = useRef<boolean>(false);

  const refresh = () => {
    setCount(count + 1);
  };
  const isTest = network === BitcoinNetwork.Test;

  const fetchBalance = useCallback((forceFetch = false) => {
    const queryBalance = async (current: IAccount) => {
      // const coinCode: SupportedCoins =
      //   NETWORK_SCRIPT_TO_COIN[current.network][current.scriptType];
      const data = await queryUtxoMem(current.receiveAddress.address, isTest);
      const balance = data.filter(item => item.status.confirmed).reduce((p, n) => p+n.value, 0);
      
      // const balance = Number(response.coins[coinCode].balance) || 0;
      return { balance };
    };

    if(currentWalletType === WalletType.BitcoinWallet || props?.type === WalletType.BitcoinWallet) {
      if (current) {
        const wallet = getWallet(current.id);
        if(wallet && wallet.balanceFetched && !forceFetch){
          setBalance(wallet.balance);
          setStatus(AppStatus.Ready);
          return;
        }

        if(!hasFetched.current){
          setStatus(AppStatus.FetchBalance);
        }

        setLoadingBalance(true);
        setErrorMessage('');
        hasFetched.current = true;
        queryBalance(current)
          .then(({ balance }) => {
            setBalance(balance);
            setStatus(AppStatus.Ready);
            setLoadingBalance(false);
            setBalanceForWallet(current.id, balance);
          })
          .catch((e) => {
            logger.error(e);
            setErrorMessage('Loading failed. Please check your network connection.');
            setLoadingBalance(false);
            setBalance(0);
            setStatus(AppStatus.Ready);
            setBalanceForWallet(current.id, balance);
          });
      } else {
        setErrorMessage('Loading failed. Please select your wallet');
        setBalance(0);
        setStatus(AppStatus.Ready);
      }
    } else if(currentWalletType === WalletType.LightningWallet) {
      if (lightning.current) {
        const currentLNWallet = lightning.current;
        const wallet = getWallet(currentLNWallet.id);
        if(wallet && wallet.balanceFetched && !forceFetch){
          setBalance(wallet.balance);
          setStatus(AppStatus.Ready);
          return;
        }
        if(!hasFetched.current){
          setStatus(AppStatus.FetchBalance);
        }
        hasFetched.current = true;

        setLoadingBalance(true);
        setErrorMessage('');
        queryLightningBalance().then(response => {
          const balance = Number(response.BTC.AvailableBalance) || 0;
          setBalance(balance);
          setStatus(AppStatus.Ready);
          setLoadingBalance(false);
          setBalanceForWallet(currentLNWallet.id, balance);
        }).catch((e) => {
          logger.error(e);
          setErrorMessage('Loading failed. Please check your network connection.');
          setBalance(0);
          setStatus(AppStatus.Ready);
          setLoadingBalance(false);
        });
      } else {
        setBalance(0);
        setErrorMessage('Loading failed. Please select your wallet');
        setStatus(AppStatus.Ready);
      }
    }
  }, [currentWalletType, current, lightning.current, isTest]);

  useEffect(() => {
    if (current || lightning.current) {
      fetchBalance();
    }
  }, [current, currentWalletType, lightning.current]);

  useEffect(() => {
    if(count > 0) {
      fetchBalance(true);
    }
  }, [count]);

  return {
    balance,
    refresh,
    loadingBalance,
    errorMessage,
  };
};
