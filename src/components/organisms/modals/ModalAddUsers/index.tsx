/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { SSwitch } from 'components/atoms/SSwitch';
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

import { CompanyTag } from './components/CompanyTag';
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
    setValue,
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
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Usuário'}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            setValue={setValue}
            disabled={isEdit || !userData.sendEmail}
            defaultValue={userData.email}
            label={'Email'}
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'email do usuário...'}
            name="email"
            size="small"
            {...(!userData.sendEmail && {
              helperText:
                'Convidar usuário somente através de link compartilhável',
            })}
          />

          {userData.name && (
            <InputForm
              autoFocus
              setValue={setValue}
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
          />
          {isConsulting && (
            <STagButton
              maxWidth="200px"
              text={'Adicionar Empresas'}
              onClick={() => handleOpenCompanySelect()}
            />
          )}
          {isConsulting && (
            <STagButton
              maxWidth="200px"
              text={'Adicionar Grupo'}
              onClick={() => handleOpenCompanySelect({ isGroup: true })}
            />
          )}
          {isConsulting && (
            <STagButton
              maxWidth="200px"
              text={'Adicionar Clínica'}
              onClick={() => handleOpenCompanySelect({ isClinic: true })}
            />
          )}
          {!isEdit && (
            <Box mt={-2} ml={'auto'}>
              <SSwitch
                onChange={() => {
                  setValue('email', '');
                  setUserData({
                    ...userData,
                    sendEmail: !userData.sendEmail,
                  } as any);
                }}
                checked={userData.sendEmail}
                label="Enviar e-mail"
                sx={{ mr: 4 }}
                color="text.light"
              />
            </Box>
          )}
          {isEdit && (
            <SFlex ml={'auto'} justify="end" gap={5}>
              <EditUserSelects userData={userData} setUserData={setUserData} />
            </SFlex>
          )}
        </SFlex>
        {isConsulting && (
          <SFlex mt={5} mb={20} gap={5} flexWrap="wrap">
            {userData.companies.map((company) => {
              return (
                <CompanyTag
                  key={company.id}
                  company={company}
                  handleRemoveCompany={handleRemoveCompany}
                />
              );
            })}
          </SFlex>
        )}
        <SelectRoles
          mt={5}
          data={userData}
          setData={(data) => setUserData({ ...data, group: null })}
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
