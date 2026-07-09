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

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { StatusEnum } from 'project/enum/status.enum';

import {
  PCMsoAttendanceServiceTypeOptions,
} from 'core/interfaces/api/IPcmsoAttendanceService';
import { phoneMask } from 'core/utils/masks/phone.mask';
import { statusOptionsConstant } from 'core/constants/maps/status-options.constant';

import { useAddPcmsoAttendanceService } from './hooks/useAddPcmsoAttendanceService';

const pcmsoAttendanceStatusOptions = [
  statusOptionsConstant[StatusEnum.ACTIVE],
  statusOptionsConstant[StatusEnum.INACTIVE],
];

export const ModalAddPcmsoAttendanceService = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    serviceData,
    control,
    handleSubmit,
    isEdit,
    modalName,
    handleDelete,
    setValue,
  } = useAddPcmsoAttendanceService();

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
          title={'Serviço de atendimento'}
          secondIcon={serviceData?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />

        <InputForm
          autoFocus
          defaultValue={serviceData.name}
          setValue={setValue}
          label={'Nome do serviço'}
          labelPosition="center"
          control={control}
          sx={{ minWidth: ['100%', 600], mb: 5 }}
          placeholder={'nome do hospital, UPA, clínica...'}
          name="name"
          size="small"
        />

        <Box mb={5}>
          <SelectForm
            setValue={setValue}
            control={control}
            name="serviceType"
            label="Tipo de serviço"
            labelPosition="center"
            options={PCMsoAttendanceServiceTypeOptions}
            defaultValue={serviceData.serviceType}
            size="small"
          />
        </Box>

        <InputForm
          defaultValue={serviceData.address || ''}
          setValue={setValue}
          label={'Endereço'}
          labelPosition="center"
          control={control}
          sx={{ minWidth: ['100%', 600], mb: 5 }}
          placeholder={'endereço completo...'}
          name="address"
          size="small"
        />

        <SFlex flexWrap="wrap" mb={5} gap={5}>
          <Box flex={1}>
            <InputForm
              defaultValue={serviceData.phone || ''}
              label="Telefone"
              setValue={setValue}
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
              defaultValue={String(serviceData.sortOrder ?? 0)}
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

        <SFlex flexWrap="wrap" mb={5} gap={5}>
          <Box flex={1}>
            <InputForm
              defaultValue={serviceData.distanceLabel || ''}
              label="Distância aproximada"
              setValue={setValue}
              control={control}
              name="distanceLabel"
              labelPosition="center"
              size="small"
              placeholder={'~5 km'}
            />
          </Box>
          <Box flex={1}>
            <InputForm
              defaultValue={serviceData.travelTimeLabel || ''}
              label="Tempo estimado"
              setValue={setValue}
              control={control}
              name="travelTimeLabel"
              labelPosition="center"
              size="small"
              placeholder={'~15 min'}
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
              options={pcmsoAttendanceStatusOptions}
              optionsFieldName={{ contentField: 'name' }}
              defaultValue={serviceData.status}
              size="small"
            />
          </Box>
        )}

        <InputForm
          defaultValue={serviceData.notes || ''}
          label={'Observações'}
          multiline
          minRows={3}
          setValue={setValue}
          maxRows={5}
          control={control}
          placeholder={'observações ou justificativa...'}
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
