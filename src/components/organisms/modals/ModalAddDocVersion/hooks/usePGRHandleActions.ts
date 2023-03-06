/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';

import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { useQueryDocumentData } from 'core/services/hooks/queries/useQueryDocumentData/useQueryDocumentData';

export const initialPgrDocState = {
  id: '',
  name: '',
  status: StatusEnum.ACTIVE,
  companyId: '',
  workspaceId: '',
  workspaceName: '',
  validityEnd: null as Date | null,
  validityStart: null as Date | null,
  type: undefined as DocumentTypeEnum | undefined,

  elaboratedBy: '',
  revisionBy: '',
  approvedBy: '',
  coordinatorBy: '',
  professionals: [] as IProfessional[],

  json: {
    visitDate: null as Date | null,
    source: '',
    complementaryDocs: [] as string[],
    complementarySystems: [] as string[],
    isQ5: false,
    hasEmergencyPlan: false,
  },

  workspaceClosed: false,
};

const modalName = ModalEnum.DOCUMENT_DATA_UPSERT;

export const usePGRHandleModal = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialPgrDocState);

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialPgrDocState,
  });

  const { data: doc, isLoading: docLoading } = useQueryDocumentData({
    type: DocumentTypeEnum.PGR,
    companyId: data.companyId,
    workspaceId: data.workspaceId,
  });

  const onClose = useCallback(
    (data?: any) => {
      onCloseModal(modalName, data);
      setData(initialPgrDocState);
    },
    [onCloseModal],
  );

  useEffect(() => {
    if (data && data?.workspaceClosed && !data?.workspaceId) return onClose();
  }, [data, onClose]);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialPgrDocState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setData((oldData) => {
        const newData = {
          ...initialPgrDocState,
          ...oldData,
          ...initialData,
          ...doc,
          type: DocumentTypeEnum.PGR,
        };

        if (!newData.validityStart) {
          newData.json.complementaryDocs = [
            'NR 15 – Atividades e Operações Insalubres e seus Anexos;',
            'ACGIH – Limites de Exposição para Substâncias Químicas e Agentes Físicos;',
            'Levantamento de Riscos por Função (PRHO).',
          ];
        }

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData, doc, onClose]);

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
  };
};

export type IUsePGRHandleModal = ReturnType<typeof usePGRHandleModal>;
