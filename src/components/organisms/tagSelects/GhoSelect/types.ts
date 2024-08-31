import { ReactNode } from 'react';

import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';

import { IGho } from './../../../../core/interfaces/api/IGho';

interface IGHOTypeSelectBaseProps
  extends Partial<Omit<ISTagSearchSelectProps, 'multiple'>> {
  large?: boolean;
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

interface IGHOTypeSelectMultipleProps {
  multiple: true;
  handleSelect?: (selected: IGho[]) => void;
}

interface IGHOTypeSelectSingleProps {
  multiple?: false;
  handleSelect?: (selected: IGho, parents: IGho[]) => void;
}

export type IGHOTypeSelectProps = IGHOTypeSelectBaseProps &
  (IGHOTypeSelectMultipleProps | IGHOTypeSelectSingleProps);
