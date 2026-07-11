import { css } from '@emotion/react';
import { Box, styled } from '@mui/material';

export const STBoxItem = styled(Box)<{
  inactive: number;
  collapsed?: number;
  framed?: number;
}>`
  width: 100%;
  display: flex;
  flex-direction: column;

  .item_box {
    min-height: 44px;
    padding: ${(props) => props.theme.spacing(2, 4)};
    background-color: ${(props) => props.theme.palette.background.paper};
    position: relative;

    ${(props) =>
      props.framed
        ? css`
            border: none;
            border-radius: 0;
            ${!props.collapsed &&
            css`
              border-bottom: 1px solid ${props.theme.palette.grey[200]};
            `}
          `
        : css`
            border: 2px solid
              ${props.inactive
                ? props.theme.palette.error.main
                : props.theme.palette.divider};
            border-radius: ${props.theme.shape.borderRadius}px;
            ${!props.collapsed &&
            css`
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
              border-bottom: none;
            `}
          `};

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
    padding: ${(props) => props.theme.spacing(0.5, 4)};
    background-color: ${(props) => props.theme.palette.background.paper};
    position: relative;
    cursor: pointer;

    ${(props) =>
      props.framed
        ? css`
            border: none;
            border-radius: 0;
            border-bottom: 1px solid ${props.theme.palette.grey[200]};
          `
        : css`
            border: 2px solid
              ${props.inactive
                ? props.theme.palette.error.main
                : props.theme.palette.divider};
            border-radius: ${props.theme.shape.borderRadius}px;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            background-color: ${props.theme.palette.grey[50]};
          `};

    &:hover {
      filter: brightness(0.98);
    }
  }
`;
