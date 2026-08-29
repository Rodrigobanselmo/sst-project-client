import React, { FC } from 'react';

import { STagButton } from 'components/atoms/STagButton';
import {
  brandIdentityPaginationCurrentSx,
  brandIdentityPaginationIdleSx,
} from 'configs/theme/brand-identity-fill';

import { PaginationItemProps } from './types';

const PaginationItem: FC<{ children?: any } & PaginationItemProps> = ({
  isCurrent = false,
  pageNumber,
  onPageChange,
}) => {
  return (
    <STagButton
      onClick={() => {
        if (!isCurrent) onPageChange(pageNumber);
      }}
      text={String(pageNumber)}
      sx={isCurrent ? brandIdentityPaginationCurrentSx : brandIdentityPaginationIdleSx}
    />
  );
};

export default PaginationItem;
