import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

export const STContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
`;

export const STSectionBox = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  max-height: 570px;
`;
