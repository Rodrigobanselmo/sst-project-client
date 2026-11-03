import type {
  SimilarityCandidate,
  SimilarityProposalsResponse,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';

/** Consultative contract: the original response is retained without projecting away evidence.
 * Deliberately unrelated to IntegratedReview / SaveRequest. No occupational write commands.
 */
export function adaptOccupationalAnalysis(
  response: SimilarityProposalsResponse,
  companyId: string,
  workspaceId: string,
) {
  if (
    response.workspace.companyId !== companyId ||
    response.workspace.id !== workspaceId
  )
    throw new Error('ANALYSIS_SCOPE_MISMATCH');
  const proposals = response.candidates.map((candidate, index) => {
    if (
      candidate.draft &&
      (candidate.draft.companyId !== companyId ||
        !candidate.draft.workspaceIds.includes(workspaceId))
    )
      throw new Error('PROPOSAL_SCOPE_MISMATCH');
    const status = candidate.materialization?.status || 'NOT_MATERIALIZED';
    return {
      key: `${candidate.draft?.proposalId || 'candidate'}:${index}`,
      source: 'OCCUPATIONAL' as const,
      companyId,
      workspaceId,
      proposalId: candidate.draft?.proposalId ?? null,
      fingerprint: candidate.proposalFingerprint ?? null,
      algorithmVersion:
        candidate.draft?.algorithmVersion ||
        response.similarityAlgorithmVersion,
      snapshotHash: response.snapshotContentHash,
      existingGroupId: candidate.materialization?.homogeneousGroupId ?? null,
      recognition: status,
      // Composition/provenance recognition is not a certification of occupational equivalence.
      occupationalEquivalenceConfirmed: false as const,
      requiresTechnicalReview:
        status === 'EXACT_EXISTING_GSE' ||
        status === 'PARTIAL_OVERLAP' ||
        candidate.indication === 'REVIEW' ||
        candidate.broadCohortReviewRequired === true,
      blocked:
        candidate.blocks.length > 0 || candidate.indication === 'BLOCKED',
      insufficient: candidate.indication === 'INSUFFICIENT_DATA',
      candidate,
    };
  });
  return {
    source: 'OCCUPATIONAL' as const,
    companyId,
    workspaceId,
    response,
    proposals,
  };
}
export const recognitionLabel = (status: string) =>
  ({
    EXACT_CREATED_PROPOSAL:
      'Proposta já implementada — proveniência reconhecida',
    EXACT_EXISTING_GSE:
      'GSE existente com composição correspondente — revisão ocupacional necessária',
    PARTIAL_OVERLAP: 'Proposta parcialmente atendida — sobreposição',
    NOT_MATERIALIZED: 'Proposta ainda não implementada',
  })[status] || 'Reconhecimento indisponível';
export function occupationalTechnicalSections(candidate: SimilarityCandidate) {
  return {
    'Justificativas favoráveis': candidate.favorableReasons,
    Divergências: candidate.divergences,
    Bloqueios: candidate.blocks.map((b) => b.message),
    'Justificativa técnica': [
      candidate.draft?.technicalJustification ||
        candidate.technicalJustification ||
        'Não informada',
    ],
    'Critérios de inclusão': candidate.draft?.inclusionCriteria || [],
    'Critérios de exclusão': candidate.draft?.exclusionCriteria || [],
    'Notas de revisão': candidate.draft?.reviewNotes || [],
  };
}
