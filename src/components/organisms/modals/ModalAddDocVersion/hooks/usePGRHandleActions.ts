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
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

export const initialPgrDocState = {
  json: {
    visitDate: null as Date | null | undefined,
    source: '',
    complementaryDocs: [] as string[],
    complementarySystems: [] as string[],
    isQ5: false,
    isHideCA: false,
    isHideOriginColumn: false,
    aprTypeSeparation: null as HierarchyTypeEnum | null,
    hasEmergencyPlan: false,
    months_period_level_2: 24,
    months_period_level_3: 12,
    months_period_level_4: 6,
    months_period_level_5: 3,
  },
};

export const usePGRHandleModal = () => {
  const props = useMainActions({
    type: DocumentTypeEnum.PGR,
    initialDocState: initialPgrDocState,
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
        const documentPGR: Partial<IPGRDocumentData> =
          doc?.type == DocumentTypeEnum.PGR ? doc : {};

        const newData = {
          ...initialState,
          ...oldData,
          ...initialData,
          ...documentPGR,
          json: {
            ...initialState.json,
            ...oldData.json,
            ...initialData?.json,
            ...documentPGR?.json,
          },
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

export type IUsePGRHandleModal = ReturnType<typeof usePGRHandleModal>;
