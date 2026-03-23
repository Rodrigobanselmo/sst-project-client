import { Box, styled } from '@mui/material';

export const StyledFlexMultiGho = styled(Box)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: ${(props) => props.theme.spacing(5)};
  border-radius: ${(props) => props.theme.spacing(5)};
  padding: ${(props) => props.theme.spacing(2)};
  gap: ${(props) => props.theme.spacing(3, 5)};
  overflow-x: scroll;
  border: 1px solid ${(props) => props.theme.palette.divider};
  width: 100%;
`;
