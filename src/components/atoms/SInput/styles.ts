import { css } from '@emotion/react';
import { styled } from '@mui/material';
import TextField from '@mui/material/TextField';

export const STTextField = styled(TextField)<{
  success: number;
  errors: number;
  effect: number;
  ssx: number;
  secondary: number;
  size: string;
  backgroundColor?: string;
  unstyled: number;
  sub_variant?: 'search' | 'standard' | 'search_v2';
  multiline?: boolean;
  smallPlaceholder?: number;
}>`
  ${(props) =>
    props.smallPlaceholder &&
    css`
      input::placeholder {
        opacity: 0.4;
        font-size: 0.85rem;
      }

      textarea::placeholder {
        opacity: 0.4;
        font-size: 0.9rem;
      }
    `};

  &&& .MuiOutlinedInput-root {
    -webkit-box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
    background-color: ${(props) => props.theme.palette.background.paper};
  }

  &&& .MuiInputBase-root {
    /* background-color: ${(props) => props.theme.palette.background.paper}; */
  }

  &&& .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) => props.theme.palette.background.paper};
    /* border-color: ${(props) => props.theme.palette.background.border}; */
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

  ${(props) =>
    props.ssx &&
    css`
      &&& .MuiInputBase-root {
        max-height: 32px;
        padding: 1px 4px;
      }

      &&&.MuiFormControl-root.MuiTextField-root:after {
        margin-top: -15px;
      }

      &&& .MuiInputBase-root {
        margin-bottom: -5px;
      }
    `};

  ${(props) =>
    props.success &&
    css`
      ${!props.multiline &&
      css`
        &:after {
          content: '';
          border-bottom: 2px solid ${props.theme.palette.success.main};
          top: ${props.size === 'small' ? 22 : 44}px;
          position: absolute;
          width: 100%;
          height: 10px;
          border-bottom-left-radius: ${props.theme.spacing(4)};
          border-bottom-right-radius: ${props.theme.spacing(4)};
          pointer-events: none;
        }
      `}
    `};

  ${(props) =>
    props.errors &&
    css`
      & .MuiFormHelperText-root {
        color: ${props.theme.palette.error.main};
      }

      ${props.multiline &&
      css`
        &&& .MuiOutlinedInput-notchedOutline {
          border-color: ${props.theme.palette.error.main};
          border-width: 2px;
        }

        &&&
          .MuiOutlinedInput-root.Mui-focused
          .MuiOutlinedInput-notchedOutline {
          border-color: ${props.theme.palette.error.main};
        }

        &:hover {
          &&& .MuiOutlinedInput-notchedOutline {
            border-color: ${props.theme.palette.error.main};
            border-width: 2px;
          }
          &&&
            .MuiOutlinedInput-root.Mui-focused
            .MuiOutlinedInput-notchedOutline {
            border-color: ${props.theme.palette.error.main};
            opacity: 1;
          }
        }
      `};

      ${!props.multiline &&
      css`
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
    `};

  ${(props) =>
    props.sub_variant == 'search' &&
    css`
      border-color: ${props.theme.palette.grey[200]};
      border-width: 2px;
      /* box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1); */
      border-radius: 8px;
      &&& .MuiOutlinedInput-notchedOutline {
        border-color: ${props.theme.palette.grey[200]};
        border-width: 2px;
      }

      &&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-width: 2px;
        border-color: ${props.theme.palette.grey[300]};
      }

      &:hover {
        &&& .MuiOutlinedInput-notchedOutline {
          border-color: ${props.theme.palette.grey[300]};
          border-width: 2px;
        }
        &&&
          .MuiOutlinedInput-root.Mui-focused
          .MuiOutlinedInput-notchedOutline {
          border-width: 2px;
          border-color: ${props.theme.palette.grey[300]};
          opacity: 1;
        }
      }
    `};

  ${(props) =>
    props.sub_variant == 'search_v2' &&
    css`
      padding: 10px;
    `};

  ${(props) =>
    props.unstyled &&
    css`
      border: none !important;

      * {
        &:after {
          display: none;
        }
        &:before {
          display: none;
        }
        border: none !important;
      }
    `};

  ${(props) =>
    props.effect &&
    css`
      border-color: ${props.theme.palette.grey[300]};
      border-width: 2px;
      border-radius: 8px;
      * {
        color: ${props.theme.palette.grey[600]} !important;
      }

      &&& .MuiOutlinedInput-notchedOutline {
        border-color: ${props.theme.palette.grey[300]};
        border-width: 2px;
      }

      &&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-width: 2px;
        border-color: ${props.theme.palette.grey[300]};
      }

      &:hover {
        &&& .MuiOutlinedInput-notchedOutline {
          border-color: ${props.theme.palette.grey[300]};
          border-width: 2px;
        }
        &&&
          .MuiOutlinedInput-root.Mui-focused
          .MuiOutlinedInput-notchedOutline {
          border-width: 2px;
          border-color: ${props.theme.palette.grey[300]};
          opacity: 1;
        }
      }
      * {
        cursor: default !important;
      }
    `};

  ${(props) =>
    props.errors &&
    css`
      * {
        color: ${props.theme.palette.error.main} !important;
      }

      & .MuiFormHelperText-root {
        color: ${props.theme.palette.error.main};
      }

      ${props.multiline &&
      css`
        &&& .MuiOutlinedInput-notchedOutline {
          border-color: ${props.theme.palette.error.main};
          border-width: 2px;
        }

        &&&
          .MuiOutlinedInput-root.Mui-focused
          .MuiOutlinedInput-notchedOutline {
          border-color: ${props.theme.palette.error.main};
        }

        &:hover {
          &&& .MuiOutlinedInput-notchedOutline {
            border-color: ${props.theme.palette.error.main};
            border-width: 2px;
          }
          &&&
            .MuiOutlinedInput-root.Mui-focused
            .MuiOutlinedInput-notchedOutline {
            border-color: ${props.theme.palette.error.main};
            opacity: 1;
          }
        }
      `};

      ${!props.multiline &&
      css`
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
    `};
  /* 
  & .MuiInputBase-root.Mui-disabled {
    -webkit-text-fill-color: red !important;
    color: red !important;
    background-color: red;
  } */
`;
