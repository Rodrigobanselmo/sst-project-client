import React from 'react';
import { useWizard } from 'react-use-wizard';

import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import { companyOptionsConstant } from 'core/constants/maps/company.constant';
import { useAccess } from 'core/hooks/useAccess';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import { IUseAddCompany } from '../../hooks/useAddCompany';
import { useCompanyCreate } from './hooks/useCompanyCreate';

export const SecondModalCompanyStep = (props: IUseAddCompany) => {
  const { control, onSubmit, loading, onCloseUnsaved } =
    useCompanyCreate(props);
  const { previousStep } = useWizard();
  const { companyData, setCompanyData } = props;
  const { isValidRoles } = useAccess();
  const buttons = [
    { onClick: () => previousStep(), text: 'Voltar' },
    {
      text: companyData.id ? 'Salvar' : 'Criar',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            defaultValue={companyData.name}
            minRows={2}
            maxRows={4}
            label="Nome*"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'nome do empresa...'}
            name="name"
            size="small"
          />
          <InputForm
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
          />
          <InputForm
            multiline
            defaultValue={companyData.description}
            minRows={2}
            maxRows={4}
            label="Descrição"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'descrição opcional do empresa...'}
            name="description"
            size="small"
          />
          <RadioFormText
            type="radio"
            control={control}
            defaultValue={String(companyData.type)}
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
          {isValidRoles([RoleEnum.MASTER]) && (
            <SSwitch
              onChange={(e) => {
                setCompanyData({
                  ...companyData,
                  isConsulting: e.target.checked,
                } as any);
              }}
              checked={!!companyData.isConsulting}
              label="Empresa de consultoria"
              sx={{ mr: 4 }}
              color="text.light"
            />
          )}
          {isValidRoles([RoleEnum.MASTER]) && (
            <SSwitch
              onChange={(e) => {
                setCompanyData({
                  ...companyData,
                  isLicensedActive: e.target.checked,
                } as any);
              }}
              checked={!!companyData.isLicensedActive}
              label="Empresa ativa"
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
