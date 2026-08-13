/**
 * Contrato — step inicial do editor aplicado UMA vez; navegação manual livre.
 *
 * Executar:
 * npx tsx src/@v2/pages/companies/characterization-edit/apply-initial-wizard-step.util.spec.ts
 */
import assert from 'node:assert/strict';

import { decideApplyInitialWizardStep } from './apply-initial-wizard-step.util';
import {
  CHARACTERIZATION_WIZARD_STEP,
  CHARACTERIZATION_WIZARD_TAB_LABELS,
  CHARACTERIZATION_WIZARD_TAB_ORDER,
} from '../characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-steps';

const STEP_COUNT = CHARACTERIZATION_WIZARD_TAB_ORDER.length;
assert.equal(STEP_COUNT, 6);

/** Aplicação inicial para cada aba, na ordem canônica. */
const entries: Array<{ step: number; label: string }> = [
  {
    step: CHARACTERIZATION_WIZARD_STEP.DATA,
    label: CHARACTERIZATION_WIZARD_TAB_LABELS.DATA,
  },
  {
    step: CHARACTERIZATION_WIZARD_STEP.CARGOS,
    label: CHARACTERIZATION_WIZARD_TAB_LABELS.CARGOS,
  },
  {
    step: CHARACTERIZATION_WIZARD_STEP.MEDIA,
    label: CHARACTERIZATION_WIZARD_TAB_LABELS.MEDIA,
  },
  {
    step: CHARACTERIZATION_WIZARD_STEP.TRACEABILITY,
    label: CHARACTERIZATION_WIZARD_TAB_LABELS.TRACEABILITY,
  },
  {
    step: CHARACTERIZATION_WIZARD_STEP.RISKS,
    label: CHARACTERIZATION_WIZARD_TAB_LABELS.RISKS,
  },
  {
    step: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    label: CHARACTERIZATION_WIZARD_TAB_LABELS.AI_ANALYSIS,
  },
];

assert.deepEqual(
  entries.map((entry) => entry.label),
  [...CHARACTERIZATION_WIZARD_TAB_ORDER],
);

for (const { step, label } of entries) {
  const decision = decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: false,
    requestedStep: step,
    activeStep: 0,
    stepCount: STEP_COUNT,
  });
  assert.equal(decision.shouldGoToStep, step !== 0, label);
  assert.equal(decision.target, step, label);
  assert.equal(decision.markApplied, true, label);
}

/** Já no target → só marca aplicado, sem goToStep. */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: false,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.MEDIA,
    activeStep: CHARACTERIZATION_WIZARD_STEP.MEDIA,
    stepCount: STEP_COUNT,
  }),
  {
    shouldGoToStep: false,
    target: CHARACTERIZATION_WIZARD_STEP.MEDIA,
    markApplied: true,
  },
);

/** Após aplicado: clique em outra aba NÃO deve voltar ao step inicial. */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: true,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.MEDIA,
    activeStep: 0,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: false, markApplied: true },
);

assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: true,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.RISKS,
    activeStep: CHARACTERIZATION_WIZARD_STEP.CARGOS,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: false, markApplied: true },
);

/** Refetch / re-render com enabled true e alreadyApplied → no-op. */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: true,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.RISKS,
    activeStep: CHARACTERIZATION_WIZARD_STEP.RISKS,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: false, markApplied: true },
);

/** Ainda não habilitado → não marca aplicado (espera hidratação). */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: false,
    alreadyApplied: false,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.RISKS,
    activeStep: 0,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: false, markApplied: false },
);

/** Sem intenção → libera navegação. */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: false,
    requestedStep: undefined,
    activeStep: 0,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: false, markApplied: true },
);

/** Step inválido → não aplica ainda. */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: false,
    requestedStep: 99,
    activeStep: 0,
    stepCount: STEP_COUNT,
  }),
  // clamp → 0; activeStep já 0 → mark applied without go
  { shouldGoToStep: false, target: 0, markApplied: true },
);

/** Nova abertura (alreadyApplied=false) com step diferente aplica de novo. */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: false,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    activeStep: 0,
    stepCount: STEP_COUNT,
  }),
  {
    shouldGoToStep: true,
    target: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    markApplied: true,
  },
);

console.log('apply-initial-wizard-step.util.spec.ts OK');
