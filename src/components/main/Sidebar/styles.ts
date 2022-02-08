import { css } from '@emotion/react';
import { styled, Stack, StackProps } from '@mui/material';

interface StyledStackPros extends StackProps {
  is_close: number;
}
export const FlexStyle = styled(Stack)<StyledStackPros>`
  height: 100%;
  background-color: ${({ theme }) => theme.palette.secondary.dark};
  width: 16rem;
  transition: all 0.5s ease-in-out;
  display: flex;
  position: relative;

  ${(props) =>
    props.is_close &&
    css`
      width: 4rem;
    `}
`;
