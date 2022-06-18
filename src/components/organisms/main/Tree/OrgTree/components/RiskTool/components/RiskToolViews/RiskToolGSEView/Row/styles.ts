import { Box, styled } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

import { STGridExtend } from '../../../../styles';

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
  p {
    font-size: 0.8rem;
  }
`;

export const STBoxItem = styled(Box)`
  border: 2px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  padding: ${(props) => props.theme.spacing(2, 4)};
  width: 100%;
`;
