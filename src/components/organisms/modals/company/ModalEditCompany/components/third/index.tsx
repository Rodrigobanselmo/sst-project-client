import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCompanyEdit } from './hooks/useCompanyThirdEdit';

export const ThirdModalCompanyStep = (props: IUseAddCompany) => {
  const { control, onSubmit, loading, onCloseUnsaved, previousStep, lastStep } =
    useCompanyEdit(props);
  const { companyData } = props;

  const buttons = [
    {
      variant: 'outlined',
      text: 'Voltar',
      arrowBack: true,
      onClick: () => previousStep(),
    },
    {
      variant: 'outlined',
      arrowNext: true,
      text: 'Finalizar',
      onClick: () => lastStep(),
    },
    {
      text: 'Proximo',
      arrowNext: true,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  if (!companyData.id) buttons.splice(1, 1);

  const cnae = companyData.primary_activity[0] || { code: '', name: '' };

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SText color="text.label" fontSize={14} mb={-2}>
            Atividade Principal (CNAE Primário)
          </SText>
          <SFlex flexWrap="wrap" gap={5}>
            <Box flex={5}>
              <InputForm
                defaultValue={cnae.name}
                label="Atividade"
                sx={{ minWidth: [300, 600] }}
                control={control}
                placeholder={'descrição da atividade do CNAE...'}
                name="cnae_name"
                size="small"
              />
            </Box>
            <Box flex={1}>
              <InputForm
                defaultValue={cnae.code}
                label="Código"
                control={control}
                sx={{ minWidth: 200 }}
                placeholder={'código CNAE...'}
                name="cnae_code"
                size="small"
              />
            </Box>
          </SFlex>
          <InputForm
            defaultValue={companyData.riskDegree}
            label="Grau de risco"
            control={control}
            placeholder={'grau de risco referente à atividade...'}
            name="riskDegree"
            size="small"
          />
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
