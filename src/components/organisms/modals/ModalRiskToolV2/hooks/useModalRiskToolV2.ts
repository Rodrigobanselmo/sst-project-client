/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';

export const initialRiskToolV2State = {
  riskGroupId: '',
};

const modalNameInit = ModalEnum.RISK_TOOL_V2;

export const useModalRiskToolV2 = (modalName = modalNameInit) => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialRiskToolV2State);
  const { push, asPath } = useRouter();

  const [data, setData] = useState({
    ...initialRiskToolV2State,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialRiskToolV2State>>(modalName);

    if (!(initialData as any).passBack) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

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

export type IUseModalRiskToolV2 = ReturnType<typeof useModalRiskToolV2>;

