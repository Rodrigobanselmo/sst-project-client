/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

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
    handleOpenAccessSelect,
    handleOpenCompanySelect,
    handleRemoveCompany,
    isConsulting,
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
        <SFlex mt={5} gap={5}>
          <STagButton
            maxWidth="200px"
            text={
              !!userData?.group && !!userData.group?.name
                ? userData.group.name
                : 'Adicionar Grupo de Acesso'
            }
            active={!!userData?.group && !!userData?.group?.name}
            onClick={handleOpenAccessSelect}
          />{' '}
          {isConsulting && (
            <STagButton
              maxWidth="200px"
              text={'Adicionar Empresas'}
              onClick={handleOpenCompanySelect}
            />
          )}
        </SFlex>{' '}
        {isConsulting && (
          <SFlex mt={10} gap={5}>
            {userData.companies.map((company) => {
              return (
                <SFlex
                  border={'1px solid'}
                  borderColor="grey.300"
                  px={4}
                  borderRadius={1}
                  py={1}
                  key={company.id}
                  center
                  sx={{ backgroundColor: 'grey.100' }}
                >
                  <Box>
                    <SText maxWidth="200px" noBreak fontSize={12}>
                      {company.name}
                    </SText>
                    <SText fontSize={11}>{cnpjMask.mask(company.cnpj)}</SText>
                  </Box>
                  <STooltip withWrapper title={'Remover'}>
                    <SIconButton
                      onClick={() => handleRemoveCompany(company)}
                      size="small"
                    >
                      <Icon component={SDeleteIcon} sx={{ fontSize: '1rem' }} />
                    </SIconButton>
                  </STooltip>
                </SFlex>
              );
            })}
          </SFlex>
        )}
        <SelectRoles
          mt={10}
          data={userData}
          setData={(data) => setUserData({ ...data, group: null })}
        />
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
