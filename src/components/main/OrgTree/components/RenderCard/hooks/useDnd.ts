/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useStore } from 'react-redux';

import { useTreeActions } from '../../../../../../core/contexts/TreeActionsContextProvider';
import { useDebounce } from '../../../hooks/useDebounce';
import { ITreeMap, ITreeMapObject } from './../../../interfaces';

export const useDnd = (node: ITreeMapObject) => {
  const { setDraggingItem, isChild, editNodes, removeNodes } = useTreeActions();
  const store = useStore();

  const onAppendMock = (id: number | string) => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;
    const dropItem = nodesMap[id] as ITreeMapObject | null;
    const dragItemId = store.getState().tree
      .dragItemId as ITreeMapObject | null;

    const dropFilterChildren = dropItem?.childrenIds
      ? dropItem.childrenIds.filter((childId) => childId !== id)
      : [];

    const AddMockToDrop = {
      id: id,
      childrenIds: [...dropFilterChildren, 'mock_id'],
    };

    const CreateMock = {
      id: 'mock_id',
      childrenIds: [],
      label: dragItemId?.label,
      parentId: id,
      className: 'mock_card',
    };

    return editNodes([CreateMock, AddMockToDrop]);
  };

  const onRemoveMock = () => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;
    const mockItem = nodesMap['mock_id'] as ITreeMapObject | null;
    const dropItem = nodesMap[node.id] as ITreeMapObject | null;

    if (mockItem && dropItem?.id === mockItem.parentId) {
      const removeMock = {
        id: mockItem?.parentId || '',
        childrenIds:
          nodesMap[mockItem?.parentId || '']?.childrenIds.filter(
            (child) => child !== 'mock_id',
          ) || [],
      };

      editNodes([removeMock]);
      return removeNodes(mockItem.id);
    }
  };

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'box',
      item: node,
      options: {
        dropEffect: 'copy',
      },
      collect: (monitor: any) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [],
  );

  useEffect(() => {
    const labelDoc = document.getElementById(`node-tree-${node.id}`);
    if (!labelDoc) return;

    const LabelClassName = labelDoc.className;

    labelDoc.className = isDragging
      ? labelDoc.className + ' RdtCant-drop'
      : LabelClassName.replace(' RdtCant-drop', '');

    setDraggingItem(node);
  }, [isDragging]);

  const onDragEnter = (dropId: string | number) => {
    const dragItemId = store.getState().tree
      .dragItemId as ITreeMapObject | null;

    if (dragItemId) {
      const canDrop =
        dragItemId.id !== node?.id && !isChild(dragItemId.id, node.id);
      if (!canDrop) return;
    }

    onAppendMock(dropId);
  };

  const onDragLeave = () => {
    onRemoveMock();
  };

  const onDrop = (drag: ITreeMapObject) => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;
    const dragItem = nodesMap[drag.id] as ITreeMapObject | null;
    const dropItem = nodesMap[node.id] as ITreeMapObject | null;

    const removeDragFromParent = {
      id: dragItem?.parentId || '',
      childrenIds:
        nodesMap[dragItem?.parentId || '']?.childrenIds.filter(
          (child) => child !== dragItem?.id,
        ) || [],
    };

    const changeDragParent = {
      id: dragItem?.id || '',
      parentId: dropItem?.id,
    };

    const dropFilterChildren = dropItem?.childrenIds
      ? dropItem.childrenIds.filter((childId) => childId !== dragItem?.id)
      : [];

    const AddDragToDrop = {
      id: dropItem?.id || '',
      childrenIds: [...dropFilterChildren, dragItem?.id || ''],
    };

    return editNodes([removeDragFromParent, changeDragParent, AddDragToDrop]);
  };

  const { onDebounce } = useDebounce(onDragEnter, 500);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'box',
      canDrop: (item: ITreeMapObject) =>
        item.id !== node.id && !isChild(item.id, node.id),
      drop: (drag: ITreeMapObject) => onDrop(drag),
      collect: (monitor: any) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [],
  );

  useEffect(() => {
    if (isOver) onDebounce(node.id);
    else onDragLeave();
  }, [isOver]);

  return {
    drag,
    drop,
    isDragging,
  };
};
