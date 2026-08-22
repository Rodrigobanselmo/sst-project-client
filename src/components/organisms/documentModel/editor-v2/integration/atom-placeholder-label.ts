import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

const KNOWN_TYPES = new Set<string>(
  Object.values(DocumentSectionChildrenTypeEnum),
);

function orientationLabel(source?: { orientation?: string } | null): string {
  return source?.orientation === 'landscape' ? 'PAISAGEM' : 'RETRATO';
}

export function formatAtomPlaceholder(
  type: string | undefined,
  source?: { orientation?: string } | null,
  catalogLabel?: string,
): string {
  const atomType = type || 'UNKNOWN';

  if (atomType === DocumentSectionChildrenTypeEnum.IMAGE) return 'IMAGEM';
  if (atomType === DocumentSectionChildrenTypeEnum.BREAK)
    return 'QUEBRA DE PÁGINA';
  if (atomType === DocumentSectionChildrenTypeEnum.SECTION_BREAK) {
    return `QUEBRA DE SEÇÃO — ${orientationLabel(source)}`;
  }
  if (
    atomType === DocumentSectionChildrenTypeEnum.APR_TABLE ||
    atomType === 'APR' ||
    atomType === 'INVENTORY'
  ) {
    return 'INVENTÁRIO DE RISCOS';
  }
  if (
    atomType === DocumentSectionChildrenTypeEnum.PLAN_TABLE ||
    atomType === 'ACTION_PLAN'
  ) {
    return 'PLANO DE AÇÃO';
  }

  if (catalogLabel) return catalogLabel;
  if (KNOWN_TYPES.has(atomType)) return atomType;
  return `ELEMENTO NÃO SUPORTADO: ${atomType}`;
}
