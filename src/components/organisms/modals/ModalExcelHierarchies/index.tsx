/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

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
import { ModalExportEmployees as ModalExportHierarchies } from './components/ModalExportHierarchies';
import { useEditHierarchies } from './hooks/useEditHierarchies';

export const ModalExcelHierarchies = () => {
  const props = useEditHierarchies();
  const { companyId } = useGetCompanyId();
  const { registerModal, onClose, uploadMutation, modalName } = props;

  const buttons = [{}] as IModalButton[];

  return (
    <>
      <SModal
        {...registerModal(modalName)}
        keepMounted={false}
        onClose={onClose}
      >
        <SModalPaper p={8} center>
          <SModalHeader
            tag={'add'}
            onClose={onClose}
            title={'Organograma e GSE'}
          />

          <ModalExportHierarchies {...props} />

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
          queryClient.refetchQueries([QueryEnum.HIERARCHY, companyId]);
          queryClient.refetchQueries([QueryEnum.GHO, companyId]);
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
