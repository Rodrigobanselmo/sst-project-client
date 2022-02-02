import { Stack, styled, Typography } from '@mui/material';

import LogoSimpleIcon from '../../../../assets/logo/logo-simple/logo-simple';

export const STStack = styled(Stack)`
  width: 100%;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
`;

export const STLogoSimple = styled(LogoSimpleIcon)`
  min-width: 2rem;
  min-height: 2rem;
  margin-top: -4px;
`;

export const STTypography = styled(Typography)`
  font-size: 24px;
  font-weight: 500;
  width: 100%;
  color: ${({ theme }) => theme.palette.grey[100]};
`;
