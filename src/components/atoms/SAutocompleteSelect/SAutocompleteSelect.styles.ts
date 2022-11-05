import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Autocomplete, styled } from '@mui/material';

export const StyledAutocompleteSelect = styled(Autocomplete)`
   /* & .MuiAutocomplete-endAdornment {
    padding-right: ${({ theme }) => theme.spacing(10)};
  }

  & .MuiOutlinedInput-root {
    padding: ${({ theme }) => theme.spacing(4, 4, 0)};

    & .MuiInputBase-input {
      height: ${({ theme }) => theme.spacing(8)};
    }
  }

   & .MuiInputLabel-root {
    &.MuiInputLabel-outlined {
      transform: translate(14px, 10px);
    }
  }  */

`;

export const StyledAutocompleteIcon = styled(KeyboardArrowDownIcon)`
  color: ${({ theme }) => theme.palette.text.main};
  font-size: 1.5rem;
`;
