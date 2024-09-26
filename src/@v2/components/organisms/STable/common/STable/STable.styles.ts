import { Box, styled } from '@mui/material';

export const STSTable = styled(Box)<{ columns: string; rowGap: string }>`
  overflow-x: auto;

  .table_grid {
    gap: ${(props) => props.rowGap};
    grid-template-columns: ${(props) => props.columns};
  }
`;
