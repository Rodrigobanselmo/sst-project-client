import { css } from '@emotion/react';
import { styled } from '@mui/material';
import TextField from '@mui/material/TextField';

export const STTextField = styled(TextField)<{
  success: number;
  errors: number;
  secondary: number;
  size: string;
}>`
  &:hover {
    &&& .MuiOutlinedInput-notchedOutline {
      opacity: 0.3;
    }
    &&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
      opacity: 1;
    }
  }

  ${(props) =>
    props.success &&
    css`
      &:after {
        content: '';
        border-bottom: 2px solid ${props.theme.palette.success.main};
        top: ${props.size === 'small' ? 28 : 44}px;
        position: absolute;
        width: 100%;
        height: 10px;
        border-bottom-left-radius: ${props.theme.spacing(4)};
        border-bottom-right-radius: ${props.theme.spacing(4)};
        pointer-events: none;
      }
    `};

  ${(props) =>
    props.errors &&
    css`
      & .MuiFormHelperText-root {
        color: ${props.theme.palette.error.main};
      }
      &:after {
        content: '';
        border-bottom: 2px solid ${props.theme.palette.error.main};
        top: ${props.size === 'small' ? 28 : 44}px;
        position: absolute;
        width: 100%;
        height: 10px;
        border-bottom-left-radius: ${props.theme.spacing(4)};
        border-bottom-right-radius: ${props.theme.spacing(4)};
        pointer-events: none;
      }
    `};

  ${(props) =>
    props.secondary &&
    css`
      &:hover {
        &&& .MuiOutlinedInput-notchedOutline {
          border: 1px solid ${props.theme.palette.gray[600]};
          opacity: 1;
        }
        &&&
          .MuiOutlinedInput-root.Mui-focused
          .MuiOutlinedInput-notchedOutline {
          border: 1px solid ${props.theme.palette.primary.main};
          opacity: 1;
        }
      }
      &&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
        border: 1px solid ${props.theme.palette.primary.main};
        opacity: 1;
      }
      &&& .MuiOutlinedInput-notchedOutline {
        border: 1px solid ${props.theme.palette.gray[700]};
      }

      &&& .MuiOutlinedInput-root {
        color: ${props.theme.palette.gray[50]};
        background-color: ${props.theme.palette.db[900]};
        max-height: 2.2rem;
      }
    `}
`;
