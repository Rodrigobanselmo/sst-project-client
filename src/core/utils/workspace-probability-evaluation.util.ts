export type WorkspaceProbabilityAuthority = 'SHARED' | 'WORKSPACE';
export type WorkspaceProbabilityOrigin = 'ESTIMATE' | 'MANUAL' | 'PROMOTION';

export type WorkspaceProbabilityCriteria = {
  employeeCountTotal?: number | null;
  employeeCountGho?: number | null;
  minDurationJT?: number | null;
  minDurationEO?: number | null;
  chancesOfHappening?: number | null;
  frequency?: number | null;
  history?: number | null;
  medsImplemented?: number | null;
};

export type WorkspaceProbabilityControlLists<T = { id?: string | null }> = {
  adms?: T[] | null;
  engs?: T[] | null;
  epis?: T[] | null;
};

const MISSING_HEADER =
  'Selecione o estabelecimento no cabeçalho para gravar a probabilidade deste GSE.';

export function touchesWorkspaceProbability(values: {
  probability?: number | null;
  probabilityAfter?: number | null;
  probabilityCriteria?: unknown;
}): boolean {
  return (
    values.probability != null ||
    values.probabilityAfter != null ||
    values.probabilityCriteria != null
  );
}

/**
 * Gravação de probabilidade de GSE qualitativo usa só o estabelecimento do cabeçalho.
 * Elemento caracterizado e quantitativo seguem o payload atual.
 */
export function prepareWorkspaceProbabilityWrite<T extends {
  probability?: number | null;
  probabilityAfter?: number | null;
  probabilityCriteria?: unknown;
  workspaceId?: string | null;
}>(params: {
  values: T;
  isQuantity?: boolean;
  originKind?: string | null;
  headerWorkspaceId?: string | null;
}): { ok: true; values: T } | { ok: false; message: string } {
  if (!touchesWorkspaceProbability(params.values)) {
    return { ok: true, values: params.values };
  }
  if (params.isQuantity || params.originKind === 'CHARACTERIZATION') {
    return { ok: true, values: params.values };
  }
  if (!params.headerWorkspaceId) {
    return { ok: false, message: MISSING_HEADER };
  }
  return {
    ok: true,
    values: { ...params.values, workspaceId: params.headerWorkspaceId },
  };
}

const MISSING_WORKSPACE_CONTROLS =
  'Os controles deste estabelecimento não estão disponíveis para a estimativa.';

/** Avaliação por estabelecimento: GSE e hierarquia. Elemento caracterizado fica de fora. */
const WORKSPACE_SCOPED_PROBABILITY_VIEWS = new Set(['GSE', 'SIMPLE_BY_GROUP']);

/**
 * A lista filtrada só é obrigatória no GSE/hierarquia qualitativo com estabelecimento.
 * Elemento caracterizado usa os controles do próprio fator, os mesmos exibidos na linha.
 */
export function requiresWorkspaceProbabilityControls(params: {
  isQuantity?: boolean | null;
  originKind?: string | null;
  viewDataType?: string | null;
  headerWorkspaceId?: string | null;
}): boolean {
  if (params.isQuantity) return false;
  if (params.originKind === 'CHARACTERIZATION') return false;
  if (!params.headerWorkspaceId) return false;
  if (params.viewDataType == null) return true;
  return WORKSPACE_SCOPED_PROBABILITY_VIEWS.has(params.viewDataType);
}

/**
 * Sem origem explícita, a tela de elemento caracterizado grava no fator.
 * GSE e hierarquia continuam exigindo o estabelecimento do cabeçalho.
 */
export function originKindForWorkspaceProbabilityWrite(params: {
  originKind?: string | null;
  viewDataType?: string | null;
}): string | null | undefined {
  if (params.originKind) return params.originKind;
  if (params.viewDataType == null) return params.originKind;
  if (WORKSPACE_SCOPED_PROBABILITY_VIEWS.has(params.viewDataType)) {
    return params.originKind;
  }
  return 'CHARACTERIZATION';
}

export type ProbabilityAssistantControls = {
  available: true;
  controls: {
    engs?: readonly unknown[] | null;
    adms?: readonly unknown[] | null;
    epis?: readonly unknown[] | null;
  };
} | {
  available: false;
  message: string;
};

/** Listas do assistente. GSE com estabelecimento não usa engs/adms completos. */
export function controlsForProbabilityAssistant(
  riskData?: {
    engs?: readonly unknown[] | null;
    adms?: readonly unknown[] | null;
    epis?: readonly unknown[] | null;
    controlsForWorkspaceProbabilityEstimate?: {
      adms?: readonly unknown[] | null;
      engs?: readonly unknown[] | null;
      epis?: readonly unknown[] | null;
    } | null;
  } | null,
  options?: { requireWorkspaceControls?: boolean },
): ProbabilityAssistantControls {
  const filtered = riskData?.controlsForWorkspaceProbabilityEstimate;
  if (filtered) {
    return {
      available: true,
      controls: {
        engs: filtered.engs ?? [],
        adms: filtered.adms ?? [],
        epis: filtered.epis ?? [],
      },
    };
  }
  if (options?.requireWorkspaceControls) {
    return { available: false, message: MISSING_WORKSPACE_CONTROLS };
  }
  return {
    available: true,
    controls: {
      engs: riskData?.engs,
      adms: riskData?.adms,
      epis: riskData?.epis,
    },
  };
}

export function workspaceProbabilityCaption(params: {
  authority?: WorkspaceProbabilityAuthority | null;
  origin?: WorkspaceProbabilityOrigin | null;
  isQuantity?: boolean;
}): string | null {
  if (params.isQuantity || !params.authority) return null;
  if (params.authority === 'SHARED') return 'Avaliação histórica compartilhada';
  if (params.origin === 'ESTIMATE') return 'Estimativa deste estabelecimento';
  if (params.origin === 'MANUAL') return 'Definida manualmente neste estabelecimento';
  if (params.origin === 'PROMOTION') {
    return 'Promovida pelo Plano de Ação neste estabelecimento';
  }
  return 'Avaliação deste estabelecimento';
}

export function workspaceProbabilityAssistantNote(params: {
  authority?: WorkspaceProbabilityAuthority | null;
  origin?: WorkspaceProbabilityOrigin | null;
  /** Sem estimativa anterior, não há critérios da última estimativa para citar. */
  hasAdoptedCriteria?: boolean;
}): string | null {
  const lastEstimate = params.hasAdoptedCriteria === false
    ? ''
    : ' Os critérios abaixo são da última estimativa.';
  if (params.origin === 'MANUAL') {
    return `A probabilidade vigente foi definida manualmente.${lastEstimate}`;
  }
  if (params.origin === 'PROMOTION') {
    return `A probabilidade vigente foi promovida pelo Plano de Ação.${lastEstimate}`;
  }
  if (params.authority === 'SHARED') {
    return 'O valor atual é a avaliação histórica compartilhada. A estimativa gravada vale só para este estabelecimento.';
  }
  if (params.authority === 'WORKSPACE' && params.origin === 'ESTIMATE') {
    return 'Critérios adotados na estimativa deste estabelecimento.';
  }
  return null;
}

/** Só a estimativa vigente do estabelecimento pode ser regravada pela sugestão de contagem. */
export function countSuggestionMayAutoSave(params: {
  authority?: WorkspaceProbabilityAuthority | null;
  origin?: WorkspaceProbabilityOrigin | null;
}): boolean {
  if (!params.authority) return true;
  return params.authority === 'WORKSPACE' && params.origin === 'ESTIMATE';
}

/**
 * A resposta da gravação não substitui residual, nível e controles já resolvidos
 * para o estabelecimento. A consulta seguinte traz a avaliação da API.
 */
export function mergeProbabilityWriteIntoRiskRow<T extends {
  probability?: number | null;
  probabilityAfter?: number | null;
  probabilityCriteria?: WorkspaceProbabilityCriteria | null;
  probabilityAuthority?: WorkspaceProbabilityAuthority | null;
  probabilityOrigin?: WorkspaceProbabilityOrigin | null;
  criteriaAdoptedAt?: string | Date | null;
  level?: number | null;
  ro?: string | null;
  controlsForWorkspaceProbabilityEstimate?: {
    adms?: readonly unknown[] | null;
    engs?: readonly unknown[] | null;
    epis?: readonly unknown[] | null;
  } | null;
}>(current: T, incoming: T, write?: {
  probability?: number | null;
  probabilityAfter?: number | null;
  probabilityCriteria?: unknown;
}): T {
  const residualOnly =
    write?.probability == null &&
    write?.probabilityCriteria == null &&
    write?.probabilityAfter != null;
  return {
    ...current,
    ...incoming,
    probability: residualOnly
      ? current.probability
      : incoming.probability ?? current.probability,
    probabilityAfter: residualOnly
      ? incoming.probabilityAfter ?? current.probabilityAfter
      : current.probabilityAfter,
    level: current.level,
    ro: current.ro,
    controlsForWorkspaceProbabilityEstimate:
      current.controlsForWorkspaceProbabilityEstimate,
    probabilityCriteria: residualOnly
      ? current.probabilityCriteria
      : incoming.probabilityOrigin === 'ESTIMATE' && incoming.probabilityCriteria != null
        ? incoming.probabilityCriteria
        : current.probabilityCriteria,
    criteriaAdoptedAt: residualOnly
      ? current.criteriaAdoptedAt
      : incoming.probabilityOrigin === 'ESTIMATE' && incoming.criteriaAdoptedAt != null
        ? incoming.criteriaAdoptedAt
        : current.criteriaAdoptedAt,
    probabilityAuthority: incoming.probabilityAuthority ?? current.probabilityAuthority,
    probabilityOrigin: residualOnly
      ? current.probabilityOrigin
      : incoming.probabilityOrigin ?? current.probabilityOrigin,
  } as T;
}
