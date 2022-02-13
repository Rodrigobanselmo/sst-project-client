import { Box, styled } from '@mui/material';

export const STFlexContainer = styled(Box)`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100% - 3rem);
  width: 100%;
  position: relative;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    height: calc(100% - 4rem);
    
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    height: calc(100% - 5rem);
  }
`;
