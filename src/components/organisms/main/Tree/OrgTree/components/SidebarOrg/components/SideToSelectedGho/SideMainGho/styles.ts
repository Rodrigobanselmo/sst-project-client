import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STBoxItem = styled(Box)<{ disabled: number }>`
  border: 2px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(4)};
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  padding: ${(props) => props.theme.spacing(2, 4)};
  width: 100%;
  min-height: 46px;
  cursor: pointer;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.7;
    `};
`;
