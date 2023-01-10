import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { SPageMenu } from 'components/molecules/SPageMenu';
import dayjs from 'dayjs';

import { dateToString } from 'core/utils/date/date-format';
import { cleanObjectNullValues } from 'core/utils/helpers/cleanObjectValues';

import { ModalClinicExamStep } from './components/ModalClinicExamStep';
import { useEditClinicExams } from './hooks/useEditClinicExams';

export const ModalAddClinicExam = () => {
  const props = useEditClinicExams();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    clinicExamData,
    loading,
    modalName,
    allClinicExams,
    isEdit,
    initializeModalDate,
    onClose,
    onStackOpenModal,
  } = props;

  const buttons = [
    {},
    {
      text: clinicExamData.id ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
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
        sx={{ overflow: 'auto' }}
        center
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={clinicExamData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Exame realizado pela Clínica'}
        />
        {allClinicExams.map((m) => dayjs(m.startDate).format())}
        {isEdit && (
          <SPageMenu
            active={String(clinicExamData.id)}
            options={allClinicExams
              .map((clinicExam) => ({
                label: dateToString(clinicExam.startDate),
                value: String(clinicExam.id),
              }))
              .reverse()}
            onChange={(id) => {
              onClose();
              setTimeout(() => {
                onStackOpenModal(
                  modalName,
                  allClinicExams.find(
                    (clinicExam) => clinicExam.id == Number(id),
                  ),
                );
              }, 10);
            }}
            mb={10}
          />
        )}
        <ModalClinicExamStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
