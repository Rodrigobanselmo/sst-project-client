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

const SlideUp = keyframes`
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
