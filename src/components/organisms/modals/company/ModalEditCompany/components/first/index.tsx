import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { companyOptionsConstant } from 'core/constants/maps/company.constant';
import { useAccess } from 'core/hooks/useAccess';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCompanyEdit } from './hooks/useCompanyFirstEdit';

export const FirstModalCompanyStep = (props: IUseAddCompany) => {
  const { control, onSubmit, loading, onCloseUnsaved, lastStep } =
    useCompanyEdit(props);
  const { isValidRoles } = useAccess();
  const { companyData, setCompanyData } = props;

  const buttons = [
    {},
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

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SFlex flexWrap="wrap" gap={5}>
            <Box flex={5}>
              <InputForm
                defaultValue={companyData.name}
                minRows={2}
                maxRows={4}
                label="Nome*"
                sx={{ minWidth: [300, 600] }}
                control={control}
                placeholder={'nome do empresa...'}
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
                placeholder={'cnpj do empresa...'}
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
          <InputForm
            defaultValue={companyData.responsibleName}
            label="Responsavel legal"
            control={control}
            labelPosition="center"
            placeholder={'Responsavel legal da empresa...'}
            name="responsibleName"
            size="small"
          />

          <SFlex flexWrap="wrap" gap={5}>
            <Box flex={5}>
              <InputForm
                defaultValue={companyData.email}
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

          <RadioForm
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
