import { css } from '@emotion/react';
import { styled } from '@mui/material';

import { ButtonLoad } from './components/ButtonLoad';

interface ButtonProps {
  _variant: string;
  _shadow: number;
  _small: number;
}

export const STButton = styled(ButtonLoad)<ButtonProps>`
  box-shadow: none;
  min-width: 100px;
  text-transform: none;

  &:hover {
    box-shadow: none;
  }

  ${(props) =>
    props._variant === 'contained' &&
    css`
      color: ${props.theme.palette.common.white};
    `};

  ${(props) =>
    props._shadow &&
    css`
      box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
    `};

  ${(props) =>
    props._small &&
    css`
      width: fit-content;
      min-width: auto;
      font-size: 12px;
      height: ${props.theme.spacing(10)};
    `};
`;
