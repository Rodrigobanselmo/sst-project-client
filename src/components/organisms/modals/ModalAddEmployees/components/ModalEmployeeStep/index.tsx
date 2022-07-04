/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { SHierarchyIcon } from 'assets/icons/SHierarchyIcon';

import { cpfMask } from 'core/utils/masks/cpf.mask';

import { IUseEditEmployee } from '../../hooks/useEditEmployees';

export const ModalEmployeeStep = ({
  employeeData,
  control,
  switchRef,
  onAddHierarchy,
}: IUseEditEmployee) => {
  // const workspaceText =
  //   employeeData.workspaces.length > 0
  //     ? employeeData.workspaces.map((workspace) => workspace.name).join(',')
  //     : 'Adicionar Estabelecomento';

  const hierarchyText =
    ('label' in employeeData.hierarchy && employeeData.hierarchy?.label) ||
    employeeData.hierarchy?.name ||
    'Adicionar cargo';

  return (
    <SFlex gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      <InputForm
        autoFocus
        defaultValue={employeeData.name}
        label="Nome"
        labelPosition="center"
        control={control}
        sx={{ minWidth: ['100%', 600], textTransform: 'uppercase' }}
        placeholder={'nome completo do empregado...'}
        name="name"
        size="small"
      />
      <InputForm
        defaultValue={employeeData.cpf}
        label="CPF"
        labelPosition="center"
        control={control}
        sx={{ minWidth: ['100%', 600] }}
        placeholder={'000.000.000-00'}
        name="cpf"
        mask={cpfMask.apply}
        size="small"
      />
      <SFlex align="center" justify="space-between">
        <SFlex align="center">
          {/* <STagButton
            large
            icon={SWorkspaceIcon}
            text={workspaceText}
            iconProps={{ sx: { fontSize: 17 } }}
            onClick={onAddWorkspace}
          /> */}
          <STagButton
            large
            icon={SHierarchyIcon}
            text={hierarchyText}
            iconProps={{ sx: { fontSize: 17 } }}
            onClick={onAddHierarchy}
          />
        </SFlex>
        {!employeeData.id && (
          <SSwitch
            inputRef={switchRef}
            label="Criar mais"
            sx={{ mr: 4 }}
            color="text.light"
          />
        )}
      </SFlex>
    </SFlex>
  );
};
