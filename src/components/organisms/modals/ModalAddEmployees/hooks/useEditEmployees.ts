/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutDownloadFile } from 'core/services/hooks/mutations/useMutDownloadFile';
import { useMutUploadFile } from 'core/services/hooks/mutations/useMutUploadFile';

export const initialEmployState = {
  companyId: '',
};

export const useEditEmployees = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();

  const [employee, setEmployee] = useState({
    ...initialEmployState,
  });

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialEmployState>>(
      ModalEnum.EMPLOYEES_ADD,
    );

    if (initialData) {
      setEmployee((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData]);

  const downloadMutation = useMutDownloadFile();
  const uploadMutation = useMutUploadFile();

  const onClose = (data?: any) => {
    onCloseModal(ModalEnum.EMPLOYEES_ADD, data);
  };

  return {
    registerModal,
    onClose,
    employee,
    setEmployee,
    downloadMutation,
    uploadMutation,
  };
};

export type IUseEditEmployees = ReturnType<typeof useEditEmployees>;
