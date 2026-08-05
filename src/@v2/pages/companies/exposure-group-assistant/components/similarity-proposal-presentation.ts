import type {
  SimilarityCandidate,
  SimilarityProposalMode,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';

const ROLE_NAME_HINT =
  /\b(sem cargo|funcao|função|auxiliar|assistente|tecnico|técnico|agente|auditor|motorista|secretario|secretário|coordenador|analista|operador|fiscal)\b/i;

/**
 * Presentation-only: never return a UUID to the UI.
 */
export function formatRiskDisplayName(
  riskId: string,
  labels: Map<string, { name: string; code?: string | null }>,
): string {
  const hit = labels.get(riskId);
  if (!hit?.name?.trim()) return 'Fator de risco (nome indisponível)';
  const code = hit.code?.trim();
  if (code) return `${hit.name.trim()} (${code})`;
  return hit.name.trim();
}

export function looksLikeRoleName(name: string | null | undefined): boolean {
  if (!name?.trim()) return false;
  return ROLE_NAME_HINT.test(name) || /SEM CARGO/i.test(name);
}

/**
 * Infer common role labels from already-returned candidate fields (no API change).
 * Prefers LCA when it looks like an OFFICE/função name and differs from the intermediate unit.
 */
export function inferProposalMode(c: SimilarityCandidate): SimilarityProposalMode {
  if (c.proposalMode) return c.proposalMode;
  return c.elementCount === 1 ? 'SINGLETON' : 'CONSOLIDATED';
}

export function resolveProposalDisplayName(c: SimilarityCandidate): string {
  return (
    c.draft?.suggestedName?.trim() ||
    c.suggestedName?.trim() ||
    c.provisionalName
  );
}

export const GSE_DRAFT_CLASSIFICATION_LABEL: Record<
  import('@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types').GseDraftClassification,
  string
> = {
  STRUCTURAL: 'Estrutural',
  ADMINISTRATIVE: 'Administrativo',
  OPERATIONAL: 'Operacional',
  TRANSVERSAL: 'Transversal',
  EQUIPMENT: 'Equipamentos',
  FUNCTIONAL: 'Funcional',
  MIXED: 'Misto',
};

export function resolveProposalRoleLabels(c: SimilarityCandidate): string[] {
  const fromApi = c.commonRoleNames?.map((r) => r.trim()).filter(Boolean) ?? [];
  if (fromApi.length) return fromApi;
  return resolveCommonRoleLabels(c);
}

export function truncateText(
  text: string | undefined,
  maxLength: number,
): string | null {
  if (!text?.trim()) return null;
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export function resolveProposalJustificationPreview(
  c: SimilarityCandidate,
  maxLength = 120,
): string | null {
  const summary = truncateText(c.justificationSummary, maxLength);
  if (summary) return summary;
  return truncateText(c.technicalJustification, maxLength);
}

export function candidateListKey(c: SimilarityCandidate): string {
  return c.participants
    .map((p) => p.elementId)
    .sort()
    .join('|');
}

export const PROPOSAL_MODE_LABEL: Record<SimilarityProposalMode, string> = {
  SINGLETON: 'Unitária',
  CONSOLIDATED: 'Consolidada',
};

export function resolveCommonRoleLabels(c: SimilarityCandidate): string[] {
  const unit = c.intermediateUnitName?.trim() ?? null;
  const ancestor = c.commonAncestorName?.trim() ?? null;
  if (!ancestor) return [];

  const isUnitAcronym =
    Boolean(unit) && ancestor.toLowerCase() === unit!.toLowerCase();
  if (isUnitAcronym) return [];

  if (looksLikeRoleName(ancestor)) return [ancestor];

  // LCA is often the OFFICE node even without keyword hints (long descriptive title).
  if (
    unit &&
    ancestor !== unit &&
    ancestor.length >= 10 &&
    !/^(SAT|SAF|AGE|GAB|DG|SGF)$/i.test(ancestor)
  ) {
    return [ancestor];
  }

  return [];
}

export function buildProposalWhySummary(c: SimilarityCandidate): string[] {
  const lines: string[] = [];
  lines.push(
    `${c.elementCount} elemento${c.elementCount === 1 ? '' : 's'}`,
  );

  const roles = resolveCommonRoleLabels(c);
  if (roles.length === 1) {
    lines.push(`Cargo comum: ${roles[0]}`);
  } else if (roles.length > 1) {
    lines.push(`${roles.length} cargos em comum`);
  }

  if (c.employeeCoverage?.summaryLabel) {
    lines.push(c.employeeCoverage.summaryLabel);
  } else if (c.coveredEmployeeCountUnion > 0) {
    lines.push(
      `${c.coveredEmployeeCountUnion} empregado${
        c.coveredEmployeeCountUnion === 1 ? '' : 's'
      } alcançado${c.coveredEmployeeCountUnion === 1 ? '' : 's'}`,
    );
  }

  const riskOrigins = new Set(
    c.participants.map((p) => p.riskSourceType ?? 'UNAVAILABLE'),
  );
  if (
    c.commonRiskIds.length > 0 &&
    (c.riskScore == null || c.riskScore >= 95)
  ) {
    lines.push('Mesmo conjunto de riscos');
  } else if (c.commonRiskIds.length > 0) {
    lines.push(`${c.commonRiskIds.length} risco(s) em comum`);
  }

  if (
    riskOrigins.size === 1 &&
    riskOrigins.has('REPRESENTATIVE_ANCESTOR')
  ) {
    const src = c.participants.find((p) => p.representativeSourceName)
      ?.representativeSourceName;
    lines.push(
      src
        ? `Mesmo ancestral representativo (${src})`
        : 'Mesmo ancestral representativo',
    );
  } else if (riskOrigins.size === 1 && riskOrigins.has('OWN')) {
    lines.push('Riscos próprios nos elementos');
  }

  if (c.intermediateUnitName) {
    lines.push(`Mesma unidade: ${c.intermediateUnitName}`);
  } else if (c.commonAncestorName && !roles.includes(c.commonAncestorName)) {
    lines.push(`Estrutura comum: ${c.commonAncestorName}`);
  }

  if (c.structuralScore >= 70) {
    lines.push('Estrutura organizacional equivalente');
  }

  return lines;
}

export function participantNameById(c: SimilarityCandidate): Map<string, string> {
  return new Map(c.participants.map((p) => [p.elementId, p.name]));
}
