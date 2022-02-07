import { BoxProps } from '@mui/material';

import { IRiskFactors } from '../../../../../../core/interfaces/IRiskFactors';
import { ITreeMapObject, ITreeSelectedItem } from '../../../interfaces';

export interface ITypeSelectProps extends BoxProps {
  node: ITreeMapObject | ITreeSelectedItem;
  large?: boolean;
  handleSelect?: (option: IRiskFactors) => void;
}
