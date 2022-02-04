/* eslint-disable @typescript-eslint/no-explicit-any */
import { CSSProperties } from 'react';

export interface IOrgTreeProps {
  horizontal?: boolean;
  collapsable?: boolean;
}

export interface IOrgTreeNodeProps extends IOrgTreeProps {}

export interface ITreeMapObject {
  parentId: string | number | null;
  childrenIds: Array<string | number>;
  id: string | number;
  label: string;
  expand?: boolean;
  style?: CSSProperties;
  className?: string;
}

export interface ITreeMap extends Record<string, ITreeMapObject> {}

export interface ITreeMapPartial
  extends Record<string, Partial<ITreeMapObject>> {}

export interface ITreeMapEdit extends Partial<Omit<ITreeMapObject, 'id'>> {
  id: string | number;
}

export interface ITreeMapPartialEdit extends Record<string, ITreeMapEdit> {}

export interface ITreeActionsContextData {
  editNodes: (nodesMap: ITreeMapEdit[]) => void;
  removeNodes: (id: Array<number | string> | number | string) => void;
  isChild: (parentId: number | string, childId: number | string) => boolean;
  setDraggingItem: (node: ITreeMapObject) => void;
  onExpandAll: (expand: boolean, nodeId?: string | number | undefined) => void;
  editTreeMap: (nodesMap: ITreeMapPartial) => void;
  setTree: (nodesMap: ITreeMap) => void;
}

export interface ITreeActionsContextProps {}
