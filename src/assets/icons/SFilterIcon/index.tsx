import React, { FC } from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SFilterIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <FilterListIcon {...props} />;
};

export default FilterListIcon;
