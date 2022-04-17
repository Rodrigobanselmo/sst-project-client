import { css, keyframes } from '@emotion/react';
import { Box, styled } from '@mui/material';

import { TreeTypeEnum } from '../../enums/tree-type.enums';

interface ICardCard {
  isDragging: boolean;
  type?: TreeTypeEnum;
}

const FadeInAnimation = keyframes`  
  0% { 
    border: 2px solid #7de874;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
   }
  50% { 
    border: 2px solid #7de874;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5);
   }
  100% { 
    border: 2px solid #7de874;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
   }
`;

export const STCardArea = styled(Box)<{
  horizontal?: number;
  expanded?: number;
}>`
  position: relative;
  display: inline-block;
  cursor: move;
  z-index: ${({ theme }) => theme.mixins.nodeCard};
  ${(props) =>
    props.horizontal &&
    css`
      display: table-cell;
      vertical-align: middle;
    `}
`;

export const STRenderLabel = styled(Box)<ICardCard>`
  background-color: white;
  cursor: grab;
  padding: ${(props) => props.theme.spacing(3, 6)};
  min-width: ${(props) => props.theme.spacing(100)};
  min-height: ${(props) => props.theme.spacing(20)};
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  z-index: ${({ theme }) => theme.mixins.nodeLabel};
  color: ${(props) => props.theme.palette.text.main};
  position: relative;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  height: ${(props) => props.theme.spacing(35)};

  // no break line
  white-space: nowrap;
  text-overflow: ellipsis;

  &.mock_card {
    border: 1px solid #7de874;
  }

  &.node_animation {
    animation: ${FadeInAnimation} 2s linear 3;
  }

  .node-tree-text-id {
    background-color: ${(props) => props.theme.palette.primary.main};
    padding: 1px 6px;
    display: flex;
    align-items: center;
    border-radius: 4px;
    color: white;
    justify-content: center;
    max-width: 52px;
    min-width: 52px;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  ${(props) =>
    props.isDragging &&
    css`
      cursor: grabbing;
    `}
`;

export const StyledLabel = styled('div')`
  margin: 0;
  padding: 0;
`;
