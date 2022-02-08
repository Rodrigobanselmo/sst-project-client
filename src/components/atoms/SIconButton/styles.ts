import { css } from '@emotion/react';
import { darken, styled, IconButton } from '@mui/material';

export const STTextField = styled(IconButton)<{
  bg: any;
}>`
  ${(props) =>
    props.bg &&
    css`
      background-color: ${props.theme.palette[props.bg as unknown as any]};
      &:hover {
        background-color: ${darken(props.theme.palette[props.bg], 0.7)};
      }
      &:active {
        background-color: ${darken(props.theme.palette[props.bg], 0.7)};
      }
    `}
`;
