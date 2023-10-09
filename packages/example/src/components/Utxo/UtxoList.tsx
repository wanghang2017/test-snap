import { useMemo } from 'react';
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


const defaultAddress = '1DSZGSPTi6uotFmLeMxmJCA6xpNGWp146K';


export const UtxoList = observer(() => {
  const utxo = useMemo(() => {
    return new UtxoListView();
  }, []);
  const { utxoList, loading, columnList, column, direction } = utxo;
  return (
    <UtxoContainer open={true}>
      <SearchContainer>
        <Input style={{ marginRight: 10 }} loading={loading} icon='search' placeholder='Search...' onChange={(e, data) => utxo.setAdress(data.value)}/>
        <Button content='Search' onClick={utxo.fetchUtxoList}/>
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
