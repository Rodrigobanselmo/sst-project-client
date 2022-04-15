import { Box, styled } from '@mui/material';

export const STMouseControlBox = styled(Box)`
  background-color: #00000033;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${({ theme }) => theme.mixins.mouseControl};
`;
