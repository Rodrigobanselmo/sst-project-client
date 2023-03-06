import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'react-redux';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';
import {
  IDocumentSlice,
  setDocumentModel,
} from 'store/reducers/document/documentSlice';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';
import { useMutCreateDocumentModel } from 'core/services/hooks/mutations/manager/document-model/useMutCreateDocumentModel/useMutCreateDocumentModel';
import { useMutUpdateDocumentModel } from 'core/services/hooks/mutations/manager/document-model/useMutUpdateDocumentModel/useMutUpdateDocumentModel';
import { useQueryDocumentModel } from 'core/services/hooks/queries/useQueryDocumentModel/useQueryDocumentModel';
import { useQueryDocumentModelData } from 'core/services/hooks/queries/useQueryDocumentModelData/useQueryDocumentModelData';

import { initialBlankState } from '../../ModalBlank/ModalBlank';

export const initialEditDocumentModelState = {
  id: 0,
  title: 'Modelo do Documento',
  companyId: undefined as string | undefined,
  copyFromId: undefined as number | undefined,
  copyFrom: undefined as IDocumentModel | undefined,
  name: undefined as string | undefined,
  description: undefined as string | undefined,
  type: undefined as DocumentTypeEnum | undefined,
  isChanged: false,
  status: StatusEnum.ACTIVE as StatusEnum | undefined,
};

const modalName = ModalEnum.DOCUMENT_MODEL_EDIT_DATA;

export const useEditDocumentModel = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const dispatch = useAppDispatch();
  const store = useStore();
  const initialDataRef = useRef(initialEditDocumentModelState);
  const { onStackOpenModal } = useModal();
  const { preventDelete } = usePreventAction();

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialEditDocumentModelState,
  });

  const isEdit = !!data.id;

  const createMutation = useMutCreateDocumentModel();
  const updateMutation = useMutUpdateDocumentModel();

  const { data: model, isLoading: isLoadingModel } = useQueryDocumentModel(
    data.id,
    {
      companyId: data.companyId,
    },
  );

  const { data: modelData, isLoading } = useQueryDocumentModelData({
    id: data.id,
    companyId: data.companyId,
  });

  useEffect(() => {
    const needSynchronization = (store.getState().document as IDocumentSlice)
      .needSynchronization;

    const setDocument = () => {
      dispatch(setDocumentModel(modelData || null));
    };

    if (!needSynchronization) {
      setDocument();
    } else {
      onStackOpenModal(ModalEnum.MODAL_BLANK, {
        handleOnCloseWithoutSelect: true,
        closeButtonText: 'Não salvar',
        submitButtonText: 'Continuar editando',
        // onSelect:, //!
        onCloseWithoutSelect: () => {
          preventDelete(
            setDocument,
            'Essa ação é permanente, caso continue os dados não salvos seram perdidos para sempre',
            { confirmCancel: 'Voltar', confirmText: 'Confirmar sem salvar' },
          );
        },
        content: (data: any) => (
          <Box>
            <SText>
              Você possui mudanças no documento {'X'} que não foram salvas.
            </SText>
            <SText>Deseja continuar de onde parou?</SText>
          </Box>
        ),
      } as Partial<typeof initialBlankState>);
    }
  }, [dispatch, modelData, onStackOpenModal, preventDelete, store]);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEditDocumentModelState>>(modalName);

    if (initialData && !(initialData as any).passBack) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
          ...model,
        };

        initialDataRef.current = newData;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData, model]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setData(initialEditDocumentModelState);
  };

  const onCloseUnsaved = (action?: () => void) => {
    if (
      preventUnwantedChanges(
        { isChanged: false },
        { isChanged: data.isChanged },
        onClose,
      )
    )
      return;
    onClose();
    action?.();
  };

  const setChangedState = () => {
    if (data.isChanged)
      setData((d) => ({
        ...d,
        isChanged: true,
      }));
  };

  return {
    registerModal,
    onClose: onCloseUnsaved,
    data,
    setData,
    loading:
      isLoading ||
      isLoadingModel ||
      createMutation.isLoading ||
      updateMutation.isLoading,
    modalName,
    model: modelData,
    isEdit,
    updateMutation,
    createMutation,
    setChangedState,
    dispatch,
  };
};

export type IUseDocumentModel = ReturnType<typeof useEditDocumentModel>;
