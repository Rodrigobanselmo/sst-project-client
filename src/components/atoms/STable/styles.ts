import { Box, styled } from '@mui/material';

export const STSTable = styled(Box)<{ columns: string; rowGap: string }>`
  overflow-x: auto;

  .table_grid {
    gap: ${(props) => props.rowGap};
    grid-template-columns: ${(props) => props.columns};
  }
`;

export const STSTableBody = styled(Box)`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-width: fit-content;
`;

export const STSTableHeader = styled(Box)`
  display: grid;
  align-items: center;
  width: 100%;
`;

export const STSTableRow = styled(Box)`
  display: grid;
  flex-shrink: 0;
  -webkit-box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0.25rem;
  align-items: center;
  width: 100%;
`;

export const STSTableHRow = styled(Box)`
  color: ${({ theme }) => theme.palette.text.secondary};
  display: flex;
`;