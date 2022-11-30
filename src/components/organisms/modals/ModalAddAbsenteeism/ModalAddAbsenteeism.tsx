/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { phoneMask } from 'core/utils/masks/phone.mask';
import { absenteeismSchema } from 'core/utils/schemas/absenteeism.schema';

import { MotiveStep } from './components/1-motiveStep/MotiveStep';
import { DoctorStep } from './components/2-doctorStep/DoctorStep';
import { useAddAbsenteeism } from './hooks/useAddAbsenteeism';

export const ModalAddAbsenteeism = () => {
  const props = useAddAbsenteeism();

  const {
    registerModal,
    onCloseUnsaved,
    absenteeismData,
    isEdit,
    modalName,
    handleDelete,
  } = props;

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={() => onCloseUnsaved()}
    >
      <SModalPaper width={['100%', 1000]} center p={8} component="form">
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Absenteísmo'}
          secondIcon={absenteeismData?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />

        <Wizard
          schemas={[absenteeismSchema]}
          header={
            isEdit ? (
              <WizardTabs
                height={45}
                options={[
                  { label: 'Dados do acidente', sx: { fontSize: 12 } },
                  { label: 'Atestado', sx: { fontSize: 12 } },
                ]}
              />
            ) : null
          }
        >
          <MotiveStep {...props} />
          <DoctorStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
