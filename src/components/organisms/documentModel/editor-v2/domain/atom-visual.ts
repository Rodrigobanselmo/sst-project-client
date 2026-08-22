import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

export type AtomVisualCategory =
  | 'pagination'
  | 'media'
  | 'table'
  | 'data'
  | 'unknown';

export type AtomVisualModel = {
  category: AtomVisualCategory;
  label: string;
  icon: string;
  orientation?: 'portrait' | 'landscape';
};

const KNOWN_ENUM = new Set<string>(
  Object.values(DocumentSectionChildrenTypeEnum),
);

const PAGINATION = new Set<string>([
  DocumentSectionChildrenTypeEnum.BREAK,
  DocumentSectionChildrenTypeEnum.SECTION_BREAK,
]);

const MEDIA = new Set<string>([
  DocumentSectionChildrenTypeEnum.IMAGE,
  DocumentSectionChildrenTypeEnum.MEASURE_IMAGE,
  DocumentSectionChildrenTypeEnum.RS_IMAGE,
]);

const DATA = new Set<string>([
  DocumentSectionChildrenTypeEnum.PROFESSIONAL,
  DocumentSectionChildrenTypeEnum.PROFESSIONALS_SIGNATURES,
  DocumentSectionChildrenTypeEnum.LEGAL_RESPONSIBLE_SIGNATURE,
  DocumentSectionChildrenTypeEnum.ATTACHMENTS,
  DocumentSectionChildrenTypeEnum.COMPLEMENTARY_DOCS,
  DocumentSectionChildrenTypeEnum.COMPLEMENTARY_SYSTEMS,
  'WORKSPACE_BLOCK',
  'SCOPE_BLOCK',
]);

const FRIENDLY_LABELS: Record<string, string> = {
  [DocumentSectionChildrenTypeEnum.IMAGE]: 'Imagem',
  [DocumentSectionChildrenTypeEnum.MEASURE_IMAGE]: 'Imagem de medida',
  [DocumentSectionChildrenTypeEnum.RS_IMAGE]: 'Imagem RS',
  [DocumentSectionChildrenTypeEnum.BREAK]: 'Quebra de página',
  [DocumentSectionChildrenTypeEnum.TABLE_VERSION_CONTROL]:
    'Tabela — Controle de versões',
  [DocumentSectionChildrenTypeEnum.APR_TABLE]: 'Inventário de Riscos',
  APR: 'Inventário de Riscos',
  INVENTORY: 'Inventário de Riscos',
  [DocumentSectionChildrenTypeEnum.PLAN_TABLE]: 'Plano de Ação',
  ACTION_PLAN: 'Plano de Ação',
  [DocumentSectionChildrenTypeEnum.PROFESSIONAL]: 'Lista de profissionais',
  [DocumentSectionChildrenTypeEnum.PROFESSIONALS_SIGNATURES]:
    'Assinaturas dos profissionais',
  [DocumentSectionChildrenTypeEnum.LEGAL_RESPONSIBLE_SIGNATURE]:
    'Assinatura do responsável legal',
  [DocumentSectionChildrenTypeEnum.ATTACHMENTS]: 'Anexos',
  [DocumentSectionChildrenTypeEnum.COMPLEMENTARY_DOCS]:
    'Documentos complementares',
  [DocumentSectionChildrenTypeEnum.COMPLEMENTARY_SYSTEMS]:
    'Lista de Sistemas de Gestão',
  WORKSPACE_BLOCK: 'Estabelecimento',
  SCOPE_BLOCK: 'Escopo',
};

const CATEGORY_ICON: Record<AtomVisualCategory, string> = {
  pagination: '↵',
  media: '🖼',
  table: '▦',
  data: '👥',
  unknown: '◻',
};

/**
 * Miniatura de IMAGE: nesta fase usamos card com ícone.
 * Motivo: URL de documento pode falhar por CORS/performance no editor
 * e não há upload/crop/resize. source.url permanece intacto.
 */
export const IMAGE_THUMBNAIL_STRATEGY = 'icon-card' as const;

export function classifyAtomType(type: string | undefined): AtomVisualCategory {
  const atomType = type || 'UNKNOWN';
  if (PAGINATION.has(atomType)) return 'pagination';
  if (MEDIA.has(atomType)) return 'media';
  if (DATA.has(atomType)) return 'data';
  if (
    atomType.startsWith('TABLE_') ||
    atomType.startsWith('FRPS_') ||
    atomType.startsWith('ITERABLE_') ||
    atomType.endsWith('_TABLE') ||
    atomType.endsWith('_TABLES') ||
    atomType.endsWith('_CHART') ||
    atomType === DocumentSectionChildrenTypeEnum.APR_TABLE ||
    atomType === DocumentSectionChildrenTypeEnum.PLAN_TABLE ||
    atomType === 'APR' ||
    atomType === 'INVENTORY' ||
    atomType === 'ACTION_PLAN'
  ) {
    return 'table';
  }
  if (KNOWN_ENUM.has(atomType)) return 'table';
  return 'unknown';
}

function sectionBreakOrientation(
  source?: { orientation?: string } | null,
): 'portrait' | 'landscape' {
  return source?.orientation === 'landscape' ? 'landscape' : 'portrait';
}

export function atomVisualLabel(
  type: string | undefined,
  source?: { orientation?: string } | null,
  catalogLabel?: string,
): string {
  const atomType = type || 'UNKNOWN';

  if (atomType === DocumentSectionChildrenTypeEnum.SECTION_BREAK) {
    const orientation =
      sectionBreakOrientation(source) === 'landscape' ? 'Paisagem' : 'Retrato';
    return `Quebra de seção — ${orientation}`;
  }

  if (catalogLabel) return catalogLabel;
  if (FRIENDLY_LABELS[atomType]) return FRIENDLY_LABELS[atomType];
  if (classifyAtomType(atomType) === 'unknown') {
    return `Elemento não suportado: ${atomType}`;
  }
  return atomType;
}

export function atomVisualIcon(
  type: string | undefined,
  source?: { orientation?: string } | null,
): string {
  const atomType = type || 'UNKNOWN';
  if (atomType === DocumentSectionChildrenTypeEnum.BREAK) return '↵';
  if (atomType === DocumentSectionChildrenTypeEnum.SECTION_BREAK) {
    return sectionBreakOrientation(source) === 'landscape' ? '↔' : '↕';
  }
  return CATEGORY_ICON[classifyAtomType(atomType)];
}

export function describeAtomVisual(
  type: string | undefined,
  source?: { orientation?: string } | null,
  catalogLabel?: string,
): AtomVisualModel {
  const atomType = type || 'UNKNOWN';
  const category = classifyAtomType(atomType);
  return {
    category,
    label: atomVisualLabel(atomType, source, catalogLabel),
    icon: atomVisualIcon(atomType, source),
    ...(atomType === DocumentSectionChildrenTypeEnum.SECTION_BREAK && {
      orientation: sectionBreakOrientation(source),
    }),
  };
}
