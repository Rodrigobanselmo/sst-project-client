import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import dynamic from 'next/dynamic';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { useAccess } from 'core/hooks/useAccess';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseUserDataModal } from '../../hooks/useEditCompany';
import { useUserData } from './hooks/useUserData';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

export const UserDataModalStep = (props: IUseUserDataModal) => {
  const { control, onSubmit, loading, onCloseUnsaved, onChangeCnpj } =
    useUserData(props);
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
          {/* <InputForm
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
          /> */}
        </Box>
        <EmployeeSelect
          preload
          maxWidth="100%"
          maxPerPage={10}
          // handleSelect={(employee) => console.error(employee)}
          // handleSelect={(_, list) =>
          //   setData((old) => ({ ...old, selectedEmployees: list }))
          // }
          selectedEmployees={[]}
          multiple={false}
          {...props}
        />
        {/* <SSwitch
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
            /> */}
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
