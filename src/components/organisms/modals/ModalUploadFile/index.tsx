import React, { FC, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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

import { SFileDndUpload } from '../../../molecules/SFileDndUpload';
import { SModalUploadFile } from './types';

export const ModalUploadFile: FC<{ children?: any } & SModalUploadFile> = ({
  loading,
  onConfirm,
  maxFiles,
  accept,
}) => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const filesRef = useRef<File[]>([]);

  const onClose = () => {
    onCloseModal(ModalEnum.UPLOAD);
    filesRef.current = [];
  };

  const onConfirmButton = async () => {
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

    onConfirm &&
      (await onConfirm(filesRef.current, getModalData(ModalEnum.UPLOAD)));

    setTimeout(() => {
      onClose();
    }, 100);
  };

  const onSetFiles = async (files: File[]) => {
    filesRef.current = files;
  };

  const buttons = [
    {},
    {
      text: 'Fazer upload',
      onClick: onConfirmButton,
      variant: 'contained',
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.UPLOAD, loading)}
      keepMounted={false}
      onClose={onClose}
    >
      <SModalPaper p={8} width={600}>
        <SModalHeader onClose={onClose} title={'Enviar arquivo'} />
        <DndProvider backend={HTML5Backend}>
          <SFileDndUpload
            maxFiles={maxFiles}
            accept={accept}
            onChange={onSetFiles}
          />
        </DndProvider>
        <SModalButtons loading={loading} onClose={onClose} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
