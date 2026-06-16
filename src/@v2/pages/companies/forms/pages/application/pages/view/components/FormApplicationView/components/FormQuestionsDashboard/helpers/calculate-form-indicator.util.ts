export type QuestionAnswersForIndicator = {
  answers: Array<{ selectedOptionsIds: string[] }>;
  options: Array<{ id: string; value?: number }>;
};

export type FormIndicatorResult = {
  score: number;
  percentage: number;
  hasValidAnswers: boolean;
};

export function calculateFormIndicatorFromQuestion(
  question: QuestionAnswersForIndicator,
): FormIndicatorResult {
  let totalValue = 0;
  let totalAnswers = 0;

  question.answers.forEach((answer) => {
    answer.selectedOptionsIds.forEach((optionId) => {
      const option = question.options.find((opt) => opt.id === optionId);
      if (option && option.value !== undefined && option.value > 0) {
        totalValue += option.value - 1;
        totalAnswers += 1;
      }
    });
  });

  if (totalAnswers === 0) {
    return { score: 0, percentage: 0, hasValidAnswers: false };
  }

  const maxPossibleValue = totalAnswers * 4;
  const score = maxPossibleValue > 0 ? totalValue / maxPossibleValue : 0;
  const percentage = Math.round(score * 100);

  return { score, percentage, hasValidAnswers: true };
}

export function calculateFormIndicatorFromQuestions(
  questions: QuestionAnswersForIndicator[],
): FormIndicatorResult {
  let totalValue = 0;
  let totalAnswers = 0;

  questions.forEach((question) => {
    question.answers.forEach((answer) => {
      answer.selectedOptionsIds.forEach((optionId) => {
        const option = question.options.find((opt) => opt.id === optionId);
        if (option && option.value !== undefined && option.value > 0) {
          totalValue += option.value - 1;
          totalAnswers += 1;
        }
      });
    });
  });

  if (totalAnswers === 0) {
    return { score: 0, percentage: 0, hasValidAnswers: false };
  }

  const maxPossibleValue = totalAnswers * 4;
  const score = maxPossibleValue > 0 ? totalValue / maxPossibleValue : 0;
  const percentage = Math.round(score * 100);

  return { score, percentage, hasValidAnswers: true };
}
