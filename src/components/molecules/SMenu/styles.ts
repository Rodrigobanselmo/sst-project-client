/* eslint-disable indent */
// import { css } from '@emotion/react';
import { styled, Menu, MenuItem } from '@mui/material';

interface ISTMenuProps {}

export const STMenu = styled(Menu)<ISTMenuProps>`
  margin-top: 2px;
  & .MuiPaper-root {
    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.palette.background.divider};
    box-shadow: rgb(0 0 0 / 9%) 0px 3px 12px;
  }
  & .MuiMenu-list {
    padding: 0px;
    gap: 3px;
  }
`;

export const STMenuItem = styled(MenuItem)<ISTMenuProps>`
  &.MuiMenuItem-root {
    padding: 8px 10px;
    font-size: 13px;
    line-height: 16px;
    font-weight: 300;
    & .MuiSvgIcon-root {
      font-size: 18px;
      margin-right: 8px;
      color: ${(props) => props.theme.palette.text.light};
    }
  }
`;
