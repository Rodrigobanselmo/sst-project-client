import { css } from '@emotion/react';
import { styled, Box } from '@mui/material';

export const STSBoxButton = styled(Box)<{ large?: number }>`
  height: 24px;
  border: 1px solid ${(props) => props.theme.palette.background.divider};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px 4px 8px;
  border-radius: 5px;
  box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.05);
  background-color: ${(props) => props.theme.palette.grey[100]};
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.palette.grey[300]};
  }

  ${(props) =>
    props.large &&
    css`
      height: 30px;
    `}
`;
