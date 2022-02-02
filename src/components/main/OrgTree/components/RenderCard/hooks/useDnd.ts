/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { useHierarchyData } from '../../../context/HierarchyContextProvider';
import { useDebounce } from '../../../hooks/useDebounce';
import { INestedObject } from './../../../interfaces/index';

export const useDnd = (data: INestedObject) => {
  const {
    setHierarchy,
    editById,
    isChild,
    findParentByChildId,
    findById,
    draggingItemRef,
    setHierarchyRef,
  } = useHierarchyData();

  const onAppendMock = (id: number | string, label: string) => {
    // add renderNode if has already children inside
    const componentChildren = document.getElementById(`children_${id}`);
    if (componentChildren) {
      const elementMockLabel = document.getElementById('label_text_mock');
      const elementMockNode = document.getElementById('node-tree-mock');
      if (!elementMockLabel) return;
      if (!elementMockNode) return;

      elementMockLabel.innerText = label;

      elementMockNode.style.display = 'table-cell';
      elementMockNode.id = 'node-tree-mock-clone';
      const elementMockNodeClone = elementMockNode?.cloneNode(true);
      elementMockNode.style.display = 'none';
      elementMockNode.id = 'node-tree-mock';

      const elementMockNodeLastChild = elementMockNodeClone.lastChild;
      elementMockNodeLastChild &&
        elementMockNodeClone.removeChild(elementMockNodeLastChild);

      componentChildren.appendChild(elementMockNodeClone);
      return;
    }

    // add renderChildrenNode if does not have children inside
    const componentNode = document.getElementById(`node-tree-${id}`);
    if (componentNode) {
      const elementMockLabel = document.getElementById('label_text_child_mock');
      const componentMockChildren = document.getElementById('children_mock');

      if (!elementMockLabel) return;
      if (!componentMockChildren) return;

      elementMockLabel.innerText = label;

      const oldMockId = componentMockChildren.id;
      componentMockChildren.id = 'node-tree-mock-clone';
      const componentMockChildrenClone = componentMockChildren?.cloneNode(true);
      componentMockChildren.id = oldMockId;

      componentNode.appendChild(componentMockChildrenClone);
    }
  };

  const onRemoveMock = () => {
    const componentCloneMock = document.getElementById('node-tree-mock-clone');
    componentCloneMock && componentCloneMock.remove();
  };

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'box',
      item: data,
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
    const labelDoc = document.getElementById(`node-tree-${data.id}`);
    if (!labelDoc) return;

    const LabelClassName = labelDoc.className;

    labelDoc.className = isDragging
      ? labelDoc.className + ' RdtCant-drop'
      : LabelClassName.replace(' RdtCant-drop', '');

    draggingItemRef.current = data;
  }, [isDragging]);

  const onDragEnter = (dropId: string | number) => {
    let dragLabel = 'Copiar aqui';
    if (draggingItemRef.current) {
      const dragItemId = draggingItemRef.current.id;
      const canDrop = dragItemId !== data.id && !isChild(dragItemId, data.id);
      dragLabel = draggingItemRef.current.label;
      if (!canDrop) return;
    }
    onAppendMock(dropId, dragLabel);
  };

  const onDragLeave = () => {
    onRemoveMock();
  };

  const onDrop = (drag: INestedObject) => {
    const dragItem = findById(drag.id);
    const dropItem = data;

    const { parent: parentDragItem } = findParentByChildId(drag.id);

    if (parentDragItem && dragItem) {
      const newParent = {
        ...parentDragItem,
        children: [...parentDragItem.children.filter((i) => i.id !== drag.id)],
      };

      const removedDragItemHierarchy = editById(
        parentDragItem.id,
        newParent,
        'replace',
      );

      const addedDragItemHierarchy = editById(
        dropItem.id,
        {
          children: [dragItem],
        },
        'soft-edit',
        removedDragItemHierarchy,
      );

      setHierarchy(addedDragItemHierarchy);
      setHierarchyRef(addedDragItemHierarchy);
    }
  };

  const { onDebounce } = useDebounce(onDragEnter, 300);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'box',
      canDrop: (item: INestedObject) =>
        item.id !== data.id && !isChild(item.id, data.id),
      drop: (drag: INestedObject) => onDrop(drag),
      collect: (monitor: any) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [],
  );

  useEffect(() => {
    if (isOver) onDebounce(data.id);
    else onDragLeave();
  }, [isOver]);

  return {
    drag,
    drop,
    isDragging,
  };
};
