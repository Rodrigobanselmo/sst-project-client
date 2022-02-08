import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const STGridBox = styled(Box)`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: fit-content(0px) 1fr;
  height: 100vh;
  background-color: ${(props) => props.theme.palette.secondary.dark};
`;

export const STBoxSidebar = styled(Box)`
  grid-row: 1 / 3;
  grid-column: 1;
  background-color: ${(props) => props.theme.palette.secondary.dark};
`;

export const STBoxContent = styled(Box)`
  flex-flow: column;
  display: flex;
  overflow: hidden;
  box-shadow: inset 7px 0 9px -7px rgba(0, 0, 0, 0.9);
  background-color: ${(props) => props.theme.palette.background.default};
`;
