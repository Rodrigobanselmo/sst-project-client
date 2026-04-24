import { styled } from '@mui/material';
import Box from '@mui/material/Box';

/** Chip shell compartilhado (empresa / estabelecimento no header). */
export const STBox = styled(Box)`
  align-items: center;
  padding: 3px 7px;
  padding-right: 10px;
  -webkit-box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.05);
  background-color: ${(props) => props.theme.palette.background.paper};
  cursor: pointer;

  border-radius: 8px;
  border: 1px solid;
  border-color: ${(props) => props.theme.palette.grey[300]};

  &:hover {
    border-color: ${(props) => props.theme.palette.primary.main};
  }
`;
