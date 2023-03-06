/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { SButton } from 'components/atoms/SButton';
import { SFileDndUpload } from 'components/molecules/SFileDndUpload';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { queryClient } from 'core/services/queryClient';

import { ModalUploadFile } from '../ModalUploadFile';
import { ModalImportExportButtons } from './components/ModalImportExportButtons';
import { useModalImportExport } from './hooks/useModalImportExport';

export const ModalImportExport = () => {
  const props = useModalImportExport();

  const {
    registerModal,
    onClose,
    isLoading,
    handleRemove,
    onSubmit,
    onSetFiles,
    handleSubmit,
    fileData,
    modalName,
  } = props;

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
    <>
      <SModal
        {...registerModal(modalName)}
        keepMounted={false}
        onClose={onClose}
      >
        <SModalPaper
          onSubmit={handleSubmit(onSubmit)}
          component="form"
          center
          p={8}
          width={['100%', '100%', 600, 660]}
        >
          <SModalHeader onClose={onClose} title={fileData.title} />
          <DndProvider backend={HTML5Backend}>
            <SFileDndUpload
              maxFiles={fileData.maxFiles}
              accept={fileData.accept}
              onChange={onSetFiles}
            />
          </DndProvider>

          <ModalImportExportButtons {...props} />
          <SModalButtons
            loading={isLoading}
            onClose={onClose}
            buttons={buttons}
          />
        </SModalPaper>
      </SModal>
      {/* <ModalUploadFile
        loading={uploadMutation.isLoading}
        onConfirm={async (files: File[], path: string) => {
          await uploadMutation
            .mutateAsync({
              file: files[0],
              path: path,
            })
            .catch(() => {});
          queryClient.invalidateQueries([QueryEnum.HIERARCHY, companyId]);
          queryClient.invalidateQueries([QueryEnum.GHO, companyId]);
          onClose();
        }}
        maxFiles={1}
        accept={
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      /> */}
    </>
  );
};
