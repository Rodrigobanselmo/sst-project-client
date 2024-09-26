import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';


export const STSTableRow = styled(Box)<{
  clickable: number;
  status?: 'inactive' | 'warn' | 'info' | 'success' | 'fade' | 'none';
}>`
  -webkit-box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0.25rem;
  align-items: center;
  width: 100%;

  .table-row-checkbox {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }

  .table-row-box {
    z-index: 1;
    height: fit-content;
  }

  ${(props) =>
    props.clickable &&
    css`
      .table-row-box {
        height: fit-content;
        cursor: pointer;
      }

      cursor: pointer;
      &:hover {
        background-color: ${props.theme.palette.background.box};

        .table-row-checkbox {
          background-color: ${props.theme.palette.background.box};
        }
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
