import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import SText from 'components/atoms/SText';
import { SelectForm } from 'components/molecules/form/select';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect';
import dayjs from 'dayjs';
import {
  employeeExamScheduleTypeList,
  ExamHistoryTypeEnum,
} from 'project/enum/employee-exam-history-type.enum';
import { SexTypeEnum } from 'project/enum/sex.enums';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { border_box } from 'core/styles/cssInJsStyles';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseEditEmployee } from '../../hooks/useEditExamEmployee';
import { useEmployeeStep } from './hooks/useEmployeeStep';

export const getSexLabel = (sex?: SexTypeEnum) => {
  if (sex === SexTypeEnum.F) return 'Feminino';
  if (sex === SexTypeEnum.M) return 'Masculino';

  return '';
};

export const EmployeeStep = (props: IUseEditEmployee) => {
  const {
    control,
    onSubmit,
    employee,
    data,
    loading,
    onCloseUnsaved,
    isEdit,
    setData,
    setValue,
    notInHierarchy,
    newHierarchy,
    isPendingExams,
  } = useEmployeeStep(props);

  const buttons = [
    {},
    {
      text: 'Proximo',
      arrowNext: !isEdit,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <EmployeeSelect
          maxWidth="200px"
          maxPerPage={5}
          handleSelect={(employee: IEmployee) => {
            employee?.id &&
              setData((old) => ({
                ...old,
                companyId: employee.companyId,
                employeeId: employee.id,
                examType: undefined,
                examsData: [],
              }));
          }}
          text={'Selecionar Funcionario'}
          // addButton={false}
          large
          queryEmployee={{ all: true }}
          tooltipTitle="Encontrar funcionário"
          selectedEmployees={[]}
          multiple={false}
        />
        <Box
          mt={12}
          sx={{
            input: { fontSize: 14 },
          }}
        >
          {employee?.id && (
            <>
              {/* employee */}
              <Box sx={{ ...border_box }} mb={5}>
                <SFlex flexWrap="wrap" gap={5} mb={10}>
                  <Box flex={2}>
                    <SInput
                      value={employee?.name || ''}
                      disabled
                      label="Nome do funcionário"
                      superSmall
                      InputLabelProps={{ shrink: true }}
                      labelPosition="center"
                      variant="standard"
                      sx={{
                        width: ['100%'],
                      }}
                    />
                  </Box>
                  <Box flex={1} maxWidth="150px">
                    <SInput
                      value={cpfMask.mask(employee?.cpf) || ''}
                      disabled
                      label="CPF"
                      superSmall
                      InputLabelProps={{ shrink: true }}
                      labelPosition="center"
                      variant="standard"
                      sx={{ width: ['100%'] }}
                    />
                  </Box>
                  <Box flex={1} minWidth="200px">
                    <SInput
                      value={employee?.esocialCode || ''}
                      disabled
                      label="Matrícula (eSocial)"
                      superSmall
                      InputLabelProps={{ shrink: true }}
                      labelPosition="center"
                      variant="standard"
                      sx={{ width: ['100%'] }}
                    />
                  </Box>
                </SFlex>

                <SFlex flexWrap="wrap" gap={5}>
                  <Box minWidth="400px" flex={1}>
                    <SInput
                      value={employee?.email || ''}
                      disabled
                      label="Email"
                      superSmall
                      InputLabelProps={{ shrink: true }}
                      labelPosition="center"
                      variant="standard"
                      sx={{
                        width: ['100%'],
                      }}
                    />
                  </Box>
                  <Box flex={1} minWidth="150px" maxWidth="150px">
                    <SInput
                      value={phoneMask.mask(employee?.phone) || ''}
                      disabled
                      label="Telefone"
                      superSmall
                      InputLabelProps={{ shrink: true }}
                      labelPosition="center"
                      variant="standard"
                      sx={{
                        width: ['100%'],
                      }}
                    />
                  </Box>
                  <Box flex={1} minWidth="50px" maxWidth="50px">
                    <SInput
                      value={
                        employee?.birthday
                          ? dayjs().diff(employee.birthday, 'years')
                          : ''
                      }
                      disabled
                      label="Idade"
                      superSmall
                      InputLabelProps={{ shrink: true }}
                      labelPosition="center"
                      variant="standard"
                      sx={{
                        width: ['100%'],
                      }}
                    />
                  </Box>
                  <Box flex={1} minWidth="150px" maxWidth="150px">
                    <SInput
                      value={getSexLabel(employee?.sex) || ''}
                      disabled
                      label="Sexo"
                      superSmall
                      InputLabelProps={{ shrink: true }}
                      labelPosition="center"
                      variant="standard"
                      sx={{
                        width: ['100%'],
                      }}
                    />
                  </Box>
                </SFlex>
              </Box>

              {/* company */}
              <Box sx={{ ...border_box }}>
                <SFlex flexWrap="wrap" gap={5}>
                  <Box flex={1}>
                    <SInput
                      value={getCompanyName(employee?.company)}
                      disabled
                      label="Nome do Empresa"
                      superSmall
                      InputLabelProps={{ shrink: true }}
                      labelPosition="center"
                      variant="standard"
                      sx={{
                        width: ['100%'],
                      }}
                    />
                  </Box>
                  <Box flex={1} minWidth="150px" maxWidth="150px">
                    <SInput
                      value={cnpjMask.mask(employee?.company?.cnpj) || ''}
                      disabled
                      label="CNPJ"
                      superSmall
                      InputLabelProps={{ shrink: true }}
                      labelPosition="center"
                      variant="standard"
                      sx={{ width: ['100%'] }}
                    />
                  </Box>
                </SFlex>
              </Box>

              {/* hierarchy */}
              <SFlex flexWrap="wrap" mt={5}>
                <Box flex={notInHierarchy ? 1 : 4} sx={{ ...border_box }}>
                  {employee?.hierarchy?.parents?.map((parent, index) => {
                    return (
                      <SInput
                        key={parent.id}
                        value={parent?.name || ''}
                        disabled
                        label={hierarchyConstant[parent.type]?.name}
                        superSmall
                        InputLabelProps={{ shrink: true }}
                        labelPosition="center"
                        variant="standard"
                        sx={{
                          width: ['100%'],
                          mt: index !== 0 ? 8 : 0,
                        }}
                      />
                    );
                  })}
                  <SInput
                    value={employee?.hierarchy?.name || ''}
                    disabled
                    label={'Cargo atual'}
                    superSmall
                    InputLabelProps={{ shrink: true }}
                    labelPosition="center"
                    variant="standard"
                    sx={{
                      width: ['100%'],
                      mt: 8,
                    }}
                  />
                </Box>

                <Box
                  flex={4}
                  sx={{
                    ...border_box,
                    backgroundColor: 'grey.50',
                  }}
                >
                  <SelectForm
                    unmountOnChangeDefault
                    setValue={setValue}
                    defaultValue={String(data.examType || '') || ''}
                    label="Tipo de Exame"
                    disabled={isPendingExams}
                    control={control}
                    placeholder="selecione..."
                    name="examType"
                    inputProps={{
                      autoFocus: true,
                    }}
                    labelPosition="top"
                    onChange={(e) => {
                      if (e.target.value)
                        setData({
                          ...data,
                          examsData: [],
                          examType: (e as any).target.value,
                        });
                    }}
                    size="small"
                    options={employeeExamScheduleTypeList(employee)}
                    boxProps={{ flex: 1 }}
                  />
                  {newHierarchy && data.companyId && employee?.id && (
                    <SFlex direction="column" gap={4} mb={5} mt={5}>
                      <SText color="text.label" fontSize={14}>
                        Novo Cargo
                      </SText>
                      <HierarchySelect
                        tooltipText={(textField) => textField}
                        filterOptions={[HierarchyEnum.SECTOR]}
                        defaultFilter={HierarchyEnum.SECTOR}
                        disabled={isPendingExams}
                        text={
                          data.sector?.name
                            ? data.sector.name
                            : 'Selecione um Setor'
                        }
                        large
                        icon={null}
                        error={data.errors.sector}
                        maxWidth={'auto'}
                        handleSelect={(hierarchy: IHierarchy) => {
                          setData({
                            ...data,
                            sector: hierarchy,
                            hierarchy: undefined,
                            examsData: [],
                            subOffice: undefined,
                            errors: { ...data.errors, sector: false },
                          });
                        }}
                        companyId={data.companyId}
                        selectedId={data.sector?.id}
                        borderActive={data.sector?.id ? 'info' : undefined}
                        active={false}
                        bg={'background.paper'}
                      />
                      <HierarchySelect
                        tooltipText={(textField) => textField}
                        disabled={isPendingExams}
                        filterOptions={[HierarchyEnum.OFFICE]}
                        defaultFilter={HierarchyEnum.OFFICE}
                        text="Selecione um Cargo"
                        large
                        icon={null}
                        maxWidth={'auto'}
                        parentId={data.sector?.id}
                        error={data.errors.hierarchy}
                        handleSelect={(hierarchy: IHierarchy, parents) => {
                          const parentSector =
                            parents &&
                            parents.find(
                              (hierarchy) =>
                                hierarchy.type == HierarchyEnum.SECTOR,
                            );

                          setData({
                            ...data,
                            hierarchy,
                            subOffice: undefined,
                            examsData: [],
                            sector: parentSector,
                            errors: {
                              ...data.errors,
                              sector: false,
                              hierarchy: false,
                            },
                          });
                        }}
                        companyId={data.companyId}
                        selectedId={data.hierarchy?.id}
                        active={false}
                        borderActive={data.hierarchy?.id ? 'info' : undefined}
                        bg={'background.paper'}
                      />
                      {data.hierarchy?.id && (
                        <HierarchySelect
                          tooltipText={(textField) => textField}
                          disabled={isPendingExams}
                          filterOptions={[HierarchyEnum.SUB_OFFICE]}
                          defaultFilter={HierarchyEnum.SUB_OFFICE}
                          text="Selecione um Cargo Desenv."
                          large
                          icon={null}
                          maxWidth={'auto'}
                          parentId={data.hierarchy?.id}
                          error={data.errors.subOffice}
                          handleSelect={(hierarchy: IHierarchy) => {
                            console.log(hierarchy);
                            setData({
                              ...data,
                              subOffice: hierarchy,
                              examsData: [],
                              errors: {
                                ...data.errors,
                                subOffice: false,
                              },
                            });
                          }}
                          companyId={data.companyId}
                          selectedId={data.subOffice?.id}
                          active={false}
                          borderActive={data.subOffice?.id ? 'info' : undefined}
                          bg={'background.paper'}
                        />
                      )}
                    </SFlex>
                  )}
                </Box>
              </SFlex>
            </>
          )}
        </Box>
      </AnimatedStep>
      {/* <p style={{ fontSize: '4px' }}>132.855.119-90</p> */}
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </SFlex>
  );
};
