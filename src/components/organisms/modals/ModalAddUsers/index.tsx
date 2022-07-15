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

import { EditUserSelects } from './components/EditUserSelects';
import { SelectRoles } from './components/SelectRoles';
import { useAddUser } from './hooks/useAddUser';

export const ModalAddUsers = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    userData,
    setUserData,
    control,
    handleSubmit,
    isEdit,
  } = useAddUser();

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setUserData({ ...userData }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.USER_ADD)}
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
          title={'Usuário'}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            disabled={isEdit}
            defaultValue={userData.email}
            label="Email"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'email do usuário...'}
            name="email"
            size="small"
          />
          {userData.name && (
            <InputForm
              autoFocus
              disabled={isEdit}
              defaultValue={userData.name}
              label="Nome"
              control={control}
              sx={{ minWidth: ['100%', 600] }}
              placeholder={'nome do usuário...'}
              name="name"
              size="small"
            />
          )}
        </SFlex>
        <SelectRoles mt={10} userData={userData} setUserData={setUserData} />
        {isEdit && (
          <EditUserSelects userData={userData} setUserData={setUserData} />
        )}
        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
