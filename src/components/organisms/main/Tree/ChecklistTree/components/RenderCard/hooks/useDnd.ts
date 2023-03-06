/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useStore } from 'react-redux';

import { useChecklistTreeActions } from '../../../../../../../../core/hooks/useChecklistTreeActions';
import { nodeTypesConstant } from '../../../constants/node-type.constant';
import { questionsTextTypesConstant } from '../../../constants/questions-text-types.constant';
import { useDebounce } from '../../../hooks/useDebounce';
import { ITreeMap, ITreeMapObject } from '../../../interfaces';

export const useDnd = (node: ITreeMapObject) => {
  const { setDraggingItem, isChild, editNodes, removeNodes } =
    useChecklistTreeActions();
  const isMockAppend = useRef(false);
  const store = useStore();

  const onAppendMock = (id: number | string) => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;
    const dropItem = nodesMap[id] as ITreeMapObject | null;
    const dragItem = store.getState().tree.dragItem as ITreeMapObject | null;

    if (dragItem && dropItem) {
      if (dragItem.id === dropItem.id) return;
      if (isChild(dragItem.id, dropItem.id)) return;
      if (
        nodeTypesConstant[dropItem.type] &&
        !nodeTypesConstant[dropItem.type].childOptions.includes(dragItem.type)
      )
        return;
    }

    isMockAppend.current = true;

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
      label: dragItem?.label,
      parentId: id,
      className: 'mock_card',
    };

    return editNodes([CreateMock, AddMockToDrop], true);
  };

  const onRemoveMock = () => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;
    const mockItem = nodesMap['mock_id'] as ITreeMapObject | null;
    const dropItem = nodesMap[node.id] as ITreeMapObject | null;
    isMockAppend.current = false;

    if (mockItem && dropItem?.id === mockItem.parentId) {
      const removeMock = {
        id: mockItem?.parentId || '',
        childrenIds:
          nodesMap[mockItem?.parentId || '']?.childrenIds.filter(
            (child) => child !== 'mock_id',
          ) || [],
      };

      editNodes([removeMock], true);
      return removeNodes(mockItem.id, true);
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
    if (labelDoc) {
      const LabelClassName = labelDoc.className;

      labelDoc.className = isDragging
        ? LabelClassName + ' RdtCant-drop'
        : LabelClassName.replace(' RdtCant-drop', '');

      if (node.id !== 'mock_id') setDraggingItem(node);
    }
  }, [isDragging]);

  const onDragEnter = (dropId: string | number) => {
    const dragItem = store.getState().tree.dragItem as ITreeMapObject | null;

    if (dragItem) {
      const canDrop = onCanDrop(dragItem);
      if (!canDrop) return;
    }

    onAppendMock(dropId);
  };

  const onDragLeave = () => {
    onRemoveMock();
  };

  const onDrop = (drag: ITreeMapObject) => {
    if (!isMockAppend.current) return;

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

  const onCanDrop = (dragItem: ITreeMapObject) => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;
    const actualDragItem = nodesMap[dragItem.id];

    if (
      node?.answerType &&
      questionsTextTypesConstant.includes(node.answerType) &&
      node.childrenIds.length > 0
    ) {
      return false;
    }

    const differentId = actualDragItem.id !== node.id;

    const notChildOfDrop = !isChild(actualDragItem.id, node.id);
    const typeIncludesNode =
      nodeTypesConstant[node.type] &&
      nodeTypesConstant[node.type].childOptions.includes(actualDragItem.type);

    return differentId && notChildOfDrop && typeIncludesNode;
  };

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'box',
      canDrop: (item: ITreeMapObject) => onCanDrop(item),
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
    isOver,
  };
};
