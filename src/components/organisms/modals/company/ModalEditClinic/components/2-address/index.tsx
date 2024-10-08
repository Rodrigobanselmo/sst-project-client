import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { cepMask } from 'core/utils/masks/cep.mask';
import { intMask } from 'core/utils/masks/int.mask';

import { IUseAddCompany } from '../../hooks/useEditClinic';
import { useCompanyEdit } from './hooks/useCompanySecondEdit';

export const AddressModalCompanyStep = (props: IUseAddCompany) => {
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
              defaultValue={cepMask.mask(companyData?.address?.cep || '') || ''}
              setValue={setValue}
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
              defaultValue={companyData.address?.street || ''}
              label="Logradouro"
              setValue={setValue}
              labelPosition="center"
              control={control}
              name="street"
              size="small"
            />
          </SFlex>
          <InputForm
            setValue={setValue}
            defaultValue={companyData.address?.neighborhood || ''}
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
              setValue={setValue}
              label="Cidade"
              labelPosition="center"
              control={control}
              name="city"
              size="small"
            />
            <InputForm
              defaultValue={companyData.address?.state || ''}
              label="Estado"
              labelPosition="center"
              control={control}
              inputProps={{ sx: { textTransform: 'uppercase' } }}
              setValue={setValue}
              name="state"
              size="small"
            />
          </SFlex>
          <SFlex sx={{ display: 'grid', gridTemplateColumns: ' 1fr 150px' }}>
            <InputForm
              defaultValue={companyData.address?.complement || ''}
              label="Complemento"
              labelPosition="center"
              control={control}
              setValue={setValue}
              name="complement"
              size="small"
            />
            <InputForm
              defaultValue={companyData.address?.number || ''}
              label="Número"
              labelPosition="center"
              control={control}
              name="number"
              setValue={setValue}
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
