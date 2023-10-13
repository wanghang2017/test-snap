import { useEffect, useMemo } from 'react';
import { Input, Button, Table, Icon } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';

import {
  HeaderContainer,
  SearchContainer,
  UtxoContainer,
  EmptyContainer,
  LoadingContainer,
  LinkContainer
} from './styles';

import UtxoListView from './model';
import LoadingIcon from '../Icons/Loading';
import dayjs from 'dayjs';
import { useReceiveAddress } from '../../hook/useReceiveAddress';
import { useAppStore } from '../../mobx';
import { BitcoinNetwork } from '../../interface';
// import { generatePSBT } from '../../lib';


const defaultAddress = '1DSZGSPTi6uotFmLeMxmJCA6xpNGWp146K';


export const UtxoList = observer(() => {
  const { settings: { network } } = useAppStore();
  const { address } = useReceiveAddress();
  const utxo = useMemo(() => {
    return new UtxoListView();
  }, []);
  useEffect(() => { 
    utxo.setAdress(address);
    utxo.fetchUtxoList(network===BitcoinNetwork.Test);
  }, [address]);
  const { utxoList, loading, columnList, column, direction } = utxo;

  useEffect(() => {
    // const psbtListStr = localStorage.getItem('psbtList');
    // const psbtList = JSON.parse(psbtListStr||'[]');
    // utxo.setPsbtList(psbtList);
  });

  const sell = (utxo:any)=>{
    // const psbt = generatePSBT(utxo);
  
    
    // localStorage.setItem('psbtList', JSON.stringify(psbt));
  };
  const buy = (utxo:any)=>{
    // const psbt = utxo.psbtList.find(item=>{ return item?.id===utxo?.txid; });
     
  };
  return (
    <UtxoContainer open={true}>
      <SearchContainer>
        <Input style={{ marginRight: 10 }} value={utxo.address} loading={loading} icon='search' placeholder='Search...' onChange={(e, data) => utxo.setAdress(data.value)}/>
        <Button content='Search' onClick={() => utxo.fetchUtxoList(network === BitcoinNetwork.Test)}/>
      </SearchContainer>
      
      <HeaderContainer>
       
        <Table sortable celled>
          <Table.Header>
            <Table.Row>
              {columnList.map(item => {
                return <Table.HeaderCell
                  sorted={column === item.title ? direction : undefined}
                  onClick={() => { utxo.setColumn(item.title); }}
                  key={item.title}>
                  {item.title}
                </Table.HeaderCell>;
              })}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {
              utxoList.map(utxo => {
                return <Table.Row key={utxo.txid} positive={utxo.status.confirmed} negative={!utxo.status.confirmed}>
                  <Table.Cell><LinkContainer target='_blank' href={`https://mempool.space/tx/${utxo.txid}`} rel='noreferrer' >{utxo.txid}</LinkContainer></Table.Cell>
                  <Table.Cell>{dayjs(utxo.status.block_time*1000).format('YYYY-MM-DD HH:mm:ss')}</Table.Cell>
                  <Table.Cell>{utxo.vout}</Table.Cell>
                  <Table.Cell>{utxo.status.confirmed ? <Icon name='checkmark' /> : <Icon name='spinner' />}</Table.Cell>
                  <Table.Cell>{utxo.value}</Table.Cell>
                  <Table.Cell>{utxo.isOrdinal ? <Icon name='checkmark' /> : <Icon name='close' />}</Table.Cell>
                  <Table.Cell>{utxo.isOrdinal ? <><button onClick={() => sell(utxo)}>下单</button> <button onClick={()=>buy(utxo)} >吃单</button></> : '-'}</Table.Cell>
                </Table.Row>;
              })
            }
          </Table.Body>
        </Table>
        {!utxoList.length &&
            <EmptyContainer>
              没有数据
            </EmptyContainer>
        }
        {loading ? <LoadingContainer><LoadingIcon /></LoadingContainer> : null}
       
       
      </HeaderContainer>
    </UtxoContainer>
  );
});
