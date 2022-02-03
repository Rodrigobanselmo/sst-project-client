import { css } from '@emotion/react';
import { styled } from '@mui/material';

import { ButtonLoad } from './components/ButtonLoad';
import { SButtonProps } from './types';

export const STButton = styled(ButtonLoad)<Pick<SButtonProps, 'variant'>>`
  box-shadow: none;

  &:hover {
    box-shadow: none;
  }

  ${(props) =>
    props.variant === 'contained' &&
    css`
      color: ${props.theme.palette.common.white};
    `}
`;
