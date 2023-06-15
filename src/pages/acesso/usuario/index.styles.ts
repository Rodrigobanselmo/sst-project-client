import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

export const STContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: auto;
  margin-top: 30px;
  
  @media (max-height: 780px) {
    margin-top: 20px;
  }
  `;

export const STSectionBox = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
  padding: 0 50px;

  @media (max-width: 1024px) {
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;
