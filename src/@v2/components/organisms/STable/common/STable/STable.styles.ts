import { Box, styled } from '@mui/material';

export const STSTable = styled(Box)<{ columns: string; rowGap: string }>`
  overflow-x: auto;

  /* Ensure scrollbar is always visible */
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  .table_grid {
    gap: ${(props) => props.rowGap};
    grid-template-columns: ${(props) => props.columns};
  }
`;
