import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

export const STContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(100% - 120px);
  `;

export const STSectionBox = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  max-height: 570px;
`;
