/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';

import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { useQueryDocumentData } from 'core/services/hooks/queries/useQueryDocumentData/useQueryDocumentData';

import { IPGRDocumentData } from './../../../../../core/interfaces/api/IDocumentData';
import { IUseMainActionsModal, useMainActions } from './useMainActions';

export const initialPERICULOSIDADEDocState = {
  json: {},
};

export const usePERICULOSIDADEHandleModal = () => {
  const props = useMainActions({
    type: DocumentTypeEnum.PERICULOSIDADE,
    initialDocState: initialPERICULOSIDADEDocState,
  });

  const {
    registerModal,
    onCloseUnsaved,
    onClose,
    data,
    setData,
    modalName,
    initialDataRef,
    docLoading,
    getModalData,
    doc,
    initialState,
  } = props;

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setData((oldData) => {
        const isRegenerate = Boolean(
          (initialData as { regenerateVersionId?: string }).regenerateVersionId,
        );
        const documentPERICULOSIDADE: Partial<any> =
          !isRegenerate &&
          (doc as any)?.type == DocumentTypeEnum.PERICULOSIDADE
            ? (doc ?? {})
            : {};

        const newData = {
          ...initialState,
          ...oldData,
          ...initialData,
          ...documentPERICULOSIDADE,
          ...(isRegenerate
            ? {
                name: initialData.name ?? oldData.name,
                elaboratedBy:
                  initialData.elaboratedBy ?? oldData.elaboratedBy,
                revisionBy: initialData.revisionBy ?? oldData.revisionBy,
                approvedBy: initialData.approvedBy ?? oldData.approvedBy,
                coordinatorBy:
                  initialData.coordinatorBy ?? oldData.coordinatorBy,
                modelId: initialData.modelId ?? oldData.modelId,
                model: initialData.model ?? oldData.model,
                generationSnapshot:
                  initialData.generationSnapshot ?? oldData.generationSnapshot,
              }
            : {}),
          versionFamily:
            initialData?.versionFamily ??
            (isRegenerate ? 'test' : oldData.versionFamily ?? 'test'),
          json: {
            ...initialState.json,
            ...oldData.json,
            ...initialData?.json,
            ...documentPERICULOSIDADE?.json,
          },
          type: DocumentTypeEnum.PERICULOSIDADE,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData, doc, onClose, setData]);

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    data,
    setData,
    modalName,
    initialDataRef,
    docLoading,
    props: props as unknown as IUseMainActionsModal,
  };
};

export type IUsePERICULOSIDADEHandleModal = ReturnType<
  typeof usePERICULOSIDADEHandleModal
>;
