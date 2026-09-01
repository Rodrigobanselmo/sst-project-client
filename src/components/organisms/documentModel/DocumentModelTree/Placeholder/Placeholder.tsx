import React from 'react';

import { Box } from '@mui/material';

import { NodeDocumentModel } from '../types/types';

const Placeholder: React.FC<
  { children?: any } & { node: NodeDocumentModel; depth: number }
> = ({ depth }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        height: 4,
        left: depth * 24,
        transform: 'translateY(-50%)',
        backgroundColor: 'primary.main',
        zIndex: 100,
      }}
    />
  );
};

export default Placeholder;
