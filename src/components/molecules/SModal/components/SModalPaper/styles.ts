import { Box, styled } from '@mui/material';

export const STModalPaper = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  position: relative;
  margin: auto;
  border-radius: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  overflow: auto;
  max-height: 80vh;

  @media (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    padding: ${({ theme }) => theme.spacing(12)};
  }
`;
