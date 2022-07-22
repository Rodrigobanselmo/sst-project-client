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

const modalName = ModalEnum.HIERARCHIES_EXCEL_ADD;

export const useEditHierarchies = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();

  const [hierarchyData, setHierarchyData] = useState({
    ...initialEmployState,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialEmployState>>(modalName);

    if (initialData) {
      setHierarchyData((oldData) => {
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
    onCloseModal(modalName, data);
  };

  return {
    registerModal,
    onClose,
    hierarchyData,
    setHierarchyData,
    downloadMutation,
    uploadMutation,
    modalName,
  };
};

export type IUseEditEmployees = ReturnType<typeof useEditHierarchies>;
