import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import type {
  ICompany,
  ICompanyHierarchyTypeLabels,
} from 'core/interfaces/api/ICompany';

export const CANONICAL_HIERARCHY_TYPE_LABELS: Record<HierarchyEnum, string> = {
  [HierarchyEnum.DIRECTORY]: 'Diretoria',
  [HierarchyEnum.MANAGEMENT]: 'Gerência',
  [HierarchyEnum.SECTOR]: 'Setor',
  [HierarchyEnum.SUB_SECTOR]: 'Subsetor',
  [HierarchyEnum.OFFICE]: 'Cargo',
  [HierarchyEnum.SUB_OFFICE]: 'Cargo desenvolvido',
};

export const HIERARCHY_TYPE_LABEL_KEYS = Object.keys(
  CANONICAL_HIERARCHY_TYPE_LABELS,
) as HierarchyEnum[];

export function isSupportedHierarchyType(
  type: unknown,
): type is HierarchyEnum {
  return (
    typeof type === 'string' &&
    Object.prototype.hasOwnProperty.call(CANONICAL_HIERARCHY_TYPE_LABELS, type)
  );
}

export function readStoredHierarchyTypeLabels(
  stored: unknown,
): ICompanyHierarchyTypeLabels {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return {};
  }

  const source = stored as Record<string, unknown>;
  const labels: ICompanyHierarchyTypeLabels = {};

  for (const type of HIERARCHY_TYPE_LABEL_KEYS) {
    const raw = source[type];
    if (typeof raw !== 'string') continue;

    const trimmed = raw.trim();
    if (!trimmed) continue;

    labels[type] = trimmed;
  }

  return labels;
}

export function resolveHierarchyTypeLabel(
  type: unknown,
  companyLabels?: unknown,
): string {
  if (!isSupportedHierarchyType(type)) {
    throw new Error(`Tipo hierárquico inválido: ${String(type)}`);
  }

  const stored = readStoredHierarchyTypeLabels(companyLabels);
  return stored[type] ?? CANONICAL_HIERARCHY_TYPE_LABELS[type];
}

export function resolveHierarchyTypeLabelsMap(
  companyLabels?: unknown,
): Record<HierarchyEnum, string> {
  return HIERARCHY_TYPE_LABEL_KEYS.reduce(
    (acc, type) => {
      acc[type] = resolveHierarchyTypeLabel(type, companyLabels);
      return acc;
    },
    {} as Record<HierarchyEnum, string>,
  );
}

export function resolveHierarchyTypeLabelsFromCompany(
  company?: Pick<ICompany, 'metadata'> | null,
): Record<HierarchyEnum, string> {
  return resolveHierarchyTypeLabelsMap(company?.metadata?.hierarchyTypeLabels);
}
