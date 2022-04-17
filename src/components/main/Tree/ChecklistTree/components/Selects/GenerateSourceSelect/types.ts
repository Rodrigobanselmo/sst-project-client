import { BoxProps } from '@mui/material';

import { ITreeMapObject, ITreeSelectedItem } from '../../../interfaces';

export interface IGenerateSourceSelectProps extends BoxProps {
  node: ITreeMapObject | ITreeSelectedItem;
  large?: boolean;
  handleSelect?: (selectedIds: string[]) => void;
}
