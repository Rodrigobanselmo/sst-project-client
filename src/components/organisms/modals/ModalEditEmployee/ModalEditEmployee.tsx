/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { employeeSchema } from 'core/utils/schemas/employee.schema';

import { DataModalCompanyStep } from './components/1-data';
import { HierarchyHistoryStep } from './components/2-hierarchy';
import { useEditEmployee } from './hooks/useEditEmployee';

export const ModalEditEmployee = () => {
  const props = useEditEmployee();
  const isEdit = props.isEdit;

  return (
    <SModal
      {...props.registerModal(props.modalName)}
      keepMounted={false}
      onClose={() => props.onCloseUnsaved()}
    >
      <SModalPaper
        overflow="hidden"
        sx={{
          width: ['100%', 600, 800],
          minHeight: ['100%', 550],
          display: 'flex',
          flexDirection: 'column',
        }}
        p={8}
        center
      >
        <SModalHeader
          tag={props.data.id ? 'edit' : 'add'}
          onClose={props.onCloseUnsaved}
          title={'Funcionário'}
        />
        <Wizard
          header={
            isEdit ? (
              <WizardTabs
                height={45}
                options={[
                  { label: 'Dados Pessoais', sx: { fontSize: 12 } },
                  { label: 'Histórico de lotação', sx: { fontSize: 12 } },
                ]}
              />
            ) : null
          }
          schemas={[employeeSchema]}
        >
          <DataModalCompanyStep {...props} />
          <HierarchyHistoryStep {...props} />
          {/* <AddressModalCompanyStep {...props} />
          <FourthModalCompanyStep {...props} />
          <BankModalCompanyStep {...props} />
          <ContactModalCompanyStep {...props} /> */}
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
