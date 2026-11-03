import { SIMPLESST_PRODUCT_YELLOW } from 'configs/theme/simplesst-product-identity';
import { darken, type Theme } from '@mui/material/styles';
import { css } from '@emotion/react';
import { styled } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

import defaultTheme from 'configs/theme';

export const SFlexButton = styled(SFlex)<{ active?: number }>`
  background-color: ${({ theme }) => theme.palette.background.default};
  border-radius: ${defaultTheme.shape.borderRadius}px;
  cursor: pointer;
  z-index: ${defaultTheme.mixins.saveFeedback};
  transition: background-color 0.2s ease-in-out;

  svg {
    color: ${({ theme }) => theme.palette.gray[500]};
  }

  p {
    color: ${({ theme }) => theme.palette.text.main};
  }

  &:hover {
    background-color: ${({ theme }) => theme.palette.background.box};
  }
  &:active {
    background-color: ${({ theme }) => theme.palette.background.lightGray};
  }

  ${(props) =>
    props.active &&
    css`
      background-color: ${props.theme.palette.info.main};

      &:hover {
        background-color: ${props.theme.palette.info.dark};
      }
      &:active {
        background-color: ${props.theme.palette.info.light};
      }

      svg {
        color: ${props.theme.palette.common.white};
      }

      p {
        color: ${props.theme.palette.common.white};
      }
    `}
`;

export const gseActiveButtonSx = (theme: Theme) => ({
  '&&': {
    backgroundColor: SIMPLESST_PRODUCT_YELLOW,
    '& p, & svg': { color: theme.palette.getContrastText(SIMPLESST_PRODUCT_YELLOW) },
    '&:hover': { backgroundColor: darken(SIMPLESST_PRODUCT_YELLOW, 0.06) },
    '&:active': { backgroundColor: darken(SIMPLESST_PRODUCT_YELLOW, 0.1) },
    '&:focus-visible': { outline: `2px solid ${theme.palette.text.primary}`, outlineOffset: 2 },
  },
});
