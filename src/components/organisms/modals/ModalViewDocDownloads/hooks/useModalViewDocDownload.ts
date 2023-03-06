/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
import { useMutUploadFile } from 'core/services/hooks/mutations/general/useMutUploadFile';
import { useQueryDocumentVersion } from 'core/services/hooks/queries/useQueryDocumentVersion';

export const initialViewDocDownloadState = {
  id: '',
  companyId: '',
  downloadRoute: ApiRoutesEnum.DOCUMENTS_BASE,
  downloadAttRoute: ApiRoutesEnum.DOCUMENTS_BASE_ATTACHMENTS,
};

const modalName = ModalEnum.DOCUMENT_DOWNLOAD;

export const useModalViewDocDownload = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();

  const [doc, setDoc] = useState({
    ...initialViewDocDownloadState,
  });

  const { data: docQuery } = useQueryDocumentVersion(doc.id);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialViewDocDownloadState>>(modalName);

    if (initialData && !(initialData as any).passBack) {
      setDoc((oldData) => {
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
    doc,
    setDoc,
    downloadMutation,
    uploadMutation,
    modalName,
    docQuery,
  };
};

export type IUseDocs = ReturnType<typeof useModalViewDocDownload>;
