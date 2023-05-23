import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { cepMask } from 'core/utils/masks/cep.mask';
import { intMask } from 'core/utils/masks/int.mask';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCompanyEdit } from './hooks/useCompanySecondEdit';

export const SecondModalCompanyStep = (props: IUseAddCompany) => {
  const {
    control,
    onSubmit,
    onCloseUnsaved,
    previousStep,
    onChangeCep,
    setValue,
  } = useCompanyEdit(props);
  const { companyData, loading, isEdit } = props;

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

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SText color="text.label" fontSize={14}>
            Endereço
          </SText>
          <SFlex sx={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
            <InputForm
              setValue={setValue}
              defaultValue={cepMask.mask(companyData?.address?.cep || '') || ''}
              mask={cepMask.apply}
              label="Cep"
              labelPosition="center"
              control={control}
              onChange={({ target: { value } }) => onChangeCep(value)}
              placeholder={'descrição...'}
              name="cep"
              size="small"
            />
            <InputForm
              setValue={setValue}
              defaultValue={companyData.address?.street || ''}
              label="Logradouro"
              labelPosition="center"
              control={control}
              name="street"
              size="small"
            />
          </SFlex>
          <InputForm
            defaultValue={companyData.address?.neighborhood || ''}
            setValue={setValue}
            label="Bairro"
            labelPosition="center"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            name="neighborhood"
            size="small"
          />
          <SFlex sx={{ display: 'grid', gridTemplateColumns: '1fr 150px ' }}>
            <InputForm
              defaultValue={companyData.address?.city || ''}
              label="Cidade"
              labelPosition="center"
              setValue={setValue}
              control={control}
              name="city"
              size="small"
            />
            <InputForm
              defaultValue={companyData.address?.state || ''}
              setValue={setValue}
              label="Estado"
              labelPosition="center"
              control={control}
              inputProps={{ sx: { textTransform: 'uppercase' } }}
              name="state"
              size="small"
            />
          </SFlex>
          <SFlex sx={{ display: 'grid', gridTemplateColumns: ' 1fr 150px' }}>
            <InputForm
              defaultValue={companyData.address?.complement || ''}
              label="Complemento"
              setValue={setValue}
              labelPosition="center"
              control={control}
              name="complement"
              size="small"
            />
            <InputForm
              defaultValue={companyData.address?.number || ''}
              label="Número"
              setValue={setValue}
              labelPosition="center"
              control={control}
              name="number"
              size="small"
            />
          </SFlex>
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
