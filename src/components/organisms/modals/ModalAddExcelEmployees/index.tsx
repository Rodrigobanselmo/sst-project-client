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
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { queryClient } from 'core/services/queryClient';

import { EmptyWorkspaceData } from '../empty/EmptyWorkspaceData';
import { ModalUploadFile } from '../ModalUploadFile';
import { ModalExportEmployees } from './components/ModalExportEmployees';
import { useEditEmployees } from './hooks/useEditEmployees';

export const ModalAddExcelEmployees = () => {
  const props = useEditEmployees();
  const { data: company } = useQueryCompany();
  const { companyId } = useGetCompanyId();
  const { registerModal, onClose, uploadMutation } = props;

  const buttons = [{}] as IModalButton[];

  return (
    <>
      <SModal
        {...registerModal(ModalEnum.EMPLOYEES_EXCEL_ADD)}
        keepMounted={false}
        onClose={onClose}
      >
        <SModalPaper p={8} center>
          <SModalHeader tag={'add'} onClose={onClose} title={'Funcionários'} />

          {company.workspace && !!company.workspace.length ? (
            <ModalExportEmployees {...props} />
          ) : (
            <EmptyWorkspaceData />
          )}

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
