import { BoxProps } from '@mui/material';

import { ITreeMapObject, ITreeSelectedItem } from '../../../interfaces';

export interface IBlockedBySelectProps extends BoxProps {
  node: ITreeMapObject | ITreeSelectedItem;
  large?: boolean;
  handleSelect?: (selectedIds: string[]) => void;
}
