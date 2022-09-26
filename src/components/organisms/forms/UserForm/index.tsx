import React from 'react';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box, BoxProps } from '@mui/material';
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

export const UserForm = (props: BoxProps & { onlyEdit?: boolean }) => {
  const {
    onSave,
    loading,
    handleSubmit,
    control,
    uneditable,
    onEdit,
    user,
    userData,
    setUserData,
    onAddArray,
    onDeleteArray,
    linkGoogle,
    setValue,
    onAddCouncil,
    onDeleteCouncil,
  } = useUserForm(props.onlyEdit);

  useFetchFeedback(!user);

  if (!user || !userData) return null;

  return (
    <STBox onSubmit={handleSubmit(onSave)} component={'form'} {...props}>
      <SFlex gap={8} direction="column">
        <InputForm
          defaultValue={userData?.name}
          uneditable={uneditable}
          label="Nome Completo"
          control={control}
          placeholder={'Digite seu nome completo'}
          name="name"
          size="small"
        />
        <InputForm
          defaultValue={userData?.cpf}
          uneditable={uneditable}
          label="CPF"
          control={control}
          placeholder={'000.000.000-00'}
          name="cpf"
          mask={cpfMask.apply}
          size="small"
        />
        <GoogleButton onClick={linkGoogle} text="Vincular conta Google" />
        <RadioForm
          disabled={uneditable}
          label="Profissão*"
          control={control}
          defaultValue={String(userData.type)}
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

        {userData.hasCouncil && (
          <CouncilShow
            data={userData.councils || []}
            onAdd={(v) => onAddCouncil(v)}
            onDelete={(v) => onDeleteCouncil(v)}
            disabled={uneditable}
          />
        )}

        {userData.hasFormation && (
          <SDisplaySimpleArray
            disabled={uneditable}
            values={userData.formation || []}
            onAdd={(value) => onAddArray(value, 'formation')}
            onDelete={(value) => onDeleteArray(value, 'formation')}
            label={'Formação'}
            buttonLabel={'Adicionar Formação Acadêmica'}
            placeholder="ex.: Engenheiro de segurança"
            modalLabel={'Adicionar Formação'}
          />
        )}

        {userData.hasCertifications && (
          <SDisplaySimpleArray
            disabled={uneditable}
            values={userData.certifications || []}
            onAdd={(value) => onAddArray(value, 'certifications')}
            onDelete={(value) => onDeleteArray(value, 'certifications')}
            label={'Certificações'}
            buttonLabel={'Adicionar Certificação'}
            placeholder="ex.: Certificado HOC 0061"
            modalLabel={'Adicionar Certificado'}
          />
        )}

        <SFlex gap={5} mt={10} justifyContent="flex-end" width="100%">
          {!props.onlyEdit && (
            <SButton
              size="small"
              variant={uneditable ? 'contained' : 'outlined'}
              loading={loading}
              onClick={() => onEdit()}
            >
              {uneditable ? 'Editar' : 'Cancelar'}
            </SButton>
          )}
          <SButton
            size="small"
            variant={'contained'}
            loading={loading}
            type="submit"
            disabled={uneditable}
          >
            {props.onlyEdit ? 'Prosseguir' : 'Salvar'}
          </SButton>
        </SFlex>
      </SFlex>
      <SFlex gap={8} direction="column" mt={15}>
        {/* <SSwitch
          onChange={() => {
            setUserData({
              ...userData,
              crea: '',
              hasCREA: !userData.hasCREA,
            } as any);
            onEdit(false);
          }}
          checked={userData.hasCREA}
          label="Adicionar CREA"
          sx={{ mr: 4 }}
          color="text.light"
        />
        <SSwitch
          onChange={() => {
            setUserData({
              ...userData,
              crm: '',
              hasCRM: !userData.hasCRM,
            } as any);
            onEdit(false);
          }}
          checked={userData.hasCRM}
          label="Adicionar CRM"
          sx={{ mr: 4 }}
          color="text.light"
        /> */}
        <SSwitch
          onChange={() => {
            setUserData({
              ...userData,
              councilType: '',
              councilUF: '',
              councilId: '',
              hasCouncil: !userData.hasCouncil,
            } as any);
            onEdit(false);
          }}
          checked={userData.hasCouncil}
          label="Adicionar Conselho"
          sx={{ mr: 4 }}
          color="text.light"
        />
        <SSwitch
          onChange={() => {
            setUserData({
              ...userData,
              formation: [],
              hasFormation: !userData.hasFormation,
            } as any);
            onEdit(false);
          }}
          checked={userData.hasFormation}
          label="Formação acadêmica"
          sx={{ mr: 4 }}
          color="text.light"
        />
        <SSwitch
          onChange={(e) => {
            setUserData({
              ...userData,
              certifications: [],
              hasCertifications: e.target.checked,
            } as any);
            onEdit(false);
          }}
          checked={!!userData.hasCertifications}
          label="Certificações"
          sx={{ mr: 4 }}
          color="text.light"
        />
      </SFlex>
    </STBox>
  );
};
