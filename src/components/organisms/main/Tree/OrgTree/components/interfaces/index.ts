import { ReactNode } from 'react';

import { IOrgTreeNodeProps, ITreeMapObject } from '../../interfaces';

export interface ITreeOptions {
  horizontal?: boolean;
  expanded?: boolean;
}

export interface IRenderChildren {
  list: Array<number | string>;
  nodeId: number | string;
  prop: IOrgTreeNodeProps;
  extra?: ReactNode;
}

export interface IRender {
  prop: IOrgTreeNodeProps;
  first?: boolean;
  id: string | number;
}

export interface IRenderCard {
  node: ITreeMapObject;
  prop: IOrgTreeNodeProps;
}

export interface IRenderButton {
  prop: IOrgTreeNodeProps;
  node: ITreeMapObject;
}
