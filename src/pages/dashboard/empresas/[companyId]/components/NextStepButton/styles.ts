import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

interface IProps {
  active?: 0 | 1;
}

export const STBox = styled(Box)<IProps>`
  padding: ${(props) => props.theme.spacing(5)};
  background-color: ${(props) => props.theme.palette.background.darkPaper};
  border-radius: ${(props) => props.theme.spacing(4)};
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.8);
  }

  svg {
    color: ${(props) => props.theme.palette.text.secondary};
  }
  p {
    color: ${(props) => props.theme.palette.text.primary};
  }

  ${(props) =>
    props.active &&
    css`
      background-color: ${props.theme.palette.info.main};
      svg {
        color: ${props.theme.palette.common.white};
      }
      p {
        color: ${props.theme.palette.common.white};
      }
    `}
`;
