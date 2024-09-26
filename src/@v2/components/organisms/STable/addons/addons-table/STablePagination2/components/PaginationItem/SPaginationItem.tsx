import React, { FC, ReactNode } from 'react';

import { STagButton } from 'components/atoms/STagButton';

import { PaginationItemProps } from './SPaginationItem.types';

export const SPaginationItem: FC<
  { children?: ReactNode } & PaginationItemProps
> = ({ isCurrent = false, pageNumber, onPageChange }) => {
  return (
    <STagButton
      onClick={() => onPageChange(pageNumber)}
      disabled={isCurrent}
      text={String(pageNumber)}
    />
  );
};
