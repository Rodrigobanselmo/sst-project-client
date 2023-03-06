import React, { useContext, ReactElement } from 'react';
import { useDragDropManager } from 'react-dnd';

import {
  selectEqualDocumentDragItem,
  selectEqualDocumentDragItemIndex,
} from 'store/reducers/document/documentSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { useTreeContext } from './hooks';
import { PlaceholderContext } from './providers';
import { NodeModel } from './types';

type Props = {
  depth: number;
  listCount: number;
  dropTargetId: NodeModel['id'];
  index?: number;
};

export const Placeholder = <T,>(props: Props): ReactElement | null => {
  const {
    placeholderRender,
    placeholderComponent: Component,
    classes,
  } = useTreeContext<T>();
  const isDropTarget = useAppSelector(
    selectEqualDocumentDragItem(props.dropTargetId),
  );
  const isIndex = useAppSelector(selectEqualDocumentDragItemIndex(props.index));
  const isIndexListCount = useAppSelector(
    selectEqualDocumentDragItemIndex(props.listCount),
  );
  const manager = useDragDropManager();
  const monitor = manager.getMonitor();
  const dragSource = monitor.getItem() as NodeModel<T> | null;

  if (!placeholderRender || !dragSource) {
    return null;
  }

  const visible =
    isDropTarget &&
    (isIndex || (props.index === undefined && isIndexListCount));

  if (!visible) {
    return null;
  }

  return (
    <Component className={classes?.placeholder || ''}>
      {placeholderRender(dragSource, { depth: props.depth })}
    </Component>
  );
};
