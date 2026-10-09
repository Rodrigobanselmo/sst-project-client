export type CharacterizationHierarchyLinkRecord = {
  id?: number | null;
  hierarchyId?: string | null;
  endDate?: Date | string | null;
  deletedAt?: Date | string | null;
  workspaceId?: string | null;
};

export type CharacterizationHierarchyWithLinks = {
  id?: string | number | null;
  hierarchyOnHomogeneous?: CharacterizationHierarchyLinkRecord[] | null;
};

export class CharacterizationHierarchyUnlinkError extends Error {
  constructor() {
    super('unlink-failed');
    this.name = 'CharacterizationHierarchyUnlinkError';
  }
}

export class CharacterizationHierarchyUpsertError extends Error {
  constructor(cause?: unknown) {
    super('upsert-failed');
    this.name = 'CharacterizationHierarchyUpsertError';
    this.cause = cause;
  }
}

const bareHierarchyId = (id: string | number | null | undefined) =>
  String(id || '')
    .split('//')[0]
    .trim();

/**
 * Vínculos explícitos ativos deste elemento e deste estabelecimento que
 * deixaram de constar na seleção confirmada. Não cria vínculo de cargo
 * abrangido por uma estrutura superior.
 */
export function collectCharacterizationLinkIdsToEnd(params: {
  hierarchies: CharacterizationHierarchyWithLinks[];
  confirmedHierarchyIds: string[];
  workspaceId?: string;
}): number[] {
  const confirmed = new Set(
    params.confirmedHierarchyIds.map(bareHierarchyId).filter(Boolean),
  );
  const linkIds: number[] = [];
  const seen = new Set<number>();

  params.hierarchies.forEach((hierarchy) => {
    const fallbackHierarchyId = bareHierarchyId(hierarchy.id);
    (hierarchy.hierarchyOnHomogeneous || []).forEach((link) => {
      if (!link || link.endDate || link.deletedAt) return;
      if (
        params.workspaceId &&
        link.workspaceId &&
        link.workspaceId !== params.workspaceId
      ) {
        return;
      }

      const hierarchyId =
        bareHierarchyId(link.hierarchyId) || fallbackHierarchyId;
      if (!hierarchyId || confirmed.has(hierarchyId)) return;

      const linkId = Number(link.id);
      if (!Number.isFinite(linkId) || seen.has(linkId)) return;
      seen.add(linkId);
      linkIds.push(linkId);
    });
  });

  return linkIds;
}

/**
 * Encerra os vínculos omitidos e só então grava a seleção.
 * Falha na exclusão impede o upsert. Falha no upsert, depois de uma
 * exclusão bem-sucedida, pede atualização dos dados já alterados.
 */
export async function commitCharacterizationHierarchySelection(params: {
  hierarchies: CharacterizationHierarchyWithLinks[];
  confirmedHierarchyIds: string[];
  workspaceId?: string;
  unlink: (linkIds: number[]) => Promise<unknown>;
  upsert: () => Promise<unknown>;
  refreshAfterPartialFailure?: () => Promise<unknown>;
}): Promise<void> {
  const linkIds = collectCharacterizationLinkIdsToEnd(params);

  if (linkIds.length) {
    let unlinked: unknown;
    try {
      unlinked = await params.unlink(linkIds);
    } catch {
      throw new CharacterizationHierarchyUnlinkError();
    }
    if (unlinked == null) {
      throw new CharacterizationHierarchyUnlinkError();
    }
  }

  try {
    await params.upsert();
  } catch (error) {
    if (linkIds.length) {
      await params.refreshAfterPartialFailure?.();
    }
    throw new CharacterizationHierarchyUpsertError(error);
  }
}
