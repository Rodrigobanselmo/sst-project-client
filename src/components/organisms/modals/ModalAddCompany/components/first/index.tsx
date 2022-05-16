/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useWizard } from 'react-use-wizard';

import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseAddCompany } from '../../hooks/useAddCompany';
import { useGetCNPJ } from './hooks/useGetCNPJ';

export const FirstModalCompanyStep = (props: IUseAddCompany) => {
  const { onSubmit, control } = useGetCNPJ(props);

  const { companyData } = props;
  const buttons = [
    {},
    {
      text: companyData.id ? 'Editar' : 'Criar',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            defaultValue={companyData.cnpj}
            minRows={2}
            maxRows={4}
            label="CNPJ*"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'cnpj do empresa...'}
            name="cnpj"
            size="small"
          />
        </SFlex>
      </AnimatedStep>
      <SModalButtons
        // loading={loading}
        // onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
