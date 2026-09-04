import { ApiRoutesEnum } from 'core/enums/api-routes.enums';

export const PCMSO_COMPOSITION_PARTS = [
  'mainDocument',
  'riskExamsByGse',
  'examsByCharacterizableElement',
  'examsByHierarchy',
  'examsByMixedHierarchy',
] as const;

export type PcmsoCompositionPart = (typeof PCMSO_COMPOSITION_PARTS)[number];

export type PcmsoCompositionCheckboxGroupId = 'main' | 'annexes';

export type PcmsoCompositionCheckbox = {
  id: PcmsoCompositionPart;
  group: PcmsoCompositionCheckboxGroupId;
  label: string;
  description?: string;
};

export const PCMSO_COMPOSITION_GROUP_TITLES: Record<
  PcmsoCompositionCheckboxGroupId,
  string
> = {
  main: 'Conteúdo principal',
  annexes: 'Anexos do PCMSO',
};

export function getPcmsoRecommendedDownloadLabel(): string {
  return 'Baixar documento recomendado';
}

export function getPcmsoCustomCompositionToggleLabel(): string {
  return 'Montar documento personalizado';
}

export function getPcmsoCustomDownloadButtonLabel(): string {
  return 'Baixar documento personalizado';
}

export function getPcmsoCompositionCheckboxes(): PcmsoCompositionCheckbox[] {
  return [
    {
      id: 'mainDocument',
      group: 'main',
      label: 'Documento principal do PCMSO',
      description: 'Corpo principal do documento, sem anexos.',
    },
    {
      id: 'riskExamsByGse',
      group: 'annexes',
      label: 'Relação de Riscos e Exames por GSE',
    },
    {
      id: 'examsByCharacterizableElement',
      group: 'annexes',
      label: 'Relação de Exames por Elemento Caracterizável',
    },
    {
      id: 'examsByHierarchy',
      group: 'annexes',
      label: 'Relação de Exames por Hierarquia',
    },
    {
      id: 'examsByMixedHierarchy',
      group: 'annexes',
      label: 'Relação de Exames por Hierarquia Mesclada',
    },
  ];
}

export function sortPcmsoCompositionParts(
  parts: Iterable<PcmsoCompositionPart>,
): PcmsoCompositionPart[] {
  const selected = new Set(parts);
  return PCMSO_COMPOSITION_PARTS.filter((part) => selected.has(part));
}

export function buildPcmsoCustomCompositionDownloadUrl(params: {
  docId: string;
  companyId: string;
  parts: Iterable<PcmsoCompositionPart>;
}): string | null {
  const ordered = sortPcmsoCompositionParts(params.parts);
  if (ordered.length === 0) return null;

  return `${ApiRoutesEnum.DOCUMENTS_BASE}/pcmso-consolidated/docx/${params.docId}/${params.companyId}?composition=custom&parts=${ordered.join(',')}`;
}
