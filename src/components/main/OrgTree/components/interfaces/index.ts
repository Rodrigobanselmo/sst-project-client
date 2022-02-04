import { IOrgTreeNodeProps, ITreeMapObject } from '../../interfaces';

export interface ITreeOptions {
  horizontal?: boolean;
  expanded?: boolean;
}

export interface IRenderChildren {
  list: Array<number | string>;
  data: ITreeMapObject;
  prop: IOrgTreeNodeProps;
}

export interface IRender {
  prop: IOrgTreeNodeProps;
  first?: boolean;
  id: string | number;
}

export interface IRenderCard {
  data: ITreeMapObject;
  prop: IOrgTreeNodeProps;
}

export interface IRenderButton {
  prop: IOrgTreeNodeProps;
  data: ITreeMapObject;
}
