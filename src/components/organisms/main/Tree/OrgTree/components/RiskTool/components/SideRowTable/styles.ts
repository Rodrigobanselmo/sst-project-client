import { css } from '@emotion/react';
import { styled, Box } from '@mui/material';

import { STGridExtend } from '../../styles';

export const STGridItem = styled(STGridExtend)<{
  selected?: number;
  inactive?: number;
  loading?: number;
}>`
  border: 1px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  padding: ${(props) => props.theme.spacing(5, 4)};

  ${(props) =>
    props.inactive &&
    css`
      border: 2px solid ${props.theme.palette.error.main};
    `};

  ${(props) =>
    props.selected &&
    css`
      border: 2px solid ${props.theme.palette.info.main};
    `};

  ${(props) =>
    props.loading &&
    css`
      background-color: ${props.theme.palette.background.divider};
    `};
`;

export const SEndDateBox = styled(Box)<{
  inactive?: number;
}>`
  padding: ${(props) => props.theme.spacing(1, 4)};
  display: flex;
  border: 1px solid
    ${(props) =>
      props.inactive
        ? props.theme.palette.error.main
        : props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.grey[100]};
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  position: relative;
  cursor: pointer;
  width: 230px;

  &:hover {
    filter: brightness(0.9);
  }
`;
