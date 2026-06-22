export type HierarchyGroupOption = {
  id: string;
  name: string;
  establishment?: string;
  companyName?: string;
};

function formatHierarchyWithContext(option: HierarchyGroupOption): string {
  const context = option.establishment?.trim() || option.companyName?.trim();
  if (!context) return option.name;
  return `${option.name} — ${context}`;
}

export function buildHierarchyGroupOptionLabels(
  options: HierarchyGroupOption[],
): Map<string, string> {
  const nameCounts = new Map<string, number>();

  for (const option of options) {
    const key = option.name.trim().toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }

  return new Map(
    options.map((option) => {
      const isDuplicateName =
        (nameCounts.get(option.name.trim().toLowerCase()) ?? 0) > 1;
      const label = isDuplicateName
        ? formatHierarchyWithContext(option)
        : option.name;
      return [option.id, label];
    }),
  );
}
