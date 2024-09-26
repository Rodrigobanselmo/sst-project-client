import { Box } from '@mui/material';
import styled from '@mui/system/styled';

export const StyledPaginationWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
    flex-direction: column;
  }
`;
