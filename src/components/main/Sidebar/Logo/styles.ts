import { Stack, styled, Typography } from '@mui/material';

export const StackStyled = styled(Stack)`
  width: 100%;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
`;

export const Image = styled('img')`
  width: 2rem;
  margin-top: -4px;
`;

export const SText = styled(Typography)`
  font-size: 24px;
  font-weight: bold;
  width: 100%;
  color: ${({ theme }) => theme.palette.grey[100]};
`;
