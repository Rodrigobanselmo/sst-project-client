/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWizard } from 'react-use-wizard';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { IQueryDocumentModelData } from 'core/services/hooks/queries/useQueryDocumentModelData/useQueryDocumentModelData';
import { useStore } from 'react-redux';
import {
  IDocumentSlice,
  setSaveDocument,
} from 'store/reducers/document/documentSlice';
import { IUseDocumentModel } from '../../../hooks/useEditDocumentModel';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';

export const useDataStep = (props: IUseDocumentModel) => {
  const { onClose, data } = props;
  const store = useStore();

  const { stepCount, goToStep, previousStep } = useWizard();
  const onCloseUnsaved = async () => {
    onClose(() => null);
  };
  const dispatch = useAppDispatch();

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    const modelData = (store.getState().document as IDocumentSlice).model;
    if (!modelData) return;

    const query: IQueryDocumentModelData = {
      id: data.id,
      companyId: data.companyId,
    };

    props.updateMutation
      .mutateAsync({
        id: data.id,
        data: modelData,
        companyId: data.companyId,
      })
      .then(() => {
        dispatch(setSaveDocument());
        queryClient.setQueryData(
          [QueryEnum.DOCUMENT_MODEL_DATA, query],
          (oldData: any) => {
            return { ...oldData, document: modelData };
          },
        );
      })
      .catch(() => null);
  };

  return {
    ...props,
    onSubmit,
    onCloseUnsaved,
    lastStep,
    previousStep,
  };
};

export type IUseData = ReturnType<typeof useDataStep>;
