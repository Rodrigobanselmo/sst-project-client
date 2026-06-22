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
  return new Map(
    options.map((option) => [option.id, formatHierarchyWithContext(option)]),
  );
}

function getHierarchyGroupOptionLabel(
  option: HierarchyGroupOption,
  labels: Map<string, string>,
): string {
  return labels.get(option.id) ?? option.name;
}

export function sortHierarchyGroupOptionsByLabel(
  options: HierarchyGroupOption[],
  labels: Map<string, string>,
): HierarchyGroupOption[] {
  return [...options].sort((a, b) => {
    const labelA = getHierarchyGroupOptionLabel(a, labels);
    const labelB = getHierarchyGroupOptionLabel(b, labels);

    const byLabel = labelA.localeCompare(labelB, 'pt-BR', {
      sensitivity: 'base',
    });
    if (byLabel !== 0) return byLabel;

    const byName = a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    if (byName !== 0) return byName;

    return a.id.localeCompare(b.id);
  });
}
