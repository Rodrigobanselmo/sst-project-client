import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STBoxItem = styled(Box)<{ inactive: number }>`
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .item_box {
    flex: 1;
    min-height: 46px;
    padding: ${(props) => props.theme.spacing(2, 4)};
    border: 2px solid
      ${(props) =>
        props.inactive
          ? props.theme.palette.error.main
          : props.theme.palette.divider};
    background-color: ${(props) => props.theme.palette.background.box};
    border-radius: ${(props) => props.theme.shape.borderRadius}px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;
    position: relative;

    ${(props) =>
      props.inactive &&
      css`
        p {
          color: ${props.theme.palette.error.main};
        }
      `};
  }

  .item_end_date {
    flex-shrink: 0;
    padding: ${(props) => props.theme.spacing(1, 4)};
    border: 2px solid
      ${(props) =>
        props.inactive
          ? props.theme.palette.error.main
          : props.theme.palette.divider};
    background-color: ${(props) => props.theme.palette.grey[100]};
    border-radius: ${(props) => props.theme.shape.borderRadius}px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    position: relative;
    cursor: pointer;

    /* ${(props) =>
      props.inactive &&
      css`
        border: 2px solid ${props.theme.palette.error.main};
      `}; */

    &:hover {
      filter: brightness(0.9);
    }
  }
`;
