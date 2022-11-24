import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { IProtocol } from 'core/interfaces/api/IProtocol';

export interface IProtocolSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  text?: string;
  tooltipTitle?: string;
  borderActive?: 'error' | 'info' | 'warning' | 'success';
  large?: boolean;
  selected?: (string | number)[];
  multiple?: boolean;
  handleSelect?: (selectedIds: IProtocol) => void;
  onEnter?: (value: string) => void;
  onlyProtocol?: boolean;
}
