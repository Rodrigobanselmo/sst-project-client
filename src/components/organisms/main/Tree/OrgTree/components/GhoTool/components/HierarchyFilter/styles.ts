import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

import SArrowUpFilterIcon from 'assets/icons/SArrowUpFilterIcon';

import { STGridExtend } from '../../styles';

export const STGridItem = styled(STGridExtend)`
  p {
    font-size: 0.8rem;
  }
`;

export const STSInput = styled(SInput)`
  width: ${(props) => props.theme.spacing(143)};
  max-width: 100%;
  border-radius: 999px;
  box-shadow: none;

  &&&& .MuiOutlinedInput-root {
    border-radius: 999px;
    box-shadow: none;
    min-height: 32px;
  }

  &&&& .MuiOutlinedInput-notchedOutline {
    border-radius: 999px;
    border-color: ${(props) => props.theme.palette.divider};
    border-width: 1px;
  }

  &&&& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline,
  &&&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) => props.theme.palette.primary.main};
    border-width: 1px;
  }
`;

export const STBoxInput = styled(Box)`
  background-color: ${(props) => props.theme.palette.background.paper};
  z-index: 20;
  padding: ${(props) => props.theme.spacing(5, 0)};
  border-radius: ${({ theme }) => theme.spacing(8)};
`;

export const STGridHeader = styled(STGridExtend)`
  margin-bottom: ${(props) => props.theme.spacing(-8)};

  p {
    font-size: 0.8rem;
  }
`;

export const StyledSArrowUpFilterIcon = styled(SArrowUpFilterIcon)<{
  filter?: string;
}>`
  color: ${(props) => props.theme.palette.text.light};
  margin-left: ${(props) => props.theme.spacing(-2)};

  ${(props) =>
    props.filter == 'desc' &&
    css`
      transform: rotate(180deg);
    `}

  ${(props) =>
    props.filter == 'none' &&
    css`
      transform: rotate(90deg);
    `}
`;
