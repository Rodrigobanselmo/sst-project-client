/**
 * Textos e helpers da alteração em massa de status operacional
 * (ACTIVE / INACTIVE) dos elementos caracterizáveis.
 */

export type CharacterizationOperationalStatus = 'ACTIVE' | 'INACTIVE';

/** Espelha ApiRoutesEnum.CHARACTERIZATIONS + /bulk-status */
export function buildCharacterizationBulkStatusPath(
  companyId: string,
  workspaceId: string,
): string {
  return `/company/${companyId}/workspace/${workspaceId}/characterizations/bulk-status`;
}

export function buildCharacterizationBulkStatusPayload(params: {
  characterizationIds: string[];
  status: CharacterizationOperationalStatus;
  confirm?: boolean;
}) {
  return {
    characterizationIds: params.characterizationIds,
    status: params.status,
    confirm: params.confirm,
  };
}

export const CHARACTERIZATION_BULK_STATUS_TEXTS = {
  activate: {
    title: 'Ativar elementos selecionados?',
    confirm: 'Ativar',
    cancel: 'Cancelar',
  },
  inactivate: {
    title: 'Inativar elementos selecionados?',
    confirm: 'Inativar',
    cancel: 'Cancelar',
  },
} as const;

export function buildActivateConfirmMessage(params: {
  willUpdate: number;
  alreadyActive: number;
}): string {
  const { willUpdate, alreadyActive } = params;
  return `Serão ativados ${willUpdate} elementos caracterizáveis. ${alreadyActive} elementos já estão ativos e não sofrerão alteração.`;
}

export function buildInactivateConfirmMessage(params: {
  willUpdate: number;
  alreadyInactive: number;
  blocked: number;
}): string {
  const { willUpdate, alreadyInactive, blocked } = params;
  const lines = [
    `Dos elementos selecionados:`,
    `- ${willUpdate} serão inativados;`,
    `- ${alreadyInactive} já estão inativos;`,
    `- ${blocked} não podem ser inativados porque possuem vínculos ocupacionais ativos sem Data Fim.`,
    '',
    'Esta ação não remove vínculos, cargos nem riscos. Apenas altera o status operacional dos elementos elegíveis.',
  ];
  return lines.join('\n');
}

export function countBrowseStatusTargets(
  rows: Array<{ status?: string; isInactive?: boolean }>,
  target: CharacterizationOperationalStatus,
): { alreadyInTarget: number; willChange: number } {
  let alreadyInTarget = 0;
  let willChange = 0;
  for (const row of rows) {
    const inactive =
      row.isInactive === true ||
      String(row.status || '').toUpperCase() === 'INACTIVE';
    const isTarget = target === 'INACTIVE' ? inactive : !inactive;
    if (isTarget) alreadyInTarget += 1;
    else willChange += 1;
  }
  return { alreadyInTarget, willChange };
}
