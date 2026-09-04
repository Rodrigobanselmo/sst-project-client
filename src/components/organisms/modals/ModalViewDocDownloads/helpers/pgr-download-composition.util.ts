import { DocumentTypeEnum } from 'project/enum/document.enums';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';

export const PGR_COMPOSITION_PARTS = [
  'mainDocument',
  'inventoryByFunction',
  'inventoryByGse',
  'actionPlanDetailed',
  'actionPlanGrouped',
  'actionPlanManagerial',
] as const;

export type PgrCompositionPart = (typeof PGR_COMPOSITION_PARTS)[number];

export type PgrCompositionCheckboxGroupId =
  | 'main'
  | 'inventory'
  | 'action_plan';

export type PgrCompositionCheckbox = {
  id: PgrCompositionPart;
  group: PgrCompositionCheckboxGroupId;
  label: string;
  description?: string;
};

export const PGR_COMPOSITION_GROUP_TITLES: Record<
  PgrCompositionCheckboxGroupId,
  string
> = {
  main: 'Conteúdo principal',
  inventory: 'Inventário de Riscos',
  action_plan: 'Plano de Ação',
};

export function getPgrRecommendedDownloadLabel(): string {
  return 'Baixar documento recomendado';
}

export function getPgrCustomCompositionToggleLabel(): string {
  return 'Montar documento personalizado';
}

export function getPgrCustomDownloadButtonLabel(): string {
  return 'Baixar documento personalizado';
}

export function getPgrCompositionCheckboxes(
  documentType: DocumentTypeEnum,
): PgrCompositionCheckbox[] {
  const programName =
    documentType === DocumentTypeEnum.FRPS ? 'FRPS' : 'PGR';

  return [
    {
      id: 'mainDocument',
      group: 'main',
      label: `Documento principal do ${programName}`,
      description: 'Corpo principal do documento, sem anexos.',
    },
    {
      id: 'inventoryByFunction',
      group: 'inventory',
      label: 'Inventário por Função',
    },
    {
      id: 'inventoryByGse',
      group: 'inventory',
      label: 'Inventário por GSE',
    },
    {
      id: 'actionPlanDetailed',
      group: 'action_plan',
      label: 'Plano de Ação Detalhado',
    },
    {
      id: 'actionPlanGrouped',
      group: 'action_plan',
      label: 'Plano de Ação Agrupado',
    },
    {
      id: 'actionPlanManagerial',
      group: 'action_plan',
      label: 'Plano de Ação Gerencial',
    },
  ];
}

export function sortPgrCompositionParts(
  parts: Iterable<PgrCompositionPart>,
): PgrCompositionPart[] {
  const selected = new Set(parts);
  return PGR_COMPOSITION_PARTS.filter((part) => selected.has(part));
}

export function buildPgrCustomCompositionDownloadUrl(params: {
  docId: string;
  companyId: string;
  parts: Iterable<PgrCompositionPart>;
}): string | null {
  const ordered = sortPgrCompositionParts(params.parts);
  if (ordered.length === 0) return null;

  return `${ApiRoutesEnum.DOCUMENTS_BASE}/pgr-consolidated/docx/${params.docId}/${params.companyId}?composition=custom&parts=${ordered.join(',')}`;
}
