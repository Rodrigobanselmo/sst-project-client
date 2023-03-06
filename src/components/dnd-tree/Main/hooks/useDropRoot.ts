import { useContext } from 'react';
import { useDrop, DragElementWrapper } from 'react-dnd';

import { useTreeContext } from '.';
import { ItemTypes } from '../ItemTypes';
import { PlaceholderContext } from '../providers';
import { NodeModel } from '../types';
import { getDropTarget, isDroppable, isNodeModel } from '../utils';

export const useDropRoot = <T>(
  ref: React.RefObject<HTMLElement>,
): [boolean, NodeModel, DragElementWrapper<HTMLElement>] => {
  const treeContext = useTreeContext<T>();
  const placeholderContext = useContext(PlaceholderContext);
  const [{ isOver, dragSource }, drop] = useDrop({
    accept: [ItemTypes.TREE_ITEM, ...treeContext.extraAcceptTypes],
    drop: (dragItem: any, monitor) => {
      const { rootId, onDrop } = treeContext;
      const { getDropTargetId, getIndex } = placeholderContext;

      const dropTargetId = getDropTargetId();
      const index = getIndex();

      if (
        monitor.isOver({ shallow: true }) &&
        dropTargetId !== undefined &&
        index !== undefined
      ) {
        // If the drag source is outside the react-dnd,
        // a different object is passed than the NodeModel.
        onDrop(isNodeModel<T>(dragItem) ? dragItem : null, rootId, index);
      }

      placeholderContext.hidePlaceholder();
    },
    canDrop: (dragItem, monitor) => {
      const { rootId } = treeContext;

      if (monitor.isOver({ shallow: true })) {
        if (dragItem === undefined) {
          return false;
        }

        return isDroppable(
          isNodeModel<T>(dragItem) ? dragItem.id : undefined,
          rootId,
          treeContext,
        );
      }

      return false;
    },
    hover: (dragItem, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        const { rootId } = treeContext;
        const { getDropTargetId, getIndex, showPlaceholder, hidePlaceholder } =
          placeholderContext;

        const dropTargetId = getDropTargetId();
        const index = getIndex();

        const dropTarget = getDropTarget<T>(
          null,
          ref.current,
          monitor,
          treeContext,
        );

        if (
          dropTarget === null ||
          !isDroppable(
            isNodeModel<T>(dragItem) ? dragItem.id : undefined,
            rootId,
            treeContext,
          )
        ) {
          hidePlaceholder();
          return;
        }

        if (dropTarget.id !== dropTargetId || dropTarget.index !== index) {
          showPlaceholder(dropTarget.id, dropTarget.index);
        }
      }
    },
    collect: (monitor) => {
      const dragSource: NodeModel<T> = monitor.getItem();

      return {
        isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
        dragSource,
      };
    },
  });

  return [isOver, dragSource, drop];
};
