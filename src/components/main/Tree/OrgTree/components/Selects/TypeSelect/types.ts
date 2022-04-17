import { BoxProps } from '@mui/material';

import { TreeTypeEnum } from '../../../enums/tree-type.enums';
import { ITreeMapObject, ITreeSelectedItem } from '../../../interfaces';

export interface ITypeSelectProps extends BoxProps {
  node: ITreeMapObject | ITreeSelectedItem;
  parentId: string | number;
  large?: boolean;
  disabled?: boolean;
  handleSelect?: (option: { value: TreeTypeEnum; name: string }) => void;
}
