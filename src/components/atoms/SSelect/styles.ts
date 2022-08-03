import { css } from '@emotion/react';
import { Select } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledSelect = styled(Select)<{
  success?: number;
  errors?: number;
  secondary?: number;
}>`
  background-color: ${(props) => props.theme.palette.common.white} !important;
  .menu-item {
    background-color: #dcdcdc !important;
  }

  input[value=''] {
    border: none;
    border-radius: 8px;
    opacity: 0.7;
    height: 100%;
  }

  &&& .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) => props.theme.palette.background.border};
    border-width: 1px;
  }

  &&&.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) => props.theme.palette.primary.main};
    border-width: 2px;
  }

  &:hover {
    &&& .MuiOutlinedInput-notchedOutline {
      border-color: ${(props) => props.theme.palette.background.default};
      border-width: 2px;
    }
    &&&.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: ${(props) => props.theme.palette.primary.main};
      opacity: 1;
    }
  }

  ${(props) =>
    props.errors &&
    css`
      &&& .MuiOutlinedInput-notchedOutline {
        border-color: ${props.theme.palette.error.main};
        border-width: 2px;
      }

      &:hover {
        &&& .MuiOutlinedInput-notchedOutline {
          border-color: ${props.theme.palette.error.main};
          border-width: 2px;
        }
        &&&.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: ${props.theme.palette.error.main};
          opacity: 1;
        }
      }

      &&&.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: ${props.theme.palette.error.main};
        border-width: 2px;
      }
    `};
`;
