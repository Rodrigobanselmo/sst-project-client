import type {
  InventoryPgrImportReview,
  InventoryPreviewIssue,
  InventoryReviewRoleDecision,
  InventoryRolePreview,
} from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';

export const INVENTORY_PGR_IMPORT_STALE_CODE = 'INVENTORY_PGR_IMPORT_STALE';

export const INVENTORY_PGR_IMPORT_STALE_MESSAGE =
  'A estrutura da empresa mudou desde a revisão. Recalcule o plano antes de importar.';

export function inventoryAcknowledgedIssueTypes(
  issues: readonly Pick<InventoryPreviewIssue, 'type'>[],
  acknowledgedRows: ReadonlySet<number>,
): string[] {
  const pendingTypes = new Set(
    issues.filter((_, index) => !acknowledgedRows.has(index)).map(({ type }) => type),
  );
  return [...new Set(issues.map(({ type }) => type))].filter(
    (type) => !pendingTypes.has(type),
  );
}

export function inventoryTruncationReview(
  issue: Pick<InventoryPreviewIssue, 'type' | 'message'>,
  roles: readonly InventoryRolePreview[],
  decisions: readonly InventoryReviewRoleDecision[],
) {
  if (issue.type !== 'POSSIBLE_TEXT_TRUNCATION') return null;
  const sourceName = /^O trecho extraído "(.+)" pode estar fragmentado\./.exec(
    issue.message,
  )?.[1];
  if (!sourceName) return null;

  const decisionsByKey = new Map(decisions.map((decision) => [decision.key, decision]));
  const affected = roles.filter(
    (role) => role.sourceName === sourceName && decisionsByKey.get(role.key)?.included !== false,
  );
  if (!affected.length) return null;

  const corrections: string[] = [];
  const pending: InventoryRolePreview[] = [];
  for (const role of affected) {
    const decision = decisionsByKey.get(role.key);
    const appliedName = decision?.appliedName?.trim() || '';
    // Use the same name comparison as the API review.
    const normalized = appliedName.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toUpperCase()
      .trim();

    if (normalized && normalized !== role.normalizedName &&
        !decision?.resolvedMatchId && role.matchStatus !== 'EXACT_MATCH') {
      corrections.push(appliedName);
    } else {
      pending.push(role);
    }
  }

  return { sourceName, correctedNames: [...new Set(corrections)], pending };
}

export function canApplyInventoryImportPlan(input: {
  review: InventoryPgrImportReview | null;
  reviewSynced: boolean;
  reviewPending: boolean;
  applyPending: boolean;
  softAcknowledged: boolean;
}): boolean {
  if (!input.review || !input.reviewSynced) return false;
  if (input.reviewPending || input.applyPending) return false;
  if (!input.softAcknowledged) return false;
  if (!input.review.readyForFutureApply) return false;
  if (input.review.blockers.some((blocker) => blocker.hard)) return false;
  return true;
}

export function inventoryImportApplyHint(input: {
  review: InventoryPgrImportReview | null;
  reviewSynced: boolean;
  reviewPending: boolean;
  applyPending: boolean;
  canApply: boolean;
}): string {
  if (input.applyPending) return 'Importando… aguarde a resposta da API.';
  if (input.reviewPending || !input.reviewSynced) {
    return 'Recalculando o plano… a importação só habilita com a revisão atualizada.';
  }
  if (!input.review) return 'Recalculando o plano…';
  if (input.review.summary.pendingBlockers > 0) {
    const pending = input.review.summary.pendingBlockers;
    return `Resolva ${pending} pendência${pending === 1 ? '' : 's'} para importar`;
  }
  if (input.canApply) {
    return 'Plano pronto. A importação gravará somente o que a API confirmar.';
  }
  return 'O plano ainda não está pronto para importar.';
}

function readErrorPayload(error: unknown): {
  code?: string;
  message?: string;
} {
  const data = (error as { response?: { data?: { code?: string; message?: unknown } } })
    ?.response?.data;
  const message = Array.isArray(data?.message)
    ? data.message[0]
    : data?.message;
  return {
    code: data?.code,
    message: typeof message === 'string' ? message : undefined,
  };
}

export function isInventoryPgrImportStaleError(error: unknown): boolean {
  const payload = readErrorPayload(error);
  if (payload.code === INVENTORY_PGR_IMPORT_STALE_CODE) return true;
  const message = `${payload.message || ''} ${(error as Error)?.message || ''}`;
  return /INVENTORY_PGR_IMPORT_STALE|estrutura da empresa mudou|fingerprint/i.test(
    message,
  );
}

export function inventoryImportApplyErrorMessage(error: unknown): string {
  if (isInventoryPgrImportStaleError(error)) {
    return INVENTORY_PGR_IMPORT_STALE_MESSAGE;
  }
  const payload = readErrorPayload(error);
  if (payload.message) return payload.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Não foi possível importar. Nenhuma alteração foi confirmada pela API.';
}

export function scrollInventoryImportFlowIntoView(
  element: { scrollIntoView: (options?: ScrollIntoViewOptions) => void } | null,
) {
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
