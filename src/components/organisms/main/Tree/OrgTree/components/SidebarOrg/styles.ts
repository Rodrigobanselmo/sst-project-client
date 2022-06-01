import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

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
  transition: all 3s ease-in-out;

  ${(props) =>
    props.risk_init &&
    css`
      max-height: 500px;
      border-radius: ${props.theme.spacing(3, 3, 3, 3)};
      width: ${props.open
        ? `calc(100vw - ${props.theme.mixins.openSideBarWidth} - 55px)`
        : `calc(100vw - ${props.theme.mixins.closedSideBarWidth} - 55px)`};
    `}

  ${(props) =>
    props.expanded &&
    css`
      min-height: calc(100vh - 130px);
    `}

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
}>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(4)};
  padding-bottom: ${(props) => props.theme.spacing(10)};
  max-height: calc(100vh - 300px);
  min-height: ${(props) => props.theme.spacing(100)};
  overflow: auto;

  ${(props) =>
    props.risk_init &&
    css`
      max-height: 400px;
    `}

  ${(props) =>
    props.expanded &&
    css`
      min-height: calc(100vh - 220px);
    `}
`;

export const STGridExtend = styled(Box)`
  display: grid;
  grid-template-columns:
    minmax(100px, 1fr) minmax(100px, 1fr)
    minmax(100px, 1fr) minmax(100px, 1fr) 120px 120px
    minmax(100px, 1fr) 120px 120px;
  padding: ${(props) => props.theme.spacing(2, 4)};
  gap: ${(props) => props.theme.spacing(5)};
  width: 100%;
`;
