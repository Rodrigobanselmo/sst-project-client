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

import { SelectRoles } from '../ModalAddUsers/components/SelectRoles';
import { useAddAccessGroup } from './hooks/useAddAccessGroup';

export const ModalAddAccessGroup = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    accessGroupData,
    setAccessGroupData,
    control,
    handleSubmit,
    submitType,
    isEdit,
    setValue,
  } = useAddAccessGroup();

  const buttons = [
    {},
    {
      text: 'Criar Cópia',
      variant: 'outlined',
      type: 'submit',
      onClick: () => {
        submitType.current = 'copy';
        setAccessGroupData({ ...accessGroupData });
      },
    },
    {
      text: isEdit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {
        submitType.current = '';
        setAccessGroupData({ ...accessGroupData });
      },
    },
  ] as IModalButton[];

  if (!isEdit) buttons.splice(1, 1);

  return (
    <SModal
      {...registerModal(ModalEnum.ACCESS_GROUP_ADD)}
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
          title={'Grupo de Acesso'}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            defaultValue={accessGroupData.name}
            setValue={setValue}
            label="Nome"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'nome do grupo de perissões...'}
            name="name"
            size="small"
          />
          <InputForm
            defaultValue={accessGroupData.description}
            label="Descrição"
            setValue={setValue}
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'breve descrição das permissões presentes do grupo...'}
            name="description"
            minRows={3}
            multiline
            maxRows={6}
            size="small"
          />
        </SFlex>
        <SelectRoles
          mt={10}
          data={accessGroupData}
          setData={setAccessGroupData}
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
