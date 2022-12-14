import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

import { ViewTypeEnum } from './utils/view-risk-type.constant';

export const STBoxContainer = styled(Box)<{
  risk_init?: number;
  expanded?: number;
  open?: number;
}>`
  background-color: ${(props) => props.theme.palette.background.paper};
  width: 100%;
  max-height: 100%;
  z-index: ${({ theme }) => theme.mixins.sidebarTree};
  margin: ${(props) => props.theme.spacing(4, 8, 12, 1)};
  box-shadow: 1px 1px 3px 3px rgba(0, 0, 0, 0.1);
  border-radius: ${({ theme }) => theme.spacing(3, 3, 12, 3)};
  position: relative;
  overflow: hidden;
  padding: ${(props) => props.theme.spacing(5, 5)};
  /* transition: all 3s ease-in-out; */

  ${(props) =>
    props.risk_init &&
    css`
      max-height: 500px;
      border-radius: ${props.theme.spacing(3, 3, 3, 3)};
      width: ${props.open
        ? `calc(100vw - ${props.theme.mixins.openSideBarWidth} - 55px)`
        : `calc(100vw - ${props.theme.mixins.closedSideBarWidth} - 55px)`};
    `};

  ${(props) =>
    props.expanded &&
    css`
      min-height: calc(100vh - 130px);
    `};

  &::-webkit-scrollbar {
    border-radius: 24px;
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
  }
`;

export const STBoxStack = styled(Box)<{
  risk_init?: number;
  expanded?: number;
  viewType?: ViewTypeEnum;
}>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(4)};
  padding-bottom: ${(props) => props.theme.spacing(10)};
  max-height: calc(100vh - 350px);
  min-height: ${(props) => props.theme.spacing(100)};
  overflow: auto;
  min-width: fit-content;

  ${(props) =>
    props.risk_init &&
    css`
      max-height: 335px;
    `};

  ${(props) =>
    props.expanded &&
    css`
      max-height: calc(100vh - 385px);
      min-height: calc(100vh - 385px);
      ${props.viewType === ViewTypeEnum.SIMPLE_BY_RISK &&
      css`
        max-height: calc(100vh - 265px);
        min-height: calc(100vh - 265px);
      `};

      ${props.viewType === ViewTypeEnum.MULTIPLE &&
      css`
        max-height: calc(100vh - 305px);
        min-height: calc(100vh - 305px);
      `};
    `};

  &::-webkit-scrollbar {
    border-radius: 24px;
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 24px;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 24px;
    background: ${({ theme }) => theme.palette.grey[300]};

    &:hover {
      background: ${({ theme }) => theme.palette.grey[500]};
    }
  }
`;

export const STGridExtend = styled(Box)`
  display: grid;
  /* grid-template-columns:
    minmax(100px, 1fr) minmax(100px, 1fr)
    minmax(100px, 1fr) minmax(100px, 1fr) 120px 120px
    minmax(100px, 1fr) 120px 120px; */
  padding: ${(props) => props.theme.spacing(2, 4)};
  gap: ${(props) => props.theme.spacing(5)};
  width: 100%;
`;

export const StyledGridMultiGho = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  padding-bottom: ${(props) => props.theme.spacing(25)};
  gap: ${(props) => props.theme.spacing(3, 5)};
`;

export const STTableContainer = styled('div')`
  overflow-x: auto;
  width: 100%;
  min-width: 320px;
  margin-top: 12px;

  &::-webkit-scrollbar {
    border-radius: 24px;
    width: 5px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 24px;
    width: 5px;
    height: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 24px;
    background: ${({ theme }) => theme.palette.grey[300]};

    &:hover {
      background: ${({ theme }) => theme.palette.grey[500]};
    }
  }
`;
