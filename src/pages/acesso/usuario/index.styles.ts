import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

export const STContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: auto;
  
  @media (min-height: 780px) {
    margin-top: 50px;
  
  }
  @media (min-height: 850px) {
    margin-top: 100px;
  }
  `;

export const STSectionBox = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
  padding: 0 50px;
`;
