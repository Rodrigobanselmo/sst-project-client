import { BoxProps } from '@mui/material';

import { ITreeMapObject } from '../../../../interfaces';

export interface ITextLabelProps extends BoxProps {
  data: ITreeMapObject;
}
