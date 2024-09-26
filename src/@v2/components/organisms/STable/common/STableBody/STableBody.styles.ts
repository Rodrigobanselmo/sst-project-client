import { Box, styled } from '@mui/material';

export const STSTableBody = styled(Box)`
  display: flex;
  flex-direction: column;
  min-width: fit-content;
  padding: 2px;

  &::-webkit-scrollbar {
    border-radius: 24px;
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
    border-radius: 24px;
  }
`;
