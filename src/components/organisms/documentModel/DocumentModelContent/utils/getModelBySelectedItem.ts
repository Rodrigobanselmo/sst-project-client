import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import { NodeDocumentModel } from '../../DocumentModelTree/types/types';
import { itemLevelMap } from '../constants/item-types.map';

export const getModelSectionsBySelectedItem = (
  model: IDocumentModelFull,
  selectedItem: NodeDocumentModel,
) => {
  const isSection =
    selectedItem && selectedItem.data && 'section' in selectedItem.data;
  const isElement =
    selectedItem && selectedItem.data && 'element' in selectedItem.data;

  let actualDeep = 0;
  let startToAdd = false;
  let stopToAdd = false;

  const sectionsData = model.document.sections
    .map(({ children: sectionChildren, ...section }) => {
      if (stopToAdd) return false;
      const data = section.data.map((sectionItem) => {
        if (stopToAdd) return false;
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
            const elementId = element.id;
            const deep = itemLevelMap[element.type]?.level;

            // eslint-disable-next-line prettier/prettier
              if (isElement && elementId != selectedItem.id && !startToAdd)  return false;
            if (isElement && elementId == selectedItem.id) {
              startToAdd = true;
              actualDeep = deep;
            }
            // eslint-disable-next-line prettier/prettier
              if (isElement && elementId !== selectedItem.id && deep === actualDeep && startToAdd) {
              stopToAdd = true;
              return false;
            }

            if (startToAdd) return true;
            return false;
          });
        }

        if (startToAdd)
          return {
            ...sectionItem,
            ...(children && { children }),
          };

        return false;
      });

      if (startToAdd) return data.filter((i) => i);
      return false;
    })
    .find((i) => i);

  return sectionsData;
};
