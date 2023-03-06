/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
import { useMutUploadFile } from 'core/services/hooks/mutations/general/useMutUploadFile';
import { useMutReport } from 'core/services/hooks/mutations/reports/useMutReport/useMutReport';

export interface IUploadNewFileConfirm {
  files: File[];
  path: string;
}

export const initialModalImportExport = {
  title: 'Enviar Aquirvo',
  subtitle: '',
  accept:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' as
      | string
      | string[],
  files: [] as File[],
  path: '',
  removeButton: false,
  maxFiles: 1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirm: async (arg: IUploadNewFileConfirm) => {},
  onDownload: async () => {},
};

const modalName = ModalEnum.IMPORT_EXPORT_MODAL;

export const useModalImportExport = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState<boolean>(false);
  const { onCloseModal } = useModal();

  const { handleSubmit, reset } = useForm();

  const [fileData, setFileData] = useState({
    ...initialModalImportExport,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialModalImportExport>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setFileData((oldData) => ({
        ...oldData,
        ...initialData,
      }));
    }
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(modalName);
    setFileData(initialModalImportExport);
    reset();
  };

  const onSetFiles = async (files: File[]) => {
    setFileData((data) => ({ ...data, files }));
  };

  const handleRemove = async () => {
    setFileData((data) => ({ ...data, files: [] }));
  };

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      fileData.onConfirm &&
        (await fileData.onConfirm({
          files: fileData.files,
          path: fileData.path,
        }));
      setIsLoading(false);

      // setTimeout(() => { //! add
      //   onClose();
      // }, 100);
    } catch {
      setIsLoading(false);
    }
  };

  const onDownload = async () => {
    try {
      setIsDownloadLoading(true);
      fileData.onDownload && (await fileData.onDownload());
      setIsDownloadLoading(false);
    } catch {
      setIsDownloadLoading(false);
    }
  };

  return {
    registerModal,
    onClose,
    fileData,
    setFileData,
    modalName,
    isLoading,
    handleRemove,
    isDownloadLoading,
    onSubmit,
    onSetFiles,
    handleSubmit,
    onDownload,
  };
};

export type IUseModalImportExport = ReturnType<typeof useModalImportExport>;
