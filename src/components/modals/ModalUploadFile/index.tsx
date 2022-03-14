import React, { FC, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';

import { SFileDndUpload } from '../../molecules/SFileDndUpload';
import { SModalUploadFile } from './types';

export const ModalUploadFile: FC<SModalUploadFile> = ({
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
    onConfirm && onConfirm(filesRef.current, getModalData(ModalEnum.UPLOAD));
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
        <SModalHeader onClose={onClose} title={'Exportar arquivo'} />
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
