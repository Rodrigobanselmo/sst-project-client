import { FORM_PARTICIPANT_NO_ESTABLISHMENT_LABEL } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment';
import type { CombinedHierarchyLevelConfig } from '@v2/models/form/helpers/form-participants-aggregate-by-combined-hierarchy';
import {
  FORM_PARTICIPANT_MISSING_DIRECTORY_LABEL,
  FORM_PARTICIPANT_MISSING_MANAGEMENT_LABEL,
  FORM_PARTICIPANT_MISSING_SECTOR_LABEL,
  FORM_PARTICIPANT_MISSING_SUB_SECTOR_LABEL,
} from '@v2/models/form/helpers/form-participant-hierarchy-display';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

export type CombinedHierarchyGroupingConfig = {
  viewMode: CombinedHierarchyParticipantsViewMode;
  levels: CombinedHierarchyLevelConfig[];
  selectLabel: string;
  loadingMessage: string;
  pdfTitle: string;
  pdfSectionTitle: string;
  columnLabel: string;
  includesEstablishment: boolean;
};

type CombinedLevelKey =
  | 'ESTABLISHMENT'
  | 'DIRECTORY'
  | 'MANAGEMENT'
  | 'SECTOR'
  | 'SUB_SECTOR';

const COMBINED_LEVEL_PRESETS: Record<
  CombinedLevelKey,
  CombinedHierarchyLevelConfig & {
    columnPart: string;
    selectPart: string;
  }
> = {
  ESTABLISHMENT: {
    kind: 'ESTABLISHMENT',
    missingLabel: FORM_PARTICIPANT_NO_ESTABLISHMENT_LABEL,
    columnPart: 'Estabelecimento',
    selectPart: 'estabelecimento',
  },
  DIRECTORY: {
    kind: HierarchyTypeEnum.DIRECTORY,
    missingLabel: FORM_PARTICIPANT_MISSING_DIRECTORY_LABEL,
    columnPart: 'Superintendência',
    selectPart: 'superintendência',
  },
  MANAGEMENT: {
    kind: HierarchyTypeEnum.MANAGEMENT,
    missingLabel: FORM_PARTICIPANT_MISSING_MANAGEMENT_LABEL,
    columnPart: 'Diretoria',
    selectPart: 'diretoria',
  },
  SECTOR: {
    kind: HierarchyTypeEnum.SECTOR,
    missingLabel: FORM_PARTICIPANT_MISSING_SECTOR_LABEL,
    columnPart: 'Setor',
    selectPart: 'setor',
  },
  SUB_SECTOR: {
    kind: HierarchyTypeEnum.SUB_SECTOR,
    missingLabel: FORM_PARTICIPANT_MISSING_SUB_SECTOR_LABEL,
    columnPart: 'Subsetor',
    selectPart: 'subsetor',
  },
};

function toViewModeId(levelKeys: CombinedLevelKey[]): string {
  const slugByKey: Record<CombinedLevelKey, string> = {
    ESTABLISHMENT: 'establishment',
    DIRECTORY: 'directory',
    MANAGEMENT: 'management',
    SECTOR: 'sector',
    SUB_SECTOR: 'sub_sector',
  };

  return `grouped_${levelKeys.map((key) => slugByKey[key]).join('_')}`;
}

function buildCombinedHierarchyGroupingConfig(
  levelKeys: CombinedLevelKey[],
): CombinedHierarchyGroupingConfig {
  const presets = levelKeys.map((key) => COMBINED_LEVEL_PRESETS[key]);
  const levels = presets.map(({ kind, missingLabel }) => ({ kind, missingLabel }));
  const selectLabel = `Agrupado por ${presets.map((preset) => preset.selectPart).join(' + ')}`;
  const columnLabel = presets.map((preset) => preset.columnPart).join(' / ');
  const pdfSectionTitle = `Por ${presets.map((preset) => preset.selectPart).join(' e ')}`;

  return {
    viewMode: toViewModeId(levelKeys) as CombinedHierarchyParticipantsViewMode,
    levels,
    selectLabel,
    loadingMessage: `Carregando agrupamento ${selectLabel.toLowerCase()}…`,
    pdfTitle: `Recorte filtrado — ${selectLabel.toLowerCase()}`,
    pdfSectionTitle,
    columnLabel,
    includesEstablishment: levelKeys.includes('ESTABLISHMENT'),
  };
}

const COMBINED_WITHOUT_ESTABLISHMENT_LEVEL_SETS: CombinedLevelKey[][] = [
  ['DIRECTORY', 'MANAGEMENT'],
  ['DIRECTORY', 'SECTOR'],
  ['DIRECTORY', 'SUB_SECTOR'],
  ['MANAGEMENT', 'SECTOR'],
  ['MANAGEMENT', 'SUB_SECTOR'],
  ['SECTOR', 'SUB_SECTOR'],
  ['DIRECTORY', 'MANAGEMENT', 'SECTOR'],
  ['DIRECTORY', 'MANAGEMENT', 'SUB_SECTOR'],
  ['DIRECTORY', 'SECTOR', 'SUB_SECTOR'],
  ['MANAGEMENT', 'SECTOR', 'SUB_SECTOR'],
  ['DIRECTORY', 'MANAGEMENT', 'SECTOR', 'SUB_SECTOR'],
];

const COMBINED_WITH_ESTABLISHMENT_LEVEL_SETS: CombinedLevelKey[][] = [
  ['ESTABLISHMENT', 'DIRECTORY', 'MANAGEMENT'],
  ['ESTABLISHMENT', 'DIRECTORY', 'SECTOR'],
  ['ESTABLISHMENT', 'DIRECTORY', 'SUB_SECTOR'],
  ['ESTABLISHMENT', 'MANAGEMENT', 'SECTOR'],
  ['ESTABLISHMENT', 'MANAGEMENT', 'SUB_SECTOR'],
  ['ESTABLISHMENT', 'SECTOR', 'SUB_SECTOR'],
  ['ESTABLISHMENT', 'DIRECTORY', 'MANAGEMENT', 'SECTOR'],
  ['ESTABLISHMENT', 'DIRECTORY', 'MANAGEMENT', 'SUB_SECTOR'],
  ['ESTABLISHMENT', 'DIRECTORY', 'SECTOR', 'SUB_SECTOR'],
  ['ESTABLISHMENT', 'MANAGEMENT', 'SECTOR', 'SUB_SECTOR'],
  ['ESTABLISHMENT', 'DIRECTORY', 'MANAGEMENT', 'SECTOR', 'SUB_SECTOR'],
];

export const COMBINED_HIERARCHY_GROUPING_CONFIGS: CombinedHierarchyGroupingConfig[] =
  [
    ...COMBINED_WITHOUT_ESTABLISHMENT_LEVEL_SETS.map(
      buildCombinedHierarchyGroupingConfig,
    ),
    ...COMBINED_WITH_ESTABLISHMENT_LEVEL_SETS.map(
      buildCombinedHierarchyGroupingConfig,
    ),
  ];

export const COMBINED_HIERARCHY_GROUPING_CONFIGS_WITHOUT_ESTABLISHMENT =
  COMBINED_HIERARCHY_GROUPING_CONFIGS.filter(
    (config) => !config.includesEstablishment,
  );

export const COMBINED_HIERARCHY_GROUPING_CONFIGS_WITH_ESTABLISHMENT =
  COMBINED_HIERARCHY_GROUPING_CONFIGS.filter(
    (config) => config.includesEstablishment,
  );

export type CombinedHierarchyParticipantsViewMode =
  `grouped_${string}` & {
    readonly __combinedHierarchyViewMode?: unique symbol;
  };

export function getCombinedHierarchyGroupingConfig(
  viewMode: string,
): CombinedHierarchyGroupingConfig | undefined {
  return COMBINED_HIERARCHY_GROUPING_CONFIGS.find(
    (config) => config.viewMode === viewMode,
  );
}

export function isCombinedHierarchyViewMode(
  viewMode: string,
): viewMode is CombinedHierarchyParticipantsViewMode {
  return getCombinedHierarchyGroupingConfig(viewMode) != null;
}
