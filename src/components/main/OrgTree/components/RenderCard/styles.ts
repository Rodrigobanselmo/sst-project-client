import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

import { TreeTypeEnum } from '../../../../../core/enums/tree-type.enums';

export const STCardArea = styled('div')<{
  horizontal?: number;
  expanded?: number;
}>`
  position: relative;
  display: inline-block;
  cursor: move;
  z-index: 10;
  ${(props) =>
    props.horizontal &&
    css`
      display: table-cell;
      vertical-align: middle;
    `}
`;

interface ICardCard {
  isDragging: boolean;
  type?: TreeTypeEnum;
}
export const STRenderLabel = styled(Box)<ICardCard>`
  background-color: white;
  cursor: grab;
  padding: 7px 15px;
  min-width: 100px;
  min-height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  z-index: 100000;
  color: ${(props) => props.theme.palette.text.main};
  position: relative;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  width: 320px;
  height: 98px;

  // no break line
  white-space: nowrap;
  text-overflow: ellipsis;

  &.mock_card {
    border: 1px solid #7de874;
  }

  ${(props) =>
    props.type === TreeTypeEnum.OPTION &&
    css`
      border-radius: 20px;
    `}

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
