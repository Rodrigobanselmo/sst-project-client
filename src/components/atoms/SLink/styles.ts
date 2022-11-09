import { css } from '@emotion/react';
import { styled, Link } from '@mui/material';

export const STLink = styled(Link)<{
  unstyled?: number;
}>`
  ${(props) =>
    props.unstyled &&
    css`
      text-decoration: none;
      &:hover {
        text-decoration: none;
      }
    `};
`;
