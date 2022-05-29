import React from 'react';

import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const FadeIn = keyframes`
  0%    { opacity: 0; }
  100%  { opacity: 1; }
  /* 0%    { transform: translateX(100px); opacity: 0; }
  100%  { transform: translateX(0px); opacity: 1; } */
`;

const StyledDiv = styled.div<{ next?: number }>`
  animation: ${FadeIn} 0.4s;
`;

type Props = {
  children: React.ReactNode;
};

const AnimatedStep: React.FC<Props> = ({ children }) => {
  return <StyledDiv>{children}</StyledDiv>;
};

export default React.memo(AnimatedStep);
