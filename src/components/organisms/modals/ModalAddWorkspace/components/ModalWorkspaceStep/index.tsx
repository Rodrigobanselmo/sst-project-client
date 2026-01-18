/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, styled } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import SHelpIcon from 'assets/icons/SHelpIcon';
import { InputForm } from 'components/molecules/form/input';
import { CnaeInputSelect } from 'components/organisms/inputSelect/CnaeSelect/CnaeSelect';

import { cepMask } from 'core/utils/masks/cep.mask';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import { IUseEditWorkspace } from '../../hooks/useEditWorkspace';
import { ICnae } from 'core/interfaces/api/ICompany';
import {
  SEditor,
  SEditorToolbarOption,
} from '@v2/components/forms/fields/SEditor/SEditor';

const StyledImage = styled('img')`
  height: 150px;
  max-width: 300px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
  &:active {
    opacity: 0.5;
  }
`;

export const ModalWorkspaceStep = ({
  companyData,
  control,
  setCompanyData,
  onChangeCep,
  onChangeCnpj,
  loadingCnpj,
  loadingCep,
  setValue,
  handleAddPhoto,
}: IUseEditWorkspace) => {
  const [primaryCnae, setPrimaryCnae] = React.useState<ICnae | null>(null);

  return (
    <SFlex gap={8} direction="column" mt={8} minWidth={800}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      {companyData.id && (
        <>
          <SText color="text.label" fontSize={14} mb={-2}>
            Logo do estabelecimento
          </SText>
          <StyledImage
            alt={companyData.name}
            src={companyData.logoUrl || '/images/placeholder-image.png'}
            onClick={handleAddPhoto}
          />
        </>
      )}
      <InputForm
        autoFocus
        defaultValue={companyData.name}
        minRows={2}
        maxRows={4}
        label="Nome"
        labelPosition="center"
        setValue={setValue}
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
        setValue={setValue}
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
          setValue={setValue}
          placeholder={'descrição...'}
          name="cep"
          mask={cepMask.apply}
          loading={loadingCep}
          size="small"
        />
        <InputForm
          defaultValue={companyData.street}
          minRows={2}
          setValue={setValue}
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
        setValue={setValue}
        name="neighborhood"
        size="small"
      />
      <SFlex sx={{ display: 'grid', gridTemplateColumns: '1fr 150px ' }}>
        <InputForm
          defaultValue={companyData.city}
          minRows={2}
          maxRows={4}
          setValue={setValue}
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
          defaultValue={companyData.complement}
          minRows={2}
          maxRows={4}
          label="Complemento"
          labelPosition="center"
          setValue={setValue}
          control={control}
          name="complement"
          size="small"
        />
        <InputForm
          defaultValue={companyData.number}
          setValue={setValue}
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
        <>
          <Box ml={6}>
            <SSwitch
              onChange={() => {
                setCompanyData({
                  ...companyData,
                  useCustomSection: !companyData.useCustomSection,
                } as any);
              }}
              checked={companyData.useCustomSection}
              label="Criar seção personalizada do estabelecimento"
              sx={{ mr: 4 }}
              color="text.light"
            />
          </Box>
          <InputForm
            defaultValue={companyData.cnpj}
            label="CNPJ"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            setValue={setValue}
            placeholder={'cnpj do empresa...'}
            name="cnpj"
            size="small"
            mask={cnpjMask.apply}
            onChange={({ target: { value } }) => onChangeCnpj(value)}
            loading={loadingCnpj}
          />
          {!companyData.useCustomSection ? (
            <>
              <InputForm
                defaultValue={companyData.companyJson.name}
                label="Razão Social"
                control={control}
                sx={{ minWidth: ['100%', 600] }}
                setValue={setValue}
                name="companyName"
                size="small"
              />
              <CnaeInputSelect
                control={control}
                setValue={setValue}
                onChange={(data) => {
                  setValue('primaryCnae', data);
                  setPrimaryCnae(data);
                }}
                name="primaryCnaeId"
                label="CNAE Principal"
                data={
                  primaryCnae || companyData.companyJson.primary_activity?.[0]
                }
                defaultValue={companyData.companyJson.primary_activity?.[0]}
              />
            </>
          ) : (
            <Box>
              <SFlex align="center" gap={1} mb={6} mt={0}>
                <SText color="grey.600" fontSize={14}>
                  Estabelecimento (seção personalizada)
                </SText>
                <STooltip
                  title="Este campo será inserido no documento na identificação do estabelecimento"
                  withWrapper
                >
                  <SHelpIcon
                    sx={{
                      fontSize: 16,
                      color: 'grey.600',
                      cursor: 'pointer',
                    }}
                  />
                </STooltip>
              </SFlex>
              <SEditor
                value={companyData.companyJson.customSectionHTML || ''}
                toolbarOptions={[
                  SEditorToolbarOption.HEADING,
                  SEditorToolbarOption.BOLD,
                  SEditorToolbarOption.ITALIC,
                  SEditorToolbarOption.UNDO,
                  SEditorToolbarOption.REDO,
                ]}
                onChange={(value) => {
                  setValue('customSectionHTML', value);
                }}
                placeholder="Digite a seção do estabelecimento..."
                containerProps={{
                  sx: {
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  },
                }}
                editorContainerProps={{
                  sx: { minHeight: 80 },
                }}
              />
            </Box>
          )}
        </>
      )}
    </SFlex>
  );
};
