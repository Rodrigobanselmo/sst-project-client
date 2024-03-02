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

  &:hover {
    // border: 1px solid ${(props) => props.theme.palette.info.main};
    filter: brightness(0.9);

    .check-icon {
      border-color: ${(props) => props.theme.palette.info.main};
    }
    svg {
      color: ${(props) => props.theme.palette.info.main};
    }
    p {
      color: ${(props) => props.theme.palette.info.main};
    }
  }

  &:active {
    filter: brightness(0.8);

    svg {
      color: ${(props) => props.theme.palette.common.white};
    }
    p {
      color: ${(props) => props.theme.palette.info.light};
    }
  }

  svg {
    color: ${(props) => props.theme.palette.common.white};
  }
  p {
    color: ${(props) => props.theme.palette.text.primary};
  }

  ${(props) =>
    props.active &&
    css`
      border-color: ${props.theme.palette.info.main};

      .check-icon {
        background-color: ${props.theme.palette.info.main};
      }

      svg {
        color: ${props.theme.palette.common.white};
      }
      p {
        color: ${props.theme.palette.info.dark};
      }
    `};

  ${(props) =>
    props.disabled &&
    css`
      background-color: ${props.theme.palette.grey[500]} !important;
      svg {
        color: ${props.theme.palette.common.white};
      }
      p {
        color: ${props.theme.palette.common.white};
      }

      &:hover {
        filter: brightness(0.9);

        svg {
          color: ${props.theme.palette.common.white};
        }
        p {
          color: ${props.theme.palette.common.white};
        }
      }

      &:active {
        filter: brightness(0.8);

        svg {
          color: ${props.theme.palette.common.white};
        }
        p {
          color: ${props.theme.palette.common.white};
        }
      }
    `};
`;
