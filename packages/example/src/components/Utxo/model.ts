import { makeAutoObservable } from 'mobx';
import { UtxoListResponse, queryUtxoMem, queryTxMem, UtxoTxResponse } from '../../api/mempool/uxto';
import { logger } from '../../logger';


const sleep=(time:number)=>{
  return new Promise((resolve:(value:unknown)=>void )=>{
    setTimeout(() => {
      resolve(null);
    }, time);
  });
  
};

const fetchFncList = async (ary: (()=>Promise<any>)[], num:number)=>{
  let resAry:(any)[]=[];
  const length = Math.ceil(ary.length/num);
  for (let i = 0; i < length;i++){
    const item = ary.slice(num * i, num * (i +1));
    const res = await Promise.all(item.map(i=>i()));
    await sleep(100);
    resAry= [...resAry, ...res];
  }
  return resAry;

};

class UtxoListView{
  private utxoListBase: UtxoListResponse = [];
  public address= '';
  public column= '';
  public direction: 'descending' |'ascending'|undefined ;
  public loading=false;
  public psbtList = [];
  public columnList = [
    {
      title: 'txid'
    },
    {
      title: 'dateTime'
    },
    {
      title: 'vout'
    },
    {
      title: 'confirmed'
    },
    {
      title: 'value'
    },
    {
      title:'isOrdinal'
    },
    {
      title: 'operate'
    }
  ];
  constructor(){
    makeAutoObservable(this);
  }

  setPsbtList(psbtList:[]){
    this.psbtList=psbtList;
  }
  setAdress(address:string){
    this.address = address;
  }
  setColumn(column:string){
    this.direction = column===this.column&& this.direction === 'ascending' ? 'descending' : 'ascending',
    this.column=column;
  }

  fetchUtxoList = async (isTest: boolean) => {
    if (this.address) {
      this.loading = true;
      queryUtxoMem(this.address, isTest).then( async data => {
        const utxoTxList = data.map( item => async ()=> {
          item.confirmed = item.status.confirmed;
          item.dateTime = item.status.block_time;
          if(item.vout===0){
            const res = await queryTxMem(item.txid, isTest);
            const ordinal = res?.vin?.[0]?.witness?.[1] || '';
            if (ordinal && ordinal.includes('0063') && ordinal.endsWith('68')) {
              return { ...item, isOrdinal: true };
            }
          }
          return { ...item, isOrdinal:false };
        });
        const res = await fetchFncList(utxoTxList, 10);
        
        
        this.utxoListBase = res;
        this.loading = false;
      }).catch(e => {
        this.loading = false;
        logger.error(e);
      });
    }
  };

  get utxoList (){
    if(!this.direction){
      return this.utxoListBase;
    }

    if(
      this.direction === 'ascending'
    ){
      return this.utxoListBase.slice().sort((pre, next)=>pre[this.column]-next[this.column]);
    }
    return this.utxoListBase.slice().sort((pre, next) => next[this.column] - pre[this.column]);
    
  }
  
}

export default UtxoListView;