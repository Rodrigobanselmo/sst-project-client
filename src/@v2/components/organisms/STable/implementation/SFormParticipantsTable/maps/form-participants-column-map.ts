import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import { FormParticipantsColumnsEnum } from '../enums/form-participants-columns.enum';

type FormParticipantsTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const FormParticipantsColumnMap: Record<
  FormParticipantsColumnsEnum,
  FormParticipantsTypeMapValue
> = {
  [FormParticipantsColumnsEnum.NAME]: { label: 'Nome', alwaysVisible: true },
  [FormParticipantsColumnsEnum.CPF]: { label: 'CPF' },
  [FormParticipantsColumnsEnum.EMAIL]: { label: 'Email' },
  [FormParticipantsColumnsEnum.PHONE]: { label: 'Telefone' },
  [FormParticipantsColumnsEnum.STATUS]: { label: 'Status' },
  [FormParticipantsColumnsEnum.HIERARCHY_NAME]: { label: 'Hierarquia' },
  [FormParticipantsColumnsEnum.HAS_RESPONDED]: { label: 'Respondeu' },
  [FormParticipantsColumnsEnum.CREATED_AT]: { label: 'Criado' },
  [FormParticipantsColumnsEnum.UPDATED_AT]: {
    label: 'Atualizado',
    startHidden: true,
  },
  [FormParticipantsColumnsEnum.COPY_LINK]: { label: 'Compartilhar' },
};

export const participantsColumns = Object.entries(FormParticipantsColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
