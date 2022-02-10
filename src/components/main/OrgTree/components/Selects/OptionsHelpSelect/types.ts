import { RefObject } from 'react';

import { BoxProps } from '@mui/material';

import { ITreeMapObject, ITreeSelectedItem } from '../../../interfaces';

export interface IOptionsHelpSelectProps extends BoxProps {
  node: ITreeMapObject | ITreeSelectedItem;
  large?: boolean;
  menuRef: RefObject<HTMLDivElement>;
}
