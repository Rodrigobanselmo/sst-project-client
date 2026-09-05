export type ActionPlanGroupRiskItem = {
  id: string;
  name: string;
};

export function uniqueActionPlanGroupRisks<T extends ActionPlanGroupRiskItem>(
  risks: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const risk of risks) {
    const id = risk.id?.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(risk);
  }

  return result;
}

export function formatActionPlanGroupRiskCount(count: number): string {
  return `${count} fatores de risco`;
}
