import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { IErrorResp } from '@v2/types/error.type';
import { extractApiError } from '@v2/utils/extract-api-error';
import type { ClosingConsistencyClassification } from '@v2/services/forms/form-application/closing-precheck/service/closing-precheck.types';

export const LEGACY_CLOSING_REVIEW_MESSAGE =
  'Esta campanha foi concluída antes da implantação da revisão de consistência no encerramento. A revisão retrospectiva não está disponível para este formulário.';

export const REVIEW_NEEDED_LABEL = 'Divergência de lotação — requer revisão';
export const CONFIRMED_LEGITIMATE_LABEL =
  'Divergência revisada — confirmada como legítima';
export const TRANSFER_LABEL = 'Movimentação identificada';
export const CONSISTENT_LABEL = 'Consistente';

export const TRANSFER_EXPLANATION =
  'O empregado estava neste setor quando respondeu e possui movimentação de lotação posterior.';

export const REVIEW_NEEDED_EXPLANATION =
  'O setor registrado nesta resposta difere da lotação identificada para o empregado na data do preenchimento. Confira antes de concluir a campanha.';

export const CONFIRMED_LEGITIMATE_EXPLANATION =
  'Esta divergência foi revisada e confirmada como legítima. Não requer nova ação enquanto a comparação de lotação permanecer a mesma.';

export type ClosingReviewVisualKind =
  | 'consistent'
  | 'transfer'
  | 'review'
  | 'confirmed_legitimate'
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

export function isClosingDivergenceConfirmedLegitimate(
  resolutionStatus?: string | null,
): boolean {
  return resolutionStatus === 'CONFIRMED_LEGITIMATE';
}

export function closingReviewVisualKind(
  classification: ClosingConsistencyClassification | string,
  resolutionStatus?: string | null,
): ClosingReviewVisualKind {
  if (isClosingDivergenceConfirmedLegitimate(resolutionStatus)) {
    return 'confirmed_legitimate';
  }
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
  resolutionStatus?: string | null,
): string {
  switch (closingReviewVisualKind(classification, resolutionStatus)) {
    case 'consistent':
      return CONSISTENT_LABEL;
    case 'transfer':
      return TRANSFER_LABEL;
    case 'review':
      return REVIEW_NEEDED_LABEL;
    case 'confirmed_legitimate':
      return CONFIRMED_LEGITIMATE_LABEL;
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
  resolutionStatus?: string | null,
): string | null {
  const kind = closingReviewVisualKind(classification, resolutionStatus);
  if (kind === 'transfer') return TRANSFER_EXPLANATION;
  if (kind === 'review') return REVIEW_NEEDED_EXPLANATION;
  if (kind === 'confirmed_legitimate') return CONFIRMED_LEGITIMATE_EXPLANATION;
  return null;
}

export function closingReviewClassificationColor(
  classification: ClosingConsistencyClassification | string,
  resolutionStatus?: string | null,
): string {
  switch (closingReviewVisualKind(classification, resolutionStatus)) {
    case 'review':
      return 'error.main';
    case 'transfer':
      return 'info.main';
    case 'consistent':
    case 'confirmed_legitimate':
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

const CLOSING_RESOLUTION_SKIP_LABELS: Record<string, string> = {
  STALE_VALUE: 'o valor gravado mudou',
  STALE_REFERENCE: 'a referência de lotação mudou',
  STALE_CLASSIFICATION: 'a classificação mudou',
  NOT_ELIGIBLE: 'item não elegível neste momento',
  MISSING_REFERENCE: 'sem setor de referência',
  MISSING_ANSWER: 'resposta não encontrada',
  WRONG_APPLICATION: 'item fora do escopo desta campanha',
  DUPLICATE_ITEM: 'item duplicado no lote',
};

export const CLOSING_RESOLUTION_RELOAD_HINT =
  'Atualize ou reabra a auditoria e tente novamente.';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function extractClosingResolutionErrorData(error: unknown): Record<string, unknown> | null {
  const root = asRecord(error);
  if (!root) return null;
  const response = asRecord(root.response);
  const data = asRecord(response?.data) ?? asRecord(root.data);
  return data;
}

function stringifyUnknownMessage(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .join(' ');
  }
  return '';
}

export function closingResolutionErrorMessage(error: unknown): string {
  const data = extractClosingResolutionErrorData(error);
  const skipped = Array.isArray(data?.skipped) ? data.skipped : [];
  const applied = data?.applied;
  const uniqueReasons = [
    ...new Set(
      skipped
        .map((row) => (asRecord(row)?.reason as string | undefined) ?? '')
        .filter(Boolean),
    ),
  ];
  const stale = uniqueReasons.some((reason) => reason.startsWith('STALE'));
  const labels = uniqueReasons.map(
    (reason) => CLOSING_RESOLUTION_SKIP_LABELS[reason] || reason,
  );

  const parts: string[] = [];
  const extracted =
    stringifyUnknownMessage(data?.message) ||
    (error && typeof error === 'object'
      ? stringifyUnknownMessage(extractApiError(error as IErrorResp))
      : '');
  parts.push(
    extracted ||
      'Não foi possível aplicar o lote. Nenhuma alteração foi feita.',
  );

  if (applied === 0 || skipped.length > 0) {
    if (skipped.length > 0) {
      parts.push(
        `Nenhum item foi alterado (${skipped.length} inconsistência${
          skipped.length === 1 ? '' : 's'
        }).`,
      );
      if (labels.length) {
        parts.push(`Motivo: ${labels.join('; ')}.`);
      }
    }
    parts.push(CLOSING_RESOLUTION_RELOAD_HINT);
  }

  if (stale && !parts.includes(CLOSING_RESOLUTION_RELOAD_HINT)) {
    parts.push(CLOSING_RESOLUTION_RELOAD_HINT);
  }

  return parts.filter(Boolean).join(' ');
}

export type ClosingResolutionSelectionEmployee = {
  employeeId: number;
  name: string;
  formAnswerId?: string | null;
  submissionId?: string | null;
  snapshotSectorId?: string | null;
  coveringSectorId?: string | null;
  referenceSectorId?: string | null;
  classification: ClosingConsistencyClassification | string;
  resolutionStatus?: string | null;
  canCorrect?: boolean;
  canConfirmLegitimate?: boolean;
};

export type ClosingResolutionBatchAction = 'CORRECT' | 'CONFIRM_LEGITIMATE';

export function closingReviewEmployeeKey(
  employee: Pick<ClosingResolutionSelectionEmployee, 'formAnswerId' | 'employeeId'>,
): string {
  return employee.formAnswerId || `employee:${employee.employeeId}`;
}

export function canSelectClosingReviewEmployee(
  employee: ClosingResolutionSelectionEmployee,
): boolean {
  return isPendingCorrectableClosingEmployee(employee);
}

export function isPendingCorrectableClosingEmployee(
  employee: ClosingResolutionSelectionEmployee,
): boolean {
  if (isClosingDivergenceConfirmedLegitimate(employee.resolutionStatus)) {
    return false;
  }
  if (
    employee.classification === 'MATCH' ||
    employee.classification === 'NO_RESPONSE' ||
    employee.classification === 'LIKELY_TRANSFER'
  ) {
    return false;
  }
  return employee.canCorrect === true;
}

export function closingReviewCorrectablePendingKeys(
  employees: ClosingResolutionSelectionEmployee[],
): string[] {
  return employees
    .filter(isPendingCorrectableClosingEmployee)
    .map(closingReviewEmployeeKey);
}

export function closingResolutionExclusionReason(
  employee: ClosingResolutionSelectionEmployee,
  action: ClosingResolutionBatchAction,
): string {
  if (action === 'CORRECT') {
    if (employee.classification === 'INCONCLUSIVE') {
      return 'Sem setor válido na data da resposta — correção automática indisponível.';
    }
    if (employee.classification === 'UNRESOLVED_SECTOR') {
      return 'Setor gravado não identificado — correção automática indisponível.';
    }
    if (!employee.coveringSectorId) {
      return 'Sem setor válido na data da resposta — a correção não usa o setor atual.';
    }
    if (!employee.canCorrect) {
      return 'Este vínculo não é elegível para correção automática.';
    }
  }
  if (!employee.canConfirmLegitimate) {
    return 'Não há referência confiável para confirmar esta divergência.';
  }
  return 'Ação indisponível para este item.';
}

export function partitionClosingResolutionSelection(params: {
  employees: ClosingResolutionSelectionEmployee[];
  selectedKeys: string[];
  action: ClosingResolutionBatchAction;
}) {
  const selected = params.employees.filter((employee) =>
    params.selectedKeys.includes(closingReviewEmployeeKey(employee)),
  );
  const eligible = selected.filter((employee) =>
    params.action === 'CORRECT' ? employee.canCorrect : employee.canConfirmLegitimate,
  );
  const excluded = selected
    .filter((employee) => !eligible.includes(employee))
    .map((employee) => ({
      employeeId: employee.employeeId,
      name: employee.name,
      reason: closingResolutionExclusionReason(employee, params.action),
    }));

  return {
    selectedCount: selected.length,
    eligibleCount: eligible.length,
    excludedCount: excluded.length,
    eligible,
    excluded,
  };
}

export function buildClosingResolutionPayloadItem(
  employee: ClosingResolutionSelectionEmployee,
  action: ClosingResolutionBatchAction,
) {
  const reference =
    action === 'CORRECT' ? employee.coveringSectorId : employee.referenceSectorId;
  if (
    !employee.formAnswerId ||
    !employee.submissionId ||
    !employee.snapshotSectorId ||
    !reference
  ) {
    return null;
  }

  return {
    employeeId: employee.employeeId,
    submissionId: employee.submissionId,
    formAnswerId: employee.formAnswerId,
    expectedPreviousValue: employee.snapshotSectorId,
    expectedReferenceValue: reference,
    expectedClassification: employee.classification as ClosingConsistencyClassification,
  };
}

export function batchCorrectConfirmationCopy(params: {
  selectedCount: number;
  eligibleCount: number;
  excludedCount: number;
  excluded: Array<{ name: string; reason: string }>;
}): string[] {
  const lines = [
    `Selecionados: ${params.selectedCount}`,
    `Corrigíveis agora: ${params.eligibleCount}`,
    `Não corrigíveis neste lote: ${params.excludedCount}`,
  ];

  if (params.eligibleCount > 0) {
    lines.push(
      `${params.eligibleCount} vínculo${params.eligibleCount === 1 ? '' : 's'} de setor das respostas ${params.eligibleCount === 1 ? 'será atualizado' : 'serão atualizados'}.`,
      'Nenhuma resposta psicossocial será modificada.',
    );
  }

  if (params.excluded.length) {
    lines.push('Itens excluídos:');
    for (const item of params.excluded) {
      lines.push(`• ${item.name}: ${item.reason}`);
    }
  }

  return lines;
}

export function batchConfirmLegitimateCopy(params: {
  selectedCount: number;
  eligibleCount: number;
  excludedCount: number;
  excluded: Array<{ name: string; reason: string }>;
}): string[] {
  const lines = [
    `Selecionados: ${params.selectedCount}`,
    `Confirmáveis agora: ${params.eligibleCount}`,
    `Não confirmáveis neste lote: ${params.excludedCount}`,
  ];
  if (params.eligibleCount > 0) {
    lines.push(
      `${params.eligibleCount} divergência${params.eligibleCount === 1 ? '' : 's'} ${params.eligibleCount === 1 ? 'será confirmada' : 'serão confirmadas'} como legítima${params.eligibleCount === 1 ? '' : 's'}.`,
      'Nenhum vínculo de setor será alterado nesta ação.',
    );
  }
  if (params.excluded.length) {
    lines.push('Itens excluídos:');
    for (const item of params.excluded) {
      lines.push(`• ${item.name}: ${item.reason}`);
    }
  }
  return lines;
}
