import { css } from '@emotion/react';
import { styled } from '@mui/material';

import { STGridExtend } from '../../styles';

export const STGridItem = styled(STGridExtend)<{ selected: number }>`
  border: 1px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  border-radius: ${(props) => props.theme.shape.borderRadius}px;

  ${(props) =>
    props.selected &&
    css`
      border: 2px solid ${props.theme.palette.info.main};
    `}
`;
