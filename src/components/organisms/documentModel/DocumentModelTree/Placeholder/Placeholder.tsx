import React from 'react';

import { NodeDocumentModel } from '../types/types';

const Placeholder: React.FC<
  { children?: any } & { node: NodeDocumentModel; depth: number }
> = ({ node, depth }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        height: 4,
        left: depth * 24,
        transform: 'translateY(-50%)',
        backgroundColor: '#81a9e0',
        zIndex: 100,
      }}
    />
  );
};

export default Placeholder;
