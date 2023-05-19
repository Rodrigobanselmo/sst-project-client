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

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
