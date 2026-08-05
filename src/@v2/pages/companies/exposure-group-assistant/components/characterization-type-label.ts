/**
 * Centralized Portuguese labels for characterization / element types.
 * Never expose raw API enums (WORKSTATION, EQUIPMENT, …) to the user.
 */
const CHARACTERIZATION_TYPE_LABELS: Record<string, string> = {
  WORKSTATION: 'Posto de trabalho',
  EQUIPMENT: 'Equipamento',
  GENERAL: 'Visão geral',
  ADMINISTRATIVE: 'Ambiente administrativo',
  SUPPORT: 'Ambiente de apoio',
  ACTIVITIES: 'Atividade',
  OPERATION: 'Operação',
};

export function getCharacterizationTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Tipo não informado';
  return CHARACTERIZATION_TYPE_LABELS[type] ?? type;
}

export const CHARACTERIZATION_TYPE_FILTER_OPTIONS = [
  { value: 'WORKSTATION', label: getCharacterizationTypeLabel('WORKSTATION') },
  { value: 'EQUIPMENT', label: getCharacterizationTypeLabel('EQUIPMENT') },
  { value: 'ACTIVITIES', label: getCharacterizationTypeLabel('ACTIVITIES') },
  { value: 'GENERAL', label: getCharacterizationTypeLabel('GENERAL') },
  { value: 'SUPPORT', label: getCharacterizationTypeLabel('SUPPORT') },
  { value: 'OPERATION', label: getCharacterizationTypeLabel('OPERATION') },
  { value: 'ADMINISTRATIVE', label: getCharacterizationTypeLabel('ADMINISTRATIVE') },
] as const;
