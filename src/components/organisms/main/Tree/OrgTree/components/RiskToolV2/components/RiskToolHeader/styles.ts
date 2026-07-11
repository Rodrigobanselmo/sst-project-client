import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

import SArrowUpFilterIcon from 'assets/icons/SArrowUpFilterIcon';

import { STGridExtend } from '../../RiskTool.styles';

export const STGridItem = styled(STGridExtend)`
  p {
    font-size: 0.8rem;
  }
`;

export const STSInput = styled(SInput)`
  &&& .MuiInputBase-adornedEnd {
    padding-right: 2.2rem !important;
  }
  width: ${(props) => props.theme.spacing(143)};
`;

export const STBoxInput = styled(Box)`
  background-color: ${(props) => props.theme.palette.background.paper};
  z-index: 20;
  padding: ${(props) => props.theme.spacing(5, 0)};
  border-radius: ${({ theme }) => theme.spacing(8)};
`;

export const STGridHeader = styled(STGridExtend)`
  margin-bottom: ${(props) => props.theme.spacing(2)};
  padding: ${(props) => props.theme.spacing(2, 0)};
  background-color: ${(props) => props.theme.palette.grey[50]};
  border: 1px solid ${(props) => props.theme.palette.grey[200]};
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  border-bottom: 2px solid ${(props) => props.theme.palette.grey[300]};

  & > * {
    border-left: 1px solid ${(props) => props.theme.palette.grey[200]};
    padding-left: ${(props) => props.theme.spacing(3)};
    padding-right: ${(props) => props.theme.spacing(3)};
    min-width: 0;
  }

  & > *:first-of-type {
    border-left: none;
  }

  p {
    font-size: 0.8rem;
    font-weight: 700;
    color: ${(props) => props.theme.palette.text.primary};
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
