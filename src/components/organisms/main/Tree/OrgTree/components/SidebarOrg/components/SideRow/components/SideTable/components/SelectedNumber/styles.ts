import { css } from '@emotion/react';
import { styled } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

export const STSFlex = styled(SFlex)<{ selected?: number; disabled?: number }>`
  background-color: ${(props) => props.theme.palette.background.darkPaper};
  width: ${(props) => props.theme.spacing(8)};
  height: ${(props) => props.theme.spacing(12)};
  border-radius: ${(props) => props.theme.spacing(3)};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    filter: brightness(0.8);
  }

  ${(props) =>
    props.selected &&
    css`
      background-color: ${props.theme.palette.success.main};
    `}

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;
      background-color: ${props.theme.palette.background.disabled};
      opacity: 0.8;
    `}
`;

export const STText = styled(SText)<{ selected?: number }>`
  font-size: 0.8rem;
  line-height: 0px;
  color: ${(props) => props.theme.palette.text.secondary};
  padding-top: 1px;

  ${(props) =>
    props.selected &&
    css`
      color: ${props.theme.palette.success.contrastText};
    `};
`;
