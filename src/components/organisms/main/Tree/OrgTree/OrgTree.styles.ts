  import { css } from '@emotion/react';
import styled from '@emotion/styled';

interface IHorizontal {
  horizontal: boolean;
}
export const OrgTreeContainer = styled.div<IHorizontal>`
  display: block;
  overflow: auto;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: 30px;
  padding-right: 1600px;

  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  &::-webkit-scrollbar-track {
    width: 10px;
    height: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
    border-radius: 24px;
  }

`;

export const OrgTree = styled.div<IHorizontal>`
  display: table;
  text-align: center;
  padding-bottom: 1600px;

  &:before,
  &:after {
    content: '';
    display: table;
  }

  &:after {
    clear: both;
  }
`;

export const STGhoBox = styled.div<{ risk_init:number; gho:number; expanded?:number  }>`
  height: 95%;
  width: 306px;
  position: absolute;
  left: calc(100% - 338px);
  pointer-events: none;
  transition: left 0.5s ease-in-out;

  ${(props) =>
    (props.gho || props.risk_init) &&
      css`
        pointer-events: auto;
    `}

  ${(props) =>
    props.risk_init &&
      css`
        max-height: 600px;
        height: auto;
        bottom: 50px;
        left: 25px;
        width: auto;
    `}

${(props) =>
    props.expanded &&
      css`
        min-height: calc(100vh - 150px);
    `}
`;
