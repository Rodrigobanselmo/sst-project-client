type Question = {
  id: string;
  answers: Array<{
    participantsAnswersId: string;
    selectedOptionsIds: string[];
  }>;
};
// OR within a question; AND between questions. Empty selection means no restriction.
export function intersectIdentificationFilters(
  questions: Question[],
  filters: Record<string, string[]>,
): Set<string> | null {
  let result: Set<string> | null = null;
  for (const [id, selected] of Object.entries(filters)) {
    if (!selected.length) continue;
    const question = questions.find((q) => q.id === id);
    const matches = new Set(
      question?.answers
        .filter((a) =>
          a.selectedOptionsIds.some((option) => selected.includes(option)),
        )
        .map((a) => a.participantsAnswersId) ?? [],
    );
    result =
      result === null
        ? matches
        : new Set(Array.from(result as Set<string>).filter((id) => matches.has(id)));
  }
  return result;
}
