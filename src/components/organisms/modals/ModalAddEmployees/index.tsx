/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalUploadFile } from '../ModalUploadFile';
import { ModalExportEmployees } from './components/ModalExportEmployees';
import { useEditEmployees } from './hooks/useEditEmployees';

export const ModalAddEmployees = () => {
  const props = useEditEmployees();
  const { registerModal, onClose, uploadMutation } = props;

  const buttons = [{}] as IModalButton[];

  return (
    <>
      <SModal
        {...registerModal(ModalEnum.EMPLOYEES_ADD)}
        keepMounted={false}
        onClose={onClose}
      >
        <SModalPaper p={8} center>
          <SModalHeader tag={'add'} onClose={onClose} title={'Empregados'} />

          <ModalExportEmployees {...props} />

          <SModalButtons onClose={onClose} buttons={buttons} />
        </SModalPaper>
      </SModal>
      <ModalUploadFile
        loading={uploadMutation.isLoading}
        onConfirm={async (files: File[], path: string) => {
          await uploadMutation.mutateAsync({
            file: files[0],
            path: path,
          });

          onClose();
        }}
        maxFiles={1}
        accept={
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      />
    </>
  );
};
