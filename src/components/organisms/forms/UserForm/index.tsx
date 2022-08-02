import { BoxProps } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { GoogleButton } from 'components/atoms/SSocialButton/GoogleButton/GoogleButton';
import { SSwitch } from 'components/atoms/SSwitch';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import { professionalsOptionsList } from 'core/constants/maps/professionals.map';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { cpfMask } from 'core/utils/masks/cpf.mask';

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
        <RadioForm
          ball
          type="radio"
          disabled={uneditable}
          label="Profissão*"
          control={control}
          defaultValue={String(userData.type)}
          onChange={(e) => {
            const type = (e as any).target.value as ProfessionalTypeEnum;

            setUserData((old) => {
              return {
                ...old,
                type,
                ...(type === ProfessionalTypeEnum.ENGINEER && {
                  hasCREA: true,
                }),
                ...(type === ProfessionalTypeEnum.DOCTOR && { hasCRM: true }),
              };
            });
          }}
          options={professionalsOptionsList.map((professionalType) => ({
            content: professionalType.name,
            value: professionalType.value,
          }))}
          name="type"
          columns={3}
          mt={5}
        />

        <GoogleButton onClick={linkGoogle} text="Vincular conta Google" />

        {userData.hasCREA && (
          <InputForm
            defaultValue={userData?.crea}
            uneditable={uneditable}
            label="CREA"
            control={control}
            placeholder={'número do CREA'}
            name="crea"
            size="small"
          />
        )}

        {userData.hasCRM && (
          <InputForm
            defaultValue={userData?.crm}
            uneditable={uneditable}
            label="CRM"
            control={control}
            placeholder={'número do CRM'}
            name="crm"
            size="small"
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
        <SSwitch
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
