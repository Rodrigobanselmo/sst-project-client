/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { addressClinicSchema } from 'core/utils/schemas/address.schema';
import { bankSchema } from 'core/utils/schemas/bank.schema';
import { clinicSchema } from 'core/utils/schemas/clinic.schema';

import { UserDataModalStep } from './components/1-data';
import { useEditCompany } from './hooks/useEditCompany';

export const ModalScheduleExam = () => {
  const props = useEditCompany();
  const isEdit = props.isEdit;

  return (
    <SModal
      {...props.registerModal(props.modalName)}
      keepMounted={false}
      onClose={() => props.onCloseUnsaved()}
    >
      <SModalPaper p={8} center>
        <SModalHeader
          tag={props.companyData.id ? 'edit' : 'add'}
          onClose={props.onCloseUnsaved}
          title={'Clínica'}
        />

        <Wizard
          header={
            isEdit ? (
              <WizardTabs
                options={[
                  { label: 'Dados da clínica' },
                  { label: 'Endereço' },
                  { label: 'Informações Adcionais' },
                  { label: 'Dados Bancários' },
                  { label: 'Contato' },
                ]}
              />
            ) : null
          }
          schemas={[clinicSchema, bankSchema, addressClinicSchema]}
        >
          <UserDataModalStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
