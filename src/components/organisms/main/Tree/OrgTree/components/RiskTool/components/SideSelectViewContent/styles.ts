import { css } from '@emotion/react';
import { styled } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

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
