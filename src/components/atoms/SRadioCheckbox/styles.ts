import { css } from '@emotion/react';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

import { IStyledGrid } from './types';

export const StyledGrid = styled(Grid)<IStyledGrid>`
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  width: 100%;

  &:focus {
    outline: 10px solid #000;
    background-color: #000;
  }

  input {
    position: absolute;
    opacity: 0;
    display: none;
  }

  input + span {
    border: 2px solid;
    border-color: ${(props) => props.theme.palette.background.divider};
    box-sizing: border-box;
    cursor: pointer;
    display: inline-block;
    width: 100%;
    color: ${(props) => props.theme.palette.text.primary};
    ${(props) =>
      props.backgroundColorItem &&
      css`
        background-color: ${props.backgroundColorItem};
      `};

    ${(props) =>
      props.colorItem &&
      css`
        color: ${props.colorItem};
      `};

    ${(props) =>
      props.error &&
      css`
        border: 2px solid ${props.theme.palette.error.main};
      `};
  }

  input:disabled + span {
    cursor: not-allowed;
    border: none;
    background-color: ${(props) => props.theme.palette.grey[300]};
    color: ${(props) => props.theme.palette.text.disabled};
  }
  input:checked + span {
    background-color: ${(props) => props.theme.palette.primary.main};
    color: ${(props) => props.theme.palette.common.white};

    ${(props) =>
      props.backgroundColorChecked &&
      css`
        background-color: ${props.backgroundColorChecked};
      `};

    ${(props) =>
      props.colorChecked &&
      css`
        color: ${props.colorChecked};
      `};

    .isChecked {
      color: ${(props) => props.colorChecked};
    }
  }
`;
