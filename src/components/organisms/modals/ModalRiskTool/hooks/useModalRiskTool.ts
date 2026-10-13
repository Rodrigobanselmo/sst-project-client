/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';

import {
  mergeRiskToolModalData,
  RiskToolModalData,
} from './merge-risk-tool-modal-data.util';

export const initialRiskToolState: RiskToolModalData = {
  riskGroupId: '',
  byRiskV2: false,
};

const modalNameInit = ModalEnum.RISK_TOOL;

export const useModalRiskTool = (modalName = modalNameInit) => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialRiskToolState);
  const { push, asPath } = useRouter();

  const [data, setData] = useState({
    ...initialRiskToolState,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialRiskToolState>>(modalName);

    if (!(initialData as any).passBack) {
      setData((oldData) => {
        const newData = mergeRiskToolModalData(oldData, initialData);

        initialDataRef.current = newData;
        return newData;
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
  };

  const onCloseUnsaved = () => {
    onClose();
  };

  return {
    registerModal,
    onCloseUnsaved,
    modalName,
    data,
  };
};

export type IUseEditCharacterization = ReturnType<typeof useModalRiskTool>;
