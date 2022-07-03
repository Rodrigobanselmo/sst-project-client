import { RefObject } from 'react';

import { BoxProps } from '@mui/material';

import { ITreeMapObject } from '../../../../interfaces';

export interface INodeCardProps extends BoxProps {
  node: ITreeMapObject;
  handleClickCard: () => void;
  menuRef: RefObject<HTMLDivElement>;
}
