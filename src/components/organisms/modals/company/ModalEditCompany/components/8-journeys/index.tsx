import React from 'react';

import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { useWizard } from 'react-use-wizard';

import { CompanyShiftsPanel } from 'pages/dashboard/empresas/[companyId]/novo/[stage]/components/EmployeeStage/CompanyShiftsPanel';

import { IUseAddCompany } from '../../hooks/useEditCompany';

export const JourneysModalCompanyStep = (props: IUseAddCompany) => {
  const { previousStep } = useWizard();
  const { onCloseUnsaved } = props;

  const buttons = [
    {
      variant: 'outlined',
      text: 'Voltar',
      arrowBack: true,
      onClick: () => previousStep(),
    },
    {
      text: 'Fechar',
      variant: 'contained',
      onClick: () => onCloseUnsaved(),
    },
  ] as IModalButton[];

  return (
    <>
      <AnimatedStep>
        <CompanyShiftsPanel title="Jornadas de trabalho" />
      </AnimatedStep>
      <SModalButtons onClose={onCloseUnsaved} buttons={buttons} />
    </>
  );
};
