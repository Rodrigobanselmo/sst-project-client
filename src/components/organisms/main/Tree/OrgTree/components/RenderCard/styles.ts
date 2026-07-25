import { css, keyframes } from '@emotion/react';
import { Box, styled } from '@mui/material';

import { hierarchyNodeVisualIdentity } from '../../constants/hierarchy-node-visual.constant';
import { TreeTypeEnum } from '../../enums/tree-type.enums';

interface ICardCard {
  isDragging: boolean;
  type?: TreeTypeEnum;
}

/** Largura única para todos os níveis — evita falsa hierarquia por tamanho. */
export const HIERARCHY_CARD_WIDTH = '13.75rem'; // ~220px (spacing 110)

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

const getTypeVisualCss = (type?: TreeTypeEnum) => {
  if (!type) return undefined;

  const visual = hierarchyNodeVisualIdentity[type];
  if (!visual) return undefined;

  return css`
    background-color: ${visual.background};
    border: ${visual.borderWidth}px solid ${visual.border};
    box-shadow: ${visual.shadow};
    ${visual.accentLeft
      ? `
      padding-left: 1.75rem;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: ${visual.accentLeft};
        border-radius: 5px 0 0 5px;
      }
    `
      : ''}
  `;
};

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
  box-sizing: border-box;
  background-color: white;
  cursor: grab;
  padding: ${(props) => props.theme.spacing(3.5, 5)};
  width: ${HIERARCHY_CARD_WIDTH};
  min-width: ${HIERARCHY_CARD_WIDTH};
  max-width: ${HIERARCHY_CARD_WIDTH};
  min-height: ${(props) => props.theme.spacing(50)};
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  z-index: ${({ theme }) => theme.mixins.nodeLabel};
  color: ${(props) => props.theme.palette.text.main};
  position: relative;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  border: 1px solid ${(props) => props.theme.palette.grey[200]};
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;

  ${(props) => getTypeVisualCss(props.type)}

  .hierarchy-card-delete {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }

  &:hover .hierarchy-card-delete {
    opacity: 1;
    pointer-events: auto;
  }

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
