/**
 * Executar:
 * npx tsx src/core/constants/maps/hierarchy-type-labels-form.util.spec.ts
 */
import assert from 'node:assert/strict';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import {
  applyHierarchyTypeLabelsPatchToMetadata,
  buildHierarchyTypeLabelsPatch,
  createHierarchyTypeLabelsDraft,
  isHierarchyTypeLabelCustom,
  isHierarchyTypeLabelsDraftDirty,
} from './hierarchy-type-labels-form.util';

const SEFAZ_STORED = {
  DIRECTORY: 'Superintendência',
  MANAGEMENT: 'Diretoria',
};

const altusDraft = createHierarchyTypeLabelsDraft(undefined);
assert.equal(altusDraft.DIRECTORY, 'Diretoria');
assert.equal(altusDraft.MANAGEMENT, 'Gerência');
assert.equal(isHierarchyTypeLabelCustom(HierarchyEnum.DIRECTORY), false);
assert.equal(
  isHierarchyTypeLabelsDraftDirty({ draft: altusDraft }),
  false,
  'ALTUS sem override não gera PATCH',
);

const sefazDraft = createHierarchyTypeLabelsDraft(SEFAZ_STORED);
assert.equal(sefazDraft.DIRECTORY, 'Superintendência');
assert.equal(sefazDraft.MANAGEMENT, 'Diretoria');
assert.equal(
  isHierarchyTypeLabelCustom(HierarchyEnum.DIRECTORY, SEFAZ_STORED),
  true,
);
assert.equal(
  isHierarchyTypeLabelCustom(HierarchyEnum.SECTOR, SEFAZ_STORED),
  false,
);

const afterEdit = buildHierarchyTypeLabelsPatch({
  stored: SEFAZ_STORED,
  draft: { ...sefazDraft, SECTOR: 'Coordenação' },
});
assert.deepEqual(afterEdit.hierarchyTypeLabels, { SECTOR: 'Coordenação' });

const afterRestore = buildHierarchyTypeLabelsPatch({
  stored: { ...SEFAZ_STORED, SECTOR: 'Coordenação' },
  draft: {
    ...sefazDraft,
    SECTOR: 'Setor',
  },
});
assert.deepEqual(
  afterRestore.hierarchyTypeLabels,
  { SECTOR: null },
  'restaurar envia null só daquele tipo',
);

const whitespaceRejectedAsCustom = buildHierarchyTypeLabelsPatch({
  stored: SEFAZ_STORED,
  draft: { ...sefazDraft, DIRECTORY: '   ' },
});
assert.deepEqual(whitespaceRejectedAsCustom.hierarchyTypeLabels, {
  DIRECTORY: null,
});

const metadata = applyHierarchyTypeLabelsPatchToMetadata(
  {
    primaryColor: '#123',
    pcmsoExamDefaults: { isMale: true },
    frpsPrivacy: { riskAnalysisAiMinParticipants: 2 },
    hierarchyTypeLabels: SEFAZ_STORED,
  },
  { DIRECTORY: 'Superintendência', MANAGEMENT: 'Diretoria' },
);
assert.equal(metadata.primaryColor, '#123');
assert.deepEqual(metadata.pcmsoExamDefaults, { isMale: true });
assert.deepEqual(metadata.frpsPrivacy, { riskAnalysisAiMinParticipants: 2 });
assert.deepEqual(metadata.hierarchyTypeLabels, {
  DIRECTORY: 'Superintendência',
  MANAGEMENT: 'Diretoria',
});

console.log('hierarchy-type-labels-form.util.spec.ts ok');
