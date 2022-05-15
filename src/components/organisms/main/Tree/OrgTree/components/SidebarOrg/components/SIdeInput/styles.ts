import { styled } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

export const STSInput = styled(SInput)`
  &&& .MuiInputBase-adornedEnd {
    padding-right: 2.2rem !important;
  }
  width: ${(props) => props.theme.spacing(143)};
`;
