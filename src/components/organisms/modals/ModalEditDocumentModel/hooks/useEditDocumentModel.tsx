import { useEffect, useRef, useState } from 'react';
import { useStore } from 'react-redux';

import { Box } from '@mui/material';
import clone from 'clone';
import SText from 'components/atoms/SText';
import { rememberCanonicalBackup } from 'components/organisms/documentModel/editor-v2/integration/document-editor-v2-backup';
import { logV2PersistDiff } from 'components/organisms/documentModel/editor-v2/integration/document-editor-v2-controlled-save';
import { useDocumentEditorV2Session } from 'components/organisms/documentModel/editor-v2/integration/DocumentEditorV2Session';
import { DOCUMENT_EDITOR_V2_DISCARD_MODAL } from 'components/organisms/documentModel/editor-v2/integration/document-editor-v2-notices';
import {
  createV2SaveGuardSession,
  resolveOfficialSaveAttempt,
  shouldRebaseOfficialDocument,
} from 'components/organisms/documentModel/editor-v2/integration/document-editor-v2-save-guard';
import { useSnackbar } from 'notistack';
import { parseInlineStyleText } from 'components/organisms/documentModel/utils/parseInlineStyleText';
import {
  DocumentModelClassificationEnum,
  filterClassificationsForDocumentType,
  normalizeDocumentModelClassifications,
} from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';
import {
  IDocumentSlice,
  setDocumentModalEditData,
  setDocumentModel,
  setDocumentModelUpdatedAt,
  setSaveDocument,
} from 'store/reducers/document/documentSlice';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  IDocumentModel,
  IDocumentModelData,
  IDocumentModelFull,
} from 'core/interfaces/api/IDocumentModel';
import { useMutCreateDocumentModel } from 'core/services/hooks/mutations/manager/document-model/useMutCreateDocumentModel/useMutCreateDocumentModel';
import { useMutUpdateDocumentModel } from 'core/services/hooks/mutations/manager/document-model/useMutUpdateDocumentModel/useMutUpdateDocumentModel';
import { useMutDeleteDocumentModel } from 'core/services/hooks/mutations/manager/document-model/useMutDeleteDocumentModel/useMutDeleteDocumentModel';
import {
  queryDocumentModel as fetchDocumentModelMeta,
  useQueryDocumentModel,
} from 'core/services/hooks/queries/useQueryDocumentModel/useQueryDocumentModel';
import {
  IQueryDocumentModelData,
  queryDocumentModel as fetchDocumentModelData,
  useQueryDocumentModelData,
} from 'core/services/hooks/queries/useQueryDocumentModelData/useQueryDocumentModelData';
import { queryClient } from 'core/services/queryClient';

import {
  DOCUMENT_MODEL_DISCARD_MODAL,
  DocumentModelDirtySnapshot,
  DocumentModelDirtySource,
  getDocumentModelDirtySnapshot,
  isDocumentModelEditorDirty,
  mergeDocumentModelDirtySnapshot,
} from '../helpers/document-model-dirty';
import { DocumentModelConflictContent } from '../helpers/DocumentModelConflictContent';
import {
  DOCUMENT_MODEL_CONFLICT_TITLE,
  getExpectedUpdatedAtFromDocumentState,
  isDocumentModelConflict,
  toOpaqueDocumentModelUpdatedAt,
} from '../helpers/document-model-optimistic-lock';

import { initialBlankState } from '../../ModalBlank/ModalBlank';

const hydrateOfficialDocument = (modelData: IDocumentModelFull) => {
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
                    if (!child.entityRangeBlock) child.entityRangeBlock = [];
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

  return modelDataClone.document || null;
};

export const initialEditDocumentModelState = {
  id: 0,
  title: 'Modelo do Documento',
  companyId: undefined as string | undefined,
  copyFromId: undefined as number | undefined,
  copyFrom: undefined as IDocumentModel | undefined,
  /** Tipo escolhido no fluxo “copiar de outro tipo”. */
  copyFromOtherType: undefined as DocumentTypeEnum | undefined,
  name: undefined as string | undefined,
  description: undefined as string | undefined,
  type: undefined as DocumentTypeEnum | undefined,
  isChanged: false,
  sync: false,
  status: StatusEnum.ACTIVE as StatusEnum | undefined,
  classifications: [] as DocumentModelClassificationEnum[],
};

/** Metadados do modelo enviados em todo PATCH (status + classificações). */
export const getDocumentModelMetadataPatch = (data: {
  id: number;
  companyId?: string;
  status?: StatusEnum;
  classifications?: DocumentModelClassificationEnum[];
}) => ({
  id: data.id,
  companyId: data.companyId,
  ...(data.status != null ? { status: data.status } : {}),
  classifications: normalizeDocumentModelClassifications(data.classifications),
});

const modalName = ModalEnum.DOCUMENT_MODEL_EDIT_DATA;

export const useEditDocumentModel = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const dispatch = useAppDispatch();
  const store = useStore<any>();
  const documentDirty = useAppSelector(
    (state) => state.document.needSynchronization,
  );
  const initialDataRef = useRef(initialEditDocumentModelState);
  const metadataBaselineRef = useRef<DocumentModelDirtySnapshot | null>(null);
  const { onStackOpenModal } = useModal();
  const { preventDelete, preventDiscardIf } = usePreventAction();
  const { enqueueSnackbar } = useSnackbar();
  const v2Session = useDocumentEditorV2Session();

  const [data, setData] = useState({
    ...initialEditDocumentModelState,
  });

  const isEdit = !!data.id;

  const createMutation = useMutCreateDocumentModel();
  const updateMutation = useMutUpdateDocumentModel();
  const deleteMutation = useMutDeleteDocumentModel();

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

  const officialUpdatedAtRef = useRef<string | null>(null);

  useEffect(() => {
    const incoming = toOpaqueDocumentModelUpdatedAt(model?.updated_at);
    officialUpdatedAtRef.current = incoming;
    const existing = (store.getState().document as IDocumentSlice)
      .documentModelUpdatedAt;
    if (!existing && incoming) {
      dispatch(setDocumentModelUpdatedAt(incoming));
    }
  }, [dispatch, model?.updated_at, store]);

  useEffect(() => {
    if (modelData) {
      const needSynchronization = (store.getState().document as IDocumentSlice)
        .needSynchronization;
      const modalEditData = (store.getState().document as IDocumentSlice)
        .modalEditData;

      const setDocument = () => {
        dispatch(setDocumentModel(hydrateOfficialDocument(modelData)));
        dispatch(setDocumentModalEditData(initialDataRef.current));
        const token = officialUpdatedAtRef.current;
        if (token) dispatch(setDocumentModelUpdatedAt(token));
      };

      const onContinueOldDocument = () => {
        setData((data) => ({ ...data, sync: true, ...modalEditData }));
      };

      if (!needSynchronization) {
        if (
          shouldRebaseOfficialDocument({
            v2LocalDirty: v2Session.v2LocalDirty,
          })
        ) {
          setDocument();
        }
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
  }, [
    data.sync,
    dispatch,
    modelData,
    onStackOpenModal,
    preventDelete,
    store,
    v2Session.v2LocalDirty,
  ]);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEditDocumentModelState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
          ...model,
          classifications: filterClassificationsForDocumentType(
            normalizeDocumentModelClassifications(
              model?.classifications ?? initialData?.classifications,
            ),
            model?.type ?? initialData?.type,
          ),
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

  useEffect(() => {
    if (metadataBaselineRef.current) return;

    if (model?.id) {
      metadataBaselineRef.current = getDocumentModelDirtySnapshot({
        name: model.name,
        description: model.description,
        type: model.type,
        status: model.status,
        classifications: model.classifications,
      });
      return;
    }

    if (!data.id && (data.companyId || data.type)) {
      metadataBaselineRef.current = getDocumentModelDirtySnapshot(data);
    }
  }, [data, model]);

  const isPersisting =
    createMutation.isLoading ||
    updateMutation.isLoading ||
    deleteMutation.isLoading;

  const isDirty = isDocumentModelEditorDirty({
    current: getDocumentModelDirtySnapshot(data),
    baseline: metadataBaselineRef.current,
    documentDirty,
  });

  const closeEditor = (closeData?: any) => {
    onCloseModal(modalName, closeData);
    setData(initialEditDocumentModelState);
    metadataBaselineRef.current = null;
    officialUpdatedAtRef.current = null;
    dispatch(setDocumentModelUpdatedAt(null));
  };

  const markPersisted = (partial: Partial<DocumentModelDirtySource>) => {
    metadataBaselineRef.current = mergeDocumentModelDirtySnapshot(
      metadataBaselineRef.current,
      partial,
    );
  };

  const reloadOfficialDocument = async () => {
    if (!data.id || !data.companyId) return;

    try {
      const meta = await fetchDocumentModelMeta(data.id, {
        companyId: data.companyId,
      });
      const full = await fetchDocumentModelData({
        id: data.id,
        companyId: data.companyId,
      });
      if (!meta || !full) {
        enqueueSnackbar('Não foi possível carregar a versão mais recente.', {
          variant: 'error',
        });
        return;
      }

      const nextToken = toOpaqueDocumentModelUpdatedAt(meta.updated_at);
      officialUpdatedAtRef.current = nextToken;
      queryClient.setQueryData(
        [QueryEnum.DOCUMENT_MODEL, data.id, { companyId: data.companyId }],
        meta,
      );
      queryClient.setQueryData(
        [QueryEnum.DOCUMENT_MODEL_DATA, { id: data.id, companyId: data.companyId }],
        full,
      );
      dispatch(setDocumentModel(hydrateOfficialDocument(full)));
      dispatch(setDocumentModelUpdatedAt(nextToken));
      dispatch(setSaveDocument());
      v2Session.discardLocalEdits();
      markPersisted({
        name: meta.name,
        description: meta.description,
        type: meta.type,
        status: meta.status,
        classifications: meta.classifications,
      });
      setData((old) => ({
        ...old,
        name: meta.name,
        description: meta.description,
        type: meta.type,
        status: meta.status,
        classifications: filterClassificationsForDocumentType(
          normalizeDocumentModelClassifications(meta.classifications),
          meta.type,
        ),
      }));
    } catch {
      enqueueSnackbar('Não foi possível carregar a versão mais recente.', {
        variant: 'error',
      });
    }
  };

  const closeConflictAlert = () => {
    onCloseModal(ModalEnum.MODAL_BLANK);
  };

  const showDocumentModelConflict = () => {
    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      title: DOCUMENT_MODEL_CONFLICT_TITLE,
      hideButton: true,
      content: () => (
        <DocumentModelConflictContent
          onLoadLatest={() => {
            closeConflictAlert();
            void reloadOfficialDocument();
          }}
          onKeepOpenToCopy={closeConflictAlert}
        />
      ),
    } as Partial<typeof initialBlankState>);
  };

  const persistDocumentModel = async (
    dataOverride?: IDocumentModelData,
  ): Promise<boolean> => {
    const saveAttempt = resolveOfficialSaveAttempt(
      createV2SaveGuardSession({
        surface: v2Session.visibleSurface,
        v2LocalDirty: v2Session.v2LocalDirty,
        experimentNotice: v2Session.experimentNotice,
        remountKey: v2Session.remountKey,
        saveEnabled: v2Session.canPersistV2,
      }),
      'stay',
    );
    if (!saveAttempt.persist) {
      v2Session.reportBlockedSave();
      return false;
    }

    if (updateMutation.isLoading) return false;

    const modelDocument = (store.getState().document as IDocumentSlice).model;
    if (!modelDocument || !data.id) return false;

    const query: IQueryDocumentModelData = {
      id: data.id,
      companyId: data.companyId,
    };

    let payload = dataOverride || modelDocument;
    let persistBuilt: ReturnType<typeof v2Session.planPersist> | null = null;

    if (!dataOverride && v2Session.canPersistV2) {
      const plan = v2Session.planPersist(modelDocument);
      if (plan.type === 'block') {
        v2Session.reportBlockedSave();
        return false;
      }
      if (plan.type === 'abort') {
        v2Session.reportPersistError(plan.message);
        enqueueSnackbar(plan.message, { variant: 'error' });
        return false;
      }
      if (plan.type === 'no-op') {
        v2Session.markPersisted(plan.built);
        return true;
      }
      if (plan.type === 'patch') {
        payload = plan.candidate;
        persistBuilt = plan;
        if (typeof sessionStorage !== 'undefined' && data.companyId) {
          rememberCanonicalBackup(sessionStorage, {
            companyId: data.companyId,
            modelId: data.id,
            original: modelDocument,
          });
        }
        logV2PersistDiff(plan.diff);
      }
    }

    try {
      const expectedUpdatedAt = getExpectedUpdatedAtFromDocumentState(
        store.getState().document as IDocumentSlice,
      );
      const resp = await updateMutation.mutateAsync({
        ...getDocumentModelMetadataPatch(data),
        data: payload,
        ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}),
      });
      const nextToken = toOpaqueDocumentModelUpdatedAt(resp?.updated_at);
      if (nextToken) {
        officialUpdatedAtRef.current = nextToken;
        dispatch(setDocumentModelUpdatedAt(nextToken));
      }
      if (persistBuilt?.type === 'patch' || dataOverride) {
        dispatch(setDocumentModel(payload));
      }
      dispatch(setSaveDocument());
      queryClient.setQueryData(
        [QueryEnum.DOCUMENT_MODEL_DATA, query],
        (oldData: any) => {
          return {
            ...oldData,
            document: payload,
            ...(nextToken ? { updated_at: nextToken } : {}),
          };
        },
      );
      if (nextToken) {
        queryClient.setQueryData(
          [QueryEnum.DOCUMENT_MODEL, data.id, { companyId: data.companyId }],
          (oldData: any) =>
            oldData ? { ...oldData, updated_at: nextToken } : oldData,
        );
      }
      if (persistBuilt?.type === 'patch') {
        v2Session.markPersisted(persistBuilt.built);
      }
      markPersisted({
        status: data.status,
        classifications: data.classifications,
        type: data.type,
      });
      return true;
    } catch (error) {
      if (isDocumentModelConflict(error)) {
        showDocumentModelConflict();
      }
      return false;
    }
  };

  const onCloseUnsaved = (action?: () => void) => {
    if (isPersisting) return;

    const finishClose = () => {
      if (
        preventDiscardIf(
          isDirty,
          () => {
            dispatch(setSaveDocument());
            closeEditor();
            action?.();
          },
          DOCUMENT_MODEL_DISCARD_MODAL,
        )
      )
        return;

      closeEditor();
      action?.();
    };

    if (
      preventDiscardIf(
        v2Session.v2LocalDirty,
        () => {
          v2Session.discardLocalEdits();
          finishClose();
        },
        DOCUMENT_EDITOR_V2_DISCARD_MODAL,
      )
    )
      return;

    finishClose();
  };

  const handleDelete = () => {
    preventDelete(
      async () => {
        if (!data.id || !data.companyId) return;
        await deleteMutation.mutateAsync({
          id: data.id,
          companyId: data.companyId,
        });
        closeEditor();
      },
      'Deseja realmente excluir este modelo de documento? Ele não aparecerá mais na listagem.',
      { confirmText: 'Excluir' },
    );
  };

  return {
    registerModal,
    onClose: onCloseUnsaved,
    closeEditor,
    persistDocumentModel,
    markPersisted,
    isPersisting,
    isDirty,
    data,
    setData,
    loading:
      isLoading ||
      isLoadingModel ||
      createMutation.isLoading ||
      updateMutation.isLoading ||
      deleteMutation.isLoading,
    modalName,
    model: modelData,
    isEdit,
    updateMutation,
    createMutation,
    dispatch,
    handleDelete,
  };
};

export type IUseDocumentModel = ReturnType<typeof useEditDocumentModel>;
