import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import dynamic from 'next/dynamic';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { useAccess } from 'core/hooks/useAccess';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseAddCompany } from '../../hooks/useEditClinic';
import { useCompanyEdit } from './hooks/useCompanyFirstEdit';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

export const DataModalCompanyStep = (props: IUseAddCompany) => {
  const { control, onSubmit, loading, onCloseUnsaved, onChangeCnpj, setValue } =
    useCompanyEdit(props);
  const { isValidRoles } = useAccess();
  const { companyData, setCompanyData, isEdit } = props;

  const buttons = [
    {},
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
        <SText mb={5} color="text.label" fontSize={14}>
          Identificação da Clinica
        </SText>
        <Box flex={1}>
          <InputForm
            setValue={setValue}
            defaultValue={companyData.cnpj}
            onChange={({ target: { value } }) => onChangeCnpj(value)}
            label="CNPJ"
            control={control}
            sx={{ maxWidth: 300, mb: 8 }}
            placeholder={'cnpj da clínica...'}
            name="cnpj"
            size="small"
            labelPosition="center"
            mask={cnpjMask.apply}
          />
        </Box>
        <SFlex gap={8} direction="column">
          <SFlex flexWrap="wrap" gap={5}>
            <Box flex={1}>
              <InputForm
                setValue={setValue}
                defaultValue={companyData.initials}
                minRows={2}
                maxRows={4}
                label="Sigla"
                sx={{ minWidth: [100] }}
                control={control}
                placeholder={'ex: ABC'}
                name="initials"
                labelPosition="center"
                size="small"
              />
            </Box>
            <Box flex={5}>
              <InputForm
                defaultValue={companyData.unit}
                setValue={setValue}
                label="Unidade"
                control={control}
                sx={{ minWidth: 200 }}
                placeholder={'unidade de identificação da clínica...'}
                name="unit"
                size="small"
                labelPosition="center"
              />
            </Box>
          </SFlex>
          <InputForm
            defaultValue={companyData.fantasy}
            setValue={setValue}
            minRows={2}
            maxRows={4}
            label="Nome"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'nome da clínica...'}
            required
            name="fantasy"
            size="small"
            labelPosition="center"
          />
          <SFlex flexWrap="wrap" gap={5}>
            <Box flex={5}>
              <InputForm
                setValue={setValue}
                defaultValue={companyData.name}
                minRows={2}
                maxRows={4}
                label="Razão Social"
                required
                sx={{ minWidth: [300, 600] }}
                control={control}
                placeholder={'razão Social da clínica...'}
                name="name"
                labelPosition="center"
                size="small"
              />
            </Box>
          </SFlex>

          {!companyData.id && (
            <SFlex flexWrap="wrap" gap={5}>
              <Box flex={5}>
                <InputForm
                  defaultValue={phoneMask.mask(companyData.email)}
                  setValue={setValue}
                  label="Email"
                  sx={{ minWidth: [300, 500] }}
                  control={control}
                  placeholder={'email de contato da clínica...'}
                  name="email"
                  size="small"
                  labelPosition="center"
                />
              </Box>
              <Box flex={1}>
                <InputForm
                  defaultValue={companyData.phone}
                  label="Telefone"
                  setValue={setValue}
                  control={control}
                  sx={{ minWidth: 300 }}
                  placeholder={'telephome da clínica...'}
                  name="phone"
                  mask={phoneMask.apply}
                  size="small"
                  labelPosition="center"
                />
              </Box>
            </SFlex>
          )}
        </SFlex>
        <DraftEditor
          mt={10}
          size="xs"
          label="Observações"
          placeholder="observação..."
          defaultValue={companyData.description}
          onChange={(value) => {
            setCompanyData({
              ...companyData,
              description: value,
            });
          }}
        />
        <SFlex ml={5} mt={10} direction="column">
          {isValidRoles([RoleEnum.MASTER]) && (
            <SSwitch
              onChange={(e) => {
                setCompanyData({
                  ...companyData,
                  license: {
                    ...companyData.license,
                    status: e.target.checked
                      ? StatusEnum.ACTIVE
                      : StatusEnum.INACTIVE,
                  },
                });
              }}
              checked={!!(companyData.license.status === StatusEnum.ACTIVE)}
              label="Ativar licença de uso da plataforma"
              sx={{ mr: 4 }}
              color="text.light"
            />
          )}
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
