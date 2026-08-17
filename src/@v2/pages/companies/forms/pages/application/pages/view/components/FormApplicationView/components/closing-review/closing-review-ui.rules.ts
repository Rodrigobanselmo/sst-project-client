import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { IErrorResp } from '@v2/types/error.type';
import { extractApiError } from '@v2/utils/extract-api-error';
import type { ClosingConsistencyClassification } from '@v2/services/forms/form-application/closing-precheck/service/closing-precheck.types';

export const LEGACY_CLOSING_REVIEW_MESSAGE =
  'Esta campanha foi concluída antes da implantação da revisão de consistência no encerramento. A revisão retrospectiva não está disponível para este formulário.';

export const REVIEW_NEEDED_LABEL = 'Divergência de lotação — requer revisão';
export const TRANSFER_LABEL = 'Movimentação identificada';
export const CONSISTENT_LABEL = 'Consistente';

export const TRANSFER_EXPLANATION =
  'O empregado estava neste setor quando respondeu e possui movimentação de lotação posterior.';

export const REVIEW_NEEDED_EXPLANATION =
  'O setor registrado nesta resposta difere da lotação identificada para o empregado na data do preenchimento. Confira antes de concluir a campanha.';

export type ClosingReviewVisualKind =
  | 'consistent'
  | 'transfer'
  | 'review'
  | 'no_response'
  | 'other';

export type ClosingReviewModalMode = 'closing' | 'audit';

export function shouldOpenClosingReview(params: {
  formType?: FormTypeEnum;
  nextStatus: FormApplicationStatusEnum;
}): boolean {
  return (
    params.formType === FormTypeEnum.PSYCHOSOCIAL &&
    params.nextStatus === FormApplicationStatusEnum.DONE
  );
}

export function canShowClosingAuditAction(params: {
  isMaster: boolean;
  formType?: FormTypeEnum;
}): boolean {
  return params.isMaster === true && params.formType === FormTypeEnum.PSYCHOSOCIAL;
}

export function closingReviewModalTitle(mode: ClosingReviewModalMode): string {
  return mode === 'audit'
    ? 'Auditoria de consistência da campanha'
    : 'Revisão para conclusão da campanha';
}

export function shouldShowContinueClosingAction(
  mode: ClosingReviewModalMode,
): boolean {
  return mode === 'closing';
}

export function closingReviewCloseButtonLabel(
  mode: ClosingReviewModalMode,
): string {
  return mode === 'audit' ? 'Fechar' : 'Voltar';
}

export function canContinueClosingReview(blockingTotal: number): boolean {
  return blockingTotal <= 0;
}

export function hasDivergenceAlert(count: number): boolean {
  return count > 0;
}

export function closingReviewVisualKind(
  classification: ClosingConsistencyClassification | string,
): ClosingReviewVisualKind {
  switch (classification) {
    case 'MATCH':
      return 'consistent';
    case 'LIKELY_TRANSFER':
      return 'transfer';
    case 'LIKELY_CONTAMINATION':
    case 'UNRESOLVED_SECTOR':
    case 'INCONCLUSIVE':
      return 'review';
    case 'NO_RESPONSE':
      return 'no_response';
    default:
      return 'other';
  }
}

export function closingReviewClassificationLabel(
  classification: ClosingConsistencyClassification | string,
): string {
  switch (closingReviewVisualKind(classification)) {
    case 'consistent':
      return CONSISTENT_LABEL;
    case 'transfer':
      return TRANSFER_LABEL;
    case 'review':
      return REVIEW_NEEDED_LABEL;
    case 'no_response':
      return 'Sem resposta';
    default:
      if (classification === 'OUT_OF_CURRENT_POPULATION') {
        return 'Fora da população atual';
      }
      return classification;
  }
}

export function closingReviewClassificationExplanation(
  classification: ClosingConsistencyClassification | string,
): string | null {
  const kind = closingReviewVisualKind(classification);
  if (kind === 'transfer') return TRANSFER_EXPLANATION;
  if (kind === 'review') return REVIEW_NEEDED_EXPLANATION;
  return null;
}

export function closingReviewClassificationColor(
  classification: ClosingConsistencyClassification | string,
): string {
  switch (closingReviewVisualKind(classification)) {
    case 'review':
      return 'error.main';
    case 'transfer':
      return 'info.main';
    case 'consistent':
      return 'success.main';
    default:
      return 'text.primary';
  }
}

export function closingPrecheckErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Não foi possível carregar o precheck. A conclusão não foi alterada.';
  }

  const message = extractApiError(error as IErrorResp);
  if (typeof message === 'string' && message.trim()) return message;

  return 'Não foi possível carregar o precheck. A conclusão não foi alterada.';
}
