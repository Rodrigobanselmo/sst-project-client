/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
import { useMutUploadFile } from 'core/services/hooks/mutations/general/useMutUploadFile';

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
      ModalEnum.EMPLOYEES_EXCEL_ADD,
    );

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
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
    onCloseModal(ModalEnum.EMPLOYEES_EXCEL_ADD, data);
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
