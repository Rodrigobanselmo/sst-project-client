import { Select } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledSelect = styled(Select)`
  .menu-item {
    background-color: #dcdcdc !important;
  }

  &&& .MuiOutlinedInput-root {
    background-color: ${(props) => props.theme.palette.background.paper};
  }

  &&& .MuiInputBase-root {
    background-color: ${(props) => props.theme.palette.background.paper};
  }

  &&& .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) => props.theme.palette.background.border};
    border-width: 1px;
  }

  &&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) => props.theme.palette.primary.main};
  }
  &:hover {
    &&& .MuiOutlinedInput-notchedOutline {
      border-color: ${(props) => props.theme.palette.background.default};
      border-width: 2px;
    }
    &&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: ${(props) => props.theme.palette.primary.main};
      opacity: 1;
    }
  }
`;
