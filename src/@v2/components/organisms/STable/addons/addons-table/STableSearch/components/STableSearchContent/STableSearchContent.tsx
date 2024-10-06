import { FC } from 'react';

import { Box } from '@mui/material';
import { STableSearchContentProps } from './STableSearchContent.types';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';

export const STableSearchContent: FC<STableSearchContentProps> = ({
  children,
}) => {
  const [leftChildren, ...rest] = Array.isArray(children)
    ? children
    : [children];

  return (
    <SFlex flex={1} center gap={4} ml={2}>
      {leftChildren}
      <Box flex={1} />
      {rest}
    </SFlex>
  );
};
