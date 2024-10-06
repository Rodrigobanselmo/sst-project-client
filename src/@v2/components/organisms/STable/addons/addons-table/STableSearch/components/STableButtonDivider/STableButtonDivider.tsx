import { FC } from 'react';

import { Box } from '@mui/material';
import { STableButtonDividerProps } from './STableButtonDivider.types';

export const STableButtonDivider: FC<STableButtonDividerProps> = () => {
  return (
    <Box
      height={20}
      mx={1}
      width={'2px'}
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      }}
    />
  );
};
