import { FC } from 'react';

import { STextRow } from '../STextRow/STextRow';
import { STextClickRowProps } from './STextClickRow.types';

export const STextClickRow: FC<STextClickRowProps> = ({
  onClick,
  ...props
}) => {
  return (
    <STextRow
      containerProps={{
        onClick: (e) => {
          e.stopPropagation();
          onClick();
        },
        sx: {
          cursor: 'pointer',
          p: '4px 8px',
          m: '-4px -8px',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
        },
      }}
      {...props}
    />
  );
};
