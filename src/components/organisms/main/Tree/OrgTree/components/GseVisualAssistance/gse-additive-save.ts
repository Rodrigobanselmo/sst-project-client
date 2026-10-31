import type { ApprovedGseAdditionSummary } from './gse-approved-additions';
import type { IntegratedReview } from './gse-integrated-review.model';
export type SaveCommand =
  | {
      kind: 'CREATE_GSE';
      temporaryId: string;
      name: string;
      description: string;
      workspaceIds: string[];
    }
  | {
      kind: 'ADD_LINK';
      group:
        | { kind: 'EXISTING'; id: string }
        | { kind: 'TEMPORARY'; temporaryId: string };
      hierarchyId: string;
      requestedStartDate: null;
    };
export type SaveRequest = { idempotencyKey: string; commands: SaveCommand[] };
export type SaveResult = {
  contractVersion: 'GSE_ASSISTED_ADDITIVE_V1';
  receiptId: string;
  companyId: string;
  workspaceId: string;
  idempotencyKey: string;
  createdGroups: { temporaryId: string; id: string; name: string }[];
  links: {
    groupId: string;
    hierarchyId: string;
    linkId: number | null;
    outcome: 'ADDED' | 'COVERED';
  }[];
  createdCount: number;
  addedLinkCount: number;
  completedAt: string;
};
export const additiveRoute = (companyId: string, workspaceId: string) =>
  `v2/companies/${encodeURIComponent(companyId)}/workspaces/${encodeURIComponent(workspaceId)}/gse-changes/additive`;
export function approvedSaveRequest(
  summary: ApprovedGseAdditionSummary,
  workspaceId: string,
  idempotencyKey: string,
): SaveRequest {
  if (!summary.applicable) throw Error('Nenhuma operação aprovada aplicável.');
  const commands: SaveCommand[] = summary.newGroups.map((g) => ({
    kind: 'CREATE_GSE',
    temporaryId: g.groupId,
    name: g.name,
    description: g.description ?? '',
    workspaceIds: [workspaceId],
  }));
  for (const g of [...summary.newGroups, ...summary.existingGroups])
    for (const l of g.links)
      commands.push({
        kind: 'ADD_LINK',
        group: summary.newGroups.includes(g)
          ? { kind: 'TEMPORARY', temporaryId: g.groupId }
          : { kind: 'EXISTING', id: g.groupId },
        hierarchyId: l.hierarchyId,
        requestedStartDate: null,
      });
  if (commands.length > 100)
    throw Error(
      'A confirmação excede 100 operações. Reduza o lote de aprovações.',
    );
  return { idempotencyKey, commands };
}
/** Never clear decisions on an HTTP status alone: require a matching complete server receipt. */
export function assertSaveReceipt(
  value: unknown,
  request: SaveRequest,
  companyId: string,
  workspaceId: string,
): asserts value is SaveResult {
  const r = value as SaveResult;
  if (
    !r ||
    r.contractVersion !== 'GSE_ASSISTED_ADDITIVE_V1' ||
    !r.receiptId ||
    r.companyId !== companyId ||
    r.workspaceId !== workspaceId ||
    r.idempotencyKey !== request.idempotencyKey ||
    !Array.isArray(r.createdGroups) ||
    !Array.isArray(r.links) ||
    r.createdCount !== r.createdGroups.length ||
    r.addedLinkCount !== r.links.filter((l) => l.outcome === 'ADDED').length
  )
    throw Error(
      'A API não confirmou um recibo válido. Repita a confirmação para recuperar o resultado.',
    );
  const creates = request.commands.filter(
    (c): c is Extract<SaveCommand, { kind: 'CREATE_GSE' }> =>
      c.kind === 'CREATE_GSE',
  );
  if (
    creates.length !== r.createdGroups.length ||
    creates.some(
      (c) =>
        !r.createdGroups.some(
          (g) => g.temporaryId === c.temporaryId && g.id && g.name === c.name,
        ),
    )
  )
    throw Error('Recibo incompleto. Repita a confirmação.');
  const adds = request.commands.filter(
    (c): c is Extract<SaveCommand, { kind: 'ADD_LINK' }> =>
      c.kind === 'ADD_LINK',
  );
  if (
    adds.length !== r.links.length ||
    adds.some((c) => {
      const id =
        c.group.kind === 'EXISTING'
          ? c.group.id
          : r.createdGroups.find(
              (g) =>
                g.temporaryId ===
                (c.group as { temporaryId: string }).temporaryId,
            )?.id;
      return !r.links.some(
        (l) =>
          l.groupId === id &&
          l.hierarchyId === c.hierarchyId &&
          ['ADDED', 'COVERED'].includes(l.outcome),
      );
    })
  )
    throw Error('Recibo de vínculos incompleto. Repita a confirmação.');
}
export function reconcileSavedReview(
  review: IntegratedReview,
  request: SaveRequest,
  result: SaveResult,
): IntegratedReview {
  const mapping = new Map(
    result.createdGroups.map((g) => [g.temporaryId, g.id]),
  );
  const fulfilled = new Set(
    request.commands
      .filter(
        (c): c is Extract<SaveCommand, { kind: 'ADD_LINK' }> =>
          c.kind === 'ADD_LINK',
      )
      .map((c) =>
        JSON.stringify([
          c.group.kind === 'EXISTING' ? c.group.id : c.group.temporaryId,
          c.hierarchyId,
        ]),
      ),
  );
  return {
    newGroups: review.newGroups.filter((g) => !mapping.has(g.id)),
    changes: review.changes
      .filter(
        (c) =>
          !fulfilled.has(JSON.stringify([c.groupId, c.nodeId.split('//')[0]])),
      )
      .map((c) => {
        const groupId = mapping.get(c.groupId) || c.groupId;
        return { ...c, groupId, id: JSON.stringify([groupId, c.nodeId]) };
      }),
  };
}
