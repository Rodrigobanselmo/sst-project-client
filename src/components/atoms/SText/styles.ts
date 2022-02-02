import { css } from '@emotion/react';
import { styled, Typography } from '@mui/material';

export const STTypography = styled(Typography)<{
  line_number: number;
}>`
  ${(props) =>
    props.line_number &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: ${props.line_number};
      -webkit-box-orient: vertical;
    `}
`;
