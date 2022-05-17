/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';

import { ModalEnum } from 'core/enums/modal.enums';
import { companySchema } from 'core/utils/schemas/company.schema';

import { FirstModalCompanyStep } from './components/first';
import { SecondModalCompanyStep } from './components/second';
import { useAddCompany } from './hooks/useAddCompany';

export const ModalAddCompany = () => {
  const props = useAddCompany();

  return (
    <SModal
      {...props.registerModal(ModalEnum.COMPANY_ADD)}
      keepMounted={false}
      onClose={props.onCloseUnsaved}
    >
      <SModalPaper p={8} center>
        <SModalHeader
          tag={props.companyData.id ? 'edit' : 'add'}
          onClose={props.onCloseUnsaved}
          title={'Empresa'}
        />
        <Wizard schemas={[companySchema]}>
          <FirstModalCompanyStep {...props} />
          <SecondModalCompanyStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
