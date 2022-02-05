import { Box, styled } from '@mui/material';

export const STModalPaper = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  position: relative;
  margin: auto;
  border-radius: ${({ theme }) => theme.spacing(6)};
  overflow: auto;
  max-height: 80vh;
`;
