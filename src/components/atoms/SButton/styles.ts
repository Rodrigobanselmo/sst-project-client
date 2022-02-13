import { css } from '@emotion/react';
import { styled } from '@mui/material';

import { ButtonLoad } from './components/ButtonLoad';

export const STButton = styled(ButtonLoad)<{
  _variant: string;
  _shadow: number;
}>`
  box-shadow: none;

  &:hover {
    box-shadow: none;
  }

  ${(props) =>
    props._variant === 'contained' &&
    css`
      color: ${props.theme.palette.common.white};
    `}

  ${(props) =>
    props._shadow &&
    css`
      box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
    `}
`;
