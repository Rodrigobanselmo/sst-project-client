/* eslint-disable @typescript-eslint/no-empty-function */
import { Box, styled } from '@mui/material';

export const BoxContainerStyled = styled(Box)`
  width: 100%;
  align-items: flex-start;
`;

export const BoxSectionStyled = styled(Box)`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100% - 80px);
  display: flex;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-track {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
    border-radius: 24px;
  }
`;
