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
  closingReviewClassificationColor,
  closingReviewClassificationExplanation,
  closingReviewClassificationLabel,
  closingReviewCloseButtonLabel,
  closingReviewModalTitle,
  closingReviewVisualKind,
  CONSISTENT_LABEL,
  hasDivergenceAlert,
  LEGACY_CLOSING_REVIEW_MESSAGE,
  REVIEW_NEEDED_EXPLANATION,
  REVIEW_NEEDED_LABEL,
  shouldOpenClosingReview,
  shouldShowContinueClosingAction,
  TRANSFER_EXPLANATION,
  TRANSFER_LABEL,
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

const userFacing = [
  closingReviewClassificationLabel('MATCH'),
  closingReviewClassificationLabel('LIKELY_TRANSFER'),
  closingReviewClassificationLabel('LIKELY_CONTAMINATION'),
  closingReviewClassificationExplanation('LIKELY_TRANSFER'),
  closingReviewClassificationExplanation('LIKELY_CONTAMINATION'),
].join(' ');

assert.equal(/contamina/i.test(userFacing), false);
assert.equal(/cache/i.test(userFacing), false);
assert.equal(/snapshot/i.test(userFacing), false);

console.log('closing-review-ui.rules.spec.ts OK');
