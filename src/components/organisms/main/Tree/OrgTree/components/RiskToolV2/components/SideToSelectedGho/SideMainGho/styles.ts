import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STBoxContainer = styled(Box)<{ disabled: number }>`
  border: 1px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  border-radius: 14px;
  padding: ${(props) => props.theme.spacing(3, 5)};
  width: 100%;
  cursor: pointer;
  height: 100%;
  &:hover {
    border-color: ${(props) => props.theme.palette.text.secondary};
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.7;
    `};
`;

export const STBoxItem = styled(Box)<{ disabled: number }>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(2)};
  width: 100%;
  min-height: 36px;
`;
