import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';
import SText from 'components/atoms/SText';

import { getSpacing } from '../utils/getFontSize';

export const STContainerItem = styled(Box)`
  padding: 0px 40px;
  cursor: pointer;
  :hover {
    background-color: ${(p) => p.theme.palette.grey[200]};
  }

  &:first-child > div:first-child {
    margin-top: 0px;
  }
`;

export const STSection = styled(Box)`
  display: flex;
  font-weight: bold;
  align-items: center;
  border: 1px solid;
  border-color: ${(props) => props.theme.palette.gray[300]};
  background-color: ${(props) => props.theme.palette.gray[50]};
  padding: 5px 20px;
  border-radius: 4px;
  margin-top: 100px;
  margin-bottom: 10px;
`;

export const STHeaderText = styled(SText)<{ title?: number }>`
  display: flex;
  font-weight: bold;
  align-items: start;
  gap: 8px;

  padding-bottom: ${() => getSpacing(160, { px: true })}px;
  padding-top: ${() => getSpacing(320, { px: true })}px;

  span {
    display: inline-flex;
    font-size: 70%;
    background-color: ${(props) => props.theme.palette.gray[50]};
    border: 1px solid;
    border-color: ${(props) => props.theme.palette.gray[300]};
    color: ${(props) => props.theme.palette.gray[600]};
    border-radius: 4px;
    padding: 0px 10px;
    margin-top: 3px;
  }
`;

export const STParagraph = styled(SText)`
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    display: inline-flex;
    font-size: 90%;
    background-color: ${(props) => props.theme.palette.grey[50]};
    border: 1px solid;
    border-color: ${(props) => props.theme.palette.gray[300]};
    color: ${(props) => props.theme.palette.gray[600]};
    border-radius: 4px;
    padding: 0px 5px;
  }
`;

export const STBullet = styled(SText)<{ level: number }>`
  padding-inline-start: ${(props) => 40 * (1 + props.level)}px;
  display: flex;
  align-items: top;

  &:before {
    display: inline-block;
    transform: translateY(8px);
    content: '';
    min-width: 6px;
    min-height: 6px;
    max-width: 6px;
    max-height: 6px;
    background-color: #000;
    border-radius: ${(props) => props.theme.spacing(10)};
    margin-right: 16px;
  }

  ${(props) =>
    (props.level == 1 || props.level == 4) &&
    css`
      &:before {
        background-color: transparent;
        border: 1px solid #000;
      }
    `};

  ${(props) =>
    (props.level == 2 || props.level == 5) &&
    css`
      &:before {
        border-radius: 0;
      }
    `};
`;

export const STBulletSpace = styled(SText)<{ level: number }>`
  padding-inline-start: ${(props) => 40 * (1 + props.level)}px;
  display: flex;
  align-items: top;
`;

export const STBreakPage = styled(Box)`
  display: flex;
  font-weight: bold;
  align-items: center;
  border: 1px solid;
  border-color: ${(props) => props.theme.palette.grey[600]};
  background-color: ${(props) => props.theme.palette.grey[400]};
  padding: 3px 20px;
  border-radius: 4px;
  margin-top: 20px;
  margin-bottom: 80px;
  font-size: 14px;
  width: 100%;
`;

export const STOther = styled(Box)`
  display: flex;
  font-weight: bold;
  align-items: center;
  border: 1px solid;
  border-color: ${(props) => props.theme.palette.grey[400]};
  background-color: ${(props) => props.theme.palette.grey[200]};
  padding: 10px 20px 60px;
  border-radius: 4px;
  flex: 1;
  width: 100%;
  margin-bottom: 20px;
`;
