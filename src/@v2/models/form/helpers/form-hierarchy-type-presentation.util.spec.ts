/**
 * npx tsx src/@v2/models/form/helpers/form-hierarchy-type-presentation.util.spec.ts
 */
import assert from 'node:assert/strict';

import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { getStructuralIndicatorGroupingLabel } from './form-indicators-structural-grouping.config';
import {
  formatAgrupadoPor,
  formatAgrupadoPorEstabelecimentoE,
  resolveCombinedHierarchyColumnLabel,
  resolveCombinedHierarchySelectLabel,
  resolveFormHierarchyTypeLabel,
  resolveMissingHierarchyTypeLabel,
} from './form-hierarchy-type-presentation.util';
import {
  getCombinedHierarchyLevelsForDisplay,
  getFlatHierarchyGroupingConfig,
  getFlatHierarchyMissingLabel,
  getGroupedPdfColumnLabel,
  getGroupedPdfSectionTitle,
  getGroupedPdfTitle,
  getParticipantsViewModeSelectLabel,
} from './form-participants-hierarchy-grouping.config';

const SEFAZ_LABELS = {
  [HierarchyTypeEnum.DIRECTORY]: 'Superintendência',
  [HierarchyTypeEnum.MANAGEMENT]: 'Diretoria',
};

assert.equal(
  resolveFormHierarchyTypeLabel(HierarchyTypeEnum.DIRECTORY),
  'Diretoria',
);
assert.equal(
  resolveFormHierarchyTypeLabel(HierarchyTypeEnum.MANAGEMENT),
  'Gerência',
);
assert.equal(
  resolveFormHierarchyTypeLabel(HierarchyTypeEnum.DIRECTORY, SEFAZ_LABELS),
  'Superintendência',
);
assert.equal(
  resolveFormHierarchyTypeLabel(HierarchyTypeEnum.MANAGEMENT, SEFAZ_LABELS),
  'Diretoria',
);

assert.equal(
  getStructuralIndicatorGroupingLabel('__participant_directory'),
  'Diretoria',
);
assert.equal(
  getStructuralIndicatorGroupingLabel('__participant_management'),
  'Gerência',
);
assert.equal(
  getStructuralIndicatorGroupingLabel(
    '__participant_directory',
    SEFAZ_LABELS,
  ),
  'Superintendência',
);
assert.equal(
  getStructuralIndicatorGroupingLabel(
    '__participant_management',
    SEFAZ_LABELS,
  ),
  'Diretoria',
);
assert.equal(
  getStructuralIndicatorGroupingLabel('__participant_workspace'),
  'Estabelecimento',
);

assert.equal(
  getParticipantsViewModeSelectLabel('grouped_directory'),
  'Agrupado por diretoria',
);
assert.equal(
  getParticipantsViewModeSelectLabel('grouped_management'),
  'Agrupado por gerência',
);
assert.equal(
  getParticipantsViewModeSelectLabel('grouped_directory', SEFAZ_LABELS),
  'Agrupado por superintendência',
);
assert.equal(
  getParticipantsViewModeSelectLabel('grouped_management', SEFAZ_LABELS),
  'Agrupado por diretoria',
);

assert.equal(
  resolveCombinedHierarchySelectLabel([
    HierarchyTypeEnum.DIRECTORY,
    HierarchyTypeEnum.MANAGEMENT,
  ]),
  'Agrupado por diretoria + gerência',
);
assert.equal(
  resolveCombinedHierarchySelectLabel(
    [HierarchyTypeEnum.DIRECTORY, HierarchyTypeEnum.MANAGEMENT],
    SEFAZ_LABELS,
  ),
  'Agrupado por superintendência + diretoria',
);
assert.equal(
  resolveCombinedHierarchySelectLabel([
    HierarchyTypeEnum.DIRECTORY,
    HierarchyTypeEnum.MANAGEMENT,
    HierarchyTypeEnum.SECTOR,
  ]),
  'Agrupado por diretoria + gerência + setor',
);
assert.equal(
  resolveCombinedHierarchySelectLabel([
    HierarchyTypeEnum.DIRECTORY,
    HierarchyTypeEnum.MANAGEMENT,
    HierarchyTypeEnum.SECTOR,
    HierarchyTypeEnum.SUB_SECTOR,
  ]),
  'Agrupado por diretoria + gerência + setor + subsetor',
);
assert.equal(
  resolveCombinedHierarchySelectLabel(
    [
      HierarchyTypeEnum.DIRECTORY,
      HierarchyTypeEnum.MANAGEMENT,
      HierarchyTypeEnum.SECTOR,
      HierarchyTypeEnum.SUB_SECTOR,
    ],
    SEFAZ_LABELS,
  ),
  'Agrupado por superintendência + diretoria + setor + subsetor',
);

assert.equal(
  resolveCombinedHierarchyColumnLabel([
    HierarchyTypeEnum.DIRECTORY,
    HierarchyTypeEnum.SECTOR,
  ]),
  'Diretoria / Setor',
);
assert.equal(
  formatAgrupadoPor(['Diretoria', 'Gerência']),
  'Agrupado por diretoria + gerência',
);
assert.equal(
  formatAgrupadoPorEstabelecimentoE('Diretoria'),
  'Agrupado por estabelecimento e diretoria',
);

assert.equal(
  getParticipantsViewModeSelectLabel('grouped_directory_management'),
  'Agrupado por diretoria + gerência',
);
assert.equal(
  getParticipantsViewModeSelectLabel(
    'grouped_directory_management',
    SEFAZ_LABELS,
  ),
  'Agrupado por superintendência + diretoria',
);
assert.equal(
  getParticipantsViewModeSelectLabel('grouped_directory_management_sector'),
  'Agrupado por diretoria + gerência + setor',
);
assert.equal(
  getParticipantsViewModeSelectLabel(
    'grouped_directory_management_sector_sub_sector',
  ),
  'Agrupado por diretoria + gerência + setor + subsetor',
);

assert.equal(
  getGroupedPdfTitle('grouped_directory_sector'),
  'Recorte filtrado — agrupado por diretoria + setor',
);
assert.equal(
  getGroupedPdfSectionTitle('grouped_directory_sector'),
  'Por diretoria e setor',
);
assert.equal(
  getGroupedPdfColumnLabel('grouped_directory_sector'),
  'Diretoria / Setor',
);

assert.equal(
  getGroupedPdfTitle('grouped_management'),
  'Recorte filtrado — agrupado por gerência',
);
assert.equal(getGroupedPdfSectionTitle('grouped_management'), 'Por gerência');
assert.equal(getGroupedPdfColumnLabel('grouped_management'), 'Gerência');

assert.equal(
  getGroupedPdfTitle('grouped_directory_management'),
  'Recorte filtrado — agrupado por diretoria + gerência',
);
assert.equal(
  getGroupedPdfSectionTitle('grouped_directory_management'),
  'Por diretoria e gerência',
);
assert.equal(
  getGroupedPdfColumnLabel('grouped_directory_management'),
  'Diretoria / Gerência',
);
assert.equal(
  getGroupedPdfTitle('grouped_directory_management', SEFAZ_LABELS),
  'Recorte filtrado — agrupado por superintendência + diretoria',
);
assert.equal(
  getGroupedPdfSectionTitle('grouped_directory_management', SEFAZ_LABELS),
  'Por superintendência e diretoria',
);
assert.equal(
  getGroupedPdfColumnLabel('grouped_directory_management', SEFAZ_LABELS),
  'Superintendência / Diretoria',
);

assert.equal(
  getGroupedPdfTitle('grouped_establishment_directory'),
  'Recorte filtrado — agrupado por estabelecimento e diretoria',
);
assert.equal(
  getGroupedPdfSectionTitle('grouped_establishment_directory'),
  'Por estabelecimento e diretoria',
);
assert.equal(
  getGroupedPdfColumnLabel('grouped_establishment_directory'),
  'Estabelecimento / Diretoria',
);
assert.equal(
  getGroupedPdfTitle('grouped_establishment_directory', SEFAZ_LABELS),
  'Recorte filtrado — agrupado por estabelecimento e superintendência',
);
assert.equal(
  getGroupedPdfSectionTitle('grouped_establishment_directory', SEFAZ_LABELS),
  'Por estabelecimento e superintendência',
);
assert.equal(
  getGroupedPdfColumnLabel('grouped_establishment_directory', SEFAZ_LABELS),
  'Estabelecimento / Superintendência',
);

assert.equal(
  getGroupedPdfTitle('grouped_directory_management_sector'),
  'Recorte filtrado — agrupado por diretoria + gerência + setor',
);
assert.equal(
  getGroupedPdfSectionTitle('grouped_directory_management_sector'),
  'Por diretoria e gerência e setor',
);
assert.equal(
  getGroupedPdfColumnLabel('grouped_directory_management_sector'),
  'Diretoria / Gerência / Setor',
);
assert.equal(
  getGroupedPdfTitle(
    'grouped_directory_management_sector',
    SEFAZ_LABELS,
  ),
  'Recorte filtrado — agrupado por superintendência + diretoria + setor',
);
assert.equal(
  getGroupedPdfColumnLabel(
    'grouped_directory_management_sector',
    SEFAZ_LABELS,
  ),
  'Superintendência / Diretoria / Setor',
);

assert.equal(
  resolveMissingHierarchyTypeLabel(HierarchyTypeEnum.DIRECTORY),
  'Sem diretoria',
);
assert.equal(
  resolveMissingHierarchyTypeLabel(HierarchyTypeEnum.DIRECTORY, SEFAZ_LABELS),
  'Sem superintendência',
);
assert.equal(
  resolveMissingHierarchyTypeLabel(HierarchyTypeEnum.MANAGEMENT),
  'Sem gerência',
);
assert.equal(
  resolveMissingHierarchyTypeLabel(
    HierarchyTypeEnum.MANAGEMENT,
    SEFAZ_LABELS,
  ),
  'Sem diretoria',
);

const directoryFlat = getFlatHierarchyGroupingConfig('grouped_directory');
assert.ok(directoryFlat);
assert.equal(
  getFlatHierarchyMissingLabel(directoryFlat),
  'Sem diretoria',
);
assert.equal(
  getFlatHierarchyMissingLabel(directoryFlat, SEFAZ_LABELS),
  'Sem superintendência',
);

const combinedLevels = getCombinedHierarchyLevelsForDisplay(
  'grouped_directory_sector',
);
assert.ok(combinedLevels);
assert.equal(combinedLevels[0]?.missingLabel, 'Sem diretoria');
assert.equal(combinedLevels[1]?.missingLabel, 'Sem setor');

const sefazCombinedLevels = getCombinedHierarchyLevelsForDisplay(
  'grouped_directory_sector',
  SEFAZ_LABELS,
);
assert.ok(sefazCombinedLevels);
assert.equal(sefazCombinedLevels[0]?.missingLabel, 'Sem superintendência');

console.log('form-hierarchy-type-presentation.util.spec.ts ok');
