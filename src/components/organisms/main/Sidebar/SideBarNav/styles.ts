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
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &::-webkit-scrollbar {
    width: 6px;
    background: transparent;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 24px;
  }
  &::-webkit-scrollbar-corner {
    background: transparent;
  }

  &:hover,
  &:focus-within,
  &:active {
    scrollbar-color: ${({ theme }) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.28) transparent'
        : 'rgba(0, 0, 0, 0.28) transparent'};
  }

  &:hover::-webkit-scrollbar-thumb,
  &:focus-within::-webkit-scrollbar-thumb,
  &:active::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.28)'
        : 'rgba(0, 0, 0, 0.28)'};
  }
`;
