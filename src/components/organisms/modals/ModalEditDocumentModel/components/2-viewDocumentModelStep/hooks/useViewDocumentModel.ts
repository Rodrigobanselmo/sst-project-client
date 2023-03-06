import { useStore } from 'react-redux';

import { getModelSectionsBySelectedItem } from 'components/organisms/documentModel/DocumentModelContent/utils/getModelBySelectedItem';
import {
  IDocumentSlice,
  setSaveDocument,
} from 'store/reducers/document/documentSlice';

import { QueryEnum } from 'core/enums/query.enums';
import { useMutPreviewDocumentModel } from 'core/services/hooks/mutations/checklist/documentData/useMutPreviewDocumentModel/useMutPreviewDocumentModel';
import { IQueryDocumentModelData } from 'core/services/hooks/queries/useQueryDocumentModelData/useQueryDocumentModelData';
import { queryClient } from 'core/services/queryClient';

import { IUseDocumentModel } from '../../../hooks/useEditDocumentModel';

export const useViewDocumentModel = (props: IUseDocumentModel) => {
  const { onClose, data, dispatch, model } = props;
  const store = useStore();
  const downloadPreview = useMutPreviewDocumentModel();

  const onCloseUnsaved = async () => {
    onClose();
  };

  const onDownloadPreview = async () => {
    const selectedItem = (store.getState().document as IDocumentSlice)
      .selectItem;
    if (data.type && model && selectedItem) {
      const modelSections = getModelSectionsBySelectedItem(model, selectedItem);

      if (modelSections) {
        downloadPreview
          .mutateAsync({
            type: data.type,
            companyId: data.companyId,
            data: {
              ...model?.document,
              sections: [{ data: modelSections as any }],
            },
          })
          .catch(() => null);
      }
    }
  };

  const onSubmit = async () => {
    const model = (store.getState().document as IDocumentSlice).model;
    const query: IQueryDocumentModelData = {
      id: data.id,
      companyId: data.companyId,
    };

    queryClient.setQueryData(
      [QueryEnum.DOCUMENT_MODEL_DATA, query],
      (oldData: any) => {
        return { ...oldData, document: model?.document };
      },
    );

    props.updateMutation
      .mutateAsync({
        id: data.id,
        data: model?.document,
        companyId: data.companyId,
      })
      .then(() => {
        dispatch(setSaveDocument());
      })
      .catch(() => null);
  };

  return {
    ...props,
    onSubmit,
    onCloseUnsaved,
    onDownloadPreview,
    downlandLoading: downloadPreview.isLoading,
    saveLoading: props.updateMutation.isLoading,
  };
};

export type IUseViewDocumentModel = ReturnType<typeof useViewDocumentModel>;
