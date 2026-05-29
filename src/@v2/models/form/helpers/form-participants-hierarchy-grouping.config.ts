import {
  FORM_PARTICIPANT_MISSING_DIRECTORY_LABEL,
  FORM_PARTICIPANT_MISSING_MANAGEMENT_LABEL,
  FORM_PARTICIPANT_MISSING_SUB_SECTOR_LABEL,
} from '@v2/models/form/helpers/form-participant-hierarchy-display';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

export type ParticipantsViewMode =
  | 'list'
  | 'grouped'
  | 'grouped_hierarchy_group'
  | 'grouped_sector_hierarchy_group'
  | 'grouped_establishment'
  | 'grouped_establishment_sector'
  | 'grouped_directory'
  | 'grouped_management'
  | 'grouped_sub_sector'
  | 'grouped_establishment_directory'
  | 'grouped_establishment_management'
  | 'grouped_establishment_sub_sector';

export type FormParticipantsPdfViewMode = ParticipantsViewMode;

export const ESTABLISHMENT_GROUPED_VIEW_MODES: ParticipantsViewMode[] = [
  'grouped_establishment',
  'grouped_establishment_sector',
  'grouped_establishment_directory',
  'grouped_establishment_management',
  'grouped_establishment_sub_sector',
];

export function isEstablishmentGroupedViewMode(
  mode: ParticipantsViewMode,
): boolean {
  return ESTABLISHMENT_GROUPED_VIEW_MODES.includes(mode);
}

export function isGroupedViewMode(mode: ParticipantsViewMode): boolean {
  return mode !== 'list';
}

export const ALL_PARTICIPANTS_VIEW_MODES: readonly ParticipantsViewMode[] = [
  'list',
  'grouped',
  'grouped_hierarchy_group',
  'grouped_sector_hierarchy_group',
  'grouped_establishment',
  'grouped_establishment_sector',
  'grouped_directory',
  'grouped_management',
  'grouped_sub_sector',
  'grouped_establishment_directory',
  'grouped_establishment_management',
  'grouped_establishment_sub_sector',
] as const;

export type HierarchyGroupGroupingConfig = {
  viewMode:
    | 'grouped_hierarchy_group'
    | 'grouped_sector_hierarchy_group';
  selectLabel: string;
  loadingMessage: string;
  pdfTitle: string;
  pdfSectionTitle: string;
  columnLabel: string;
  nestedHeaderColumnLabel: string;
};

export const HIERARCHY_GROUP_GROUPING_CONFIGS: HierarchyGroupGroupingConfig[] = [
  {
    viewMode: 'grouped_hierarchy_group',
    selectLabel: 'Agrupado por agrupamento de setores',
    loadingMessage: 'Carregando agrupamento por agrupamento de setores…',
    pdfTitle: 'Recorte filtrado — agrupado por agrupamento de setores',
    pdfSectionTitle: 'Por agrupamento de setores',
    columnLabel: 'Agrupamento de setores',
    nestedHeaderColumnLabel: 'Agrupamento de setores',
  },
  {
    viewMode: 'grouped_sector_hierarchy_group',
    selectLabel: 'Agrupado por setor + agrupamento de setores',
    loadingMessage:
      'Carregando agrupamento por setor e agrupamento de setores…',
    pdfTitle:
      'Recorte filtrado — agrupado por setor e agrupamento de setores',
    pdfSectionTitle: 'Por agrupamento e setor',
    columnLabel: 'Agrupamento de setores',
    nestedHeaderColumnLabel: 'Agrupamento / Setor',
  },
];

export function getHierarchyGroupGroupingConfig(
  viewMode: ParticipantsViewMode,
): HierarchyGroupGroupingConfig | undefined {
  return HIERARCHY_GROUP_GROUPING_CONFIGS.find((c) => c.viewMode === viewMode);
}

export function isHierarchyGroupViewMode(
  mode: ParticipantsViewMode,
): mode is HierarchyGroupGroupingConfig['viewMode'] {
  return HIERARCHY_GROUP_GROUPING_CONFIGS.some((c) => c.viewMode === mode);
}

export function isParticipantsViewMode(
  value: string,
): value is ParticipantsViewMode {
  return (ALL_PARTICIPANTS_VIEW_MODES as readonly string[]).includes(value);
}

/** Modos legados — semântica e agregadores originais, não usar helpers genéricos novos. */
export const LEGACY_GROUPED_VIEW_MODES: ParticipantsViewMode[] = [
  'grouped',
  'grouped_establishment',
  'grouped_establishment_sector',
];

export function isLegacyGroupedViewMode(mode: ParticipantsViewMode): boolean {
  return LEGACY_GROUPED_VIEW_MODES.includes(mode);
}

export type FlatHierarchyGroupingConfig = {
  viewMode: ParticipantsViewMode;
  hierarchyType: HierarchyTypeEnum;
  missingLabel: string;
  groupColumnLabel: string;
  selectLabel: string;
  loadingMessage: string;
  pdfTitle: string;
  pdfSectionTitle: string;
};

export type EstablishmentHierarchyGroupingConfig = {
  viewMode: ParticipantsViewMode;
  hierarchyType: HierarchyTypeEnum;
  missingLabel: string;
  subLevelColumnLabel: string;
  headerColumnLabel: string;
  selectLabel: string;
  loadingMessage: string;
  pdfTitle: string;
  pdfSectionTitle: string;
};

export const FLAT_HIERARCHY_GROUPING_CONFIGS: FlatHierarchyGroupingConfig[] = [
  {
    viewMode: 'grouped_directory',
    hierarchyType: HierarchyTypeEnum.DIRECTORY,
    missingLabel: FORM_PARTICIPANT_MISSING_DIRECTORY_LABEL,
    groupColumnLabel: 'Superintendência',
    selectLabel: 'Agrupado por superintendência',
    loadingMessage: 'Carregando agrupamento por superintendência…',
    pdfTitle: 'Recorte filtrado — agrupado por superintendência',
    pdfSectionTitle: 'Por superintendência',
  },
  {
    viewMode: 'grouped_management',
    hierarchyType: HierarchyTypeEnum.MANAGEMENT,
    missingLabel: FORM_PARTICIPANT_MISSING_MANAGEMENT_LABEL,
    groupColumnLabel: 'Diretoria',
    selectLabel: 'Agrupado por diretoria',
    loadingMessage: 'Carregando agrupamento por diretoria…',
    pdfTitle: 'Recorte filtrado — agrupado por diretoria',
    pdfSectionTitle: 'Por diretoria',
  },
  {
    viewMode: 'grouped_sub_sector',
    hierarchyType: HierarchyTypeEnum.SUB_SECTOR,
    missingLabel: FORM_PARTICIPANT_MISSING_SUB_SECTOR_LABEL,
    groupColumnLabel: 'Subsetor',
    selectLabel: 'Agrupado por subsetor',
    loadingMessage: 'Carregando agrupamento por subsetor…',
    pdfTitle: 'Recorte filtrado — agrupado por subsetor',
    pdfSectionTitle: 'Por subsetor',
  },
];

export const ESTABLISHMENT_HIERARCHY_GROUPING_CONFIGS: EstablishmentHierarchyGroupingConfig[] =
  [
    {
      viewMode: 'grouped_establishment_directory',
      hierarchyType: HierarchyTypeEnum.DIRECTORY,
      missingLabel: FORM_PARTICIPANT_MISSING_DIRECTORY_LABEL,
      subLevelColumnLabel: 'Superintendência',
      headerColumnLabel: 'Estabelecimento / Superintendência',
      selectLabel: 'Agrupado por estabelecimento e superintendência',
      loadingMessage:
        'Carregando agrupamento por estabelecimento e superintendência…',
      pdfTitle:
        'Recorte filtrado — agrupado por estabelecimento e superintendência',
      pdfSectionTitle: 'Por estabelecimento e superintendência',
    },
    {
      viewMode: 'grouped_establishment_management',
      hierarchyType: HierarchyTypeEnum.MANAGEMENT,
      missingLabel: FORM_PARTICIPANT_MISSING_MANAGEMENT_LABEL,
      subLevelColumnLabel: 'Diretoria',
      headerColumnLabel: 'Estabelecimento / Diretoria',
      selectLabel: 'Agrupado por estabelecimento e diretoria',
      loadingMessage: 'Carregando agrupamento por estabelecimento e diretoria…',
      pdfTitle: 'Recorte filtrado — agrupado por estabelecimento e diretoria',
      pdfSectionTitle: 'Por estabelecimento e diretoria',
    },
    {
      viewMode: 'grouped_establishment_sub_sector',
      hierarchyType: HierarchyTypeEnum.SUB_SECTOR,
      missingLabel: FORM_PARTICIPANT_MISSING_SUB_SECTOR_LABEL,
      subLevelColumnLabel: 'Subsetor',
      headerColumnLabel: 'Estabelecimento / Subsetor',
      selectLabel: 'Agrupado por estabelecimento e subsetor',
      loadingMessage: 'Carregando agrupamento por estabelecimento e subsetor…',
      pdfTitle: 'Recorte filtrado — agrupado por estabelecimento e subsetor',
      pdfSectionTitle: 'Por estabelecimento e subsetor',
    },
  ];

export function isNewFlatHierarchyViewMode(mode: ParticipantsViewMode): boolean {
  return FLAT_HIERARCHY_GROUPING_CONFIGS.some((c) => c.viewMode === mode);
}

export function isNewEstablishmentHierarchyViewMode(
  mode: ParticipantsViewMode,
): boolean {
  return ESTABLISHMENT_HIERARCHY_GROUPING_CONFIGS.some((c) => c.viewMode === mode);
}

export function getFlatHierarchyGroupingConfig(
  viewMode: ParticipantsViewMode,
): FlatHierarchyGroupingConfig | undefined {
  return FLAT_HIERARCHY_GROUPING_CONFIGS.find((c) => c.viewMode === viewMode);
}

export function getEstablishmentHierarchyGroupingConfig(
  viewMode: ParticipantsViewMode,
): EstablishmentHierarchyGroupingConfig | undefined {
  return ESTABLISHMENT_HIERARCHY_GROUPING_CONFIGS.find(
    (c) => c.viewMode === viewMode,
  );
}

export function getParticipantsViewModeSelectLabel(
  viewMode: ParticipantsViewMode,
): string {
  if (viewMode === 'list') return 'Lista detalhada';
  if (viewMode === 'grouped') return 'Agrupado por setor';
  const hierarchyGroup = getHierarchyGroupGroupingConfig(viewMode);
  if (hierarchyGroup) return hierarchyGroup.selectLabel;
  if (viewMode === 'grouped_establishment') {
    return 'Agrupado por estabelecimento';
  }
  if (viewMode === 'grouped_establishment_sector') {
    return 'Agrupado por estabelecimento e setor';
  }
  const flat = getFlatHierarchyGroupingConfig(viewMode);
  if (flat) return flat.selectLabel;
  const est = getEstablishmentHierarchyGroupingConfig(viewMode);
  if (est) return est.selectLabel;
  return viewMode;
}

export function getGroupedPdfTitle(viewMode: ParticipantsViewMode): string {
  const flat = getFlatHierarchyGroupingConfig(viewMode);
  if (flat) return flat.pdfTitle;
  const est = getEstablishmentHierarchyGroupingConfig(viewMode);
  if (est) return est.pdfTitle;
  const hierarchyGroup = getHierarchyGroupGroupingConfig(viewMode);
  if (hierarchyGroup) return hierarchyGroup.pdfTitle;
  if (viewMode === 'grouped') return 'Recorte filtrado — agrupado por setor';
  if (viewMode === 'grouped_establishment') {
    return 'Recorte filtrado — agrupado por estabelecimento';
  }
  if (viewMode === 'grouped_establishment_sector') {
    return 'Recorte filtrado — agrupado por estabelecimento e setor';
  }
  return 'Participantes — recorte filtrado (lista detalhada)';
}
