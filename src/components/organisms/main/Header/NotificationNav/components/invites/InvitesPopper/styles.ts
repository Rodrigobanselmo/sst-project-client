import { Stack, styled } from '@mui/material';

export const StackStyled = styled(Stack)`
  cursor: pointer;

  border-bottom: solid 1px ${({ theme }) => theme.palette.background.divider};

  &:hover {
    background-color: #00000004;
  }
`;
