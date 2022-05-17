/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { IUseEditWorkspace } from '../../hooks/useEditWorkspace';

export const ModalWorkplaceStep = ({
  companyData,
  control,
  onChangeCep,
}: IUseEditWorkspace) => {
  return (
    <SFlex gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      <InputForm
        autoFocus
        defaultValue={companyData.name}
        minRows={2}
        maxRows={4}
        label="Nome"
        labelPosition="center"
        control={control}
        sx={{ minWidth: ['100%', 600] }}
        placeholder={'nome da unidade de trabalho...'}
        name="name"
        size="small"
      />
      <InputForm
        defaultValue={companyData.description}
        multiline
        minRows={2}
        maxRows={4}
        label="Descrição"
        labelPosition="center"
        control={control}
        sx={{ minWidth: ['100%', 600] }}
        placeholder={'descrição...'}
        name="description"
        size="small"
      />
      <SText color="text.label" fontSize={14}>
        Endereço
      </SText>
      <SFlex sx={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
        <InputForm
          defaultValue={companyData.cep}
          minRows={2}
          maxRows={4}
          label="Cep"
          labelPosition="center"
          control={control}
          onChange={({ target: { value } }) => onChangeCep(value)}
          placeholder={'descrição...'}
          name="cep"
          size="small"
        />
        <InputForm
          defaultValue={companyData.street}
          minRows={2}
          maxRows={4}
          label="Logradouro"
          labelPosition="center"
          control={control}
          name="street"
          size="small"
        />
      </SFlex>
      <InputForm
        defaultValue={companyData.neighborhood}
        minRows={2}
        maxRows={4}
        label="Bairro"
        labelPosition="center"
        control={control}
        sx={{ minWidth: ['100%', 600] }}
        name="neighborhood"
        size="small"
      />
      <SFlex sx={{ display: 'grid', gridTemplateColumns: '1fr 150px ' }}>
        <InputForm
          defaultValue={companyData.city}
          minRows={2}
          maxRows={4}
          label="Cidade"
          labelPosition="center"
          control={control}
          name="city"
          size="small"
        />
        <InputForm
          defaultValue={companyData.state}
          minRows={2}
          maxRows={4}
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
          defaultValue={companyData.complement}
          minRows={2}
          maxRows={4}
          label="Complemento"
          labelPosition="center"
          control={control}
          name="complement"
          size="small"
        />
        <InputForm
          defaultValue={companyData.number}
          minRows={2}
          maxRows={4}
          label="Número"
          labelPosition="center"
          control={control}
          name="number"
          size="small"
        />
      </SFlex>
    </SFlex>
  );
};
