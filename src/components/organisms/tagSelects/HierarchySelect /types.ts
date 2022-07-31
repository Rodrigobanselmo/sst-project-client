import { ReactNode } from 'react';

import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { IHierarchy } from 'core/interfaces/api/IHierarchy';

export interface ITypeSelectProps extends Partial<ISTagSearchSelectProps> {
  large?: boolean;
  handleSelect?: (selected: IHierarchy) => void;
  text?: string;
  selectedId?: string;
  disabled?: boolean;
  bg?: string;
  companyId?: string;
  tooltipText?: (value: string) => ReactNode;
}
