import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';
import { red } from '@mui/material/colors';

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

export const STSTableRow = styled(Box)<{
  clickable: number;
  status?: 'inactive' | 'warn' | 'info' | 'success' | 'fade' | 'none';
}>`
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
      .table-row-box {
        cursor: pointer;
      }

      cursor: pointer;
      &:hover {
        background-color: ${props.theme.palette.background.box};
      }
    `};

  ${(props) =>
    props.status == 'inactive' &&
    css`
      border: 1px solid ${props.theme.palette.error.dark};
      .table-row-text {
        color: ${props.theme.palette.error.dark};
      }
    `};

  ${(props) =>
    props.status == 'success' &&
    css`
      border: 1px solid ${props.theme.palette.success.dark};
      .table-row-text {
        color: ${props.theme.palette.success.dark};
      }
    `};

  ${(props) =>
    props.status == 'info' &&
    css`
      border: 1px solid ${props.theme.palette.info.dark};
      .table-row-text {
        color: ${props.theme.palette.info.dark};
      }
    `};

  ${(props) =>
    props.status == 'warn' &&
    css`
      border: 1px solid ${props.theme.palette.warning.dark};
      .table-row-text {
        color: ${props.theme.palette.warning.dark};
      }
    `};

  ${(props) =>
    props.status == 'fade' &&
    css`
      background-color: ${props.theme.palette.grey[200]};
      opacity: 0.8;
    `};
`;

export const STSTableHRow = styled(Box)`
  color: ${({ theme }) => theme.palette.text.secondary};
  display: flex;
  line-height: 17px;
`;
