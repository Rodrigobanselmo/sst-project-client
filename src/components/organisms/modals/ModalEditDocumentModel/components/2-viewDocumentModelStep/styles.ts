import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STRelativeBox = styled(Box)<{ nav?: number }>`
  position: relative;
  border: 1px solid;
  border-color: ${(props) => props.theme.palette.grey[400]};
  border-radius: 8px;
  max-height: 100%;
  overflow-y: auto;
  width: 100%;

  ${(props) =>
    props.nav &&
    css`
      min-width: ${props.theme.spacing(150)};
      max-width: ${props.theme.spacing(150)};
      background-color: ${props.theme.palette.grey[200]};
    `};
`;
