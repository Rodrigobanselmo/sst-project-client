import React from 'react';

import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const FadeIn = keyframes`
  0%    { opacity: 0; }
  100%  { opacity: 1; }
`;

const StyledDiv = styled.div<{ next?: number }>`
  animation: ${FadeIn} 1s;
`;

type Props = {
  children: React.ReactNode;
};

const AnimatedStep: React.FC<Props> = ({ children }) => {
  return <StyledDiv>{children}</StyledDiv>;
};

export default React.memo(AnimatedStep);
