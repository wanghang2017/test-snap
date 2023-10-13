import { useState, useEffect } from 'react';
import { queryFeeRate } from '../api/mempool/uxto';
import { useAppStore } from '../mobx';
import { FeeRate } from '../components/SendModal/types';

const initFeeRate: FeeRate = {
  high: 0,
  recommended: 0,
  low: 0
};

export const useFeeRate = () => {
  const { current, settings:{ isTest } } = useAppStore();
  const [feeRate, setFeeRate] = useState<FeeRate>(initFeeRate);
  const [count, setCount] = useState(0);

  const refresh = () => setCount(count + 1);

  useEffect(() => {
    if (current) {
      queryFeeRate(isTest).then((feeRate) => {
        setFeeRate({
          low:feeRate.minimumFee,
          recommended: feeRate.economyFee,
          high: feeRate.fastestFee,
        });
      });
    }
  }, [current, count]);

  return {
    feeRate,
    refresh
  };
};
  