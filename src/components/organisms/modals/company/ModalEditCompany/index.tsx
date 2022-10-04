/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { ModalEnum } from 'core/enums/modal.enums';
import { addressSchema } from 'core/utils/schemas/address.schema';
import { companySchema } from 'core/utils/schemas/company.schema';

import { ZeroModalCompanyStep } from './components/0-cnpj';
import { FirstModalCompanyStep } from './components/1-data';
import { SecondModalCompanyStep } from './components/2-address';
import { SSTModalCompanyStep } from './components/3-sst';
import { FourthModalCompanyStep } from './components/4-logo';
import { DocumentModalCompanyStep } from './components/5-documents';
import { ContactModalCompanyStep } from './components/6-contacts';
import { useEditCompany } from './hooks/useEditCompany';

export const ModalEditCompany = () => {
  const props = useEditCompany();
  const isEdit = props.isEdit;
  return (
    <SModal
      {...props.registerModal(ModalEnum.COMPANY_EDIT)}
      keepMounted={false}
      onClose={() => props.onCloseUnsaved()}
    >
      <SModalPaper
        // semiFullScreen={props.companyData.cnpj ? true : false}
        sx={{ minWidth: props.companyData.cnpj ? ['100%', 950] : [] }}
        p={8}
        center
      >
        <SModalHeader
          tag={props.companyData.id ? 'edit' : 'add'}
          onClose={props.onCloseUnsaved}
          title={'Empresa'}
        />

        <Wizard
          header={
            isEdit ? (
              <WizardTabs
                options={[
                  { label: 'Dados da empresa' },
                  { label: 'Endereço' },
                  { label: 'SST' },
                  { label: 'Informações Adcionais' },
                  // { label: 'Documentos' },
                  { label: 'Contato' },
                ]}
              />
            ) : null
          }
          schemas={[companySchema, addressSchema]}
        >
          {!isEdit && <ZeroModalCompanyStep {...props} />}
          <FirstModalCompanyStep {...props} />
          <SecondModalCompanyStep {...props} />
          <SSTModalCompanyStep {...props} />
          <FourthModalCompanyStep {...props} />
          {/* <DocumentModalCompanyStep {...props} /> */}
          <ContactModalCompanyStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
