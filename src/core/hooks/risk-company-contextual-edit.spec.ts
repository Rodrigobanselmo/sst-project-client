/**
 * Executar: npx tsx src/core/hooks/risk-company-contextual-edit.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { RiskEnum } from 'project/enum/risk.enums';

import { replaceRiskEditorWithDraft } from 'components/organisms/modals/ModalAddRisk/hooks/risk-add-draft-replacement.util';
import {
  buildRiskFactorDuplicateDraft,
  buildRiskFactorLocalCompanyCopyDraft,
} from 'core/utils/build-risk-factor-duplicate-draft.util';

import { nextModalStack } from './modal-stack.util';

const initialEditor = {
  id: 'should-be-replaced',
  name: '',
  companyId: 'old-company',
  isDuplicateDraft: false,
  asLocalCompanyCopy: false,
  recMed: [{ id: 'old-rec' }],
  generateSource: [{ id: 'old-source' }],
  affectedRegion: '',
  absorptionRoutes: '',
};

const source = {
  id: 'origin-id',
  name: 'Benzeno',
  type: RiskEnum.QUI,
  severity: 5,
  companyId: 'global-company',
  risk: 'Leucemia',
  symptoms: 'Cefaleia',
  affectedRegion: 'Medula óssea',
  absorptionRoutes: 'Inalação; contato dérmico',
  riskFactorData: [{ id: 'link-1' }],
  recMed: [{ id: 'rec-1' }],
  generateSource: [{ id: 'src-1' }],
};

const duplicate = replaceRiskEditorWithDraft(
  initialEditor,
  buildRiskFactorDuplicateDraft({ source }),
);

assert.equal(duplicate.id, '');
assert.equal(duplicate.isDuplicateDraft, true);
assert.equal(duplicate.asLocalCompanyCopy, false);
assert.equal(duplicate.name, 'Cópia de Benzeno');
assert.equal(duplicate.affectedRegion, 'Medula óssea');
assert.equal(duplicate.absorptionRoutes, 'Inalação; contato dérmico');
assert.deepEqual(duplicate.recMed, []);
assert.deepEqual(duplicate.generateSource, []);
assert.equal('riskFactorData' in duplicate, false);

const localCopy = replaceRiskEditorWithDraft(
  initialEditor,
  buildRiskFactorLocalCompanyCopyDraft({
    source,
    companyId: 'tenant-company',
  }),
);

assert.equal(localCopy.id, '');
assert.equal(localCopy.asLocalCompanyCopy, true);
assert.equal(localCopy.companyId, 'tenant-company');
assert.equal(localCopy.name, 'Cópia de Benzeno');
assert.deepEqual(localCopy.recMed, []);
assert.equal('riskFactorData' in localCopy, false);

const closed = nextModalStack([], [], 'RISK_ADD', { id: 'new' });
assert.equal(closed.current.length, 1);
assert.deepEqual(closed.current[0]?.data, { id: 'new' });

const open = nextModalStack(
  [{ name: 'RISK_ADD', data: { id: 'origin-id', name: 'Benzeno' } }],
  [{ name: 'RISK_ADD', data: { id: 'origin-id', name: 'Benzeno' } }],
  'RISK_ADD',
  { id: '', name: 'Cópia de Benzeno', riskAddSession: 10 },
);
assert.equal(open.current.length, 1);
assert.equal(open.current[0]?.data?.id, '');
assert.equal(open.current[0]?.data?.riskAddSession, 10);
assert.equal(open.pile[0]?.data?.id, '');

const tableSource = readFileSync(
  resolve(
    'src/components/organisms/tables/RiskCompanyTable/RiskCompanyTable.tsx',
  ),
  'utf8',
);
assert.equal(tableSource.includes('event.stopPropagation()'), true);
assert.equal(tableSource.includes('ModalEnum.RISK_ADD'), true);
assert.equal(tableSource.includes('onClick={() => onSelectRow(row)}'), true);
assert.equal(tableSource.includes('aria-label="Editar fator de risco"'), true);

const updateSource = readFileSync(
  resolve(
    'src/core/services/hooks/mutations/checklist/risk/useMutUpdateRisk/index.ts',
  ),
  'utf8',
);
const createSource = readFileSync(
  resolve(
    'src/core/services/hooks/mutations/checklist/risk/useMutCreateRisk/index.ts',
  ),
  'utf8',
);
assert.equal(updateSource.includes('invalidateIdentifiedRiskList()'), true);
assert.equal(createSource.includes('invalidateIdentifiedRiskList()'), true);

const modalSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddRisk/index.tsx'),
  'utf8',
);
assert.equal(modalSource.includes('listenRiskAddSession: true'), true);

console.log('risk-company-contextual-edit tests passed');
