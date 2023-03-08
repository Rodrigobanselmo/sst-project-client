import { useMemo } from 'react';

import clone from 'clone';
import {
  selectAllDocumentModel,
  selectDocumentSelectItem,
  setDocumentDeleteMany,
} from 'store/reducers/document/documentSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import { ITypeDocumentModel } from '../types/types';
import { getModelSectionsBySelectedItem } from '../utils/getModelBySelectedItem';

export const useContentDocumentModel = ({
  model: modelQuery,
}: {
  model: IDocumentModelFull | undefined;
}) => {
  const selectedItem = useAppSelector(selectDocumentSelectItem);
  const document = useAppSelector(selectAllDocumentModel);
  const dispatch = useAppDispatch();

  const data = useMemo(() => {
    if (modelQuery && document && selectedItem) {
      const arrayData: ITypeDocumentModel[] = [];

      const isSection =
        selectedItem && selectedItem.data && 'section' in selectedItem.data;
      const modelSections = getModelSectionsBySelectedItem(
        document,
        modelQuery.sections,
        selectedItem,
      );

      let lastSection: any = {};
      (modelSections || []).forEach((sectionItem, index) => {
        if (!sectionItem) return;
        const children = sectionItem?.children;

        if (isSection) lastSection = sectionItem;

        if ((!isSection && index != 0) || isSection)
          arrayData.push({
            ...sectionItem,
            section: true,
          });

        if (children) {
          children.forEach((element) => {
            arrayData.push({
              ...element,
              sectionId: lastSection.id,
              sectionIndex: lastSection.sectionIndex,
              element: true,
            });
          });
        }
      });

      return arrayData;
    }
  }, [modelQuery, selectedItem, document]);

  const variables = useMemo(() => {
    if (modelQuery && document) {
      return {
        ...modelQuery.variables,
        ...modelQuery.document.variables,
        ...document.variables,
      };
    }
  }, [modelQuery, document]);

  const elements = useMemo(() => {
    if (modelQuery) {
      return modelQuery.elements;
    }
  }, [modelQuery]);

  const sections = useMemo(() => {
    if (modelQuery) {
      return modelQuery.sections;
    }
  }, [modelQuery]);

  const handleDeleteActualItems = () => {
    if (data)
      dispatch(setDocumentDeleteMany({ ids: data.map((item) => item.id) }));
  };

  return { data, variables, elements, sections, handleDeleteActualItems };
};
