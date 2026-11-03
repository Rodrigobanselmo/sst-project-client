import { validStructuringAlternatives, type StructuringAlternative } from './gse-structuring-alternatives';
import { api } from 'core/services/apiClient';
export type AiRoleRecommendation = {
  hierarchyId: string;
  conclusion: 'KEEP' | 'REVIEW' | 'REMOVE' | 'INCLUDE' | 'INSUFFICIENT';
  justification: string;
  evidence: string[];
  divergences: string[];
  recommendation: string;
  missingInformation: string[];
  questions: string[];
  currentGroups: { id: string; name: string }[];
  existingInTarget: boolean;
};
export type AiGseGroupAssessment = {
  characterization: string; exposureAssessment: string; preliminaryAssessment: string;
  compositionInconsistencies: string[];
  alternatives: { groupId: string; assessment: 'SUITABLE' | 'UNSUITABLE' | 'INSUFFICIENT'; reason: string; evidence: string[] }[];
  newGroupJustification: string | null;
};
export type AiPreliminaryGroup = {
  key: string; existingGroupId: string | null; name: string; decision: 'pending' | 'accepted' | 'rejected';
  changes: { hierarchyId: string; kind: 'ADD' | 'REMOVE'; decision: 'pending' | 'accepted' | 'rejected' }[];
};
export type AiGseProposal = {
  structuringAlternatives?: StructuringAlternative[];
  groupAssessment?: AiGseGroupAssessment;
  currentHierarchyIds?: string[];
  proposedHierarchyIds?: string[];
  recommendations?: AiRoleRecommendation[];
  id: string;
  name: string;
  description: string;
  hierarchyIds: string[];
  existingGroupId: string | null;
  justification: string;
  informationUsed: string[];
  divergences: string[];
  hypotheses: string[];
  missingInformation: string[];
  questions: string[];
  fieldConfirmation: string;
  classification: 'PRELIMINARY' | 'QUALITATIVE' | 'OCCUPATIONAL_CONFRONTED';
  occupationalHomogeneityConfirmed: false;
  review: 'HUMAN_REVIEW_REQUIRED';
  overlaps: {
    groupId: string;
    name: string;
    matchedHierarchyIds: string[];
    missingHierarchyIds: string[];
    basis: 'STRUCTURAL_OVERLAP_ONLY';
  }[];
  pendingHierarchyIds: string[];
};
export type AiGseAnalysis = {
  status: 'ANALYZED' | 'UNAVAILABLE';
  structuringContractVersion?: 'GSE_STRUCTURING_ALTERNATIVES_V1' | 'GSE_STRUCTURING_ALTERNATIVES_V2';
  reason?: string;
  failure?: {
    stage: string;
    code: string;
    issues?: { code: string; path: string }[];
  };
  companyId: string;
  workspaceId: string;
  contextHash: string;
  promptVersion: string;
  model?: string | null;
  generatedAt: string;
  auditStatus: string;
  fallback: 'NONE';
  auditEvidence?: unknown;
  proposals: AiGseProposal[];
  questions: string[];
  doNotGroup: { hierarchyIds: string[]; reason: string }[];
  sources: {
    roles: {
      id: string;
      name: string;
      formal: { source: string; text: string };
      interview: { source: string; text: string };
    }[];
    structure: {
      id: string;
      name: string;
      type: string;
      parentId: string | null;
    }[];
    limitations: string[];
    [key: string]: unknown;
  };
};
export async function analyzeGseWithAi(
  companyId: string,
  workspaceId: string,
  guidance: string,
  observations: string,
  preliminaryDistribution: AiPreliminaryGroup[] = [],
): Promise<AiGseAnalysis> {
  const response = await api.post<AiGseAnalysis>(
    `/v2/companies/${encodeURIComponent(companyId)}/workspaces/${encodeURIComponent(workspaceId)}/exposure-group-assistant/ai-consultative`,
    { guidance, observations, preliminaryDistribution },
  );
  return parseAiGseAnalysisResponse(response.data, companyId, workspaceId);
}
/** UI-only decisions, never SaveRequest or IntegratedReview. Preserve model evidence separately. */
export type AiGseLocalReview = {
  name: string;
  description: string;
  decision: 'pending' | 'accepted' | 'rejected';
  roles: Record<string, 'pending' | 'accepted' | 'rejected'>;
};
export function initialAiReview(proposal: AiGseProposal): AiGseLocalReview {
  return {
    name: proposal.name,
    description: proposal.description,
    decision: 'pending',
    roles: Object.fromEntries(
      roleRecommendations(proposal)
        .filter(requiresRecommendationDecision)
        .map((r) => [r.hierarchyId, 'pending']),
    ),
  };
}
export const aiClassificationLabel = (value: AiGseProposal['classification']) =>
  ({
    PRELIMINARY: 'Proposta preliminar',
    QUALITATIVE: 'Fundamentada em informações qualitativas',
    OCCUPATIONAL_CONFRONTED: 'Confrontada com dados ocupacionais disponíveis',
  })[value];

/** Presentation only: equal role names remain distinguishable by their structural path. */
export function aiRolePath(analysis: AiGseAnalysis, id: string): string {
  const nodes = new Map(
    analysis.sources.structure.map((node) => [node.id, node]),
  );
  const parts: string[] = [];
  const seen = new Set<string>();
  let current: string | null = id;
  while (current && !seen.has(current)) {
    seen.add(current);
    const node = nodes.get(current);
    if (!node) break;
    parts.unshift(node.name);
    current = node.parentId;
  }
  return (
    parts.join(' › ') ||
    analysis.sources.roles.find((role) => role.id === id)?.name ||
    'Cargo não identificado'
  );
}

export const recommendationConclusion = {
  KEEP: 'Manter vínculo — nenhuma alteração recomendada',
  REVIEW: 'Revisar vínculo',
  REMOVE: 'Propor retirada',
  INCLUDE: 'Considerar inclusão',
  INSUFFICIENT: 'Informações insuficientes',
};
export const recommendationDecisionLabel = {
  pending: 'Pendente de avaliação',
  accepted: 'Recomendação aceita',
  rejected: 'Recomendação rejeitada',
};
export const requiresRecommendationDecision = (r: AiRoleRecommendation) =>
  r.conclusion === 'REVIEW' || r.conclusion === 'INCLUDE' || r.conclusion === 'REMOVE';
export function roleRecommendations(p: AiGseProposal): AiRoleRecommendation[] {
  return p.hierarchyIds.map(
    (id) =>
      p.recommendations?.find((r) => r.hierarchyId === id) || {
        hierarchyId: id,
        conclusion: 'INSUFFICIENT',
        justification:
          'Esta análise anterior não contém uma conclusão individual por cargo.',
        evidence: [],
        divergences: [],
        recommendation:
          'Reexecute a análise para obter a recomendação ocupacional por cargo.',
        missingInformation: ['Conclusão individual não disponível.'],
        questions: [
          'Quais condições reais precisam ser confirmadas para este cargo?',
        ],
        currentGroups: [],
        existingInTarget: false,
      },
  );
}
export function recommendationSummary(p: AiGseProposal) {
  const list = roleRecommendations(p);
  return {
    keep: list.filter((r) => r.conclusion === 'KEEP').length,
    review: list.filter((r) => r.conclusion === 'REVIEW').length,
    remove: list.filter((r) => r.conclusion === 'REMOVE').length,
    include: list.filter((r) => r.conclusion === 'INCLUDE').length,
    insufficient: list.filter((r) => r.conclusion === 'INSUFFICIENT').length,
  };
}
const sourceTranslations: Record<string, string> = {
  preliminaryDistribution: 'Distribuição preliminar dos trabalhadores',
  existingGroups: 'GSEs existentes', recommendationRules: 'Critérios utilizados na recomendação',
  EXACT_EXISTING_GSE: 'Correspondência com GSE existente',
  STRUCTURAL_OVERLAP_ONLY: 'Sobreposição estrutural, sem comprovação de equivalência ocupacional',
  HUMAN_REVIEW_REQUIRED: 'Revisão profissional necessária',

  'user.guidance': 'Orientações fornecidas à IA',
  'user.observations': 'Observações do profissional',
  'Hierarchy.description': 'Descrição formal das atividades',
  'Hierarchy.realDescription': 'Descrição real/entrevista',
  'CompanyCharacterization.considerations': 'Observações da caracterização',
  'CompanyCharacterization.activities': 'Atividades caracterizadas',
  CompanyCharacterization: 'Caracterização das atividades',
  'RiskFactorData/riskFactor': 'Riscos ocupacionais cadastrados',
  RiskFactorData: 'Riscos ocupacionais cadastrados',
  HomogeneousGroup: 'GSE existente',
  HierarchyOnHomogeneous: 'Vínculos existentes',
  'user.guidance (ephemeral)': 'Orientações fornecidas à IA',
  'user.observations (ephemeral)': 'Observações do profissional',
  Hierarchy: 'Estrutura organizacional',
};
/** Presentation only: keep original technical payload intact, never expose it as raw JSON. */
export function professionalGseText(
  value: string,
  analysis?: AiGseAnalysis,
): string {
  let result = value;
  if (analysis) {
    const references = [
      ...analysis.sources.structure.map((n) => ({ id: n.id, name: n.name })),
      ...((analysis.sources.existingGroups as
        | { id: string; name: string }[]
        | undefined) || []),
      ...((analysis.sources.characterizations as
        | { id: string; name: string }[]
        | undefined) || []),
    ];
    for (const ref of references) {
      if (ref.id.length >= 6) result = result.split(ref.id).join(ref.name);
      else
        result = result.replace(
          new RegExp('cargo ' + ref.id + '(?=\\W|$)', 'g'),
          'cargo ' + ref.name,
        );
    }
  }
  for (const [technical, label] of Object.entries(sourceTranslations).sort(
    (a, b) => b[0].length - a[0].length,
  ))
    result = result.split(technical).join(label);
  return result
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      'referência do cadastro',
    )
    .replace(/\b[0-9a-f]{64}\b/gi, 'referência da análise')
    .replace(/\bHIGH\b/g, 'grau de confiança elevado')
    .replace(/\bMEDIUM\b/g, 'grau de confiança moderado')
    .replace(/\bLOW\b/g, 'grau de confiança baixo')
    .replace(/Código:\s*[A-Z_]+\.?/g, '')
    .replace(
      /\b(?:contextHash|snapshotContentHash|proposalFingerprint|homogeneousGroupId|hierarchyId|workspaceId|companyId|promptVersion)\b/g,
      'referência técnica',
    )
    .trim();
}
export function professionalSources(analysis: AiGseAnalysis): string[] {
  const s = analysis.sources;
  const text = (value: unknown) =>
    !!(
      value &&
      typeof value === 'object' &&
      typeof (value as { text?: unknown }).text === 'string' &&
      (value as { text: string }).text.trim()
    );
  const result = ['Estrutura organizacional e cargos do estabelecimento'];
  if (s.roles.some((r) => r.formal.text.trim()))
    result.push('Descrição formal das atividades');
  if (s.roles.some((r) => r.interview.text.trim()))
    result.push('Descrição real/entrevista');
  if (text(s.observations)) result.push('Observações do profissional');
  if (text(s.guidance)) result.push('Orientações fornecidas à IA');
  if (Array.isArray(s.characterizations) && s.characterizations.length)
    result.push('Caracterização das atividades e considerações registradas');
  if (
    s.occupationalRisks &&
    typeof s.occupationalRisks === 'object' &&
    Array.isArray((s.occupationalRisks as any).records) &&
    (s.occupationalRisks as any).records.length
  )
    result.push('Riscos ocupacionais cadastrados');
  if (Array.isArray(s.existingGroups) && s.existingGroups.length)
    result.push('GSEs e vínculos existentes');
  return result;
}

/** HTTP success is not occupational-analysis success. Fail closed on unknown/mixed envelopes. */
export function parseAiGseAnalysisResponse(
  value: unknown,
  companyId: string,
  workspaceId: string,
): AiGseAnalysis {
  const object = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);
  const texts = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((t) => typeof t === 'string');
  if (!object(value)) throw Error('AI_INVALID_RESPONSE_ENVELOPE');
  if (
    typeof value.companyId !== 'string' ||
    typeof value.workspaceId !== 'string'
  )
    throw Error('AI_INVALID_RESPONSE_ENVELOPE');
  if (value.companyId !== companyId || value.workspaceId !== workspaceId)
    throw Error('AI_SCOPE_MISMATCH');
  if (
    value.fallback !== 'NONE' ||
    !Array.isArray(value.proposals) ||
    !texts(value.questions) ||
    !Array.isArray(value.doNotGroup)
  )
    throw Error('AI_INVALID_RESPONSE_ENVELOPE');
  if (value.status === 'UNAVAILABLE') {
    if (
      typeof value.reason !== 'string' ||
      !value.reason.trim() ||
      value.proposals.length ||
      value.questions.length ||
      value.doNotGroup.length
    )
      throw Error('AI_INVALID_RESPONSE_ENVELOPE');
  } else if (value.status === 'ANALYZED') {
    if (value.structuringContractVersion !== undefined && !['GSE_STRUCTURING_ALTERNATIVES_V1','GSE_STRUCTURING_ALTERNATIVES_V2'].includes(String(value.structuringContractVersion))) throw Error('AI_INVALID_RESPONSE_ENVELOPE');
    if (
      value.failure !== undefined ||
      !object(value.sources) ||
      !Array.isArray(value.sources.roles) ||
      !Array.isArray(value.sources.structure) ||
      !value.proposals.every((p) => {
        if (
          !object(p) ||
          typeof p.id !== 'string' ||
          !p.id ||
          typeof p.name !== 'string' ||
          typeof p.description !== 'string' ||
          !p.description.trim() ||
          !texts(p.hierarchyIds) ||
          ((value.structuringContractVersion !== undefined || p.structuringAlternatives !== undefined) && !validStructuringAlternatives(p.structuringAlternatives, p.existingGroupId, value.sources as Record<string, unknown>, value.structuringContractVersion === 'GSE_STRUCTURING_ALTERNATIVES_V2')) ||
          !Array.isArray(p.overlaps) ||
          !texts(p.pendingHierarchyIds) ||
          typeof p.justification !== 'string' ||
          typeof p.fieldConfirmation !== 'string' ||
          !['PRELIMINARY', 'QUALITATIVE', 'OCCUPATIONAL_CONFRONTED'].includes(
            String(p.classification),
          ) ||
          p.occupationalHomogeneityConfirmed !== false ||
          ((String(value.promptVersion).startsWith('gse-consultative-v4-') || p.groupAssessment !== undefined) && (!Array.isArray(p.recommendations) || !validGroupAssessment(p.groupAssessment, object, texts)))
        )
          return false;
        if (
          ![
            'informationUsed',
            'divergences',
            'hypotheses',
            'missingInformation',
            'questions',
          ].every((key) => texts(p[key]))
        )
          return false;
        return (
          p.recommendations === undefined ||
          (Array.isArray(p.recommendations) &&
            p.recommendations.every(
              (r) =>
                object(r) &&
                typeof r.hierarchyId === 'string' &&
                ['KEEP', 'REVIEW', 'REMOVE', 'INCLUDE', 'INSUFFICIENT'].includes(
                  String(r.conclusion),
                ) &&
                typeof r.justification === 'string' &&
                typeof r.recommendation === 'string' &&
                typeof r.existingInTarget === 'boolean' &&
                Array.isArray(r.currentGroups) &&
                r.currentGroups.every(
                  (g) =>
                    object(g) &&
                    typeof g.id === 'string' &&
                    typeof g.name === 'string',
                ) &&
                [
                  'evidence',
                  'divergences',
                  'missingInformation',
                  'questions',
                ].every((key) => texts(r[key])),
            ))
        );
      })
    )
      throw Error('AI_INVALID_RESPONSE_ENVELOPE');
  } else throw Error('AI_INVALID_RESPONSE_ENVELOPE');
  return value as unknown as AiGseAnalysis;
}
export function aiConsultativeClientError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  if (code === 'AI_INVALID_RESPONSE_ENVELOPE')
    return 'A API retornou um formato de análise não reconhecido. Nenhuma proposta foi aceita.';
  if (code === 'AI_SCOPE_MISMATCH')
    return 'A análise retornada não corresponde à empresa e ao estabelecimento selecionados. Nenhuma proposta foi aceita.';
  return 'Não foi possível executar a análise por IA. Confira a permissão master e a disponibilidade do serviço. A V1 permanece disponível.';
}

/** Facts of membership are separate from suggestions and local decisions. No persistence operations. */
export function aiGroupState(p: AiGseProposal, review?: AiGseLocalReview) {
  if (!p.existingGroupId) return 'NEW' as const;
  return roleRecommendations(p).some((r) => ['REVIEW', 'REMOVE', 'INCLUDE'].includes(r.conclusion) && review?.roles[r.hierarchyId] !== 'rejected') ? 'CHANGED' as const : 'EXISTING' as const;
}
export function aiGroupCurrent(p: AiGseProposal, analysis: AiGseAnalysis): string[] {
  return p.currentHierarchyIds || ((analysis.sources.existingGroups as {id:string; hierarchyIds:string[]}[] | undefined)?.find((g) => g.id === p.existingGroupId)?.hierarchyIds || []);
}
export function aiGroupPreview(p: AiGseProposal, analysis: AiGseAnalysis, review: AiGseLocalReview): string[] {
  if (!p.existingGroupId && review.decision === 'rejected') return [];
  const result = new Set(aiGroupCurrent(p, analysis));
  for (const r of roleRecommendations(p)) {
    if (review.roles[r.hierarchyId] !== 'accepted') continue;
    if (r.conclusion === 'INCLUDE') result.add(r.hierarchyId);
    if (r.conclusion === 'REMOVE') result.delete(r.hierarchyId);
  }
  return [...result];
}
export function aiGroupDestinations(analysis: AiGseAnalysis, source: AiGseProposal, hierarchyId: string) {
  return (analysis.proposals || []).filter((p) => p.id !== source.id && roleRecommendations(p).some((r) => r.hierarchyId === hierarchyId && r.conclusion === 'INCLUDE'));
}

function validGroupAssessment(value: unknown, object: (v: unknown) => v is Record<string, unknown>, texts: (v: unknown) => v is string[]): boolean {
  if (!object(value)) return false;
  return ['characterization', 'exposureAssessment', 'preliminaryAssessment'].every((key) => typeof value[key] === 'string' && String(value[key]).trim().length > 0)
    && texts(value.compositionInconsistencies)
    && (value.newGroupJustification === null || (typeof value.newGroupJustification === 'string' && !!value.newGroupJustification.trim()))
    && Array.isArray(value.alternatives) && value.alternatives.every((a) => object(a) && typeof a.groupId === 'string' && !!a.groupId && ['SUITABLE','UNSUITABLE','INSUFFICIENT'].includes(String(a.assessment)) && typeof a.reason === 'string' && !!a.reason.trim() && texts(a.evidence) && a.evidence.length > 0);
}
