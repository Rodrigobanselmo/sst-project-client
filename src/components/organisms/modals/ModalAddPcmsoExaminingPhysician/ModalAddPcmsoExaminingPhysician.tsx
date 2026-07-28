import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { statusOptionsConstant } from 'core/constants/maps/status-options.constant';
import { StatusEnum } from 'project/enum/status.enum';

import { useAddPcmsoExaminingPhysician } from './hooks/useAddPcmsoExaminingPhysician';

const pcmsoExaminingPhysicianStatusOptions = [
  statusOptionsConstant[StatusEnum.ACTIVE],
  statusOptionsConstant[StatusEnum.INACTIVE],
];

export const ModalAddPcmsoExaminingPhysician = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    physicianData,
    setPhysicianData,
    control,
    handleSubmit,
    isEdit,
    modalName,
    handleDelete,
    setValue,
  } = useAddPcmsoExaminingPhysician();

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      disabled: loading,
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
          title={'Médico examinador PCMSO'}
          secondIcon={physicianData?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />

        <ProfessionalInputSelect
          onChange={(prof) => {
            setPhysicianData({
              ...physicianData,
              professional: prof,
            });
          }}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'nome do médico examinador...',
          }}
          query={{ byCouncil: true }}
          type={[ProfessionalTypeEnum.DOCTOR]}
          defaultValue={physicianData.professional}
          name="examiningPhysician"
          label="Médico examinador"
          control={control}
        />

        <SFlex flexWrap="wrap" mt={10} mb={5} gap={5}>
          <Box flex={1}>
            <InputForm
              defaultValue={String(physicianData.sortOrder ?? 0)}
              label="Ordem de exibição"
              setValue={setValue}
              control={control}
              name="sortOrder"
              labelPosition="center"
              size="small"
              type="number"
            />
          </Box>
        </SFlex>

        {isEdit && (
          <Box mb={5}>
            <SelectForm
              setValue={setValue}
              control={control}
              name="status"
              label="Status"
              labelPosition="center"
              options={pcmsoExaminingPhysicianStatusOptions}
              optionsFieldName={{ contentField: 'name' }}
              defaultValue={physicianData.status}
              size="small"
            />
          </Box>
        )}

        <InputForm
          defaultValue={physicianData.notes || ''}
          label={'Observações'}
          multiline
          minRows={3}
          setValue={setValue}
          maxRows={5}
          control={control}
          placeholder={'observações...'}
          name="notes"
          size="small"
        />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
