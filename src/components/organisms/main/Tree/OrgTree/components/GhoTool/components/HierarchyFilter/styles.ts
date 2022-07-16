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
  box-shadow: 0 1px 5px rgb(0 0 0 / 15%);

  &&& .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) => props.theme.palette.background.border};
    border-width: 1px;
  }

  &&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) => props.theme.palette.gray[500]};
  }
  &:hover {
    &&& .MuiOutlinedInput-notchedOutline {
      border-color: ${(props) => props.theme.palette.background.default};
      border-width: 2px;
    }
    &&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: ${(props) => props.theme.palette.gray[500]};
      opacity: 1;
    }
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
