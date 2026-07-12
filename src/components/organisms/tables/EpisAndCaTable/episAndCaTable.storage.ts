export type EpiCaColumnId =
  | 'ca'
  | 'equipment'
  | 'description'
  | 'situation'
  | 'expiredDate'
  | 'national'
  | 'status';

const KEY_HIDDEN = 'EPI_CA_TABLE_HIDDEN_COLUMNS';

export const epiCaColumnPickerItems: {
  label: string;
  value: EpiCaColumnId;
}[] = [
  { label: 'CA', value: 'ca' },
  { label: 'Equipamento', value: 'equipment' },
  { label: 'Descrição', value: 'description' },
  { label: 'Situação', value: 'situation' },
  { label: 'Validade', value: 'expiredDate' },
  { label: 'Natureza', value: 'national' },
  { label: 'Status', value: 'status' },
];

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
