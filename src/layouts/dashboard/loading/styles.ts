import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const STBoxChildren = styled(Box)`
  flex: 1;
  position: relative;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
    border-radius: 24px;
  }
`;
