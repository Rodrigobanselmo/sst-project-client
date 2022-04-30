import { css } from '@emotion/react';
import { styled } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

export const STSFlex = styled(SFlex)<{ selected: number }>`
  background-color: ${(props) => props.theme.palette.background.paper};
  width: ${(props) => props.theme.spacing(7)};
  height: ${(props) => props.theme.spacing(7)};
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    filter: brightness(0.8);
  }

  ${(props) =>
    props.selected &&
    css`
      background-color: ${props.theme.palette.success.main};
      width: ${props.theme.spacing(10)};
      height: ${props.theme.spacing(10)};
      border-radius: 50%;
    `}
`;

export const STText = styled(SText)<{ selected: number }>`
  font-size: 0.8rem;
  line-height: 0px;
  color: ${(props) => props.theme.palette.text.light};
  ${(props) =>
    props.selected &&
    css`
      color: ${props.theme.palette.success.contrastText};
      font-size: 1em;
    `}
`;
