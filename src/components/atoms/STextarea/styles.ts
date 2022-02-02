/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from '@emotion/react';
import { styled, TextareaAutosize } from '@mui/material';

export const STTextareaAutosize = styled(TextareaAutosize)<{
  resize: number;
}>`
  ${(props) =>
    !props.resize &&
    css`
      resize: none;
    `}
`;
