import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { CnaeInputSelect } from 'components/organisms/inputSelect/CnaeSelect/CnaeSelect';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import dayjs from 'dayjs';
import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { companyOptionsConstant } from 'core/constants/maps/company.constant';
import { useAccess } from 'core/hooks/useAccess';
import { dateToDate } from 'core/utils/date/date-format';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCompanyEdit } from './hooks/useCompanyFirstEdit';

export const FirstModalCompanyStep = (props: IUseAddCompany) => {
  const { control, onSubmit, loading, onCloseUnsaved } = useCompanyEdit(props);
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

  const cnae = companyData.primary_activity[0] || { code: '', name: '' };

  return (
    <>
      <AnimatedStep>
        <SText mb={5} color="text.label" fontSize={14}>
          Identificaçào da empresa
        </SText>
        <SFlex gap={8} direction="column">
          <SFlex flexWrap="wrap" gap={5}>
            <Box flex={1}>
              <InputForm
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
                label="Unidade"
                control={control}
                sx={{ minWidth: 200 }}
                placeholder={'unidade de identificação da empresa...'}
                name="unit"
                size="small"
                labelPosition="center"
              />
            </Box>
            <Box flex={1}>
              <DatePickerForm
                label="Inauguração"
                control={control}
                defaultValue={dateToDate(companyData.activityStartDate)}
                sx={{ minWidth: 200 }}
                name="activityStartDate"
                onChange={(date) => {
                  setCompanyData({
                    ...companyData,
                    activityStartDate: date instanceof Date ? date : undefined,
                  });
                }}
              />
            </Box>
          </SFlex>
          <SFlex flexWrap="wrap" gap={5}>
            <Box flex={5}>
              <InputForm
                defaultValue={companyData.name}
                minRows={2}
                maxRows={4}
                label="Razão Social"
                required
                sx={{ minWidth: [300, 600] }}
                control={control}
                placeholder={'razão Social da empresa...'}
                name="name"
                labelPosition="center"
                size="small"
              />
            </Box>
            <Box flex={1}>
              <InputForm
                defaultValue={companyData.cnpj}
                minRows={2}
                maxRows={4}
                label="CNPJ*"
                control={control}
                sx={{ minWidth: 200 }}
                placeholder={'cnpj da empresa...'}
                name="cnpj"
                size="small"
                labelPosition="center"
                mask={cnpjMask.apply}
                disabled
              />
            </Box>
          </SFlex>
          <InputForm
            defaultValue={companyData.fantasy}
            minRows={2}
            maxRows={4}
            label="Nome fantasia"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'nome fantasia da empresa...'}
            name="fantasy"
            size="small"
            labelPosition="center"
          />
          {!companyData.id && (
            <SFlex flexWrap="wrap" gap={5}>
              <Box flex={5}>
                <InputForm
                  defaultValue={phoneMask.mask(companyData.email)}
                  label="Email"
                  sx={{ minWidth: [300, 500] }}
                  control={control}
                  placeholder={'email de contato da empresa...'}
                  name="email"
                  size="small"
                  labelPosition="center"
                />
              </Box>
              <Box flex={1}>
                <InputForm
                  defaultValue={companyData.phone}
                  label="Telefone"
                  control={control}
                  sx={{ minWidth: 300 }}
                  placeholder={'telephome da empresa...'}
                  name="phone"
                  mask={phoneMask.apply}
                  size="small"
                  labelPosition="center"
                />
              </Box>
            </SFlex>
          )}
          <RadioFormText
            type="radio"
            control={control}
            defaultValue={String(companyData.type)}
            onChange={(e) =>
              props.setCompanyData((old) => ({
                ...old,
                type: (e as any).target.value,
              }))
            }
            options={[
              {
                content: companyOptionsConstant[CompanyTypesEnum.MATRIZ].name,
                value: CompanyTypesEnum.MATRIZ,
              },
              {
                content: companyOptionsConstant[CompanyTypesEnum.FILIAL].name,
                value: CompanyTypesEnum.FILIAL,
              },
            ]}
            name="type"
            columns={2}
          />

          <SText color="text.label" mb={-3} fontSize={14}>
            Responsavel legal
          </SText>
          <SFlex mt={0} flexWrap="wrap" gap={5}>
            <Box flex={5}>
              <InputForm
                defaultValue={companyData.responsibleName}
                label="Responsavel legal"
                control={control}
                labelPosition="center"
                placeholder={'Responsavel legal da empresa...'}
                name="responsibleName"
                size="small"
              />
            </Box>
            <Box flex={2}>
              <InputForm
                defaultValue={companyData.responsibleNit}
                label="NIT"
                control={control}
                labelPosition="center"
                name="responsibleNit"
                size="small"
              />
            </Box>
            <Box flex={2}>
              <InputForm
                defaultValue={companyData.responsibleCpf}
                label="CPF"
                control={control}
                labelPosition="center"
                placeholder={'000.000.000-00'}
                name="responsibleCpf"
                size="small"
              />
            </Box>
          </SFlex>

          <CnaeInputSelect
            onChange={(activity) => {
              setCompanyData({
                ...companyData,
                primary_activity: [activity],
              });
            }}
            data={cnae}
            defaultValue={cnae}
            name="primary_activity"
            label="CNAE"
            control={control}
          />
        </SFlex>
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
              label="Ativar licensa de uso da plataforma"
              sx={{ mr: 4 }}
              color="text.light"
            />
          )}
          {isValidRoles([RoleEnum.MASTER]) && (
            <SSwitch
              onChange={(e) => {
                setCompanyData({
                  ...companyData,
                  isConsulting: e.target.checked,
                });
              }}
              checked={!!companyData.isConsulting}
              label="Empresa de consultoria"
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