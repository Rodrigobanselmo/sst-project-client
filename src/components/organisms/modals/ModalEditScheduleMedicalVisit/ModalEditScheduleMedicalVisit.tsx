/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { EmployeeScheduleMedicalVisitTable } from 'components/organisms/tables/EmployeeScheduleMedicalVisitTable/EmployeeScheduleMedicalVisitTable';

import { ModalEnum } from 'core/enums/modal.enums';

import { MedicalVisitForm } from './components/MedicalVisitForm/MedicalVisitForm';
import { useModalEditScheduleMedicalVisit } from './hooks/useModalEditScheduleMedicalVisit';

export const ModalEditScheduleMedicalVisit = () => {
  const props = useModalEditScheduleMedicalVisit();
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    data,
    setData,
    control,
    handleSubmit,
    modalName,
    tableRef,
    setValue,
    isEdit,
  } = props;

  const buttons = [
    {},
    {
      text: data.id ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setData({ ...data }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        semiFullScreen
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={!isEdit ? 'Agendar Visita médica' : 'Visita médica'}
        />

        <MedicalVisitForm {...props} />
        <EmployeeScheduleMedicalVisitTable
          mt={10}
          scheduleMedicalVisitId={data.id}
          control={control}
          setValue={setValue}
          companyId={data.company?.id}
          ref={tableRef}
          employeeExamsHistorySelected={props.medicalVisit?.exams}
        />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
