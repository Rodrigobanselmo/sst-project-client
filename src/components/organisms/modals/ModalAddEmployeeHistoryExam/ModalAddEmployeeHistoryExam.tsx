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
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect ';
import {
  EmployeeHierarchyMotiveTypeEnum,
  employeeHierarchyMotiveTypeList,
} from 'project/enum/employee-hierarchy-motive.enum';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { dateToDate } from 'core/utils/date/date-format';

import { useAddData } from './hooks/useAddData';

export const ModalAddEmployeeHistoryExam = () => {
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
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Lotação'}
          secondIcon={data?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />
        <DatePickerForm
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

        {/* <SelectForm
          defaultValue={String(data.motive || '') || ''}
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
        /> */}

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
              defaultValue={data.phone_2}
              label="Telefone Secundário"
              control={control}
              sx={{ minWidth: 200 }}
              placeholder={'(__) _____-____'}
              name="phone_2"
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
