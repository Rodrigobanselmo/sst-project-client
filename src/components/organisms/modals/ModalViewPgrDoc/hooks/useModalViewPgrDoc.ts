/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
import { useMutUploadFile } from 'core/services/hooks/mutations/general/useMutUploadFile';
import { useQueryPrgDoc } from 'core/services/hooks/queries/useQueryPrgDoc';

export const initialViewPgrDocState = {
  id: '',
  riskGroupId: '',
  companyId: '',
  downloadRoute: ApiRoutesEnum.DOCUMENTS_PGR,
  downloadAttRoute: ApiRoutesEnum.DOCUMENTS_PGR_ATTACHMENTS,
};

const modalName = ModalEnum.PGR_DOC_VIEW;

export const useModalViewPgrDoc = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();

  const [doc, setDoc] = useState({
    ...initialViewPgrDocState,
  });

  const { data: docQuery } = useQueryPrgDoc(doc.id, doc.riskGroupId);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialViewPgrDocState>>(modalName);

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

export type IUseDocs = ReturnType<typeof useModalViewPgrDoc>;
