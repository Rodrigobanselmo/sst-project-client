/* eslint-disable indent */
// import { css } from '@emotion/react';
import { styled, Menu, MenuItem } from '@mui/material';

import { SInput } from '../../atoms/SInput';

interface ISTMenuProps {}

export const STMenu = styled(Menu)<ISTMenuProps>`
  margin-top: 3px;
  max-width: 600px;

  & .MuiPaper-root {
    border-radius: 4px;
    padding: 0;
    margin: 0;
    border: 1px solid ${(props) => props.theme.palette.background.divider};
    box-shadow: rgb(0 0 0 / 9%) 0px 3px 12px;
    transition: height 0.2s ease-in-out;
  }
  & .MuiMenu-list {
    padding: 0px;
    gap: 3px;
  }
`;

export const STSInput = styled(SInput)`
  * {
    padding: 3px;
    padding-left: 7px;
    padding-top: 0px;
    margin-top: -2px;
    font-size: 14px;
  }

  border-bottom: 1px solid ${(props) => props.theme.palette.background.divider};

  & ::placeholder {
    opacity: 0.6;
    font-weight: 300;
  }
`;

export const STMenuItem = styled(MenuItem)<ISTMenuProps>`
  &.MuiMenuItem-root {
    padding: 8px 10px;
    font-size: 13px;
    line-height: 16px;
    font-weight: 400;
    color: ${(props) => props.theme.palette.text.main};
    opacity: 0.9;
    & .MuiSvgIcon-root {
      font-size: 18px;
      margin-right: 8px;
      color: ${(props) => props.theme.palette.text.light};
      color: ${(props) => props.theme.palette.text.main};
    }
  }
`;