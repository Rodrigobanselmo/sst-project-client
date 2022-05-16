/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { Wizard } from 'components/organisms/main/Wizard';

import { ModalEnum } from 'core/enums/modal.enums';
import { companySchema } from 'core/utils/schemas/company.schema';

import { FirstModalCompanyStep } from './components/first';
import { SecondModalCompanyStep } from './components/second';
import { useAddCompany } from './hooks/useAddCompany';

export const ModalAddCompany = () => {
  const props = useAddCompany();

  // const buttons = [
  //   {},
  //   {
  //     text: companyData.id ? 'Editar' : 'Criar',
  //     variant: 'contained',
  //     type: 'submit',
  //     onClick: () => setCompanyData({ ...companyData }),
  //   },
  // ] as IModalButton[];

  return (
    <SModal
      {...props.registerModal(ModalEnum.COMPANY_ADD)}
      keepMounted={false}
      onClose={props.onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        center
        // component="form"
        // onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={props.companyData.id ? 'edit' : 'add'}
          onClose={props.onCloseUnsaved}
          title={'Grupo similar de exposição'}
        />
        <Wizard key={'qwe'} schemas={[companySchema]}>
          <FirstModalCompanyStep {...props} />
          <SecondModalCompanyStep {...props} />
        </Wizard>
        {/* <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        /> */}
      </SModalPaper>
    </SModal>
  );
};
