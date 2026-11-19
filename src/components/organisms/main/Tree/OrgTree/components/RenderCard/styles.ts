import { css, keyframes } from '@emotion/react';
import { Box, styled } from '@mui/material';

import { getHierarchyNodeVisual } from '../../constants/hierarchy-node-visual.constant';
import { TreeTypeEnum } from '../../enums/tree-type.enums';

interface ICardCard {
  isDragging: boolean;
  type?: TreeTypeEnum;
  isSelected?: boolean;
  selectionMode?: boolean;
}

/** Largura única para todos os níveis — evita falsa hierarquia por tamanho. */
export const HIERARCHY_CARD_WIDTH = '22.6875rem'; // 363px: 10% wider than the original 330px.
export const HIERARCHY_CARD_RADIUS = '24px';

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

const getTypeVisualCss = (type: TreeTypeEnum | undefined, mode: 'light' | 'dark') => {
  if (!type) return undefined;

  const visual = getHierarchyNodeVisual(type, mode);
  if (!visual) return undefined;

  return css`
    background-color: ${visual.background};
    border: ${visual.borderWidth}px solid ${visual.border};
    box-shadow: ${visual.shadow};
    ${visual.accentLeft
      ? `
      padding-left: 0.875rem;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-left: 4px solid ${visual.accentLeft};
        border-radius: inherit;
        pointer-events: none;
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
  background-color: ${(props) => props.theme.palette.background.paper};
  cursor: ${(props) => (props.selectionMode ? 'pointer' : 'grab')};
  padding: ${(props) => props.theme.spacing(2, 4)};
  width: var(--hierarchy-card-width, ${HIERARCHY_CARD_WIDTH});
  min-width: var(--hierarchy-card-width, ${HIERARCHY_CARD_WIDTH});
  max-width: var(--hierarchy-card-width, ${HIERARCHY_CARD_WIDTH});
  min-height: 0;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  z-index: ${({ theme }) => theme.mixins.nodeLabel};
  color: ${(props) => props.theme.palette.text.primary};
  position: relative;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  border-radius: ${HIERARCHY_CARD_RADIUS};
  border: 1px solid ${(props) => props.theme.palette.grey[200]};
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;

  ${(props) => getTypeVisualCss(props.type, props.theme.palette.mode)}

  ${(props) =>
    props.isSelected &&
    css`
      box-shadow:
        0 0 0 2px ${props.theme.palette.primary.main},
        0 1px 5px rgba(0, 0, 0, 0.15);
    `}

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
