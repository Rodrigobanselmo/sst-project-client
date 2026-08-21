import { useState } from 'react';
import { useStore } from 'react-redux';

import { getModelSectionsBySelectedItem } from 'components/organisms/documentModel/DocumentModelContent/utils/getModelBySelectedItem';
import { IDocumentSlice } from 'store/reducers/document/documentSlice';

import { useMutPreviewDocumentModel } from 'core/services/hooks/mutations/checklist/documentData/useMutPreviewDocumentModel/useMutPreviewDocumentModel';

import { IUseDocumentModel } from '../../../hooks/useEditDocumentModel';

export const useViewDocumentModel = (props: IUseDocumentModel) => {
  const { onClose, data, persistDocumentModel, closeEditor, model } = props;
  const store = useStore<any>();
  const downloadPreview = useMutPreviewDocumentModel();
  const [saveIntent, setSaveIntent] = useState<'stay' | 'exit' | null>(null);

  const onCloseUnsaved = async () => {
    onClose();
  };

  const onDownloadPreview = async () => {
    const selectedItem = (store.getState().document as IDocumentSlice)
      .selectItem;

    const modelDocument = (store.getState().document as IDocumentSlice).model;
    if (data.type && modelDocument && model && selectedItem) {
      const modelSections = getModelSectionsBySelectedItem(
        modelDocument,
        model.sections,
        selectedItem,
      );

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

  const runPersist = async (intent: 'stay' | 'exit') => {
    setSaveIntent(intent);
    const ok = await persistDocumentModel();
    if (ok && intent === 'exit') {
      closeEditor();
      return;
    }
    setSaveIntent(null);
  };

  const onSubmit = async () => {
    await runPersist('stay');
  };

  const onSubmitAndExit = async () => {
    await runPersist('exit');
  };

  const saveBusy = props.updateMutation.isLoading || saveIntent !== null;

  return {
    ...props,
    onSubmit,
    onSubmitAndExit,
    onCloseUnsaved,
    onDownloadPreview,
    downlandLoading: downloadPreview.isLoading,
    saveLoading: saveIntent === 'stay',
    saveAndExitLoading: saveIntent === 'exit',
    saveBusy,
  };
};

export type IUseViewDocumentModel = ReturnType<typeof useViewDocumentModel>;
