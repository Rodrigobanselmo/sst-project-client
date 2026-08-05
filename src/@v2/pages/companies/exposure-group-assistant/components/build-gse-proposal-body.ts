import type {
  CreateGseFromProposalBody,
  CreateGsePreviewBody,
  GseDraftProposal,
  GseDraftTextFields,
  SimilarityCandidate,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';

/**
 * Extracts the editable text surface from a draft — the only fields a human
 * or the AI refinement step may change. Mirrors the API's `extractTextFields`.
 */
export function extractGseDraftTextFields(
  draft: GseDraftProposal,
): GseDraftTextFields {
  return {
    name: draft.name,
    description: draft.description,
    technicalJustification: draft.technicalJustification,
    formationReason: draft.formationReason,
    populationDescription: draft.populationDescription,
    operationalContext: draft.operationalContext,
    occupationalContext: draft.occupationalContext,
    inclusionCriteria: [...draft.inclusionCriteria],
    exclusionCriteria: [...draft.exclusionCriteria],
    reviewNotes: [...draft.reviewNotes],
  };
}

export type BuildGseSharedBodyParams = {
  candidate: SimilarityCandidate;
  draft: GseDraftProposal;
  /** Current (possibly human/AI-edited) texts shown in the form. */
  editedTexts: GseDraftTextFields;
  /** Texts frozen from the draft when the dialog opened, before any edit. */
  deterministicTexts: GseDraftTextFields;
  snapshotHash: string;
  algorithmVersion: string;
  aiRefined?: boolean;
  aiModel?: string;
  aiPromptRevision?: number;
};

/**
 * Builds the shared composition + editable-texts body used by both
 * create-preview and create. Composition fields (elements, hierarchy ids,
 * risks, employees, mode, classification) always come from the frozen draft
 * — never from user input — since those sections are read-only in the UI.
 */
export function buildGseSharedBody(
  params: BuildGseSharedBodyParams,
): CreateGsePreviewBody {
  const {
    candidate,
    draft,
    editedTexts,
    deterministicTexts,
    snapshotHash,
    algorithmVersion,
    aiRefined,
    aiModel,
    aiPromptRevision,
  } = params;

  return {
    proposalId: draft.proposalId,
    proposalMode: draft.proposalMode,
    classification: draft.classification,
    snapshotHash,
    algorithmVersion,
    elementIds: draft.includedElements.map((el) => el.elementId),
    hierarchyIds: draft.hierarchyIds,
    riskIds: draft.includedRisks.riskIds,
    commonRoleNames: candidate.commonRoleNames,
    employeeUnionCount: draft.includedEmployees.count,
    ...editedTexts,
    aiRefined,
    aiModel,
    aiPromptRevision,
    deterministicTexts,
  };
}

export function buildGseCreateBody(
  params: BuildGseSharedBodyParams & {
    proposalFingerprint: string;
    confirmBlockingWarnings?: boolean;
  },
): CreateGseFromProposalBody {
  const { proposalFingerprint, confirmBlockingWarnings, ...shared } = params;
  return {
    ...buildGseSharedBody(shared),
    proposalFingerprint,
    confirmBlockingWarnings,
  };
}
