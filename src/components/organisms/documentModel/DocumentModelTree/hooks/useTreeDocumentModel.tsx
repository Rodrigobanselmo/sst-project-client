import { useEffect, useState } from 'react';

import clone from 'clone';
import {
  setDocumentModelSections,
  setDocumentSelectItem,
  setSaveDocument,
} from 'store/reducers/document/documentSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import {
  IDocumentModelData,
  IDocumentModelFull,
} from 'core/interfaces/api/IDocumentModel';

import { DropOptions, getDescendants } from '../../../../dnd-tree/Main';
import { replaceAllVariables } from '../../utils/replaceAllVariables';
import { itemLevelMap } from '../constants/item-types.map';
import {
  NodeDocumentModel,
  NodeDocumentModelElementData,
  NodeDocumentModelSectionData,
} from '../types/types';

export const useTreeDocumentModel = (model: IDocumentModelFull | undefined) => {
  const [treeData, setTreeData] = useState<NodeDocumentModel[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (model) {
      const treeArray: NodeDocumentModel[] = [];
      const variables = { ...model.variables, ...model.document.variables };

      model.document.sections.forEach(
        ({ children: sectionChildren, ...section }) => {
          let parentIds: string[] = [];

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          section.data.forEach(({ children: _children, ...sectionItem }) => {
            const sectionData = model.sections[sectionItem.type];
            const isBreak = sectionData?.isBreakSection;
            if (isBreak) parentIds = [];

            const sectionId = sectionItem.id;
            const children = sectionChildren?.[sectionId];

            const parentId = parentIds[parentIds.length - 1] || 0;
            treeArray.push({
              id: sectionId,
              parent: parentId,
              droppable: false,
              text: replaceAllVariables(
                sectionItem?.label ||
                  sectionItem?.text ||
                  sectionData?.label ||
                  'Seção',
                variables,
              ),
              data: {
                ...clone(sectionItem),
                hasChildren: true,
                children: [],
                section: true,
              },
            });

            if (children) {
              children.forEach((element) => {
                const deep = itemLevelMap[element.type]?.level;
                if (!deep) return;

                const elementData = model.elements[element.type];

                const deepIndex = deep - 1;
                parentIds[deepIndex] = element.id;
                const parentId = (deepIndex && parentIds[deepIndex - 1]) || 0;
                parentIds = parentIds.slice(0, deepIndex + 1);

                if (
                  treeArray[treeArray.length - 1]?.data != undefined &&
                  'section' in (treeArray[treeArray.length - 1] as any).data
                )
                  treeArray[treeArray.length - 1].parent = parentId;

                treeArray.push({
                  id: element.id,
                  parent: parentId,
                  droppable: !!deep && deep < 8,
                  previewText: elementData.label,
                  text: replaceAllVariables(element.text, variables),
                  data: {
                    ...clone(element),
                    element: true,
                  },
                });
              });
            }
          });
        },
      );

      setTreeData(treeArray);
    }
  }, [model]);

  useEffect(() => {
    const data: IDocumentModelData['sections'] = [{ data: [] }];

    const addSection = (section: NodeDocumentModelSectionData) => {
      data[0].data.push(section);

      const index = data[0].data.length - 1;
      data[0].data[index].children = [];
    };

    const addChildren = (child: NodeDocumentModelElementData) => {
      const index = data[0].data.length - 1;
      data[0].data[index]?.children?.push(child);
    };

    const addNode = (
      item: NodeDocumentModelElementData | NodeDocumentModelSectionData,
    ) => {
      const isSection = 'section' in item;
      if (isSection) {
        addSection(item as NodeDocumentModelSectionData);
        return;
      }
      const isElement = 'element' in item;
      if (isElement) {
        addChildren(item as NodeDocumentModelElementData);
        return;
      }
    };

    const canAddParents: Record<string | number, boolean> = { 0: true };
    const pendingItems: Record<
      string | number,
      (NodeDocumentModelSectionData | NodeDocumentModelElementData)[]
    > = {};

    treeData.forEach((item) => {
      const canAdd = canAddParents[item.parent];
      if (canAdd) {
        canAddParents[item.id] = true;
        addNode(item.data);

        const pending = pendingItems[item.id];
        if (pending) pending.forEach((itemData) => addNode(itemData));
      } else {
        if (!pendingItems[item.parent]) pendingItems[item.parent] = [];
        pendingItems[item.parent].push(item.data);
      }
    });

    dispatch(setSaveDocument());

    console.log('ok', data);
    console.log(treeData);
    // dispatch(setDocumentModelSections(data));
  }, [treeData, dispatch]);

  const reorderArray = (
    array: NodeDocumentModel[],
    sourceIndex: number,
    targetIndex: number,
  ) => {
    const newArray = [...array];
    const element = newArray.splice(sourceIndex, 1)[0];
    newArray.splice(targetIndex, 0, element);
    return newArray;
  };

  const handleDrop = (newTree: NodeDocumentModel[], e: DropOptions) => {
    const { dragSourceId, dropTargetId, destinationIndex } = e;

    if (
      typeof dragSourceId === 'undefined' ||
      typeof dropTargetId === 'undefined'
    )
      return;
    const start = treeData.find((v) => v.id === dragSourceId);
    const end = treeData.find((v) => v.id === dropTargetId);

    if (
      start?.parent === dropTargetId &&
      start &&
      typeof destinationIndex === 'number'
    ) {
      setTreeData((treeData) => {
        const output = reorderArray(
          treeData,
          treeData.indexOf(start),
          destinationIndex,
        );
        return output;
      });
    }

    if (
      start?.parent !== dropTargetId &&
      start &&
      typeof destinationIndex === 'number'
    ) {
      if (
        getDescendants(treeData, dragSourceId).find(
          (el) => el.id === dropTargetId,
        ) ||
        dropTargetId === dragSourceId ||
        (end && !end?.droppable)
      )
        return;
      setTreeData((treeData) => {
        const output = reorderArray(
          treeData,
          treeData.indexOf(start),
          destinationIndex,
        );

        const outputCopy = clone(output);
        const movedElement = outputCopy.find((el) => el.id === dragSourceId);
        if (movedElement) movedElement.parent = dropTargetId;
        return outputCopy;
      });
    }
  };

  const handleSelect = (node: NodeDocumentModel) =>
    dispatch(setDocumentSelectItem(node));

  return { treeData, setTreeData, dispatch, handleDrop, handleSelect };
};
