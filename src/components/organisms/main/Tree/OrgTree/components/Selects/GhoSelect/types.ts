import { BoxProps } from '@mui/material';

import { ITreeMapObject, ITreeSelectedItem } from '../../../interfaces';

export interface IGhoSelectProps extends BoxProps {
  node: ITreeMapObject | ITreeSelectedItem;
  large?: boolean;
  disabled?: boolean;
  showAll?: boolean;
  /** Compact pill on the cargo card (bottom-right); same menu + vínculos. */
  cornerBadge?: boolean;
}
