/* eslint-disable indent */
import { css } from '@emotion/react';
import { styled } from '@mui/material';

interface IArrowProps {
  placement: string;
  color: 'dark' | 'paper' | 'darkPaper' | 'default';
}

export const STArrowStyled = styled('span')<IArrowProps>`
  position: absolute;
  font-size: 7;
  top: 0;
  left: 0;
  margin-top: -6px;
  width: 3em;
  height: 1em;
  ${(props) =>
    props.placement.includes('bottom') &&
    css`
      top: 0;
      left: 0;

      &:before {
        content: '';
        margin: auto;
        display: block;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 7px 7px 7px;
        border-color: transparent transparent
          ${props.theme.palette.background[props.color]} transparent;
      }
    `}

  ${(props) =>
    props.placement.includes('top') &&
    css`
      bottom: 0;
      left: 0;

      &:before {
        content: '';
        margin: auto;
        display: block;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 7px 7px 0 7px;
        border-color: ${props.theme.palette.background[props.color]} transparent
          transparent transparent;
      }
    `}

    ${(props) =>
    props.placement.includes('right') &&
    css`
      left: 0;

      &:before {
        content: '';
        margin: auto;
        display: block;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 7px 7px 7px 0;
        border-color: transparent ${props.theme.palette.background[props.color]}
          transparent transparent;
      }
    `}
    
    ${(props) =>
    props.placement.includes('left') &&
    css`
      right: 0;

      &:before {
        content: '';
        margin: auto;
        display: block;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 7px 0 7px 7px;
        border-color: transparent transparent transparent
          ${props.theme.palette.background[props.color]};
      }
    `}
`;
