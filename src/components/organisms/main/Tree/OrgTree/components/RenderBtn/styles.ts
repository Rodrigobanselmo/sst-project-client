import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const RenderButton = styled.span<{
  horizontal: number;
  expanded: number;
  seed: number;
}>`
  position: absolute;
  display: inline-block;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  z-index: ${({ theme }) => theme.mixins.nodeCard};
  margin-left: -11px;
  margin-top: 11px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.35s ease;
  transform: translateY(2px);

  :hover {
    filter: brightness(0.9);
    transform: scale(1.1) translateY(2px);
  }

  :before,
  :after {
    content: '';
    position: absolute;
  }

  :before {
    top: 50%;
    left: 4px;
    right: 4px;
    height: 0;
    border-top: 1px solid #ccc;
  }

  :after {
    top: 4px;
    left: 50%;
    bottom: 4px;
    width: 0;
    border-left: 1px solid #ccc;
  }

  ${(props) =>
    props.expanded &&
    css`
      &:after {
        border: none;
      }
    `};

  ${(props) =>
    props.horizontal &&
    css`
      top: 50%;
      left: 100%;
      margin-top: -11px;
      margin-left: 9px;
    `};

  ${(props) =>
    props.seed &&
    css`
      display: none;
      :before,
      :after {
        display: none;
      }
    `};
`;
