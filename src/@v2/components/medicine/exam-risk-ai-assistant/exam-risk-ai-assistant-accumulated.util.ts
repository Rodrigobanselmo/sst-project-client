export const buildRiskExamAccumulationKey = (
  riskId: string,
  examId: number,
) => `${riskId}:${examId}`;

export const mergeAccumulatedItems = <T>(
  current: T[],
  incoming: T[],
  getKey: (item: T) => string,
): T[] => {
  const seen = new Set(current.map(getKey));
  const next = [...current];
  incoming.forEach((item) => {
    const key = getKey(item);
    if (seen.has(key)) return;
    seen.add(key);
    next.push(item);
  });
  return next;
};
