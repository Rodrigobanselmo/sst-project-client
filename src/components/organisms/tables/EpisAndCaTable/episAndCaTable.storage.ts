export type EpiCaColumnId =
  | 'ca'
  | 'equipment'
  | 'description'
  | 'situation'
  | 'expiredDate'
  | 'national'
  | 'status'
  | 'processNumber'
  | 'manufacturerName'
  | 'manufacturerCnpj'
  | 'brand'
  | 'reference'
  | 'color'
  | 'report'
  | 'restriction'
  | 'observation'
  | 'laboratoryCnpj'
  | 'laboratoryName'
  | 'reportNumber'
  | 'standard';

type EpiCaColumnDef = {
  label: string;
  /** Largura CSS grid da coluna na tabela. */
  column: string;
  /** Se true, começa oculta até o usuário marcar em Colunas. */
  startHidden?: boolean;
};

export const epiCaColumnMap: Record<EpiCaColumnId, EpiCaColumnDef> = {
  ca: { label: 'CA', column: '90px' },
  equipment: { label: 'Equipamento', column: 'minmax(160px, 1.4fr)' },
  description: { label: 'Descrição', column: 'minmax(140px, 1fr)' },
  situation: { label: 'Situação', column: '130px' },
  expiredDate: { label: 'Validade', column: '110px' },
  national: { label: 'Natureza', column: '100px' },
  status: { label: 'Status', column: '90px' },
  processNumber: { label: 'Processo', column: 'minmax(140px, 1fr)', startHidden: true },
  manufacturerName: {
    label: 'Fabricante',
    column: 'minmax(160px, 1.2fr)',
    startHidden: true,
  },
  manufacturerCnpj: {
    label: 'CNPJ fabricante',
    column: '140px',
    startHidden: true,
  },
  brand: { label: 'Marca', column: 'minmax(120px, 1fr)', startHidden: true },
  reference: {
    label: 'Referência',
    column: 'minmax(120px, 1fr)',
    startHidden: true,
  },
  color: { label: 'Cor', column: '100px', startHidden: true },
  report: {
    label: 'Aprovado para laudo',
    column: 'minmax(160px, 1.2fr)',
    startHidden: true,
  },
  restriction: {
    label: 'Restrição',
    column: 'minmax(120px, 1fr)',
    startHidden: true,
  },
  observation: {
    label: 'Observação',
    column: 'minmax(120px, 1fr)',
    startHidden: true,
  },
  laboratoryCnpj: {
    label: 'CNPJ laboratório',
    column: '140px',
    startHidden: true,
  },
  laboratoryName: {
    label: 'Laboratório',
    column: 'minmax(160px, 1.2fr)',
    startHidden: true,
  },
  reportNumber: { label: 'Nº laudo', column: '130px', startHidden: true },
  standard: { label: 'Norma', column: 'minmax(140px, 1fr)', startHidden: true },
};

/** Ordem das colunas na tabela e no seletor. */
export const epiCaColumnOrder: EpiCaColumnId[] = [
  'ca',
  'equipment',
  'description',
  'situation',
  'expiredDate',
  'national',
  'status',
  'processNumber',
  'manufacturerName',
  'manufacturerCnpj',
  'brand',
  'reference',
  'color',
  'report',
  'restriction',
  'observation',
  'laboratoryCnpj',
  'laboratoryName',
  'reportNumber',
  'standard',
];

export const epiCaColumnPickerItems = epiCaColumnOrder.map((value) => ({
  value,
  label: epiCaColumnMap[value].label,
  startHidden: epiCaColumnMap[value].startHidden,
}));

const KEY_HIDDEN = 'EPI_CA_TABLE_HIDDEN_COLUMNS';

export function isEpiCaColumnHidden(
  column: EpiCaColumnId,
  hiddenColumns: Partial<Record<EpiCaColumnId, boolean>>,
): boolean {
  if (column in hiddenColumns) {
    return Boolean(hiddenColumns[column]);
  }
  return Boolean(epiCaColumnMap[column].startHidden);
}

export function loadEpiCaHiddenColumns(): Partial<
  Record<EpiCaColumnId, boolean>
> {
  try {
    const raw = localStorage.getItem(KEY_HIDDEN);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveEpiCaHiddenColumns(
  hidden: Partial<Record<EpiCaColumnId, boolean>>,
) {
  localStorage.setItem(KEY_HIDDEN, JSON.stringify(hidden));
}
