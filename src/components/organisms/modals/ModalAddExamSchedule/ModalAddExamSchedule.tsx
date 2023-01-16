/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { examScheduleSchema } from 'core/utils/schemas/examSchedule.schema';

import { ModalEditEmployee } from '../ModalEditEmployee/ModalEditEmployee';
import { EmployeeStep } from './components/1-employee';
import { EvalStep } from './components/2-eval';
import { ExamStep } from './components/2-exams';
import { EvaluationStep } from './components/3-evaluation';
import { ResumeStep } from './components/4-resume';
import { useEditExamEmployee } from './hooks/useEditExamEmployee';

export const ModalAddExamSchedule = () => {
  const props = useEditExamEmployee();
  // const isEdit = props.isEdit;

  return (
    <SModal
      {...props.registerModal(props.modalName)}
      keepMounted={false}
      onClose={() => props.onCloseUnsaved()}
    >
      <SModalPaper
        overflow="hidden"
        sx={{
          width: ['100%', 600, 1000],
          maxWidth: 1200,
          minHeight: ['100%', 550],
          display: 'flex',
          flexDirection: 'column',
        }}
        p={8}
        center
      >
        <SModalHeader
          tag={'schedule'}
          onClose={props.onCloseUnsaved}
          title={'Agendamento de Exame'}
        />
        <Wizard schemas={[examScheduleSchema]}>
          <EmployeeStep {...props} />
          {props.data.examType != 'EVAL' && <ExamStep {...props} />}
          {props.data.examType == 'EVAL' && <EvalStep {...props} />}
          <EvaluationStep {...props} />
          <ResumeStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};

export const StackModalAddExamSchedule = () => {
  return (
    <>
      <ModalAddExamSchedule />
      <ModalEditEmployee />
    </>
  );
};
