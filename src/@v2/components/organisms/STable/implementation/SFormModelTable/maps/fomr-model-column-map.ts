import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import { FormModelColumnsEnum } from '../enums/form-model-columns.enum';

type FormModelTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const FormModelColumnMap: Record<
  FormModelColumnsEnum,
  FormModelTypeMapValue
> = {
  [FormModelColumnsEnum.NAME]: { label: 'nome', alwaysVisible: true },
  [FormModelColumnsEnum.DESCRIPTION]: { label: 'Descrição' },
  [FormModelColumnsEnum.TYPE]: { label: 'Tipo' },
  [FormModelColumnsEnum.SHAREABLE_LINK]: { label: 'Link' },
  [FormModelColumnsEnum.SYSTEM]: { label: 'Sistema' },
  [FormModelColumnsEnum.ANONYMOUS]: { label: 'Anônimo' },
  [FormModelColumnsEnum.CREATED_AT]: { label: 'Criado' },
  [FormModelColumnsEnum.UPDATED_AT]: { label: 'Atualizado', startHidden: true },
};

export const commentColumns = Object.entries(FormModelColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
