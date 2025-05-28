import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import { FormApplicationColumnsEnum } from '../enums/form-application-columns.enum';

type FormApplicationTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const FormApplicationColumnMap: Record<
  FormApplicationColumnsEnum,
  FormApplicationTypeMapValue
> = {
  [FormApplicationColumnsEnum.NAME]: { label: 'nome', alwaysVisible: true },
  [FormApplicationColumnsEnum.DESCRIPTION]: { label: 'Descrição' },
  [FormApplicationColumnsEnum.END_DATE]: {
    label: 'fim',
    alwaysVisible: true,
  },
  [FormApplicationColumnsEnum.START_DATE]: { label: 'Início' },
  [FormApplicationColumnsEnum.STATUS]: { label: 'Status' },
  [FormApplicationColumnsEnum.FORM]: {
    label: 'Respostas',
    alwaysVisible: true,
  },
  [FormApplicationColumnsEnum.CREATED_AT]: {
    label: 'Criado',
  },
  [FormApplicationColumnsEnum.UPDATED_AT]: {
    label: 'Atualizado',
    startHidden: true,
  },
  [FormApplicationColumnsEnum.TOTAL_ANSWERS]: {
    label: '',
    alwaysVisible: true,
  },
};

export const commentColumns = Object.entries(FormApplicationColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
