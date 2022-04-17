import { RefObject } from 'react';

import { BoxProps } from '@mui/material';

import { ITreeMapObject, ITreeSelectedItem } from '../../../interfaces';

export interface IGhoSelectProps extends BoxProps {
  node: ITreeMapObject | ITreeSelectedItem;
  large?: boolean;
  disabled?: boolean;
  showAll?: boolean;
}
