/* eslint-disable @typescript-eslint/no-explicit-any */

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { CompanyTag } from './components/CompanyTag';
import { EditUserSelects } from './components/EditUserSelects';
import { IUseAddUser } from './hooks/useAddUser';

export const ModalAddUsersComponent = (props: IUseAddUser) => {
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
    missingGroup,
  } = props;

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
          disabled={isEdit}
          defaultValue={userData.name}
          label={'Nome'}
          control={control}
          sx={{ minWidth: ['100%', 600] }}
          placeholder={'nome do usuário...'}
          name="name"
          size="small"
        />
        <InputForm
          setValue={setValue}
          disabled={isEdit}
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
      </SFlex>

      <SFlex mt={5} mb={10} gap={5}>
        <Box>
          <STagButton
            maxWidth="200px"
            large
            text={
              !!userData?.group && !!userData.group?.name
                ? userData.group.name
                : 'Adicionar Grupo de Acesso'
            }
            error={missingGroup}
            active={!!userData?.group && !!userData?.group?.name}
            onClick={handleOpenAccessSelect}
          />
          {missingGroup && (
            <SText fontSize={12} mt={2} color={'error.main'}>
              Selecione um grupo de acesso
            </SText>
          )}
        </Box>

        {!isEdit && (
          <Box pl={10} mt={-2} ml={'auto'}>
            <SSwitch
              onChange={() => {
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
        <>
          <SText fontSize={14} color={'text.label'}>
            Acesso
          </SText>
          <SFlex mt={5} gap={5}>
            {isConsulting && (
              <STagButton
                maxWidth="200px"
                minWidth={180}
                text={'Empresas'}
                onClick={() => handleOpenCompanySelect()}
              />
            )}

            {isConsulting && (
              <STagButton
                maxWidth="200px"
                minWidth={180}
                text={'Grupos Empresariais'}
                onClick={() => handleOpenCompanySelect({ isGroup: true })}
              />
            )}
            {isConsulting && (
              <STagButton
                maxWidth="200px"
                minWidth={180}
                text={'Clínicas'}
                onClick={() => handleOpenCompanySelect({ isClinic: true })}
              />
            )}
          </SFlex>
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
        </>
      )}
      {/* <SelectRoles
          mt={5}
          data={userData}
          setData={(data) => setUserData({ ...data, group: null })}
        /> */}
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </SModalPaper>
  );
};
