import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STBoxContainer = styled(Box)<{ disabled: number }>`
  border: 2px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  padding: ${(props) => props.theme.spacing(2, 4)};
  width: 100%;
  cursor: pointer;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.7;
    `};
`;

export const STBoxItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(4)};
  width: 100%;
  min-height: 46px;
`;
