import { MouseEvent, RefObject } from 'react';

import { BoxProps } from '@mui/material';

import { ITreeMapObject } from '../../../../interfaces';

export interface INodeCardProps extends BoxProps {
  node: ITreeMapObject;
  handleClickCard: (e?: MouseEvent) => void;
  menuRef: RefObject<HTMLDivElement | null>;
}
