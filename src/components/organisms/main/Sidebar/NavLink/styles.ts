import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Link, LinkProps } from '@mui/material';

interface LinkStyleProps extends LinkProps {
  is_active?: boolean;
}

export const StyledNavImage = styled('img')<{ open: number; type?: 'cat' }>`
  height: 25px;
  width: 24px;
  object-position: 4px;
  object-fit: cover;
  transition: width 0.6s ease;

  ${(props) =>
    props.open &&
    css`
      width: 100%;
    `};

  ${(props) =>
    props.type == 'cat' &&
    css`
      object-position: 4px;
      margin-left: -1px;
      margin-right: -5px;
      height: 14px;
      width: 25px;
      object-fit: contain;
    `};

  ${(props) =>
    props.type == 'cat' &&
    props.open &&
    css`
      margin-right: -2px;
      margin-left: -4px;
    `};
`;

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
