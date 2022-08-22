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
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { queryClient } from 'core/services/queryClient';

import { ModalExportEmployees } from '../ModalAddExcelEmployees/components/ModalExportEmployees';
import { useEditEmployees } from '../ModalAddExcelEmployees/hooks/useEditEmployees';
import { ModalUploadFile } from '../ModalUploadFile';

export const ModalAddHierarchies = () => {
  const props = useEditEmployees();
  const { companyId } = useGetCompanyId();
  const { registerModal, onClose, uploadMutation } = props;

  const buttons = [{}] as IModalButton[];

  return (
    <>
      <SModal
        {...registerModal(ModalEnum.HIERARCHY_ADD)}
        keepMounted={false}
        onClose={onClose}
      >
        <SModalPaper p={8} center>
          <SModalHeader tag={'add'} onClose={onClose} title={'Funcionários'} />

          <ModalExportEmployees {...props} />

          <SModalButtons onClose={onClose} buttons={buttons} />
        </SModalPaper>
      </SModal>
      <ModalUploadFile
        loading={uploadMutation.isLoading}
        onConfirm={async (files: File[], path: string) => {
          await uploadMutation
            .mutateAsync({
              file: files[0],
              path: path,
            })
            .catch(() => {});
          queryClient.refetchQueries([QueryEnum.COMPANY, companyId]);
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
