/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STSBoxButton = styled(Box)<{
  large?: number;
  error?: number;
  outline?: number;
  active?: number;
  bg?: string;
  disabled?: number;
  borderActive?: string;
}>`
  border: 1px solid ${(props) => props.theme.palette.background.divider};
  display: flex;
  align-items: start;
  justify-content: center;
  flex-direction: column;
  border-radius: 5px;
  box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.3);
  background-color: ${(props) => props.theme.palette.grey[100]};
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.palette.grey[300]};
  }

  &:active {
    background-color: ${(props) => props.theme.palette.grey[400]};
  }

  ${(props) => props.large && css``};

  ${(props) =>
    props.active &&
    css`
      background-color: ${props.theme.palette.primary.main};
      border-color: ${props.theme.palette.primary.main};

      &:hover {
        background-color: ${props.theme.palette.primary.dark};
      }

      &:active {
        background-color: ${props.theme.palette.primary.light};
      }
    `};

  ${(props) =>
    props.bg &&
    css`
      background-color: ${(props.theme.palette as any)[props.bg.split('.')[0]][
        props.bg.split('.')[1]
      ]};
      border-color: ${(props.theme.palette as any)[props.bg.split('.')[0]][
        props.bg.split('.')[1]
      ]};

      &:hover {
        opacity: 0.8;
        background-color: ${(props.theme.palette as any)[
          props.bg.split('.')[0]
        ][props.bg.split('.')[1]]};
      }

      &:active {
        background-color: ${(props.theme.palette as any)[
          props.bg.split('.')[0]
        ][props.bg.split('.')[1]]};
      }
    `};

  ${(props) =>
    props.error &&
    css`
      border: 2px solid ${props.theme.palette.error.main};
    `};

  ${(props) =>
    props.borderActive == 'primary' &&
    css`
      .text_main {
        color: ${props.theme.palette.primary.dark};
      }
      border: 1px solid ${props.theme.palette.primary.dark};
    `};

  ${(props) =>
    props.borderActive == 'info' &&
    css`
      .text_main {
        color: ${props.theme.palette.info.dark};
      }
      border: 1px solid ${props.theme.palette.info.dark};
    `};

  ${(props) =>
    props.borderActive == 'success' &&
    css`
      .text_main {
        color: ${props.theme.palette.success.dark};
      }
      border: 1px solid ${props.theme.palette.success.dark};
    `};

  ${(props) =>
    props.borderActive == 'error' &&
    css`
      .text_main {
        color: ${props.theme.palette.error.dark};
      }
      border: 1px solid ${props.theme.palette.error.dark};
    `};

  ${(props) =>
    props.borderActive == 'warning' &&
    css`
      .text_main {
        color: ${props.theme.palette.warning.dark};
      }
      border: 1px solid ${props.theme.palette.warning.dark};
    `};

  ${(props) =>
    props.outline &&
    css`
      background-color: transparent;
      box-shadow: none;
    `};

  ${(props) =>
    props.disabled &&
    css`
      background-color: ${props.theme.palette.grey[400]};
      opacity: 0.7;

      &:hover {
        background-color: ${props.theme.palette.grey[400]};
      }

      &:active {
        background-color: ${props.theme.palette.grey[400]};
      }
    `};
`;
