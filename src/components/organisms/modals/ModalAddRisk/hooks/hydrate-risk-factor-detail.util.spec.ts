/**
 * Executar: npx tsx src/components/organisms/modals/ModalAddRisk/hooks/hydrate-risk-factor-detail.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { hydrateRiskFactorFromDetail } from './hydrate-risk-factor-detail.util';

const listRow = {
  id: 'queda-id',
  name: 'Queda do mesmo nível',
  severity: 3,
  type: 'ACI',
  companyId: 'altus',
};

const persisted = {
  ...listRow,
  risk: 'Traumatismo de diversos níveis.',
  symptoms: 'Qualquer seguimento corporal ou corpo inteiro.',
  affectedRegion: 'Membros inferiores',
  absorptionRoutes: '',
  severity: 3,
};

const modalData = { id: 'queda-id' };
const clean = () => false;

assert.equal(
  hydrateRiskFactorFromDetail(listRow, persisted, clean, modalData).editor.risk,
  'Traumatismo de diversos níveis.',
);
assert.equal(
  hydrateRiskFactorFromDetail(listRow, persisted, clean, modalData).editor.symptoms,
  'Qualquer seguimento corporal ou corpo inteiro.',
);
assert.equal(
  hydrateRiskFactorFromDetail(listRow, persisted, clean, modalData).editor.affectedRegion,
  'Membros inferiores',
);
assert.equal(
  hydrateRiskFactorFromDetail(listRow, persisted, clean, modalData).formValues.absorptionRoutes,
  undefined,
);
assert.equal(
  hydrateRiskFactorFromDetail(listRow, persisted, clean, modalData).editor.severity,
  3,
);
assert.equal(
  hydrateRiskFactorFromDetail(listRow, persisted, clean, modalData).editor.name,
  'Queda do mesmo nível',
);

const edited = hydrateRiskFactorFromDetail(
  { ...listRow, risk: 'Texto digitado' },
  persisted,
  (name) => name === 'risk',
  modalData,
);
assert.equal(edited.editor.risk, 'Texto digitado');
assert.equal(edited.editor.symptoms, 'Qualquer seguimento corporal ou corpo inteiro.');

const reopened = hydrateRiskFactorFromDetail(
  listRow,
  {
    ...persisted,
    risk: 'Sugestão aplicada',
    symptoms: 'Sintoma sugerido',
    affectedRegion: 'Região sugerida',
    absorptionRoutes: 'Via sugerida',
    severity: 4,
  },
  clean,
  modalData,
);
assert.equal(reopened.formValues.risk, 'Sugestão aplicada');
assert.equal(reopened.formValues.symptoms, 'Sintoma sugerido');
assert.equal(reopened.formValues.affectedRegion, 'Região sugerida');
assert.equal(reopened.formValues.absorptionRoutes, 'Via sugerida');
assert.equal(reopened.formValues.severity, '4');

const duplicate = hydrateRiskFactorFromDetail(
  {
    id: '',
    isDuplicateDraft: true,
    name: 'Cópia de Queda do mesmo nível',
    risk: 'Traumatismo de diversos níveis.',
    symptoms: 'Qualquer seguimento corporal ou corpo inteiro.',
  },
  persisted,
  clean,
  { id: '', isDuplicateDraft: true },
);
assert.equal(duplicate.changed, false);
assert.equal(duplicate.editor.id, '');
assert.equal(duplicate.editor.risk, 'Traumatismo de diversos níveis.');

const alreadyComplete = hydrateRiskFactorFromDetail(persisted, persisted, clean, modalData);
assert.equal(alreadyComplete.changed, false);

const hookSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddRisk/hooks/useAddRisk.ts'),
  'utf8',
);
const editPageSource = readFileSync(
  resolve(
    'src/pages/dashboard/empresas/[companyId]/fatores-riscos/[riskId]/edit/index.page.tsx',
  ),
  'utf8',
);
const formSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalAddRisk/components/RiskSharedContent/RiskSharedContent.tsx',
  ),
  'utf8',
);

assert.equal(hookSource.includes('hydrateRiskFactorFromDetail('), true);
assert.equal(hookSource.includes("refetchOnMount: 'always'"), true);
assert.equal(hookSource.includes('risk: riskHealth,'), true);
assert.equal(hookSource.includes('symptoms,'), true);
assert.equal(hookSource.includes('affectedRegion,'), true);
assert.equal(hookSource.includes('absorptionRoutes,'), true);
assert.equal(editPageSource.includes('initialData: risk'), true);
assert.equal(editPageSource.includes("refetchOnMount: 'always'"), true);
assert.equal(formSource.includes('RiskFactorAiSuggestionButton'), true);
assert.equal(formSource.includes('name="risk"'), true);
assert.equal(formSource.includes('name="symptoms"'), true);

console.log('hydrate-risk-factor-detail tests passed');
