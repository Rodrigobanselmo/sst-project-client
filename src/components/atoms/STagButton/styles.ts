import { css } from '@emotion/react';
import { styled, Box } from '@mui/material';

export const STSBoxButton = styled(Box)<{
  large?: number;
  error?: number;
  active?: number;
}>`
  border: 1px solid ${(props) => props.theme.palette.background.divider};

  border-radius: 5px;
  box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.05);
  background-color: ${(props) => props.theme.palette.grey[100]};
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.palette.grey[300]};
  }

  &:active {
    background-color: ${(props) => props.theme.palette.grey[400]};
  }

  ${(props) => props.large && css``}

  ${(props) =>
    props.active &&
    css`
      background-color: ${props.theme.palette.primary.main};

      &:hover {
        background-color: ${props.theme.palette.primary.dark};
      }

      &:active {
        background-color: ${props.theme.palette.primary.light};
      }
    `}

  
  ${(props) =>
    props.error &&
    css`
      border: 2px solid ${props.theme.palette.error.main};
    `}
`;
