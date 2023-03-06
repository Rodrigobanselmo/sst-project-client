import React, { FC, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { SButton } from 'components/atoms/SButton';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { parseCookies, setCookie } from 'nookies';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { api } from 'core/services/apiClient';
import { photoSchema } from 'core/utils/schemas/photo.schema';

import { SFileDndUpload } from '../../../molecules/SFileDndUpload';
import { SModalUploadPhoto } from './types';

export interface IUploadNewFileConfirm {
  files: File[];
  path: string;
}

export const initialFileUploadState = {
  title: 'Enviar Aquirvo',
  subtitle: '',
  accept:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' as
      | string
      | string[],
  files: [] as File[],
  path: '',
  maxFiles: 1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirm: async (arg: IUploadNewFileConfirm) => {},
};

const modalName = ModalEnum.UPLOAD_NEW_FILE;

export const ModalUploadNewFile: FC<SModalUploadPhoto> = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { onCloseModal } = useModal();

  const { handleSubmit, reset } = useForm({
    resolver: yupResolver(photoSchema),
  });

  const [fileData, setFileData] = useState({
    ...initialFileUploadState,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialFileUploadState>>(modalName);

    if (initialData && !(initialData as any).passBack) {
      setFileData((oldData) => ({
        ...oldData,
        ...initialData,
      }));
    }
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(modalName);
    setFileData(initialFileUploadState);
    reset();
  };

  const onSetFiles = async (files: File[]) => {
    setFileData((data) => ({ ...data, files }));
  };

  const handleRemove = async () => {
    setFileData((data) => ({ ...data, files: [] }));
  };

  const onSubmit = async () => {
    const { 'nextauth.refreshToken': refresh_token } = parseCookies();

    const response = await api.post('/refresh', { refresh_token });

    const { token } = response.data;

    setCookie(null, 'nextauth.token', token, {
      maxAge: 60 * 60 * 25 * 30, // 30 days
      path: '/',
    });

    setCookie(null, 'nextauth.refreshToken', response.data.refresh_token, {
      maxAge: 60 * 60 * 25 * 30, // 30 days
      path: '/',
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api.defaults.headers as any)['Authorization'] = `Bearer ${token}`;

    setIsLoading(true);
    fileData.onConfirm &&
      (await fileData.onConfirm({
        files: fileData.files,
        path: fileData.path,
      }));
    setIsLoading(false);

    setTimeout(() => {
      onClose();
    }, 100);
  };

  const buttons = [
    {},
    {
      text: 'Fazer upload',
      type: 'submit',
      variant: 'contained',
      onClick: onSubmit,
    },
  ] as IModalButton[];

  return (
    <SModal {...registerModal(modalName)} keepMounted={false} onClose={onClose}>
      <SModalPaper
        onSubmit={handleSubmit(onSubmit)}
        component="form"
        center
        p={8}
        width={'fit-content'}
        minWidth={600}
      >
        <SModalHeader onClose={onClose} title={fileData.title} />
        <DndProvider backend={HTML5Backend}>
          <SFileDndUpload
            maxFiles={fileData.maxFiles}
            accept={fileData.accept}
            onChange={onSetFiles}
          />
        </DndProvider>
        <SButton onClick={handleRemove} xsmall color="error">
          Remover
        </SButton>
        <SModalButtons
          loading={isLoading}
          onClose={onClose}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
