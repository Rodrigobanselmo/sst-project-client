import { css, keyframes } from '@emotion/react';
import { styled, Box } from '@mui/material';

import SIconButton from '../../../../../../../../atoms/SIconButton';

export const STSBoxButton = styled(Box)`
  height: 22px;
  border: 1px solid ${(props) => props.theme.palette.background.divider};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.palette.gray[100]};
  }
`;

export const STAddSIconButton = styled(SIconButton)`
  max-height: 30px;
  max-width: 30px;
  position: absolute;
  left: 4px;
`;

const AttentionAnimation = keyframes`  
  0% { 
   }

   50% { 
    filter: brightness(0.8);

  }
  100% { 
   }
`;

export const STSelectBox = styled(Box)<{ selected?: number }>`
  max-height: ${(props) => props.theme.spacing(10)};
  min-height: ${(props) => props.theme.spacing(10)};
  min-width: ${(props) => props.theme.spacing(10)};
  max-width: ${(props) => props.theme.spacing(10)};
  margin-right: ${(props) => props.theme.spacing(2)};
  background-color: ${(props) => props.theme.palette.background.lightGray};
  border-radius: 50%;
  border: 1px solid ${(props) => props.theme.palette.background.divider};
  cursor: pointer;

  animation: ${AttentionAnimation} 1s linear 5;

  ${(props) =>
    props.selected &&
    css`
      background-color: ${props.theme.palette.info.main};
    `}
`;
