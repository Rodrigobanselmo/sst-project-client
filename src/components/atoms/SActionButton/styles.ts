import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

interface IProps {
  active?: 0 | 1;
  success?: 0 | 1;
  primary?: 0 | 1;
  disabled?: 0 | 1;
}

export const STBox = styled(Box)<IProps>`
  padding: ${(props) => props.theme.spacing(5)};
  background-color: ${(props) => props.theme.palette.background.darkPaper};
  border-radius: ${(props) => props.theme.spacing(4)};
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.8);
  }

  svg {
    color: ${(props) => props.theme.palette.text.secondary};
  }
  p {
    color: ${(props) => props.theme.palette.text.primary};
  }

  ${(props) =>
    props.active &&
    css`
      background-color: ${props.theme.palette.info.main};
      svg {
        color: ${props.theme.palette.common.white};
      }
      p {
        color: ${props.theme.palette.common.white};
      }
    `};

  ${(props) =>
    props.primary &&
    css`
      background-color: ${props.theme.palette.primary.main};
      svg {
        color: ${props.theme.palette.common.white};
      }
      p {
        color: ${props.theme.palette.common.white};
      }
    `};

  ${(props) =>
    props.success &&
    css`
      background-color: ${props.theme.palette.success.main};
      svg {
        color: ${props.theme.palette.common.white};
      }
      p {
        color: ${props.theme.palette.common.white};
      }
    `};

  ${(props) =>
    props.disabled &&
    css`
      background-color: ${props.theme.palette.grey[500]} !important;
      svg {
        color: ${props.theme.palette.common.white};
      }
      p {
        color: ${props.theme.palette.common.white};
      }
    `};
`;
