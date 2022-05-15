import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Link, LinkProps } from '@mui/material';

interface LinkStyleProps extends LinkProps {
  is_active?: boolean;
}

export const LinkStyle = styled(Link)<LinkStyleProps>`
  border-left: 3px solid transparent;
  align-items: center;
  transition: background-color 0.3s ease;
  display: flex;
  text-decoration: none;

  &:hover {
    background-color: #00000067;
  }

  p {
    color: ${({ theme }) => theme.palette.grey?.[400]};
  }
  svg {
    color: ${({ theme }) => theme.palette.grey?.[500]};
  }
  ${(props) =>
    props.is_active &&
    css`
      box-sizing: border-box;
      border-left: 3px solid ${props.theme.palette.primary.main};
      background-color: ${props.theme.palette.mainBlur[5]};
      background-image: linear-gradient(
        -90deg,
        ${props.theme.palette.mainBlur[5]},
        ${props.theme.palette.mainBlur[20]}
      );
      p {
        color: ${props.theme.palette.grey[300]};
      }
      svg {
        color: ${props.theme.palette.grey[300]};
      }

      &:hover {
        filter: drop-shadow();
      }
    `}
`;
