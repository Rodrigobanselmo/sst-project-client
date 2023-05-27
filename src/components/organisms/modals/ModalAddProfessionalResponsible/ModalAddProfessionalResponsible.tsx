/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { dateToDate } from 'core/utils/date/date-format';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { useAddProfessionalResponsible } from './hooks/useAddProfessionalResponsible';

export const ModalAddProfessionalResponsible = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    professionalResponsibleData,
    setProfessionalResponsibleData,
    control,
    handleSubmit,
    isEdit,
    modalName,
    handleDelete,
    setValue,
  } = useAddProfessionalResponsible();

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () =>
        setProfessionalResponsibleData({ ...professionalResponsibleData }),
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
        p={8}
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Responsável PPP'}
          secondIcon={professionalResponsibleData?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />

        <ProfessionalInputSelect
          onChange={(prof) => {
            setProfessionalResponsibleData({
              ...professionalResponsibleData,
              professional: prof,
            });
          }}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'nome do responsável...',
          }}
          query={{ byCouncil: true }}
          defaultValue={professionalResponsibleData.professional}
          name="profResponsible"
          type={[ProfessionalTypeEnum.ENGINEER]}
          label="Profissional Responsável"
          control={control}
        />

        <Box mt={10} mb={150}>
          <DatePickerForm
            setValue={setValue}
            placeholderText="__/__/__"
            label="Início da responsabilidade"
            labelPosition="top"
            control={control}
            defaultValue={dateToDate(professionalResponsibleData?.startDate)}
            name="startDate"
            sx={{ maxWidth: 240 }}
            onChange={(date) => {
              setProfessionalResponsibleData({
                ...professionalResponsibleData,
                startDate: date instanceof Date ? date : undefined,
              });
            }}
          />
        </Box>

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
