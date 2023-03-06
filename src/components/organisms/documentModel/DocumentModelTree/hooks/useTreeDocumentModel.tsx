import { useEffect, useState } from 'react';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import { replaceAllVariables } from '../../utils/replaceAllVariables';
import { itemLevelMap } from '../constants/item-types.map';
import { NodeDocumentModel } from '../types/types';

export const useTreeDocumentModel = (model: IDocumentModelFull | undefined) => {
  const [treeData, setTreeData] = useState<NodeDocumentModel[]>([]);

  useEffect(() => {
    if (model) {
      const treeArray: NodeDocumentModel[] = [];
      const variables = { ...model.variables, ...model.document.variables };

      model.document.sections.forEach(
        ({ children: sectionChildren, ...section }) => {
          let parentIds: string[] = [];

          section.data.forEach((sectionItem) => {
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
                ...sectionItem,
                ...(children && { children: [] }),
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
                    ...element,
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

  return { treeData, setTreeData };
};
