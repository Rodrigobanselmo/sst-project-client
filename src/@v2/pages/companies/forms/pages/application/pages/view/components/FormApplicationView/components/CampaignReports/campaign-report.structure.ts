import type { ReportRun } from './campaign-reports.api';

// Structure v1: each saved conclusion retains its own evidence and heading.
// Theme names and order come from the versioned taxonomy, never keyword guesses.
export function listeningNarrativeGroups(result: ReportRun['result']) {
  if (!result) return [];
  return result.narrative.listening.map((item, index) => {
    const themes = result.taxonomy.filter((theme) =>
      result.listening.some((question) =>
        item.evidenceRefs.some(
          (ref) =>
            ref === `T:${question.questionId}:${theme.id}` ||
            ref.startsWith(`P:${question.questionId}:${theme.id}:`),
        ),
      ),
    );
    return {
      id: `conclusion-${index}`,
      title: themes.length
        ? themes.map((theme) => theme.name).join(' · ')
        : 'Panorama da participação e da escuta',
      items: [item],
    };
  });
}
