import { Box, styled } from '@mui/material';

export const STBoxItem = styled(Box)`
  border: 2px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  display: flex;
  align-items: center;
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  padding: ${(props) => props.theme.spacing(2, 4)};
  width: 100%;
`;
