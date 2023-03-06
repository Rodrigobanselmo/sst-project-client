import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STCustomNode = styled(Box)<{ selected?: number }>`
  align-items: center;
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  height: 32px;
  padding-inline-end: 8px;

  ${(props) =>
    props.selected &&
    css`
      color: #1967d2;
    `};

  .expandIconWrapper {
    align-items: center;
    font-size: 0;
    cursor: pointer;
    display: flex;
    height: 24px;
    justify-content: center;
    width: 24px;
    transition: transform linear 0.1s;
    transform: rotate(0deg);
  }

  .expandIconWrapper.isOpen {
    transform: rotate(90deg);
  }

  .labelGridItem {
    padding-inline-start: 8px;
  }
`;
