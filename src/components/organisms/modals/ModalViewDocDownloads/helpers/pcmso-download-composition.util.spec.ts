/**
 * npx tsx src/components/organisms/modals/ModalViewDocDownloads/helpers/pcmso-download-composition.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  buildPcmsoCustomCompositionDownloadUrl,
  getPcmsoCompositionCheckboxes,
  getPcmsoCustomCompositionToggleLabel,
  getPcmsoCustomDownloadButtonLabel,
  getPcmsoRecommendedDownloadLabel,
  PCMSO_COMPOSITION_PARTS,
  sortPcmsoCompositionParts,
} from './pcmso-download-composition.util';

assert.equal(getPcmsoRecommendedDownloadLabel(), 'Baixar documento recomendado');
assert.equal(
  getPcmsoCustomCompositionToggleLabel(),
  'Montar documento personalizado',
);
assert.equal(
  getPcmsoCustomDownloadButtonLabel(),
  'Baixar documento personalizado',
);

const checkboxes = getPcmsoCompositionCheckboxes();
assert.deepEqual(
  checkboxes.map((item) => item.id),
  [...PCMSO_COMPOSITION_PARTS],
);
assert.equal(checkboxes[0].label, 'Documento principal do PCMSO');
assert.equal(checkboxes[0].description, 'Corpo principal do documento, sem anexos.');
assert.deepEqual(
  checkboxes.map((item) => item.label),
  [
    'Documento principal do PCMSO',
    'Relação de Riscos e Exames por GSE',
    'Relação de Exames por Elemento Caracterizável',
    'Relação de Exames por Hierarquia',
    'Relação de Exames por Hierarquia Mesclada',
  ],
);

assert.deepEqual(
  sortPcmsoCompositionParts([
    'examsByMixedHierarchy',
    'mainDocument',
    'riskExamsByGse',
  ]),
  ['mainDocument', 'riskExamsByGse', 'examsByMixedHierarchy'],
);

assert.equal(
  buildPcmsoCustomCompositionDownloadUrl({
    docId: 'doc-1',
    companyId: 'company-1',
    parts: [],
  }),
  null,
);
assert.equal(
  buildPcmsoCustomCompositionDownloadUrl({
    docId: 'doc-1',
    companyId: 'company-1',
    parts: ['examsByHierarchy', 'riskExamsByGse', 'mainDocument'],
  }),
  '/documents/base/pcmso-consolidated/docx/doc-1/company-1?composition=custom&parts=mainDocument,riskExamsByGse,examsByHierarchy',
);

console.log('pcmso-download-composition.util.spec.ts ok');
