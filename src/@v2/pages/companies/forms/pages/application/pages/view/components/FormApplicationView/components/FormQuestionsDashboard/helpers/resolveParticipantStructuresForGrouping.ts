import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { FormParticipantStructureBrowseModel } from '@v2/models/form/models/form-questions-answers/form-participant-structure-browse.model';

/** IDs únicos de submissão no browse (mesma chave de answer.participantsAnswersId). */
export function collectParticipantsAnswersIdsFromBrowse(
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel | null | undefined,
): string[] {
  const ids = new Set<string>();
  for (const group of formQuestionsAnswers?.results ?? []) {
    for (const question of group.questions) {
      for (const answer of question.answers) {
        if (answer.participantsAnswersId) {
          ids.add(answer.participantsAnswersId);
        }
      }
    }
  }
  return Array.from(ids);
}

/**
 * Estruturas para agrupamento: usa `participantStructures` da API quando presente;
 * completa com entradas vazias por participante do browse para opções estruturais
 * e fallbacks ("Sem estabelecimento", etc.) mesmo sem dados hierárquicos.
 */
export function resolveParticipantStructuresForGrouping(
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel | null | undefined,
): FormParticipantStructureBrowseModel[] {
  const participantIds = collectParticipantsAnswersIdsFromBrowse(
    formQuestionsAnswers,
  );
  if (participantIds.length === 0) return [];

  const bySubmissionId = new Map<string, FormParticipantStructureBrowseModel>();
  for (const structure of formQuestionsAnswers?.participantStructures ?? []) {
    bySubmissionId.set(structure.participantsAnswersId, structure);
  }

  return participantIds.map(
    (participantsAnswersId) =>
      bySubmissionId.get(participantsAnswersId) ??
      new FormParticipantStructureBrowseModel({
        participantsAnswersId,
        workspaceId: null,
        workspaceName: null,
        hierarchies: [],
      }),
  );
}
