/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { SelectForm } from 'components/molecules/form/select';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect';
import {
  EmployeeHierarchyMotiveTypeEnum,
  employeeHierarchyMotiveTypeList,
} from 'project/enum/employee-hierarchy-motive.enum';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { dateToDate } from 'core/utils/date/date-format';

import { useAddData } from './hooks/useAddData';

export const ModalAddEmployeeHistoryHier = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    data,
    setData,
    control,
    handleSubmit,
    isEdit,
    modalName,
    handleDelete,
    companyId,
    setValue,
  } = useAddData();

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setData({ ...data }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        center
        width={['100%', 650]}
        sx={{
          minHeight: ['100%', 420],
          display: 'flex',
          flexDirection: 'column',
        }}
        p={8}
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Lotação'}
          secondIcon={data?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />
        <DatePickerForm
          setValue={setValue}
          label="Data de início"
          control={control}
          defaultValue={dateToDate(data.startDate)}
          sx={{ maxWidth: 200, mb: 6 }}
          placeholderText="__/__/__"
          name="startDate"
          labelPosition="top"
          onChange={(date) => {
            setData({
              ...data,
              startDate: date instanceof Date ? date : undefined,
            });
          }}
        />

        <SelectForm
          defaultValue={String(data.motive || '') || ''}
          setValue={setValue}
          label="Motivo"
          control={control}
          placeholder="Exemplo: Admissão"
          name="motive"
          labelPosition="top"
          onChange={(e) => {
            if (e.target.value)
              setData({
                ...data,
                motive: (e as any).target.value,
              });
          }}
          size="small"
          options={employeeHierarchyMotiveTypeList}
        />

        {data.motive != EmployeeHierarchyMotiveTypeEnum.DEM && (
          <SFlex direction="column" gap={4} mb={5} mt={5}>
            <SText color="text.label" fontSize={14}>
              Cargo
            </SText>
            <HierarchySelect
              tooltipText={(textField) => textField}
              filterOptions={[HierarchyEnum.SECTOR]}
              defaultFilter={HierarchyEnum.SECTOR}
              text={data.sector?.name ? data.sector.name : 'Selecione um Setor'}
              large
              icon={null}
              error={data.errors.sector}
              maxWidth={'auto'}
              handleSelect={(hierarchy: IHierarchy) =>
                setData({
                  ...data,
                  sector: hierarchy,
                  hierarchy: undefined,
                  hierarchyId: undefined,
                  errors: { ...data.errors, sector: false },
                })
              }
              companyId={companyId}
              selectedId={data.sector?.id}
              borderActive={data.sector?.id ? 'info' : undefined}
              active={false}
              bg={'background.paper'}
            />
            <HierarchySelect
              tooltipText={(textField) => textField}
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
                    (hierarchy) => hierarchy.type == HierarchyEnum.SECTOR,
                  );

                setData({
                  ...data,
                  hierarchy,
                  hierarchyId: hierarchy?.id || undefined,
                  sector: parentSector,
                  errors: { ...data.errors, sector: false, hierarchy: false },
                });
              }}
              companyId={companyId}
              selectedId={data.hierarchy?.id}
              active={false}
              borderActive={data.hierarchy?.id ? 'info' : undefined}
              bg={'background.paper'}
            />
            {data.hierarchy?.id && (
              <HierarchySelect
                tooltipText={(textField) => textField}
                filterOptions={[HierarchyEnum.SUB_OFFICE]}
                defaultFilter={HierarchyEnum.SUB_OFFICE}
                text="Selecione um Cargo Desenv."
                large
                icon={null}
                maxWidth={'auto'}
                parentId={data.hierarchy?.id}
                error={data.errors.subOffice}
                handleSelect={(hierarchy: IHierarchy) => {
                  setData({
                    ...data,
                    subOffice: hierarchy,
                    errors: {
                      ...data.errors,
                      subOffice: false,
                    },
                  });
                }}
                companyId={companyId}
                selectedId={data.subOffice?.id}
                active={false}
                borderActive={data.subOffice?.id ? 'info' : undefined}
                bg={'background.paper'}
              />
            )}
          </SFlex>
        )}

        {/* <SFlex flexWrap="wrap" mb={5} gap={5}>
          <Box flex={1}>
            <InputForm
              defaultValue={data.phone}
              label="Telefone Principal"
              sx={{ minWidth: [100] }}
              control={control}
              placeholder={'(__) _____-____'}
              name="phone"
              labelPosition="center"
              size="small"
              mask={phoneMask.apply}
            />
          </Box>
          <Box flex={1}>
            <InputForm
              defaultValue={data.phone_1}
              label="Telefone Secundário"
              control={control}
              sx={{ minWidth: 200 }}
              placeholder={'(__) _____-____'}
              name="phone_1"
              size="small"
              labelPosition="center"
              mask={phoneMask.apply}
            />
          </Box>
        </SFlex> */}
        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
