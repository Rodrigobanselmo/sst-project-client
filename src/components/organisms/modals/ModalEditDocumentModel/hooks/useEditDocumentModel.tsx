import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'react-redux';

import { Box } from '@mui/material';
import clone from 'clone';
import SText from 'components/atoms/SText';
import { parseInlineStyleText } from 'components/organisms/documentModel/utils/parseInlineStyleText';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';
import {
  IDocumentSlice,
  setDocumentModalEditData,
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
  isChanged: true,
  sync: false,
  status: StatusEnum.ACTIVE as StatusEnum | undefined,
};

const modalName = ModalEnum.DOCUMENT_MODEL_EDIT_DATA;

export const useEditDocumentModel = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const dispatch = useAppDispatch();
  const store = useStore<any>();
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
    if (modelData) {
      const needSynchronization = (store.getState().document as IDocumentSlice)
        .needSynchronization;
      const modalEditData = (store.getState().document as IDocumentSlice)
        .modalEditData;

      const setDocument = () => {
        //! edit document **
        const modelDataClone = clone(modelData);
        modelDataClone.document.sections = modelDataClone.document.sections.map(
          (_section) => {
            const section = clone(_section);
            if (section.children) {
              Object.keys(section.children).forEach((key) => {
                if (!section?.children?.[key]) return;

                section.children[key] = section.children[key].map((_child) => {
                  const child = clone(_child);
                  if (child?.text) {
                    child.text = child.text
                      .split('\n')
                      .map((text, index) => {
                        const out = parseInlineStyleText(text);

                        if (out.inlineEntity.length) {
                          if (!child.entityRangeBlock)
                            child.entityRangeBlock = [];
                          if (!child.entityRangeBlock?.[index])
                            child.entityRangeBlock[index] = [];

                          child.entityRangeBlock[index] = [
                            ...out.inlineEntity,
                            ...child.entityRangeBlock[index],
                          ];
                        }

                        if (out.inlineStyle.length) {
                          if (!child.inlineStyleRangeBlock)
                            child.inlineStyleRangeBlock = [];
                          if (!child.inlineStyleRangeBlock?.[index])
                            child.inlineStyleRangeBlock[index] = [];

                          child.inlineStyleRangeBlock[index] = [
                            ...out.inlineStyle,
                            ...child.inlineStyleRangeBlock[index],
                          ];
                        }

                        return out.text;
                      })
                      .join('\n');
                  }
                  return child;
                });
              });
            }

            return section;
          },
        );
        //! edit document **
        dispatch(setDocumentModel(modelDataClone.document || null));
        dispatch(setDocumentModalEditData(initialDataRef.current));
      };

      const onContinueOldDocument = () => {
        setData((data) => ({ ...data, sync: true, ...modalEditData }));
      };

      if (!needSynchronization) {
        setDocument();
      } else {
        if (!data.sync)
          onStackOpenModal(ModalEnum.MODAL_BLANK, {
            handleOnCloseWithoutSelect: true,
            title: 'Atenção',
            closeButtonText: 'Não salvar',
            submitButtonText: 'Continuar editando',
            onSelect: onContinueOldDocument,
            onCloseWithoutSelect: (onClose) => {
              preventDelete(
                () => {
                  setDocument();
                  onClose?.();
                },
                'Essa ação é permanente, caso continue os dados não salvos seram perdidos para sempre',
                {
                  confirmCancel: 'Voltar',
                  confirmText: 'Confirmar sem salvar',
                },
              );
            },
            content: (data: any) => (
              <Box>
                <SText>
                  Você possui mudanças no documento{' '}
                  <span style={{ fontWeight: 'bold' }}>
                    {modalEditData.name} ({modalEditData.type})
                  </span>{' '}
                  que não foram salvas.
                </SText>
                <SText>Deseja continuar de onde parou?</SText>
              </Box>
            ),
          } as Partial<typeof initialBlankState>);
      }
    }
  }, [data.sync, dispatch, modelData, onStackOpenModal, preventDelete, store]);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEditDocumentModelState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
          ...model,
        };
        const needSynchronization = (
          store.getState().document as IDocumentSlice
        ).needSynchronization;

        initialDataRef.current = newData;

        if (!needSynchronization) dispatch(setDocumentModalEditData(newData));
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
    if (!data.isChanged)
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
