import React, { useEffect, useRef, ReactElement } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { selectEqualDocumentDragItem } from 'store/reducers/document/documentSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { AnimateHeight } from './AnimateHeight';
import { Container } from './Container';
import {
  useTreeContext,
  useDragNode,
  useDropNode,
  useDragControl,
  useDragHandle,
} from './hooks';
import { NodeModel, RenderParams } from './types';
import { isDroppable } from './utils';

type Props = {
  id: NodeModel['id'];
  depth: number;
};

export const Node = <T,>(props: Props): ReactElement | null => {
  const treeContext = useTreeContext<T>();
  const isDropTarget = useAppSelector(selectEqualDocumentDragItem(props.id));
  const containerRef = useRef<HTMLElement>(null);
  const handleRef = useRef<any>(null);
  const item = treeContext.tree.find(
    (node) => node.id === props.id,
  ) as NodeModel<T>;
  const { openIds, classes, enableAnimateExpand } = treeContext;
  const open = openIds.includes(props.id);

  const [isDragging, drag, preview] = useDragNode(item, containerRef);
  const [isOver, dragSource, drop] = useDropNode(item, containerRef);

  useDragHandle(containerRef, handleRef, drag);

  if (isDroppable(dragSource?.id, props.id, treeContext)) {
    drop(containerRef);
  }

  useEffect(() => {
    if (treeContext.dragPreviewRender) {
      preview(getEmptyImage(), { captureDraggingState: true });
    } else if (handleRef.current) {
      preview(containerRef);
    }
  }, [preview, treeContext.dragPreviewRender]);

  useDragControl(containerRef);

  const handleToggle = () => treeContext.onToggle(item.id);

  const Component = treeContext.listItemComponent;

  let className = classes?.listItem || '';

  if (isOver && classes?.dropTarget) {
    className = `${className} ${classes.dropTarget}`;
  }

  if (isDragging && classes?.draggingSource) {
    className = `${className} ${classes.draggingSource}`;
  }

  const draggable = treeContext.canDrag ? treeContext.canDrag(props.id) : true;
  const children = treeContext.tree.filter((node) => node.parent === props.id);

  const params: RenderParams = {
    depth: props.depth,
    isOpen: open,
    isDragging,
    isDropTarget,
    draggable,
    hasChild: children.length > 0,
    containerRef,
    handleRef,
    onToggle: handleToggle,
  };

  return (
    <Component ref={containerRef} className={className} role="listitem">
      {treeContext.render(item, params)}
      {enableAnimateExpand && params.hasChild && (
        <AnimateHeight isVisible={open}>
          <Container parentId={props.id} depth={props.depth + 1} />
        </AnimateHeight>
      )}
      {!enableAnimateExpand && params.hasChild && open && (
        <Container parentId={props.id} depth={props.depth + 1} />
      )}
    </Component>
  );
};
