/* eslint-disable @typescript-eslint/no-explicit-any */
import { CSSProperties } from 'react';

import { QuestionOptionsEnum } from 'components/main/Tree/ChecklistTree/enums/question-options.enums';

import { TreeTypeEnum } from '../enums/tree-type.enums';

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
  type: TreeTypeEnum;
  expand: boolean;
  style?: CSSProperties;
  className?: string;
  risks?: (string | number)[];
  block?: (string | number)[];
  blockedBy?: (string | number)[];
  rec?: (string | number)[];
  med?: (string | number)[];
  answerType?: QuestionOptionsEnum;
  generateSource?: string[];
}

export interface ITreeSelectedItem extends ITreeMapObject {
  action: 'edit' | 'add';
}

export interface ITreeCopyItem extends ITreeMapObject {
  all: boolean;
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
  addNodes: (nodesMap: ITreeMapObject[]) => void;
  removeNodes: (id: Array<number | string> | number | string) => void;
  isChild: (parentId: number | string, childId: number | string) => boolean;
  setDraggingItem: (node: ITreeMapObject) => void;
  setSelectedItem: (node: ITreeMapObject, action?: 'add' | 'edit') => void;
  onExpandAll: (expand: boolean, nodeId?: string | number | undefined) => void;
  editTreeMap: (nodesMap: ITreeMapPartial) => void;
  setTree: (nodesMap: ITreeMap) => void;
  getPathById: (id: number | string) => string[];
  getUniqueId: () => string;
}

export interface ITreeActionsContextProps {}
