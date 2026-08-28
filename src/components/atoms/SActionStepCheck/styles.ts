import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

interface IProps {
  active?: 0 | 1;
  success?: 0 | 1;
  primary?: 0 | 1;
  disabled?: 0 | 1;
}

export const STBox = styled(Box)<IProps>`
  border-radius: ${(props) => props.theme.spacing(4)};
  gap: 10px;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;

  p {
    color: ${(props) => props.theme.palette.text.main};
  }

  .check-icon {
    border-color: ${(props) =>
      props.theme.palette.mode === 'light'
        ? props.theme.palette.grey[400]
        : props.theme.palette.background.border};
    background-color: ${(props) =>
      props.theme.palette.mode === 'light'
        ? props.theme.palette.grey[200]
        : props.theme.palette.background.disabled};
  }

  svg {
    color: ${(props) =>
      props.theme.palette.mode === 'light'
        ? props.theme.palette.grey[600]
        : props.theme.palette.text.light};
  }

  &:hover {
    filter: brightness(0.96);
  }

  ${(props) =>
    props.active &&
    css`
      .check-icon {
        border-color: ${props.theme.palette.mode === 'light'
          ? props.theme.palette.background.dark
          : props.theme.palette.primary.main};
        background-color: ${props.theme.palette.mode === 'light'
          ? props.theme.palette.background.dark
          : props.theme.palette.primary.main};
      }

      svg {
        color: ${props.theme.palette.mode === 'light'
          ? props.theme.palette.primary.main
          : props.theme.palette.primary.contrastText};
      }
    `};

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.55;
      cursor: default;
    `};
`;
