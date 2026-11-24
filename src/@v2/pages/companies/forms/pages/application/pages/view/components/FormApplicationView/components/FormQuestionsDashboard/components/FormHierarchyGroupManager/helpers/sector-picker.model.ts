import { labeledHierarchyContext } from './formatHierarchyGroupOptionLabel';
import type { HierarchyGroupOption } from './formatHierarchyGroupOptionLabel';
/** Order comes from registered parent paths, even when the first company omits a level. */
export function hierarchyLevelOrder(options: HierarchyGroupOption[]): string[] {
  const types = [
    ...new Set(
      options.flatMap((o) => (o.hierarchyPath ?? []).map((n) => n.type)),
    ),
  ];
  const before = new Map(types.map((t) => [t, new Set<string>()]));
  for (const o of options) {
    const path = o.hierarchyPath ?? [];
    path.forEach((n, i) =>
      path.slice(0, i).forEach((p) => {
        if (p.type !== n.type) before.get(n.type)!.add(p.type);
      }),
    );
  }
  const result: string[] = [];
  const left = new Set(types);
  while (left.size) {
    const next =
      [...left].find((t) => ![...before.get(t)!].some((p) => left.has(p))) ??
      [...left][0];
    result.push(next);
    left.delete(next);
  }
  return result;
}

export type SectorVisibility = {
  hideCompany: boolean;
  companyNameMode?: 'legal' | 'fantasy';
  hideEstablishment: boolean;
};
export function sectorContextParts(
  option: HierarchyGroupOption,
  visibility: SectorVisibility,
): string[] {
  return labeledHierarchyContext(
    {
      ...option,
      companyName:
        visibility.companyNameMode === 'fantasy'
          ? option.companyFantasy?.trim() || option.companyName
          : option.companyName,
    },
    visibility,
  );
}
export function sectorPresentationLabel(
  option: HierarchyGroupOption,
  visibility: SectorVisibility,
): string {
  const label = [
    `Setor: ${option.name}`,
    ...sectorContextParts(option, visibility),
  ].join(' — ');
  return option.participantCount == null
    ? label
    : `${label} — ${option.participantCount} participante(s)`;
}
