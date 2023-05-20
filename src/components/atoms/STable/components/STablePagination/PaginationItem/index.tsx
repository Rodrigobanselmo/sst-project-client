import React, { FC } from 'react';

import { STagButton } from 'components/atoms/STagButton';

import { PaginationItemProps } from './types';

const PaginationItem: FC<{ children?: any } & PaginationItemProps> = ({
  isCurrent = false,
  pageNumber,
  onPageChange,
}) => {
  return (
    <STagButton
      onClick={() => onPageChange(pageNumber)}
      disabled={isCurrent}
      text={String(pageNumber)}
    />
  );
};

export default PaginationItem;
