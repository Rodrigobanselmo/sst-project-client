// Structural input keeps this calculation independent of the UI and respondent identity.
export interface ReportGroupInput {
  id: string;
  name: string;
  identifier: boolean;
  questions: {
    id: string;
    details: { text: string; type: string };
    options: { id: string; text: string; value?: number }[];
    answers: {
      participantsAnswersId: string;
      selectedOptionsIds: string[];
      value?: string;
    }[];
  }[];
}

// The editor stores 1 = Muito Positivo and 5 = Muito Negativo.
// Convert the registered classification; never infer polarity from wording.
export const REPORT_METHOD_VERSION = 'campaign-descriptive-v0.2';
export const REPORT_MINIMUM_RESPONDENTS = 3;

export function buildCampaignReportDataset(groups: ReportGroupInput[]) {
  return groups
    .filter((group) => !group.identifier)
    .map((group) => {
      const questions = group.questions.map((question) => {
        const objective = ['RADIO', 'SELECT', 'CHECKBOX'].includes(
          question.details.type,
        );
        const text = ['TEXT', 'SHORT_TEXT', 'LONG_TEXT'].includes(
          question.details.type,
        );
        const respondents = new Set<string>();
        let points = 0;
        let selections = 0;
        let excludedSelections = 0;
        let invalidSelections = 0;
        let textCount = 0;
        const counts = new Map<string, number>();
        for (const answer of question.answers) {
          if (text && answer.value?.trim()) {
            textCount += 1;
            respondents.add(answer.participantsAnswersId);
          }
          if (!objective) continue;
          if (answer.selectedOptionsIds.length)
            respondents.add(answer.participantsAnswersId);
          for (const id of new Set(answer.selectedOptionsIds)) {
            const option = question.options.find((item) => item.id === id);
            if (!option) {
              invalidSelections += 1;
              continue;
            }
            counts.set(id, (counts.get(id) ?? 0) + 1);
            if (
              option.value === 0 ||
              option.value === undefined ||
              option.value === null
            ) {
              excludedSelections += 1;
            } else if (
              Number.isInteger(option.value) &&
              option.value >= 1 &&
              option.value <= 5
            ) {
              points += (5 - option.value) * 25;
              selections += 1;
            } else {
              invalidSelections += 1;
            }
          }
        }
        const protectedData = respondents.size < REPORT_MINIMUM_RESPONDENTS;
        const distribution = question.options.map((option) => ({
          id: option.id,
          label: option.text,
          count: counts.get(option.id) ?? 0,
          percentage: respondents.size
            ? ((counts.get(option.id) ?? 0) / respondents.size) * 100
            : 0,
          score:
            option.value &&
            Number.isInteger(option.value) &&
            option.value >= 1 &&
            option.value <= 5
              ? (5 - option.value) * 25
              : null,
        }));
        // Never return small cells or raw response text/identifiers to the document.
        const protectedDistribution =
          protectedData ||
          distribution.some(
            (item) => item.count > 0 && item.count < REPORT_MINIMUM_RESPONDENTS,
          );
        return {
          id: question.id,
          title: question.details.text,
          objective,
          text,
          multiple: question.details.type === 'CHECKBOX',
          protectedData,
          respondents: protectedData ? null : respondents.size,
          textCount: protectedData ? null : textCount,
          selections: protectedData ? null : selections,
          excludedSelections: protectedData ? null : excludedSelections,
          invalidSelections: protectedData ? null : invalidSelections,
          score:
            protectedData || invalidSelections || !selections
              ? null
              : points / selections,
          distribution: protectedDistribution ? null : distribution,
          points: protectedData || invalidSelections ? null : points,
        };
      });
      const scored = questions.filter((question) => question.score !== null);
      const denominator = scored.reduce(
        (sum, question) => sum + (question.selections ?? 0),
        0,
      );
      return {
        id: group.id,
        name: group.name,
        questions,
        score: denominator
          ? scored.reduce((sum, question) => sum + (question.points ?? 0), 0) /
            denominator
          : null,
        denominator,
        scoredQuestions: scored.length,
        incomplete: questions.some(
          (question) => question.objective && question.score === null,
        ),
      };
    });
}
