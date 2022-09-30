import React from 'react';

import { styled } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { ContactsTable } from 'components/organisms/tables/ContactsTable';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCompanyContacts } from './hooks/useCompanyContacts';

export const ContactModalCompanyStep = (props: IUseAddCompany) => {
  const { onSubmit, loading, onCloseUnsaved, previousStep } =
    useCompanyContacts(props);
  const { companyData, isEdit } = props;

  const buttons = [
    {
      variant: 'outlined',
      text: 'Voltar',
      arrowBack: true,
      onClick: () => previousStep(),
    },
    {
      variant: 'outlined',
      text: 'Salvar e sair',
      onClick: () => onSubmit(),
    },
    {
      text: isEdit ? 'Salvar' : 'Salvar e Continuar',
      variant: 'contained',
      onClick: () => onSubmit({ closeAndGoTo: !isEdit }),
    },
  ] as IModalButton[];

  if (isEdit) buttons.splice(1, 1);

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SText color="text.label" fontSize={14} mb={-2}>
            Contatos
          </SText>
          <ContactsTable hideTitle companyId={companyData.id || undefined} />
        </SFlex>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
