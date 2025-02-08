import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import { DocumentControlColumnsEnum } from '../enums/document-control-columns.enum';

type DocumentControlTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const DocumentControlColumnMap: Record<
  DocumentControlColumnsEnum,
  DocumentControlTypeMapValue
> = {
  [DocumentControlColumnsEnum.NAME]: { label: 'nome', alwaysVisible: true },
  [DocumentControlColumnsEnum.DESCRIPTION]: {
    label: 'Descrição',
    alwaysVisible: true,
  },
  [DocumentControlColumnsEnum.END_DATE]: {
    label: 'Vencimento',
    alwaysVisible: true,
  },
  [DocumentControlColumnsEnum.START_DATE]: { label: 'Início' },
  [DocumentControlColumnsEnum.TYPE]: { label: 'Tipo' },
  [DocumentControlColumnsEnum.FILE]: { label: 'Baixar', alwaysVisible: true },
  [DocumentControlColumnsEnum.CREATED_AT]: {
    label: 'Criado',
    startHidden: true,
  },
  [DocumentControlColumnsEnum.UPDATED_AT]: {
    label: 'Atualizado',
    startHidden: true,
  },
};

export const commentColumns = Object.entries(DocumentControlColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
