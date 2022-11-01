import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STBoxContainer = styled(Box)<{ disabled: number }>`
  border: 2px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  padding: ${(props) => props.theme.spacing(0, 2)};
  width: 100%;
  cursor: pointer;

  &:hover {
    filter: brightness(0.9);
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.7;
      filter: brightness(1);
    `};
`;

export const STBoxItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(2)};
  width: 100%;
`;
