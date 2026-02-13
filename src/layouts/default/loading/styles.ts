import { Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

import LogoSimpleIcon from '../../../assets/logo/logo-simple/logo-simple';

export const STBoxChildren = styled(Box)`
  flex: 1;
  position: relative;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
    border-radius: 24px;
  }
`;

export const SlideUp = keyframes`
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(20px);
    }
    100% {
        transform: translateY(0px);
    }
`;

export const STLoadLogoSimpleIcon = styled(LogoSimpleIcon)`
  height: 80px;
  width: 80px;
  position: absolute;
  right: calc(50% - 40px);
  top: calc(50% - 70px);
  animation: ${SlideUp} 1.5s;
  animation-iteration-count: infinite;
`;

export const STCompanyLogoLoading = styled('img')`
  height: 80px;
  width: 80px;
  position: absolute;
  right: calc(50% - 40px);
  top: calc(50% - 70px);
  animation: ${SlideUp} 1.5s;
  animation-iteration-count: infinite;
  object-fit: contain;
  border-radius: 8px;
`;

export const STBoxLoading = styled(Box)`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  background-color: ${({ theme }) => theme.palette.background.default};
  z-index: ${({ theme }) => theme.mixins.loadingFeedback};
`;
