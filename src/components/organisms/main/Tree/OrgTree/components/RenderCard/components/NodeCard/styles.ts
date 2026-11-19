import { css, keyframes } from '@emotion/react';
import { styled, Box, type Theme } from '@mui/material';

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
  border: 3px solid ${(props) => props.theme.palette.grey[300]};
  cursor: pointer;
  transition: all 0.35s ease;

  /* animation: ${AttentionAnimation} 1s linear 5; */

  :hover {
    filter: brightness(0.9);
    transform: scale(1.1);
  }

  ${(props) =>
    props.selected &&
    css`
      background-color: ${props.theme.palette.primary.main};
      border: 2px solid ${props.theme.palette.grey[300]};
    `};
`;

/** Glass finish scoped to card controls, with readable glyphs in both themes. */
export const hierarchyCardControlSx = {
  height: '16px',
  minHeight: '16px',
  maxHeight: '16px',
  minWidth: '18px',
  px: '3px',
  py: 0,
  fontSize: '8px',
  lineHeight: 1,
  '& .icon_main': { fontSize: '8px !important', mr: '0px' },
  '& .text_main': { fontSize: '8px !important', lineHeight: 1 },
  border: '1px solid',
  borderColor: (theme: Theme) => theme.palette.mode === 'dark'
    ? 'rgba(226, 232, 240, 0.34)' : 'rgba(71, 85, 105, 0.28)',
  bgcolor: (theme: Theme) => theme.palette.mode === 'dark'
    ? 'rgba(23, 32, 46, 0.65)' : 'rgba(100, 116, 139, 0.06)',
  backgroundImage: (theme: Theme) => theme.palette.mode === 'dark'
    ? 'linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03) 55%, rgba(255,255,255,0.07))'
    : 'linear-gradient(160deg, rgba(255,255,255,0.30), rgba(255,255,255,0.03) 55%, rgba(100,116,139,0.08))',
  backdropFilter: 'blur(8px) saturate(130%)',
  WebkitBackdropFilter: 'blur(8px) saturate(130%)',
  boxShadow: (theme: Theme) => theme.palette.mode === 'dark'
    ? 'inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -1px 0 rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.20)'
    : 'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(100,116,139,0.10), 0 1px 2px rgba(15,23,42,0.07)',
  color: 'text.primary',
  boxSizing: 'border-box',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
  '& .MuiSvgIcon-root': { color: 'inherit', fontSize: '8px !important' },
  '&:hover': {
    borderColor: 'text.secondary',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.40), 0 2px 5px rgba(15,23,42,0.20)',
  },
  '&:active': {
    boxShadow: 'inset 0 1px 3px rgba(15,23,42,0.18)',
  },
} as const;
