import { styled } from '@mui/material/styles';

import { SButton } from '../../../../components/atoms/SButton';

export const STForgotButton = styled(SButton)`
  margin-top: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.palette.text.main};
  margin-left: auto;
  font-size: 0.75rem;
  text-transform: none;
  &:hover {
    background-color: transparent;
    text-decoration: underline;
  }
`;
