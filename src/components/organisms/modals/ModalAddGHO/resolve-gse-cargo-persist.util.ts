/**
 * Decide o PATCH de cargos do GSE.
 * [] só sai daqui quando a linha de base já foi hidratada e o usuário
 * alterou a composição até esvaziar. Data/vigência reutiliza a composição
 * da linha de base e nunca a troca por [].
 */

export type GseCargoBaseline = {
  gseId: string;
  ids: string[];
};

export function sameModalIdSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const a = [...left].sort();
  const b = [...right].sort();
  return a.every((id, index) => id === b[index]);
}

/**
 * Null enquanto o GET não terminou ou o GSE retornado não é o aberto.
 * Array vazio só entra quando o GET desse GSE já trouxe zero vínculos.
 */
export function nextGseCargoBaseline(params: {
  openGseId: string;
  querySettled: boolean;
  queryGseId?: string;
  loadedIds: string[] | null;
}): GseCargoBaseline | null {
  if (!params.openGseId) return null;
  if (!params.querySettled) return null;
  if (!params.queryGseId || params.queryGseId !== params.openGseId) return null;
  if (params.loadedIds === null) return null;
  return { gseId: params.openGseId, ids: params.loadedIds };
}

export type GseCargoPersistDecision =
  | { action: 'block' }
  | {
      action: 'patch';
      hierarchyModalIds: string[];
      compositionChanged: boolean;
      startDate?: Date | string | null;
      endDate?: Date | string | null;
    };

export function resolveGseCargoPersist(params: {
  hydrated: boolean;
  baselineGseId: string | null;
  openGseId: string;
  baselineIds: string[] | null;
  finalIds: string[];
  selectionTouched: boolean;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}): GseCargoPersistDecision {
  const ready =
    params.hydrated &&
    params.baselineIds !== null &&
    !!params.openGseId &&
    params.baselineGseId === params.openGseId;

  if (!ready || params.baselineIds === null) return { action: 'block' };

  const baselineIds = params.baselineIds;
  const compositionChanged =
    params.selectionTouched && !sameModalIdSet(params.finalIds, baselineIds);

  return {
    action: 'patch',
    hierarchyModalIds: compositionChanged ? params.finalIds : baselineIds,
    compositionChanged,
    startDate: params.startDate,
    endDate: params.endDate,
  };
}
