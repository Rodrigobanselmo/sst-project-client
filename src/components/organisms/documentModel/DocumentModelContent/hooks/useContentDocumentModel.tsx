import { useMemo } from 'react';

import clone from 'clone';
import { selectDocumentSelectItem } from 'store/reducers/document/documentSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import { ITypeDocumentModel } from '../types/types';
import { getModelSectionsBySelectedItem } from '../utils/getModelBySelectedItem';

export const useContentDocumentModel = ({
  model,
}: {
  model: IDocumentModelFull | undefined;
}) => {
  const selectedItem = useAppSelector(selectDocumentSelectItem);

  const data = useMemo(() => {
    if (model && selectedItem) {
      const arrayData: ITypeDocumentModel[] = [];
      const isSection =
        selectedItem && selectedItem.data && 'section' in selectedItem.data;
      const modelSections = getModelSectionsBySelectedItem(model, selectedItem);

      (modelSections || []).forEach((sectionItem, index) => {
        if (!sectionItem) return;
        const children = sectionItem?.children;

        if ((!isSection && index != 0) || isSection)
          arrayData.push({
            ...clone(sectionItem),
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
  }, [model, selectedItem]);

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
