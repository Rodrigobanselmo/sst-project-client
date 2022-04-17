import { Box, styled } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

export const STBoxContainer = styled(Box)`
  background-color: ${(props) => props.theme.palette.background.divider};
  padding: ${(props) => props.theme.spacing(6, 10)};
  width: ${(props) => props.theme.spacing(150)};
  box-shadow: 1px 8px 3px 3px rgba(0, 0, 0, 0.1);
  z-index: ${({ theme }) => theme.mixins.sidebarTree};
`;

export const STSInput = styled(SInput)`
  &&& .MuiInputBase-adornedEnd {
    padding-right: 2.2rem !important;
  }
`;
