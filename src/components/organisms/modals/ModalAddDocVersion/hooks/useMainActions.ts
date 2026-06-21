import { useMemo } from 'react';
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

export const initialMainDocState = {
  id: '',
  name: '',
  status: StatusEnum.ACTIVE,
  companyId: '',
  workspaceId: '',
  workspaceName: '',
  validityEnd: null as Date | null | undefined,
  validityStart: null as Date | null | undefined,
  type: undefined as DocumentTypeEnum | undefined,

  modelId: undefined as number | undefined,
  model: undefined as IDocumentModel | undefined,
  elaboratedBy: '',
  revisionBy: '',
  approvedBy: '',
  coordinatorBy: '',
  professionals: [] as IProfessional[],
  documentDate: null as string | Date | null,
  documentCreatedAt: null as string | Date | null,
  versionFamily: 'test' as 'test' | 'official',
  validityYears: 2,
  validityMonths: 0,
  regenerateVersionId: '' as string | undefined,
  lockedVersion: '' as string | undefined,
  downloadExpired: false,
  doc_description: '',
  generationSnapshot: undefined as
    | import('core/interfaces/api/document-generation-snapshot.types').DocumentGenerationSnapshot
    | null
    | undefined,

  workspaceClosed: false,
};

const modalName = ModalEnum.DOCUMENT_DATA_UPSERT;

export const useMainActions = <T>({
  type,
  initialDocState,
}: {
  type: DocumentTypeEnum;
  initialDocState: T;
}) => {
  const initialState: T & typeof initialMainDocState = useMemo(
    () => ({
      ...initialMainDocState,
      ...initialDocState,
      type,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialState);

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialState,
  });

  const { data: doc, isLoading: docLoading } = useQueryDocumentData({
    type: type,
    companyId: data.companyId,
    workspaceId: data.workspaceId,
  });

  const onClose = useCallback(
    (data?: any) => {
      onCloseModal(modalName, data);
      setData(initialState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCloseModal],
  );

  useEffect(() => {
    if (data && data?.workspaceClosed && !data?.workspaceId) return onClose();
  }, [data, onClose]);

  const onCloseUnsaved = () => {
    if (preventUnwantedChanges(data, initialDataRef.current, onClose)) return;
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    data,
    setData,
    modalName,
    initialDataRef,
    docLoading,
    doc,
    getModalData,
    initialState,
    type,
  };
};

export type IUseMainActionsModal = ReturnType<typeof useMainActions>;
