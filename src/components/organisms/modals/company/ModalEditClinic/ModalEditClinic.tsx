/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { ModalEnum } from 'core/enums/modal.enums';
import { addressClinicSchema } from 'core/utils/schemas/address.schema';
import { bankSchema } from 'core/utils/schemas/bank.schema';
import { clinicSchema } from 'core/utils/schemas/clinic.schema';

import { DataModalCompanyStep } from './components/1-data';
import { AddressModalCompanyStep } from './components/2-address';
import { FourthModalCompanyStep } from './components/3-logo';
import { BankModalCompanyStep } from './components/4-bank';
import { ContactModalCompanyStep } from './components/5-contacts';
import { useEditCompany } from './hooks/useEditClinic';

export const ModalEditClinic = () => {
  const props = useEditCompany();
  const isEdit = props.isEdit;

  return (
    <SModal
      {...props.registerModal(ModalEnum.CLINIC_EDIT)}
      keepMounted={false}
      onClose={() => props.onCloseUnsaved()}
    >
      <SModalPaper
        sx={{
          minWidth: props.companyData.cnpj ? ['100%', 950] : [],
          overflow: 'auto',
        }}
        p={8}
        center
      >
        <SModalHeader
          tag={props.companyData.id ? 'edit' : 'add'}
          onClose={props.onCloseUnsaved}
          title={'Clínica'}
          {...(props.companyData.id && {
            onDelete: props.onDelete,
          })}
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
          <DataModalCompanyStep {...props} />
          <AddressModalCompanyStep {...props} />
          <FourthModalCompanyStep {...props} />
          <BankModalCompanyStep {...props} />
          <ContactModalCompanyStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
