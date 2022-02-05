/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from '@emotion/react';
import { styled, TextareaAutosize } from '@mui/material';

export const STTextareaAutosize = styled(TextareaAutosize)<{
  resize: number;
  unstyled: number;
}>`
  padding: 10px;
  border-color: ${(props) => props.theme.palette.background.divider};
  border-width: 2px;
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline-color: ${(props) => props.theme.palette.primary.main};
  }

  &:hover {
    border-color: ${(props) => props.theme.palette.background.default};
    &:focus {
      outline-color: ${(props) => props.theme.palette.primary.main};
    }
  }

  ${(props) =>
    !props.unstyled &&
    css`
      resize: none;
    `}
  ${(props) =>
    !props.resize &&
    css`
      outline: none;
      padding: 0;
      border: none;
    `}
`;
