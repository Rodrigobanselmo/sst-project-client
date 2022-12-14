import { ReactNode } from 'react';

import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';

import { IGho } from './../../../../core/interfaces/api/IGho';

export interface IGHOTypeSelectProps extends Partial<ISTagSearchSelectProps> {
  large?: boolean;
  handleSelect?: (selected: IGho, parents: IGho[]) => void;
  text?: string;
  defaultFilter?: HomoTypeEnum;
  filterOptions?: HomoTypeEnum[];
  selectedId?: string;
  allFilters?: boolean;
  disabled?: boolean;
  bg?: string;
  companyId?: string;
  tooltipText?: (value: string) => ReactNode;
  borderActive?: 'error' | 'info' | 'warning' | 'success';
}
