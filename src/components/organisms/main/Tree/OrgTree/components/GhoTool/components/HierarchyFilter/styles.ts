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
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
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
