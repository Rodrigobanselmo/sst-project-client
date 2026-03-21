import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface STGridBoxProps {
  ai_chat_width?: number;
}

export const STGridBox = styled(Box)<STGridBoxProps>`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: fit-content(0px) 1fr ${(props) =>
      props.ai_chat_width ? `${props.ai_chat_width}px` : '0px'};
  height: 100vh;
  background-color: ${(props) => props.theme.palette.sidebar.background};
  transition: grid-template-columns 0.3s ease;
`;

export const STBoxSidebar = styled(Box)`
  grid-row: 1 / 3;
  grid-column: 1;
  background-color: ${(props) => props.theme.palette.sidebar.background};
`;

export const STBoxContent = styled(Box)`
  flex-flow: column;
  display: flex;
  overflow: hidden;
  box-shadow: inset 7px 0 9px -7px rgba(0, 0, 0, 0.9);
  background-color: ${(props) => props.theme.palette.background.default};
`;

export const STBoxAIChat = styled(Box)`
  grid-row: 1 / 3;
  grid-column: 3;
  background-color: ${(props) => props.theme.palette.sidebar.background};
  overflow: hidden;
  padding-left: 5px;
`;
