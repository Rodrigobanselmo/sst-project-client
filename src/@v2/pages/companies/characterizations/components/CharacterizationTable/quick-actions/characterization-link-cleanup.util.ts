/**
 * Contratos e textos de UX para limpeza de vínculos cargo↔elemento.
 * Vínculo ativo = HierarchyOnHomogeneous com endDate IS NULL.
 */

export const CHARACTERIZATION_LINK_CLEANUP_TEXTS = {
  quickUnlink: {
    title: 'Remover vínculo do cargo?',
    body: 'Esta ação removerá somente o vínculo entre o cargo e o elemento caracterizável. O cargo continuará cadastrado na empresa.',
    confirm: 'Remover vínculo',
    cancel: 'Cancelar',
  },
  bulkUnlink: {
    title: 'Remover vínculos dos elementos selecionados?',
    confirm: 'Remover vínculos',
    cancel: 'Cancelar',
  },
  deleteWithCleanup: {
    title: 'Excluir elemento e remover vínculos?',
    confirm: 'Remover vínculos e excluir',
    cancel: 'Cancelar',
    impactNote:
      'Esta operação poderá alterar a cobertura ocupacional, os agrupamentos utilizados no PGR e o PCMSO.',
  },
  esocialBlockedTooltip:
    'Vínculo protegido por eventos do eSocial. Remoção indisponível sem permissão ESOCIAL_EDIT.',
} as const;

export function buildBulkUnlinkConfirmMessage(params: {
  linksCount: number;
  elementsWithLinks: number;
}): string {
  const { linksCount, elementsWithLinks } = params;
  return `Serão removidos ${linksCount} vínculos ativos de cargos em ${elementsWithLinks} elementos caracterizáveis. Os cargos continuarão cadastrados na empresa. Esta operação poderá alterar a cobertura ocupacional, os agrupamentos utilizados no PGR e o PCMSO.`;
}

export function buildDeleteWithCleanupMessage(params: {
  name: string;
  activeLinks: number;
}): string {
  const { name, activeLinks } = params;
  return `O elemento '${name}' possui ${activeLinks} vínculo(s) ativo(s) de cargo. Para concluir a exclusão, o sistema removerá esses vínculos automaticamente. Os cargos continuarão cadastrados na empresa.\n\n${CHARACTERIZATION_LINK_CLEANUP_TEXTS.deleteWithCleanup.impactNote}`;
}

export function buildDeleteManyWithCleanupMessage(params: {
  elements: number;
  activeLinks: number;
}): string {
  const { elements, activeLinks } = params;
  if (activeLinks <= 0) {
    return 'Deseja excluir as caracterizações selecionadas?';
  }
  return `As ${elements} caracterizações selecionadas possuem ${activeLinks} vínculo(s) ativo(s) de cargo. Para concluir a exclusão, o sistema removerá esses vínculos automaticamente. Os cargos continuarão cadastrados na empresa.\n\n${CHARACTERIZATION_LINK_CLEANUP_TEXTS.deleteWithCleanup.impactNote}`;
}

/** Ação rápida só quando há exatamente um vínculo ativo. */
export function shouldShowQuickUnlink(activeLinkCount: number): boolean {
  return activeLinkCount === 1;
}

/** Conta vínculos ativos a partir do browse (hierarchies[] = ativos). */
export function countActiveLinksFromBrowseRows(
  rows: Array<{ hierarchies?: unknown[] }>,
): { elements: number; elementsWithLinks: number; activeLinks: number } {
  let activeLinks = 0;
  let elementsWithLinks = 0;
  for (const row of rows) {
    const count = (row.hierarchies ?? []).length;
    activeLinks += count;
    if (count > 0) elementsWithLinks += 1;
  }
  return {
    elements: rows.length,
    elementsWithLinks,
    activeLinks,
  };
}

/** Filtra vínculos ativos a partir da lista flatten do modal. */
export function countActiveHierarchyHomoRows(
  rows: Array<{ endDate?: Date | string | null }>,
): number {
  return rows.filter((row) => !row.endDate).length;
}
