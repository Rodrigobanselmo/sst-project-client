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

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';

import { EditGhoSelects } from './components/EditGhoSelects';
import { useAddGho } from './hooks/useAddGho';

export const ModalAddGho = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    ghoData,
    setGhoData,
    control,
    handleSubmit,
    onRemove,
  } = useAddGho();

  const buttons = [
    {},
    {
      text: ghoData.id ? 'Editar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setGhoData({ ...ghoData }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.GHO_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8} component="form" onSubmit={handleSubmit(onSubmit)}>
        <SModalHeader
          tag={ghoData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Grupo similar de exposição'}
          secondIcon={ghoData?.id ? SDeleteIcon : undefined}
          secondIconClick={onRemove}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            defaultValue={ghoData.name}
            minRows={2}
            maxRows={4}
            label="Nome"
            control={control}
            sx={{ width: ['100%', 600] }}
            placeholder={'nome do GSE...'}
            name="name"
            size="small"
          />
          <InputForm
            multiline
            defaultValue={ghoData.description}
            minRows={2}
            maxRows={4}
            label="Descrição"
            control={control}
            sx={{ width: ['100%', 600] }}
            placeholder={'descrição do GSE...'}
            name="description"
            size="small"
          />
        </SFlex>
        <EditGhoSelects ghoData={ghoData} setGhoData={setGhoData} />
        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
