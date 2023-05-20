import { FC } from 'react';

import { Box } from '@mui/material';

import { ISBoxPaperProps } from './types';

export const SBoxPaper: FC<{ children?: any } & ISBoxPaperProps> = ({
  children,
  ...props
}) => {
  return (
    <Box
      {...props}
      sx={{
        p: 12,
        pt: 8,
        border: '1px solid',
        borderRadius: 1,
        borderColor: 'grey.400',
        backgroundColor: 'white',
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
};
