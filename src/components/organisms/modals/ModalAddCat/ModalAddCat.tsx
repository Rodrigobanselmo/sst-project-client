/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { catSchema } from 'core/utils/schemas/cat.schema';

import { EmployeeStep } from './components/1-employeeStep/EmployeeStep';
import { AccidentStep } from './components/2-accidentStep/AccidentStep';
import { LocationStep } from './components/3-locationStep/LocationStep';
import { DoctorStep } from './components/4-doctorStep/DoctorStep';
import { useAddCat } from './hooks/useAddCat';

export const ModalAddCat = () => {
  const props = useAddCat();

  const {
    registerModal,
    onCloseUnsaved,
    isEdit,
    modalName,
    // catData,
    // handleDelete,
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
          title={'CAT'}
          // secondIcon={catData?.id ? SDeleteIcon : undefined}
          // secondIconClick={handleDelete}
        />

        <Wizard
          schemas={[catSchema]}
          header={
            isEdit ? (
              <WizardTabs
                height={45}
                options={[
                  { label: 'Dados do acidente', sx: { fontSize: 12 } },
                  { label: 'Local', sx: { fontSize: 12 } },
                  { label: 'Atestado', sx: { fontSize: 12 } },
                ]}
              />
            ) : null
          }
        >
          {!isEdit && <EmployeeStep {...props} />}
          <AccidentStep {...props} />
          <LocationStep {...props} />
          <DoctorStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
