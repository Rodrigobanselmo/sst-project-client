/**
 * npx tsx src/components/organisms/modals/ModalViewDocDownloads/helpers/pgr-download-composition.util.spec.ts
 */
import assert from 'node:assert/strict';

import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  buildPgrCustomCompositionDownloadUrl,
  getPgrCompositionCheckboxes,
  getPgrCustomCompositionToggleLabel,
  getPgrCustomDownloadButtonLabel,
  getPgrRecommendedDownloadLabel,
  PGR_COMPOSITION_PARTS,
  sortPgrCompositionParts,
} from './pgr-download-composition.util';

assert.equal(getPgrRecommendedDownloadLabel(), 'Baixar documento recomendado');
assert.equal(
  getPgrCustomCompositionToggleLabel(),
  'Montar documento personalizado',
);
assert.equal(
  getPgrCustomDownloadButtonLabel(),
  'Baixar documento personalizado',
);

const checkboxes = getPgrCompositionCheckboxes(DocumentTypeEnum.PGR);
assert.deepEqual(
  checkboxes.map((item) => item.id),
  [...PGR_COMPOSITION_PARTS],
);
assert.equal(checkboxes[0].label, 'Documento principal do PGR');
assert.equal(checkboxes[0].description, 'Corpo principal do documento, sem anexos.');
assert.deepEqual(
  checkboxes.map((item) => item.label),
  [
    'Documento principal do PGR',
    'Inventário por Função',
    'Inventário por GSE',
    'Plano de Ação Detalhado',
    'Plano de Ação Agrupado',
    'Plano de Ação Gerencial',
  ],
);
assert.equal(
  getPgrCompositionCheckboxes(DocumentTypeEnum.FRPS)[0].label,
  'Documento principal do FRPS',
);

assert.deepEqual(
  sortPgrCompositionParts([
    'actionPlanManagerial',
    'mainDocument',
    'inventoryByGse',
  ]),
  ['mainDocument', 'inventoryByGse', 'actionPlanManagerial'],
);

assert.equal(
  buildPgrCustomCompositionDownloadUrl({
    docId: 'doc-1',
    companyId: 'company-1',
    parts: [],
  }),
  null,
);
assert.equal(
  buildPgrCustomCompositionDownloadUrl({
    docId: 'doc-1',
    companyId: 'company-1',
    parts: ['actionPlanManagerial', 'inventoryByGse', 'mainDocument'],
  }),
  '/documents/base/pgr-consolidated/docx/doc-1/company-1?composition=custom&parts=mainDocument,inventoryByGse,actionPlanManagerial',
);

console.log('pgr-download-composition.util.spec.ts ok');
