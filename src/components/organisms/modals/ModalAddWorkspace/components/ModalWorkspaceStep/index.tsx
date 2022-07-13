/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { cepMask } from 'core/utils/masks/cep.mask';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import { IUseEditWorkspace } from '../../hooks/useEditWorkspace';

export const ModalWorkspaceStep = ({
  companyData,
  control,
  setCompanyData,
  onChangeCep,
  onChangeCnpj,
  loadingCnpj,
  loadingCep,
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
        placeholder={'nome do estabelecimento de trabalho...'}
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
          mask={cepMask.apply}
          loading={loadingCep}
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
      <Box ml={6}>
        <SSwitch
          onChange={() => {
            setCompanyData({
              ...companyData,
              isFromOtherCnpj: !companyData.isFromOtherCnpj,
            } as any);
          }}
          checked={companyData.isFromOtherCnpj}
          label="Estabelecimento realiza atividades em outro CNPJ"
          sx={{ mr: 4 }}
          color="text.light"
        />
      </Box>
      {companyData.isFromOtherCnpj && (
        <InputForm
          defaultValue={companyData.cnpj}
          label="CNPJ"
          control={control}
          sx={{ minWidth: ['100%', 600] }}
          placeholder={'cnpj do empresa...'}
          name="cnpj"
          size="small"
          mask={cnpjMask.apply}
          onChange={({ target: { value } }) => onChangeCnpj(value)}
          loading={loadingCnpj}
        />
      )}
    </SFlex>
  );
};
