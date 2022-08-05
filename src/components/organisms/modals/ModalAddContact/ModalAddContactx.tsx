/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { phoneMask } from 'core/utils/masks/phone.mask';

import { useAddContact } from './hooks/useAddContact';

export const ModalAddContact = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    contactData,
    setContactData,
    control,
    handleSubmit,
    isEdit,
    modalName,
    handleDelete,
  } = useAddContact();

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setContactData({ ...contactData }),
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
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Contato'}
          secondIcon={contactData?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />

        <InputForm
          autoFocus
          defaultValue={contactData.name}
          label={'Nome para identificação'}
          labelPosition="center"
          control={control}
          sx={{ minWidth: ['100%', 600], mb: 5 }}
          placeholder={'nome...'}
          name="name"
          size="small"
        />
        <SFlex flexWrap="wrap" mb={5} gap={5}>
          <Box flex={1}>
            <InputForm
              defaultValue={contactData.phone}
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
              defaultValue={contactData.phone_2}
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
        </SFlex>
        <InputForm
          defaultValue={contactData.email}
          label={'Email'}
          labelPosition="center"
          control={control}
          sx={{ minWidth: ['100%', 600], mb: 10 }}
          placeholder={'email...'}
          name="email"
          size="small"
        />
        <InputForm
          defaultValue={contactData.obs}
          label={'Observações'}
          multiline
          minRows={3}
          maxRows={5}
          control={control}
          placeholder={'descreve sua observção...'}
          name="obs"
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
