import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import { DocumentControlFileColumnsEnum } from '../enums/document-control-file-columns.enum';

type DocumentControlFileTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const DocumentControlFileColumnMap: Record<
  DocumentControlFileColumnsEnum,
  DocumentControlFileTypeMapValue
> = {
  [DocumentControlFileColumnsEnum.NAME]: { label: 'nome', alwaysVisible: true },
  [DocumentControlFileColumnsEnum.DESCRIPTION]: { label: 'Descrição' },
  [DocumentControlFileColumnsEnum.START_DATE]: { label: 'Início' },
  [DocumentControlFileColumnsEnum.END_DATE]: {
    label: 'Vencimento',
    alwaysVisible: true,
  },
  [DocumentControlFileColumnsEnum.FILE]: {
    label: 'Baixar',
    alwaysVisible: true,
  },
};

export const commentColumns = Object.entries(DocumentControlFileColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
