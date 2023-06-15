import React from 'react';

import { formatCPF, getStates } from '@brazilian-utils/brazilian-utils';
import { Box, BoxProps, Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { GoogleButton } from 'components/atoms/SSocialButton/GoogleButton/GoogleButton';
import { SSwitch } from 'components/atoms/SSwitch';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import { professionalsOptionsList } from 'core/constants/maps/professionals.map';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { CouncilShow } from './CouncilShow/CouncilShow';
import { useUserForm } from './hooks/useUserForm';
import { STBox } from './styles';
import SText from 'components/atoms/SText';
import SIconButton from 'components/atoms/SIconButton';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import { PasswordInputs } from 'pages/cadastro/components/PasswordInputs/PasswordInputs';

export const UserForm = (
  props: BoxProps & { passChange?: boolean; firstEdit?: boolean },
) => {
  const {
    onSave,
    loading,
    handleSubmit,
    control,
    user,
    userData,
    setUserData,
    onAddArray,
    onDeleteArray,
    linkGoogle,
    setValue,
    onAddCouncil,
    onDeleteCouncil,
    onEditCouncil,
    handleDeleteGoogleAccount,
    formProps,
    handleChangePass,
    isUserEditAdmin,
  } = useUserForm();

  useFetchFeedback(!user);

  if (!user || !userData) return null;

  const isGoogleAccount = !!user.googleExternalId;

  return (
    <STBox onSubmit={handleSubmit(onSave)} component={'form'} {...props}>
      <SFlex gap={8} direction="column">
        <SFlex
          gap={8}
          direction="column"
          sx={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: ['16px', '16px', '16px'],
          }}
        >
          <SFlex flexWrap="wrap" gap={5}>
            <Box minWidth={['100%', '100%', 400]}>
              <InputForm
                defaultValue={userData?.name}
                label="Nome Completo"
                control={control}
                placeholder={'Digite seu nome completo'}
                sx={{ minWidth: ['100%', '100%', 400] }}
                name="name"
                size="small"
                setValue={setValue}
              />
            </Box>
            <Box flex={1} minWidth={200}>
              <InputForm
                defaultValue={formatCPF(userData?.cpf || '')}
                label="CPF"
                control={control}
                placeholder={'000.000.000-00'}
                name="cpf"
                sx={{ minWidth: ['100%', '100%', 200] }}
                mask={cpfMask.apply}
                size="small"
                setValue={setValue}
              />
            </Box>
          </SFlex>
          <InputForm
            defaultValue={userData?.email || ''}
            disabled
            label="E-mail"
            control={control}
            name="email"
            size="small"
            setValue={setValue}
          />
          {isGoogleAccount && (
            <Box sx={{ mt: -4 }}>
              <SFlex gap={5} align={'center'}>
                <SText color="text.main" fontSize={12}>
                  Conta google cadastrada:
                  <SText
                    color="info.dark"
                    component="span"
                    ml={3}
                    fontSize={12}
                  >
                    {user.googleUser}
                  </SText>
                </SText>

                <SIconButton
                  tooltip={'remover conta google'}
                  sx={{ mt: -1, width: 20, height: 20 }}
                  onClick={handleDeleteGoogleAccount}
                  loading={loading}
                >
                  <Icon
                    component={SDeleteIcon}
                    sx={{ fontSize: 15, color: 'error.dark' }}
                  />
                </SIconButton>
              </SFlex>
            </Box>
          )}
          <SFlex
            maxWidth={240}
            gap={0}
            direction={'column'}
            align={'center'}
            {...(props.firstEdit && { mb: 10 })}
          >
            <GoogleButton
              sx={{ width: '100%', maxWidth: '100%', minWidth: 'fit-content' }}
              onClick={linkGoogle}
              text={
                isGoogleAccount ? 'Trocar conta Gogle' : 'Vincular conta Google'
              }
            />
          </SFlex>

          {!props.firstEdit && (
            <SFlex gap={5} mt={10} justifyContent="flex-end" width="100%">
              <SButton
                size="small"
                variant={'contained'}
                loading={loading}
                type="submit"
              >
                Salvar
              </SButton>
            </SFlex>
          )}
        </SFlex>

        {props.passChange && (
          <SFlex
            gap={8}
            direction="column"
            sx={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: ['16px', '16px', '16px'],
            }}
          >
            <PasswordInputs
              resetPass
              oldPassword={!isUserEditAdmin}
              {...formProps}
            />

            <SFlex gap={5} mt={10} justifyContent="flex-end" width="100%">
              <SButton
                size="small"
                variant={'contained'}
                loading={loading}
                type="button"
                onClick={handleChangePass}
              >
                Salvar
              </SButton>
            </SFlex>
          </SFlex>
        )}

        <SFlex
          gap={8}
          direction="column"
          sx={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: ['16px', '16px', '16px'],
          }}
        >
          <RadioForm
            setValue={setValue}
            label="Profissão"
            control={control}
            defaultValue={String(userData.type || ProfessionalTypeEnum.OTHER)}
            onChange={(e) => {
              const type = (e as any).target.value as ProfessionalTypeEnum;
              if (type === ProfessionalTypeEnum.ENGINEER)
                setValue('councilType', 'CREA');
              else if (type === ProfessionalTypeEnum.NURSE)
                setValue('councilType', 'COREN');
              else if (type === ProfessionalTypeEnum.DOCTOR)
                setValue('councilType', 'CRM');
              // else if (type === ProfessionalTypeEnum.SPEECH_THERAPIST)
              //   setValue('councilType', 'CFF');
              else setValue('councilType', '');

              setUserData((old) => {
                return {
                  ...old,
                  type,
                  ...(type === ProfessionalTypeEnum.ENGINEER && {
                    hasCouncil: true,
                  }),
                  ...(type === ProfessionalTypeEnum.DOCTOR && {
                    hasCouncil: true,
                  }),
                };
              });
            }}
            row
            options={professionalsOptionsList.map((professionalType) => ({
              label: professionalType.name,
              value: professionalType.value,
            }))}
            name="type"
          />

          <CouncilShow
            data={userData.councils || []}
            onAdd={(v) => onAddCouncil(v)}
            onDelete={(v) => onDeleteCouncil(v)}
            onEdit={(v, i) => onEditCouncil(v, i)}
          />

          <SDisplaySimpleArray
            values={userData.formation || []}
            onAdd={(value) => onAddArray(value, 'formation')}
            onDelete={(value) => onDeleteArray(value, 'formation')}
            label={'Formação'}
            buttonLabel={'Adicionar Formação Acadêmica'}
            placeholder="ex.: Engenheiro de segurança"
            modalLabel={'Adicionar Formação'}
          />

          <SDisplaySimpleArray
            values={userData.certifications || []}
            onAdd={(value) => onAddArray(value, 'certifications')}
            onDelete={(value) => onDeleteArray(value, 'certifications')}
            label={'Certificações'}
            buttonLabel={'Adicionar Certificação'}
            placeholder="ex.: Certificado HOC 0061"
            modalLabel={'Adicionar Certificado'}
          />

          <SFlex gap={5} mt={10} justifyContent="flex-end" width="100%">
            <SButton
              size="small"
              variant={'contained'}
              loading={loading}
              type="submit"
            >
              Salvar
            </SButton>
          </SFlex>
        </SFlex>
      </SFlex>
    </STBox>
  );
};
