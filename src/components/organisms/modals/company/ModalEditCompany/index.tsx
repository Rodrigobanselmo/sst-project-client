/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';

import { ModalEnum } from 'core/enums/modal.enums';
import { addressSchema } from 'core/utils/schemas/address.schema';
import { companySchema } from 'core/utils/schemas/company.schema';

import { FirstModalCompanyStep } from './components/first';
import { FourthModalCompanyStep } from './components/fourth';
import { SecondModalCompanyStep } from './components/second';
import { ThirdModalCompanyStep } from './components/third';
import { ZeroModalCompanyStep } from './components/zero';
import { useEditCompany } from './hooks/useEditCompany';

export const ModalEditCompany = () => {
  const props = useEditCompany();

  return (
    <SModal
      {...props.registerModal(ModalEnum.COMPANY_EDIT)}
      keepMounted={false}
      onClose={props.onCloseUnsaved}
    >
      <SModalPaper p={8} center>
        <SModalHeader
          tag={props.companyData.id ? 'edit' : 'add'}
          onClose={props.onCloseUnsaved}
          title={'Empresa'}
        />
        <Wizard schemas={[companySchema, addressSchema]}>
          {!props.companyData.id && <ZeroModalCompanyStep {...props} />}
          <FirstModalCompanyStep {...props} />
          <SecondModalCompanyStep {...props} />
          <ThirdModalCompanyStep {...props} />
          <FourthModalCompanyStep {...props} />
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
