/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalAddRisk/hooks/risk-form-hydration.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { resolveLinkedRiskSubTypeId } from 'core/utils/risk-subtype-display.util';

import { resolveRiskFormHydrationSource } from './risk-form-hydration';
import { toRiskFormSeverity } from './risk-form-severity';

const run = (name: string, fn: () => void) => {
  fn();
  console.log(`ok - ${name}`);
};

/** Formato do item de `GET /risk/all` repassado pelo atalho de edição do RiskSelect. */
const modalRisk = {
  id: 'risk-1',
  name: 'Agente qualquer',
  type: 'FIS',
  severity: 4,
  subTypes: [{ sub_type: { id: 7, name: 'Subtipo [AB/CD]' } }],
};

const hydratedFields = (source?: Record<string, any>) => ({
  severity: toRiskFormSeverity(source?.severity),
  subType: resolveLinkedRiskSubTypeId(source),
});

run('legacy modal hydrates severity and subtype from the RISK_ADD payload', () => {
  const source = resolveRiskFormHydrationSource(undefined, modalRisk);
  assert.equal(source, modalRisk);
  assert.deepEqual(hydratedFields(source), { severity: '4', subType: '7' });
});

run('edit page keeps options.initialData as the hydration source', () => {
  const pageRisk = { ...modalRisk, severity: 5, subTypes: [{ sub_type: { id: 3 } }] };
  const source = resolveRiskFormHydrationSource(pageRisk, modalRisk);
  assert.deepEqual(hydratedFields(source), { severity: '5', subType: '3' });
});

run('severity 0/null and missing subtype keep no selection', () => {
  assert.deepEqual(hydratedFields({ severity: 0, subTypes: [] }), {
    severity: undefined,
    subType: undefined,
  });
  assert.deepEqual(hydratedFields({ severity: null }), { severity: undefined, subType: undefined });
});

run('new risk and sub-modal returns do not hydrate risk fields', () => {
  assert.deepEqual(hydratedFields(resolveRiskFormHydrationSource(undefined, { name: 'Novo' })), {
    severity: undefined,
    subType: undefined,
  });
  assert.equal(resolveRiskFormHydrationSource(undefined, {}), undefined);
  assert.equal(resolveRiskFormHydrationSource(undefined, null), undefined);
  assert.equal(
    resolveRiskFormHydrationSource(undefined, { isAddRecMed: true, severity: 5 }),
    undefined,
  );
  assert.equal(
    resolveRiskFormHydrationSource(undefined, { isAddGenerateSource: true, severity: 5 }),
    undefined,
  );
  assert.equal(resolveRiskFormHydrationSource(undefined, { passBack: true, severity: 5 }), undefined);
});

run('duplicate draft (modal payload) is pre-filled', () => {
  const draft = { ...modalRisk, id: '', isDuplicateDraft: true };
  assert.deepEqual(hydratedFields(resolveRiskFormHydrationSource(undefined, draft)), {
    severity: '4',
    subType: '7',
  });
});

const hookSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddRisk/hooks/useAddRisk.ts'),
  'utf8',
);

run('both fields go through syncField, which skips user-changed fields', () => {
  assert.equal(hookSource.includes('resolveRiskFormHydrationSource('), true);
  assert.equal(
    hookSource.includes("syncField('severity', toRiskFormSeverity(initialData.severity));"),
    true,
  );
  assert.equal(hookSource.includes("syncField('subType', resolveLinkedRiskSubTypeId(initialData));"), true);
  assert.equal(hookSource.includes('if (getFieldState(name).isDirty) return;'), true);
  assert.equal(
    hookSource.includes('}, [options?.initialData, getModalData, getFieldState, setValue]);'),
    true,
  );
});

console.log('\nAll risk-form-hydration tests passed.');
