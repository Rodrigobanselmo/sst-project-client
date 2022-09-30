import React from 'react';

import { styled } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { DocumentsTable } from 'components/organisms/tables/DocumentsTable';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCompanyDocuments } from './hooks/useCompanyDocuments';

export const DocumentModalCompanyStep = (props: IUseAddCompany) => {
  const { onSubmit, loading, onCloseUnsaved, previousStep } =
    useCompanyDocuments(props);
  const { companyData, isEdit } = props;

  const buttons = [
    {
      variant: 'outlined',
      text: 'Voltar',
      arrowBack: true,
      onClick: () => previousStep(),
    },
    {
      text: isEdit ? 'Salvar' : 'Proximo',
      arrowNext: !isEdit,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  if (isEdit) buttons.splice(1, 1);

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SText color="text.label" fontSize={14} mb={-2}>
            Documentos
          </SText>
          <DocumentsTable hideTitle companyId={companyData.id || undefined} />
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
