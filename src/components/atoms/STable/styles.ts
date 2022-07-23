import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STSTable = styled(Box)<{ columns: string; rowGap: string }>`
  overflow-x: auto;

  .table_grid {
    gap: ${(props) => props.rowGap};
    grid-template-columns: ${(props) => props.columns};
  }
`;

export const STSTableBody = styled(Box)`
  display: flex;
  flex-direction: column;
  min-width: fit-content;
  padding: 2px;

  &::-webkit-scrollbar {
    border-radius: 24px;
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
    border-radius: 24px;
  }
`;

export const STSTableHeader = styled(Box)`
  display: grid;
  align-items: center;
  width: 100%;
`;

export const STSTableRow = styled(Box)<{ clickable: number }>`
  display: grid;
  flex-shrink: 0;
  -webkit-box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0.25rem;
  align-items: center;
  width: 100%;

  ${(props) =>
    props.clickable &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${props.theme.palette.background.box};
      }
    `};
`;

export const STSTableHRow = styled(Box)`
  color: ${({ theme }) => theme.palette.text.secondary};
  display: flex;
  line-height: 17px;
  font-size: 14px;
`;
