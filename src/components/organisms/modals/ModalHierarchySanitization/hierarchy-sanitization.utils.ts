import type {
  HierarchySanitizationBulkResponse,
  HierarchySanitizationItem,
} from './hierarchy-sanitization.types';

export function buildSanitizationBulkConfirmMessage(
  preview: HierarchySanitizationBulkResponse,
): string {
  const lines = [
    `Serão excluídos ${preview.eligible} cargo(s) aptos.`,
    `${preview.eligibleOffices} cargo(s) comum(ns); ${preview.eligibleDeveloped} cargo(s) desenvolvido(s).`,
    `${preview.blocked} registro(s) bloqueado(s) serão preservados.`,
    `${preview.ignored} registro(s) ignorado(s).`,
    '',
    'Empregados não serão excluídos.',
    'Cargos principais (lotação) serão preservados.',
    'Apenas cargos tecnicamente elegíveis serão removidos.',
    'Nenhuma dependência será removida silenciosamente para forçar a exclusão.',
  ];

  if (preview.eligibleDeveloped > 0) {
    lines.push(
      '',
      'Os empregados continuarão cadastrados e permanecerão vinculados aos seus cargos principais. Apenas o vínculo complementar com o cargo desenvolvido será removido.',
    );
  }

  return lines.join('\n');
}

export function buildSingleDeleteConfirmMessage(
  row: HierarchySanitizationItem,
): string {
  const lines = [
    `Cargo: ${row.name}`,
    `Tipo: ${row.typeLabel}`,
    `Caminho: ${row.path}`,
    row.reason,
  ];

  if (row.type === 'SUB_OFFICE' && row.requiresEmployeeDetach) {
    lines.push(
      '',
      'Os empregados continuarão cadastrados e permanecerão vinculados aos seus cargos principais. Apenas o vínculo complementar com o cargo desenvolvido será removido.',
    );
  }

  lines.push('A exclusão é permanente (hard delete).');
  return lines.join('\n');
}

/** Seleção em massa: apenas aptos; bloqueados nunca entram. */
export function mergeEligibleSelection(
  current: string[],
  pageItems: HierarchySanitizationItem[],
  selectAllEligibleOnPage: boolean,
): string[] {
  const pageEligibleIds = pageItems
    .filter((item) => item.status === 'ELIGIBLE')
    .map((item) => item.hierarchyId);

  if (selectAllEligibleOnPage) {
    return [...new Set([...current, ...pageEligibleIds])];
  }

  return current.filter((id) => !pageEligibleIds.includes(id));
}

export function pruneSelectionAfterReload(
  current: string[],
  pageItems: HierarchySanitizationItem[],
): string[] {
  const pageById = new Map(pageItems.map((item) => [item.hierarchyId, item]));
  return current.filter((id) => {
    const onPage = pageById.get(id);
    if (!onPage) return true;
    return onPage.status === 'ELIGIBLE';
  });
}

/**
 * Helper de regressão: garante uma única chamada de exclusão por ação.
 * Usado nos testes do painel para detectar double-submit / toast duplo.
 */
export function countDeleteCalls(calls: number[]): number {
  return calls.reduce((acc, n) => acc + n, 0);
}

export function formatDependencySummary(row: HierarchySanitizationItem): string {
  return [
    `Emp ${row.activeEmployees}`,
    `HOH ${row.homoLinkCount}`,
    `Dir ${row.directCurrentRiskCount ?? 0}`,
    `Elem ${row.inheritedCurrentRiskCount ?? 0}`,
    `Exam ${row.examHistoryCount ?? 0}`,
    `Filhos ${row.childrenCount}`,
  ].join(' · ');
}

/** Quebra explícita do rótulo de tipo (layout da coluna Tipo). */
export function formatTypeLabelLines(
  type: HierarchySanitizationItem['type'],
): string[] {
  if (type === 'SUB_OFFICE') return ['Cargo', 'desenvolvido'];
  return ['Cargo'];
}

/**
 * Proporções da tabela do painel (table-layout: fixed + colgroup).
 * Sem minWidth global que force scroll horizontal.
 */
export const SANITIZATION_TABLE_COL_WIDTHS = {
  selection: '3%',
  name: '29%',
  type: '7%',
  path: '13%',
  deps: '18%',
  status: '7%',
  reason: '17%',
  actions: '6%',
} as const;

export const SANITIZATION_TABLE_LAYOUT = {
  /** Espaço checkbox → nome (px). */
  namePaddingLeftPx: 10,
  selectionMaxPx: 40,
  typeMaxPx: 72,
  /** Evitar minWidth de tabela que recrie overflow-x. */
  tableMinWidth: 0,
} as const;
