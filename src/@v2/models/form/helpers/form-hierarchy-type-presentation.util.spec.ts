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
} from './form-hierarchy-type-presentation.util';
import { getParticipantsViewModeSelectLabel } from './form-participants-hierarchy-grouping.config';

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

console.log('form-hierarchy-type-presentation.util.spec.ts ok');
