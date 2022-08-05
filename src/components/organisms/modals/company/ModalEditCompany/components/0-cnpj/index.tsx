/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCheckCompany } from './hooks/useCheckCompany';

export const ZeroModalCompanyStep = (props: IUseAddCompany) => {
  const { onSubmit, control, onCloseUnsaved, loading } = useCheckCompany(props);

  const { companyData } = props;
  const buttons = [
    {},
    {
      text: 'Continuar',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <div>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            defaultValue={companyData.cnpj}
            minRows={2}
            maxRows={4}
            label="CNPJ*"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'cnpj do empresa...'}
            name="cnpj"
            mask={cnpjMask.apply}
            size="small"
          />
        </SFlex>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </div>
  );
};
