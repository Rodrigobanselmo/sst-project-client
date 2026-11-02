import { TextField, Stack, MenuItem } from '@mui/material';
import { Controller } from 'react-hook-form';
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { QuantityTypeEnum } from 'core/constants/maps/quantity-risks';

import { HeatForm } from './components/HeatForm';
import { NoiseForm } from './components/NoiseForm';
import { QuiForm } from './components/QuiForm';
import { RadiationForm } from './components/RadiationForm';
import { VibrationForm } from './components/VibrationForm';
import { useModalAddQuantity } from './hooks/useModalAddQuantity';
import { measurementOptions } from '@v2/features/sst-operational/measurement-model';

export const ModalAddQuantity = () => {
  const props = useModalAddQuantity();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    loading,
    modalName,
    data,
  } = props;
  const resultOptions = measurementOptions(data.type, data.risk);

  const buttons = [
    {},
    {
      text: 'Salvar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        center
        component="form"
        sx={{
          maxWidth: ['95%', '95%', 1300],
        }}
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={'add'}
          onClose={onCloseUnsaved}
          title={'Adicionar medição'}
        />

        {data.type === QuantityTypeEnum.QUI && <QuiForm {...props} />}
        {data.type === QuantityTypeEnum.NOISE && <NoiseForm {...props} />}
        {data.type === QuantityTypeEnum.HEAT && <HeatForm {...props} />}
        {data.type === QuantityTypeEnum.RADIATION && (
          <RadiationForm {...props} />
        )}
        {data.type === QuantityTypeEnum.VFB && <VibrationForm {...props} />}
        {data.type === QuantityTypeEnum.VL && <VibrationForm vl {...props} />}

        <Stack spacing={2} sx={{ my: 2 }}>
          <Controller
            name="measuredOn"
            control={props.control}
            defaultValue={data.measuredOn}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Data da medição"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <Controller
            name="selectedMeasurement"
            control={props.control}
            defaultValue={data.selectedMeasurement}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Resultado que fundamenta a exposição"
              >
                <MenuItem value="">Não selecionado</MenuItem>
                {!!field.value &&
                  !resultOptions.some(
                    (option) => option.value === field.value,
                  ) && (
                    <MenuItem value={field.value} disabled>
                      Resultado anterior incompatível — confira a seleção
                    </MenuItem>
                  )}
                {resultOptions.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="selectionReason"
            control={props.control}
            defaultValue={data.selectionReason}
            render={({ field }) => (
              <TextField {...field} label="Fundamento da medição selecionada" />
            )}
          />
        </Stack>
        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
