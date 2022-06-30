import { BoxProps, Icon } from '@mui/material';
import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { SSwitch } from 'components/atoms/SSwitch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { initialInputModalState } from 'components/organisms/modals/ModalSingleInput';

import AddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useModal } from 'core/hooks/useModal';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

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
          size="small"
        />
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

        {userData.hasFormation && (
          <SDisplaySimpleArray
            disabled={uneditable}
            values={userData.formation || []}
            onAdd={(value) => onAddArray(value, 'formation')}
            onDelete={(value) => onDeleteArray(value, 'formation')}
            label={'Formação'}
            buttonLabel={'Adicionar Formação'}
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

interface ISDisplaySimpleArrayProps {
  values: string[];
  label?: string;
  onAdd: (value: string) => void;
  onDelete: (value: string) => void;
  disabled?: boolean;
  buttonLabel?: string;
  modalLabel?: string;
  placeholder?: string;
}

export const SDisplaySimpleArray = ({
  values,
  onAdd,
  label,
  onDelete,
  disabled,
  placeholder,
  modalLabel,
  buttonLabel,
}: ISDisplaySimpleArrayProps) => {
  const { onOpenModal } = useModal();
  return (
    <Box
      sx={{
        border: '2px solid',
        borderColor: 'background.divider',
        p: 5,
        borderRadius: 1,
      }}
    >
      {label && (
        <SText color={'grey.500'} mb={3} fontSize={14}>
          {label}
        </SText>
      )}

      <SFlex direction="column">
        {removeDuplicate(values).map((value) => (
          <SFlex
            sx={{ backgroundColor: 'background.paper', borderRadius: '4px' }}
            my={2}
            key={value}
            align="center"
          >
            <SIconButton
              disabled={disabled}
              onClick={() => onDelete(value)}
              size="small"
            >
              <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
            </SIconButton>
            <SText>{value}</SText>
          </SFlex>
        ))}
        <STagButton
          large
          disabled={disabled}
          icon={AddIcon}
          text={buttonLabel || 'Adicionar'}
          iconProps={{ sx: { fontSize: 17 } }}
          onClick={() => {
            onOpenModal(ModalEnum.SINGLE_INPUT, {
              onConfirm: onAdd,
              placeholder,
              label: modalLabel,
            } as typeof initialInputModalState);
          }}
        />
      </SFlex>
    </Box>
  );
};
