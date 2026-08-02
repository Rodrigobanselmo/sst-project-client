/**
 * Contrato — step inicial do editor aplicado UMA vez; navegação manual livre.
 *
 * Executar:
 * npx tsx src/@v2/pages/companies/characterization-edit/apply-initial-wizard-step.util.spec.ts
 */
import assert from 'node:assert/strict';

import { decideApplyInitialWizardStep } from './apply-initial-wizard-step.util';
import { CHARACTERIZATION_WIZARD_STEP } from '../characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-steps';

const STEP_COUNT = 6;

/** Aplicação inicial para cada aba. */
const entries: Array<{ step: number; label: string }> = [
  { step: CHARACTERIZATION_WIZARD_STEP.DATA, label: 'Dados' },
  { step: CHARACTERIZATION_WIZARD_STEP.CARGOS, label: 'Cargos' },
  { step: CHARACTERIZATION_WIZARD_STEP.RISKS, label: 'Fatores de Riscos' },
  { step: CHARACTERIZATION_WIZARD_STEP.MEDIA, label: 'Áudios e Vídeos' },
  { step: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS, label: 'Análise IA' },
  { step: CHARACTERIZATION_WIZARD_STEP.TRACEABILITY, label: 'Rastreabilidade' },
];

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
    requestedStep: 2,
    activeStep: 2,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: false, target: 2, markApplied: true },
);

/** Após aplicado: clique em outra aba NÃO deve voltar ao step inicial. */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: true,
    requestedStep: 2,
    activeStep: 0,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: false, markApplied: true },
);

assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: true,
    requestedStep: 4,
    activeStep: 1,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: false, markApplied: true },
);

/** Refetch / re-render com enabled true e alreadyApplied → no-op. */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: true,
    alreadyApplied: true,
    requestedStep: 4,
    activeStep: 4,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: false, markApplied: true },
);

/** Ainda não habilitado → não marca aplicado (espera hidratação). */
assert.deepEqual(
  decideApplyInitialWizardStep({
    enabled: false,
    alreadyApplied: false,
    requestedStep: 4,
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
    requestedStep: 5,
    activeStep: 0,
    stepCount: STEP_COUNT,
  }),
  { shouldGoToStep: true, target: 5, markApplied: true },
);

console.log('apply-initial-wizard-step.util.spec.ts OK');
