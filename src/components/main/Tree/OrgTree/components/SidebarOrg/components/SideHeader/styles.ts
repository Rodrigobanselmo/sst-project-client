import { Box, styled } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

export const STSInput = styled(SInput)`
  &&& .MuiInputBase-adornedEnd {
    padding-right: 2.2rem !important;
  }
  max-width: ${(props) => props.theme.spacing(143)};
`;

export const STBoxInput = styled(Box)`
  background-color: ${(props) => props.theme.palette.background.paper};
  z-index: 20;
  padding: ${(props) => props.theme.spacing(5)};
  border-radius: ${({ theme }) => theme.spacing(8)};
`;
