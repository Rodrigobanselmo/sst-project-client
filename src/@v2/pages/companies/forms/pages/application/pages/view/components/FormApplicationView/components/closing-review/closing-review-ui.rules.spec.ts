/**
 * Executar: npx tsx src/@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/closing-review/closing-review-ui.rules.spec.ts
 */
import assert from 'node:assert/strict';

import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import {
  canContinueClosingReview,
  canShowClosingAuditAction,
  closingPrecheckErrorMessage,
  closingResolutionErrorMessage,
  CLOSING_RESOLUTION_RELOAD_HINT,
  closingReviewClassificationColor,
  closingReviewClassificationExplanation,
  closingReviewClassificationLabel,
  closingReviewCloseButtonLabel,
  closingReviewModalTitle,
  closingReviewVisualKind,
  CONSISTENT_LABEL,
  CONFIRMED_LEGITIMATE_EXPLANATION,
  CONFIRMED_LEGITIMATE_LABEL,
  hasDivergenceAlert,
  LEGACY_CLOSING_REVIEW_MESSAGE,
  REVIEW_NEEDED_EXPLANATION,
  REVIEW_NEEDED_LABEL,
  shouldOpenClosingReview,
  shouldShowContinueClosingAction,
  TRANSFER_EXPLANATION,
  TRANSFER_LABEL,
  batchCorrectConfirmationCopy,
  buildClosingResolutionPayloadItem,
  canSelectClosingReviewEmployee,
  closingReviewCorrectablePendingKeys,
  closingReviewEmployeeKey,
  isClosingDivergenceConfirmedLegitimate,
  isPendingCorrectableClosingEmployee,
  partitionClosingResolutionSelection,
} from './closing-review-ui.rules';

assert.equal(
  shouldOpenClosingReview({
    formType: FormTypeEnum.PSYCHOSOCIAL,
    nextStatus: FormApplicationStatusEnum.DONE,
  }),
  true,
);
assert.equal(
  shouldOpenClosingReview({
    formType: FormTypeEnum.PSYCHOSOCIAL,
    nextStatus: FormApplicationStatusEnum.INACTIVE,
  }),
  false,
);
assert.equal(
  shouldOpenClosingReview({
    formType: FormTypeEnum.NORMAL,
    nextStatus: FormApplicationStatusEnum.DONE,
  }),
  false,
);
assert.equal(canContinueClosingReview(0), true);
assert.equal(canContinueClosingReview(1), false);

assert.equal(
  canShowClosingAuditAction({
    isMaster: true,
    formType: FormTypeEnum.PSYCHOSOCIAL,
  }),
  true,
);
assert.equal(
  canShowClosingAuditAction({
    isMaster: false,
    formType: FormTypeEnum.PSYCHOSOCIAL,
  }),
  false,
);
assert.equal(
  canShowClosingAuditAction({
    isMaster: true,
    formType: FormTypeEnum.NORMAL,
  }),
  false,
);

assert.equal(
  closingReviewModalTitle('closing'),
  'Revisão para conclusão da campanha',
);
assert.equal(
  closingReviewModalTitle('audit'),
  'Auditoria de consistência da campanha',
);
assert.equal(shouldShowContinueClosingAction('closing'), true);
assert.equal(shouldShowContinueClosingAction('audit'), false);
assert.equal(closingReviewCloseButtonLabel('closing'), 'Voltar');
assert.equal(closingReviewCloseButtonLabel('audit'), 'Fechar');

assert.equal(
  closingReviewModalTitle('audit').includes('Auditoria'),
  true,
);
assert.equal(closingReviewModalTitle('closing').includes('conclusão'), true);

assert.equal(closingReviewVisualKind('MATCH'), 'consistent');
assert.equal(closingReviewClassificationLabel('MATCH'), CONSISTENT_LABEL);
assert.equal(closingReviewClassificationColor('MATCH'), 'success.main');
assert.equal(closingReviewClassificationExplanation('MATCH'), null);

assert.equal(closingReviewVisualKind('LIKELY_TRANSFER'), 'transfer');
assert.equal(closingReviewClassificationLabel('LIKELY_TRANSFER'), TRANSFER_LABEL);
assert.equal(closingReviewClassificationColor('LIKELY_TRANSFER'), 'info.main');
assert.equal(
  closingReviewClassificationExplanation('LIKELY_TRANSFER'),
  TRANSFER_EXPLANATION,
);

assert.equal(closingReviewVisualKind('LIKELY_CONTAMINATION'), 'review');
assert.equal(
  closingReviewClassificationLabel('LIKELY_CONTAMINATION'),
  REVIEW_NEEDED_LABEL,
);
assert.equal(closingReviewClassificationColor('LIKELY_CONTAMINATION'), 'error.main');
assert.equal(
  closingReviewClassificationExplanation('LIKELY_CONTAMINATION'),
  REVIEW_NEEDED_EXPLANATION,
);
assert.equal(closingReviewClassificationLabel('INCONCLUSIVE'), REVIEW_NEEDED_LABEL);
assert.equal(closingReviewClassificationLabel('UNRESOLVED_SECTOR'), REVIEW_NEEDED_LABEL);

assert.equal(
  closingReviewVisualKind('LIKELY_CONTAMINATION', 'CONFIRMED_LEGITIMATE'),
  'confirmed_legitimate',
);
assert.equal(
  closingReviewClassificationLabel(
    'LIKELY_CONTAMINATION',
    'CONFIRMED_LEGITIMATE',
  ),
  CONFIRMED_LEGITIMATE_LABEL,
);
assert.equal(
  closingReviewClassificationColor(
    'LIKELY_CONTAMINATION',
    'CONFIRMED_LEGITIMATE',
  ),
  'success.main',
);
assert.equal(
  closingReviewClassificationExplanation(
    'LIKELY_CONTAMINATION',
    'CONFIRMED_LEGITIMATE',
  ),
  CONFIRMED_LEGITIMATE_EXPLANATION,
);
assert.equal(
  closingReviewClassificationLabel('LIKELY_CONTAMINATION'),
  REVIEW_NEEDED_LABEL,
);
assert.equal(closingReviewClassificationLabel('MATCH'), CONSISTENT_LABEL);
assert.equal(
  isClosingDivergenceConfirmedLegitimate('CONFIRMED_LEGITIMATE'),
  true,
);
assert.equal(isClosingDivergenceConfirmedLegitimate(null), false);

assert.equal(closingReviewVisualKind('NO_RESPONSE'), 'no_response');
assert.equal(closingReviewClassificationLabel('NO_RESPONSE'), 'Sem resposta');
assert.equal(closingReviewClassificationColor('NO_RESPONSE'), 'text.primary');

assert.equal(hasDivergenceAlert(0), false);
assert.equal(hasDivergenceAlert(1), true);
assert.equal(hasDivergenceAlert(4), true);

assert.equal(
  closingPrecheckErrorMessage({
    response: { data: { message: LEGACY_CLOSING_REVIEW_MESSAGE } },
  }),
  LEGACY_CLOSING_REVIEW_MESSAGE,
);

assert.equal(
  /requer revisão/i.test(CONFIRMED_LEGITIMATE_LABEL),
  false,
);
assert.equal(CONFIRMED_LEGITIMATE_LABEL.includes('confirmada como legítima'), true);

const userFacing = [
  closingReviewClassificationLabel('MATCH'),
  closingReviewClassificationLabel('LIKELY_TRANSFER'),
  closingReviewClassificationLabel('LIKELY_CONTAMINATION'),
  closingReviewClassificationExplanation('LIKELY_TRANSFER'),
  closingReviewClassificationExplanation('LIKELY_CONTAMINATION'),
  closingReviewClassificationLabel(
    'LIKELY_CONTAMINATION',
    'CONFIRMED_LEGITIMATE',
  ),
].join(' ');

assert.equal(/contamina/i.test(userFacing), false);
assert.equal(/cache/i.test(userFacing), false);
assert.equal(/snapshot/i.test(userFacing), false);

const partition = partitionClosingResolutionSelection({
  employees: [
    {
      employeeId: 1,
      name: 'Ana',
      formAnswerId: 'fa-1',
      canCorrect: true,
      canConfirmLegitimate: true,
      coveringSectorId: 'sec-el',
      classification: 'LIKELY_CONTAMINATION',
    },
    {
      employeeId: 2,
      name: 'Bruno',
      formAnswerId: 'fa-2',
      canCorrect: false,
      canConfirmLegitimate: true,
      coveringSectorId: null,
      classification: 'INCONCLUSIVE',
    },
  ],
  selectedKeys: ['fa-1', 'fa-2'],
  action: 'CORRECT',
});
assert.equal(partition.selectedCount, 2);
assert.equal(partition.eligibleCount, 1);
assert.equal(partition.excludedCount, 1);
assert.match(partition.excluded[0]?.reason ?? '', /data da resposta/i);

const copy175 = batchCorrectConfirmationCopy({
  selectedCount: 175,
  eligibleCount: 175,
  excludedCount: 0,
  excluded: [],
});
assert.equal(copy175.includes('Selecionados: 175'), true);
assert.equal(copy175.includes('Corrigíveis agora: 175'), true);
assert.equal(copy175.includes('Não corrigíveis neste lote: 0'), true);
assert.equal(
  copy175.some((line) =>
    line.includes('175 vínculos de setor das respostas serão atualizados'),
  ),
  true,
);
assert.equal(
  copy175.some((line) => line.includes('Nenhuma resposta psicossocial será modificada')),
  true,
);

const mixedCopy = batchCorrectConfirmationCopy({
  selectedCount: 3,
  eligibleCount: 1,
  excludedCount: 2,
  excluded: [
    {
      name: 'Bruno',
      reason: 'Sem setor válido na data da resposta — correção automática indisponível.',
    },
  ],
});
assert.equal(mixedCopy.some((line) => line.includes('Itens excluídos')), true);

const payload = buildClosingResolutionPayloadItem(
  {
    employeeId: 1,
    name: 'Ana',
    formAnswerId: 'fa-1',
    submissionId: 'sub-1',
    snapshotSectorId: 'sec-admin',
    coveringSectorId: 'sec-el',
    referenceSectorId: 'sec-el',
    classification: 'LIKELY_CONTAMINATION',
    canCorrect: true,
  },
  'CORRECT',
);
assert.equal(payload?.expectedReferenceValue, 'sec-el');
assert.equal(payload?.expectedPreviousValue, 'sec-admin');

assert.equal(
  canSelectClosingReviewEmployee({
    employeeId: 2,
    name: 'Bruno',
    classification: 'INCONCLUSIVE',
    canCorrect: false,
    canConfirmLegitimate: true,
  }),
  false,
);

const batchEmployees = [
  {
    employeeId: 1,
    name: 'Ana',
    formAnswerId: 'fa-1',
    canCorrect: true,
    canConfirmLegitimate: true,
    coveringSectorId: 'sec-el',
    classification: 'LIKELY_CONTAMINATION' as const,
  },
  {
    employeeId: 2,
    name: 'Bruno',
    formAnswerId: 'fa-2',
    canCorrect: false,
    canConfirmLegitimate: true,
    coveringSectorId: null,
    classification: 'INCONCLUSIVE' as const,
  },
  {
    employeeId: 3,
    name: 'Carla',
    formAnswerId: 'fa-3',
    canCorrect: false,
    classification: 'MATCH' as const,
  },
  {
    employeeId: 4,
    name: 'Diego',
    formAnswerId: 'fa-4',
    canCorrect: false,
    classification: 'NO_RESPONSE' as const,
  },
  {
    employeeId: 5,
    name: 'Eva',
    formAnswerId: 'fa-5',
    canCorrect: false,
    classification: 'LIKELY_TRANSFER' as const,
  },
  {
    employeeId: 6,
    name: 'Fábio',
    formAnswerId: 'fa-6',
    canCorrect: true,
    canConfirmLegitimate: true,
    coveringSectorId: 'sec-el',
    classification: 'LIKELY_CONTAMINATION' as const,
    resolutionStatus: 'CONFIRMED_LEGITIMATE',
  },
];
assert.equal(isPendingCorrectableClosingEmployee(batchEmployees[0]!), true);
assert.equal(isPendingCorrectableClosingEmployee(batchEmployees[5]!), false);
assert.deepEqual(closingReviewCorrectablePendingKeys(batchEmployees), ['fa-1']);

const homologationEmployees = [
  ...Array.from({ length: 173 }, (_, index) => ({
    employeeId: index + 1,
    name: `Pendente ${index + 1}`,
    formAnswerId: `fa-pending-${index + 1}`,
    submissionId: `sub-pending-${index + 1}`,
    snapshotSectorId: 'sec-admin',
    coveringSectorId: 'sec-el',
    referenceSectorId: 'sec-el',
    canCorrect: true,
    canConfirmLegitimate: true,
    classification: 'LIKELY_CONTAMINATION' as const,
  })),
  {
    employeeId: 9001,
    name: 'Corrigido',
    formAnswerId: 'fa-corrected',
    canCorrect: false,
    classification: 'MATCH' as const,
  },
  {
    employeeId: 9002,
    name: 'Confirmado',
    formAnswerId: 'fa-confirmed',
    canCorrect: true,
    canConfirmLegitimate: true,
    coveringSectorId: 'sec-el',
    classification: 'LIKELY_CONTAMINATION' as const,
    resolutionStatus: 'CONFIRMED_LEGITIMATE',
  },
  {
    employeeId: 9003,
    name: 'Sem resposta',
    formAnswerId: 'fa-none',
    canCorrect: false,
    classification: 'NO_RESPONSE' as const,
  },
  {
    employeeId: 9004,
    name: 'Inelegível',
    formAnswerId: 'fa-inconclusive',
    canCorrect: false,
    canConfirmLegitimate: true,
    classification: 'INCONCLUSIVE' as const,
  },
];
const selected173 = closingReviewCorrectablePendingKeys(homologationEmployees);
assert.equal(selected173.length, 173);
assert.equal(selected173.includes('fa-corrected'), false);
assert.equal(selected173.includes('fa-confirmed'), false);
assert.equal(selected173.includes('fa-none'), false);
assert.equal(selected173.includes('fa-inconclusive'), false);

const payload173 = homologationEmployees
  .filter((employee) => selected173.includes(closingReviewEmployeeKey(employee)))
  .map((employee) => buildClosingResolutionPayloadItem(employee, 'CORRECT'))
  .filter((item): item is NonNullable<typeof item> => Boolean(item));
assert.equal(payload173.length, 173);
assert.equal(
  payload173.every((item) => item.expectedReferenceValue === 'sec-el'),
  true,
);

const conflict409 = closingResolutionErrorMessage({
  response: {
    data: {
      message: 'Nenhuma alteração foi aplicada. Recarregue a revisão e tente novamente.',
      applied: 0,
      skipped: [
        { reason: 'STALE_VALUE' },
        { reason: 'WRONG_APPLICATION' },
      ],
    },
  },
});
assert.equal(typeof conflict409, 'string');
assert.equal(conflict409.includes('Nenhuma alteração foi aplicada'), true);
assert.equal(conflict409.includes('Nenhum item foi alterado (2 inconsistências)'), true);
assert.equal(conflict409.includes(CLOSING_RESOLUTION_RELOAD_HINT), true);
assert.equal(
  typeof closingResolutionErrorMessage({
    response: { data: { message: { skipped: [{ reason: 'STALE_VALUE' }] } } },
  }),
  'string',
);

console.log('closing-review-ui.rules.spec.ts OK');
