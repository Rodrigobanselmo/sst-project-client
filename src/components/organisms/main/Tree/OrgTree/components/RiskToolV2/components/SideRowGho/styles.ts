import { Box, styled } from '@mui/material';

export const STBoxItemContainer = styled(Box)`
  border: 2px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  padding: ${(props) => props.theme.spacing(2, 4)};
  width: 100%;
  align-items: center;
  display: flex;
  justify-content: space-between;
`;
