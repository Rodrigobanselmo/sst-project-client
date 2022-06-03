/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';

import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';

export const initialPgrDocState = {
  id: '',
  status: StatusEnum.ACTIVE,
  name: '',
  elaboratedBy: '',
  revisionBy: '',
  approvedBy: '',
  source: '',
  visitDate: '',
  companyId: '',
  workspaceId: '',
  workspaceName: '',
  workspaceClosed: false,
};

const modalName = ModalEnum.RISK_GROUP_DOC_ADD;

export const useHandleModal = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialPgrDocState);

  const { preventUnwantedChanges } = usePreventAction();

  const [data, setData] = useState({
    ...initialPgrDocState,
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

    if (initialData) {
      setData((oldData) => {
        const newData = {
          ...initialPgrDocState,
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData, onClose]);

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
  };
};

export type IUseAddCompany = ReturnType<typeof useHandleModal>;
