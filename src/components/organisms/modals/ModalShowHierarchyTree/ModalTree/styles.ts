import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

export const STGridBox = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
`;

export const STSInput = styled(SInput)<{ small?: number }>`
  width: ${(props) => props.theme.spacing(143)};

  ${(props) =>
    props.small &&
    css`
      .MuiOutlinedInput-root {
        max-height: 35px;
        height: 35px;
      }
    `};
`;
