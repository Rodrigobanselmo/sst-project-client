import { useMemo, useState } from 'react';

import { DocumentTypeEnum } from 'project/enum/document.enums';
import {
  selectDocumentSelectItem,
  setDocumentSelectItem,
} from 'store/reducers/document/documentSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import {
  IDocumentModelFull,
  IDocumentModelElement,
  IDocumentModelGroup,
} from 'core/interfaces/api/IDocumentModel';

import { NodeDocumentModel } from '../../DocumentModelTree/types/types';
import { itemLevelMap } from '../constants/item-types.map';
import { ITypeDocumentModel } from '../types/types';

export const useContentDocumentModel = ({
  model,
}: {
  model: IDocumentModelFull | undefined;
}) => {
  const selectedItem = useAppSelector(selectDocumentSelectItem);

  const modelSectionsFilter = useMemo(() => {
    if (model) {
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
    }
  }, [selectedItem, model]);

  const data = useMemo(() => {
    if (modelSectionsFilter) {
      const arrayData: ITypeDocumentModel[] = [];

      const isSection =
        selectedItem && selectedItem.data && 'section' in selectedItem.data;

      modelSectionsFilter.forEach((sectionItem) => {
        if (!sectionItem) return;
        const children = sectionItem?.children;

        if (isSection)
          arrayData.push({
            ...sectionItem,
            section: true,
          });

        if (children) {
          children.forEach((element) => {
            arrayData.push({
              ...element,
              element: true,
            });
          });
        }
      });

      return arrayData;
    }
  }, [modelSectionsFilter, selectedItem]);

  // const data2 = useMemo(() => {
  //   if (model) {
  //     const arrayData: ITypeDocumentModel[] = [];
  //     const isSection =
  //       selectedItem && selectedItem.data && 'section' in selectedItem.data;
  //     const isElement =
  //       selectedItem && selectedItem.data && 'element' in selectedItem.data;

  //     let actualDeep = 0;
  //     let startToAdd = false;
  //     let stopToAdd = false;

  //     model.document.sections.forEach(
  //       ({ children: sectionChildren, ...section }) => {
  //         if (stopToAdd) return;
  //         section.data.forEach((sectionItem) => {
  //           if (stopToAdd) return;
  //           const sectionId = sectionItem.id;

  //           if (isSection && sectionId != selectedItem.id && !startToAdd)
  //             return;
  //           if (isSection && sectionId == selectedItem.id) startToAdd = true;
  //           if (isSection && sectionId != selectedItem.id && startToAdd) {
  //             stopToAdd = true;
  //             return;
  //           }

  //           const children = sectionChildren?.[sectionId];

  //           if (startToAdd)
  //             arrayData.push({
  //               ...sectionItem,
  //               section: true,
  //             });

  //           if (children) {
  //             children.forEach((element) => {
  //               const elementId = element.id;
  //               const deep = itemLevelMap[element.type]?.level;

  //               // eslint-disable-next-line prettier/prettier
  //             if (isElement && elementId != selectedItem.id && !startToAdd)  return;
  //               if (isElement && elementId == selectedItem.id) {
  //                 startToAdd = true;
  //                 actualDeep = deep;
  //               }
  //               // eslint-disable-next-line prettier/prettier
  //             if (isElement && elementId !== selectedItem.id && deep === actualDeep && startToAdd) {
  //                 stopToAdd = true;
  //                 return;
  //               }

  //               if (startToAdd)
  //                 arrayData.push({
  //                   ...element,
  //                   element: true,
  //                 });
  //             });
  //           }
  //         });
  //       },
  //     );

  //     return arrayData;
  //   }
  // }, [selectedItem, model]);

  const variables = useMemo(() => {
    if (model) {
      return { ...model.variables, ...model.document.variables };
    }
  }, [model]);

  const elements = useMemo(() => {
    if (model) {
      return model.elements;
    }
  }, [model]);

  const sections = useMemo(() => {
    if (model) {
      return model.sections;
    }
  }, [model]);

  return { data, variables, elements, sections };
};
