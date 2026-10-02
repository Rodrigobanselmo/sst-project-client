/**
 * npx tsx src/components/organisms/modals/ModalAddProbability/normalize-applicable-journeys.spec.ts
 */
import assert from 'node:assert/strict';

import { normalizeApplicableJourneys } from './applicable-journeys.util';

const incompleteWithoutStatus = normalizeApplicableJourneys({
  coveredEmployeeCount: 10,
  knownJourneyCount: 6,
  options: [{ durationMinutes: 480, shiftNames: ['Op'], employeeCount: 6 }],
  suggestedMinutes: 480,
});
assert.equal(incompleteWithoutStatus.status, 'CONSISTENTE_INCOMPLETO');
assert.equal(incompleteWithoutStatus.suggestedMinutes, 480);

const complete = normalizeApplicableJourneys({
  status: 'CONSISTENTE_COMPLETO',
  coveredEmployeeCount: 3,
  knownJourneyCount: 3,
  options: [{ durationMinutes: 480, shiftNames: ['A'], employeeCount: 3 }],
  suggestedMinutes: 480,
});
assert.equal(complete.status, 'CONSISTENTE_COMPLETO');

const conflict = normalizeApplicableJourneys({
  coveredEmployeeCount: 2,
  knownJourneyCount: 2,
  options: [
    { durationMinutes: 480, shiftNames: ['A'], employeeCount: 1 },
    { durationMinutes: 720, shiftNames: ['B'], employeeCount: 1 },
  ],
  suggestedMinutes: 480,
});
assert.equal(conflict.status, 'CONFLITANTE');
assert.equal(conflict.suggestedMinutes, null);

console.log('normalize-applicable-journeys.spec: ok');
