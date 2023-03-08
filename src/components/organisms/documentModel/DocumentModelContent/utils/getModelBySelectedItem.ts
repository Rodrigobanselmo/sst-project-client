import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import { NodeDocumentModel } from '../../DocumentModelTree/types/types';
import { itemLevelMap } from '../constants/item-types.map';

export const getModelSectionsBySelectedItem = (
  document: IDocumentModelFull['document'],
  sections: IDocumentModelFull['sections'],
  selectedItem: NodeDocumentModel,
) => {
  const isSection =
    selectedItem && selectedItem.data && 'section' in selectedItem.data;
  const isElement =
    selectedItem && selectedItem.data && 'element' in selectedItem.data;

  let actualDeep = 0;
  let startToAdd = false;
  let stopToAdd = false;
  let hasAdded = false;

  const sectionsData = document.sections
    .map(({ children: sectionChildren, ...section }, index) => {
      if (stopToAdd) return false;
      const data = section.data.map((sectionItem) => {
        if (stopToAdd) return false;

        const sectionData = sections[sectionItem.type];
        const isBreak = sectionData?.isBreakSection;

        const sectionId = sectionItem.id;

        if (isSection && sectionId != selectedItem.id && !startToAdd)
          return false;
        if (isSection && sectionId == selectedItem.id) startToAdd = true;
        if (isSection && sectionId != selectedItem.id && startToAdd) {
          stopToAdd = true;
          return false;
        }

        let children = sectionChildren?.[sectionId];

        if (children) {
          children = children.filter((element) => {
            if (stopToAdd) return false;

            const elementId = element.id;
            const deep = itemLevelMap[element.type]?.level;

            // eslint-disable-next-line prettier/prettier
              if (isElement && elementId != selectedItem.id && !startToAdd)  return false;
            if (isElement && elementId == selectedItem.id) {
              startToAdd = true;
              actualDeep = deep;
            }
            // eslint-disable-next-line prettier/prettier
              if (isElement && elementId !== selectedItem.id && deep &&deep <= actualDeep && startToAdd) {
              stopToAdd = true;
              return false;
            }

            if (startToAdd) return true;
            return false;
          });
        }

        const isNotEmptySection =
          Array.isArray(children) && (children as any).length;

        if (startToAdd && isNotEmptySection && !isBreak) {
          hasAdded = true;
          return {
            ...sectionItem,
            sectionIndex: index,
            ...(children && { children }),
          };
        }

        if (startToAdd && isBreak && !hasAdded) {
          hasAdded = true;
          stopToAdd = true;
          return {
            ...sectionItem,
            sectionIndex: index,
          };
        }

        return false;
      });

      if (startToAdd) return data.filter((i) => i);
      return false;
    })
    .find((i) => i);

  return sectionsData;
};
