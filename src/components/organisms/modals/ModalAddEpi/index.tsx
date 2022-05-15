/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { EditEpiSelects } from './components/EditEpiSelects';
import { useAddEpi } from './hooks/useAddEpi';

export const ModalAddEpi = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    epiData,
    setEpiData,
    control,
    handleSubmit,
  } = useAddEpi();

  const buttons = [
    {},
    {
      text: epiData.id ? 'Editar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setEpiData({ ...epiData }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.EPI_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8} component="form" onSubmit={handleSubmit(onSubmit)}>
        <SModalHeader
          tag={epiData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'EPI'}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            defaultValue={epiData.ca}
            minRows={1}
            label="Número CA"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'número CA'}
            name="ca"
            size="small"
          />
          <InputForm
            multiline
            defaultValue={epiData.description}
            minRows={2}
            maxRows={4}
            label="Equipamento"
            control={control}
            sx={{ width: ['100%', 600] }}
            placeholder={'descrição do equipamento de proteção...'}
            name="description"
            size="small"
          />
        </SFlex>
        <EditEpiSelects epiData={epiData} setEpiData={setEpiData} />
        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
