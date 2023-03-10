import { useCallback, useEffect, useState } from 'react';
import { useStore } from 'react-redux';

import clone from 'clone';
import { DocumentSectionTypeEnum } from 'project/enum/document-model.enum';
import {
  IDocumentSlice,
  selectAllDocumentModel,
  setDocumentModelSections,
  setDocumentSelectItem,
  setSaveDocument,
} from 'store/reducers/document/documentSlice';
import { v4 } from 'uuid';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import {
  IDocumentModelData,
  IDocumentModelFull,
  IDocumentModelSection,
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

  const document = useAppSelector(selectAllDocumentModel);

  const getNewTreeData = useCallback((model: IDocumentModelFull) => {
    const treeArray: NodeDocumentModel[] = [];

    let docVariables = document?.variables as any;

    if (Array.isArray(docVariables)) {
      docVariables = docVariables.reduce(
        (acc, item) => ({ ...acc, [item.type]: item }),
        {} as IDocumentModelFull['variables'],
      );
    }

    const variables = {
      ...model.variables,
      ...docVariables,
    };

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
            ).text,
            data: {
              ...clone(sectionItem),
              ...(children && {
                hasChildren: true,
                children: [],
              }),
              childrenTree: [],
              section: true,
            },
          });

          if (children) {
            children.forEach((element) => {
              const deep = itemLevelMap[element.type]?.level;
              if (!deep) {
                treeArray[treeArray.length - 1].data?.childrenTree?.push({
                  ...element,
                  childrenTree: [],
                  element: true,
                });
                return;
              }

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
                text: replaceAllVariables(element.text, variables).text,
                data: {
                  ...clone(element),
                  childrenTree: [],
                  element: true,
                },
              });
            });
          }
        });
      },
    );

    return treeArray;
  }, []);

  useEffect(() => {
    if (model && document) {
      const treeArray = getNewTreeData({ ...model, document });
      setTreeData(treeArray);
    }
  }, [model, document, getNewTreeData]);

  // const getNewTreeDataFromStore = () => {
  //   const modelRedux = (store.getState().document as IDocumentSlice).model;

  //   if (!modelRedux) return;
  //   if (!model) return;

  //   const newTreeData = getNewTreeData({ ...model, document: modelRedux });
  //   return newTreeData;
  // };

  const parseTreeToModel = (newTreeData: NodeDocumentModel[]) => {
    const data: IDocumentModelData['sections'] = [{ data: [], children: {} }];

    if (!newTreeData) return;

    const addSection = (section: NodeDocumentModelSectionData) => {
      data[0].data.push(section);

      if (section.hasChildren) {
        const index = data[0].data.length - 1;
        data[0].data[index].children = [];

        if (data[0].children) data[0].children[data[0].data[index].id] = [];
      }
    };

    const addChildren = (child: NodeDocumentModelElementData) => {
      let index = data[0].data.length - 1;

      {
        // se não tiver children, quer dizer que coloquei uma section sem children logo apos uma section com children e preciso duplicar a section anterior
        if (!data[0].children?.[data[0].data[index]?.id]) {
          const section = clone(
            data[0].data
              .reverse()
              .find((i) => i.hasChildren || i.children?.length) ||
              ({
                id: '',
                type: DocumentSectionTypeEnum.SECTION,
                hasChildren: true,
                children: [],
              } as IDocumentModelSection),
          );

          section.children = [];
          section.hasChildren = true;
          section.id = v4();

          data[0].data = [...data[0].data, section];

          if (data[0].children) data[0].children[section.id] = [];

          index = data[0].data.length - 1;
        }
      }

      data[0].children?.[data[0].data[index]?.id]?.push(child);
    };

    const selectAdd = (
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

    const addNode = ({
      childrenTree,
      ...item
    }: NodeDocumentModelElementData | NodeDocumentModelSectionData) => {
      selectAdd(item);
      if (childrenTree) {
        childrenTree.forEach((i) => {
          selectAdd(i);
        });
      }
    };

    const canAddParents: Record<string | number, boolean> = { 0: true };
    const pendingItems: Record<
      string | number,
      (NodeDocumentModelSectionData | NodeDocumentModelElementData)[]
    > = {};

    newTreeData;

    const sortedNodes: NodeDocumentModel[] = [];

    const sortByParentNode = (node: NodeDocumentModel) => {
      sortedNodes.push(node);
      const children = newTreeData.filter((n) => n.parent === node.id);
      children.forEach((child) => sortByParentNode(child));
    };

    newTreeData
      .filter((n) => n.parent == 0)
      .forEach((node) => sortByParentNode(node));

    sortedNodes.forEach((item) => {
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
    dispatch(setDocumentModelSections(data));

    return data;
  };

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

    const newTreeData = treeData;
    // const newTreeData = getNewTreeDataFromStore();

    if (!newTreeData) return;

    const start = newTreeData.find((v) => v.id === dragSourceId);
    const endIndex = newTreeData.findIndex((v) => v.id === dropTargetId);
    const end = newTreeData[endIndex];

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
        parseTreeToModel(output);
        return output;
      });
    }

    if (
      start?.parent !== dropTargetId &&
      start &&
      typeof destinationIndex === 'number'
    ) {
      if (
        getDescendants(newTreeData, dragSourceId).find(
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
        parseTreeToModel(outputCopy);
        return outputCopy;
      });
    }
  };

  const handleSelect = (node: NodeDocumentModel) =>
    dispatch(setDocumentSelectItem(node));

  return { treeData, setTreeData, dispatch, handleDrop, handleSelect };
};
