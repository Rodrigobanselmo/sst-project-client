/**
 * Categorias visuais da seção Anexos no modal Baixar Arquivos (PGR e FRPS).
 */
export const PGR_DOWNLOAD_ANNEX_CATEGORY_INVENTORY = 'Inventário de Riscos';
export const PGR_DOWNLOAD_ANNEX_CATEGORY_ACTION_PLAN = 'Plano de Ação';

export type PgrDownloadAnnexKind = 'inventory_function' | 'inventory_gse' | 'action_plan_detailed';

export type PgrDownloadAnnexCategoryId = 'inventory' | 'action_plan';

export type PgrActionPlanAnnexVariant = 'detailed' | 'grouped' | 'managerial';

const INVENTORY_FUNCTION_RE = /invent[aá]rio.*fun[cç][aã]o/i;
const INVENTORY_GSE_RE = /invent[aá]rio.*gse/i;
const ACTION_PLAN_RE = /plano de a[cç][aã]o/i;

export function classifyPgrDownloadAnnex(name: string): PgrDownloadAnnexKind | null {
  if (INVENTORY_FUNCTION_RE.test(name)) return 'inventory_function';
  if (INVENTORY_GSE_RE.test(name)) return 'inventory_gse';
  if (/agrupado|gerencial|managerial/i.test(name)) return null;
  if (ACTION_PLAN_RE.test(name)) return 'action_plan_detailed';
  return null;
}

export function getPgrDownloadAnnexCategoryId(
  kind: PgrDownloadAnnexKind | 'action_plan_grouped' | 'action_plan_managerial',
): PgrDownloadAnnexCategoryId {
  if (kind === 'inventory_function' || kind === 'inventory_gse') return 'inventory';
  return 'action_plan';
}

export function getPgrDownloadAnnexCategoryTitle(
  categoryId: PgrDownloadAnnexCategoryId,
): string {
  if (categoryId === 'inventory') return PGR_DOWNLOAD_ANNEX_CATEGORY_INVENTORY;
  return PGR_DOWNLOAD_ANNEX_CATEGORY_ACTION_PLAN;
}

export function getPgrDownloadAnnexLabel(
  kind: PgrDownloadAnnexKind | 'action_plan_grouped' | 'action_plan_managerial',
): string {
  if (kind === 'inventory_function') return 'Baixar Inventário de Risco por Função';
  if (kind === 'inventory_gse') return 'Baixar Inventário de Risco por GSE';
  if (kind === 'action_plan_detailed') return 'Baixar Plano de Ação Detalhado';
  if (kind === 'action_plan_grouped') return 'Baixar Plano de Ação Agrupado';
  return 'Baixar Plano de Ação Gerencial';
}

export const PGR_ACTION_PLAN_ANNEX_VARIANTS: ReadonlyArray<PgrActionPlanAnnexVariant> = [
  'detailed',
  'grouped',
  'managerial',
];
