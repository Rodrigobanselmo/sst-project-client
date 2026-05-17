import type { IFormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import type { IFormParticipantStructureBrowseModel } from '@v2/models/form/models/form-questions-answers/form-participant-structure-browse.model';

type RawBrowsePayload = Record<string, unknown>;

function asParticipantStructures(
  value: unknown,
): IFormParticipantStructureBrowseModel[] {
  if (!Array.isArray(value)) return [];
  return value as IFormParticipantStructureBrowseModel[];
}

/**
 * Garante leitura de `participantStructures` com o nome exato da API (camelCase)
 * e fallback defensivo para snake_case, sem alterar `results`.
 */
export function normalizeFormQuestionsAnswersBrowsePayload(
  data: unknown,
): IFormQuestionsAnswersBrowseModel {
  const raw = (data ?? {}) as RawBrowsePayload;

  const participantStructures = Array.isArray(raw.participantStructures)
    ? asParticipantStructures(raw.participantStructures)
    : Array.isArray(raw.participant_structures)
      ? asParticipantStructures(raw.participant_structures)
      : [];

  return {
    results: (raw.results ??
      []) as IFormQuestionsAnswersBrowseModel['results'],
    participantStructures,
  };
}
