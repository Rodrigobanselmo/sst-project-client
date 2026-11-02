export type CharacterizationHierarchyLinkRecord = {
  id?: number | null;
  hierarchyId?: string | null;
  homogeneousGroupId?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  deletedAt?: Date | string | null;
  workspaceId?: string | null;
};

export type CharacterizationHierarchyWithLinks = {
  id?: string | number | null;
  hierarchyOnHomogeneous?: CharacterizationHierarchyLinkRecord[] | null;
};

export type CharacterizationHierarchySelection = {
  hierarchyIds: string[];
  expectedLinks: {
    id: number;
    hierarchyId: string;
    startDate: string | null;
    endDate: string | null;
  }[];
  startDate?: string | null;
  endDate?: string | null;
};

const bareHierarchyId = (id: string | number | null | undefined) =>
  String(id || '')
    .split('//')[0]
    .trim();

export class CharacterizationHierarchySnapshotError extends Error {}

const isoDate = (date: Date | string | null | undefined) => {
  if (date == null || date === '') return null;
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime()))
    throw new CharacterizationHierarchySnapshotError(
      'A data do vínculo é inválida. Atualize os dados antes de salvar.',
    );
  return parsed.toISOString();
};

/** Snapshot dos vínculos explícitos abertos, nunca dos cargos apenas abrangidos. */
export function buildCharacterizationHierarchySelection(params: {
  hierarchies: CharacterizationHierarchyWithLinks[];
  confirmedHierarchyIds: string[];
  workspaceId: string;
  characterizationId: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}): CharacterizationHierarchySelection {
  const expected = new Map<
    number,
    CharacterizationHierarchySelection['expectedLinks'][number]
  >();
  for (const hierarchy of params.hierarchies) {
    for (const link of hierarchy.hierarchyOnHomogeneous || []) {
      if (!link || link.endDate || link.deletedAt) continue;
      // O elemento possui um estabelecimento. Mesmo um vínculo legado cujo
      // cargo mudou de estabelecimento faz parte da comparação completa.
      if (
        link.homogeneousGroupId &&
        link.homogeneousGroupId !== params.characterizationId
      )
        continue;
      const hierarchyId =
        bareHierarchyId(link.hierarchyId) || bareHierarchyId(hierarchy.id);
      const id = Number(link.id);
      if (!hierarchyId || !Number.isSafeInteger(id) || id <= 0)
        throw new CharacterizationHierarchySnapshotError(
          'Os vínculos não estão completos. Atualize os dados antes de salvar.',
        );
      expected.set(id, {
        id,
        hierarchyId,
        startDate: isoDate(link.startDate),
        endDate: null,
      });
    }
  }
  return {
    hierarchyIds: [
      ...new Set(
        params.confirmedHierarchyIds.map(bareHierarchyId).filter(Boolean),
      ),
    ],
    expectedLinks: [...expected.values()].sort((a, b) => a.id - b.id),
    ...(params.startDate !== undefined && {
      startDate: isoDate(params.startDate),
    }),
    ...(params.endDate !== undefined && { endDate: isoDate(params.endDate) }),
  };
}

/** Uma transação no servidor aplica retiradas e inclusões; falhas preservam a seleção local. */
export function commitCharacterizationHierarchySelection<T>(params: {
  selection: CharacterizationHierarchySelection;
  persist: (selection: CharacterizationHierarchySelection) => Promise<T>;
}): Promise<T> {
  return params.persist(params.selection);
}
