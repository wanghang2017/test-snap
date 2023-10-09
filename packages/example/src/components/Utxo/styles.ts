import styled from 'styled-components';



export const UtxoContainer = styled.div<{ open: boolean }>`
  display:flex;
  width: 100%;
  height: 100%;
  display: ${(props) => (props.open ? 'flex' : 'none')};
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;


export const HeaderContainer = styled.header`
  display:flex;
  flex-direction:column;
  width: 80%;
  position: relative;

`;


export const SearchContainer = styled.div`
  display:flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-bottom:20px;
`;


export const EmptyContainer = styled.div`
  display: flex;
  height: 150px;
  justify-content: center;
  align-items: center;
  border:1px solid #ccc;
  border-top:none;
  margin-top:-1.1em;
`;

export const LoadingContainer = styled.div`
  width:100%;
  background-color: rgba(0,0,0,.2);
  position:absolute;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    animation: iconRotate 1s infinite;
    animation-timing-function: linear;
  }
  @keyframes iconRotate {
    0% {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LinkContainer=styled.a`
  display:inline-block;
  width:200px;
  word-break:break-word;
`;