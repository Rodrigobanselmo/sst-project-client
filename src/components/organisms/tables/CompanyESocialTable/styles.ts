import { css } from '@emotion/react';
import { styled, Box } from '@mui/material';

export const STTableEsocialBox = styled(Box)<{
  unstyled?: number;
}>`
  display: grid;
  grid-template-rows: 30px 30px 30px 35px;
  justify-content: center;
  margin-top: 3px;
  align-items: center;

  ${(props) =>
    props.unstyled &&
    css`
      text-decoration: none;
      &:hover {
        text-decoration: none;
      }
    `};
`;
