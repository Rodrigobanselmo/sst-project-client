import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

interface IProps {
  active?: 0 | 1;
  disabled?: 0 | 1;
  color?: string;
}

export const STBox = styled(Box)<IProps>`
  padding: ${(props) => props.theme.spacing(5)};
  background-color: ${(props) => props.theme.palette.background.box};
  border: 2px solid ${(props) => props.theme.palette.background.box};
  border-radius: ${(props) => props.theme.spacing(4)};
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  flex: 1;
  max-width: 400px;
  min-width: 240px;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);

  &:hover {
    border: 2px solid ${(props) => props.theme.palette.primary.light};
  }

  &:active {
    filter: brightness(0.9);
  }

  svg {
    color: ${(props) => props.theme.palette.common.white};
    background-color: ${(props) => props.theme.palette.gray[500]};
    border-radius: 50%;
    padding: 6px;
  }

  ${(props) =>
    props.active &&
    css`
      border: 2px solid ${props.theme.palette.primary.light};
      box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);

      svg {
        background-color: ${props?.color || props.theme.palette.primary.main};
        border-radius: 50%;
        color: ${props.theme.palette.common.white};
        padding: 6px;
      }
    `};

  ${(props) =>
    props.disabled &&
    css`
      svg {
        background-color: ${props.theme.palette.grey[500]} !important;
        border-radius: 50%;
        color: ${props.theme.palette.common.white};
        padding: 5px;
      }
    `};
`;
