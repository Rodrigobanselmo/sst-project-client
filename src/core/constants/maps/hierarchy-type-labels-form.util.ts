import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import type { ICompanyHierarchyTypeLabels } from 'core/interfaces/api/ICompany';

import {
  CANONICAL_HIERARCHY_TYPE_LABELS,
  HIERARCHY_TYPE_LABEL_KEYS,
  readStoredHierarchyTypeLabels,
} from './hierarchy-type-labels';

export type HierarchyTypeLabelsDraft = Record<HierarchyEnum, string>;

export function createHierarchyTypeLabelsDraft(
  stored?: unknown,
): HierarchyTypeLabelsDraft {
  const overrides = readStoredHierarchyTypeLabels(stored);
  return HIERARCHY_TYPE_LABEL_KEYS.reduce((acc, type) => {
    acc[type] = overrides[type] || CANONICAL_HIERARCHY_TYPE_LABELS[type];
    return acc;
  }, {} as HierarchyTypeLabelsDraft);
}

export function isHierarchyTypeLabelCustom(
  type: HierarchyEnum,
  stored?: unknown,
) {
  return Boolean(readStoredHierarchyTypeLabels(stored)[type]);
}

export function buildHierarchyTypeLabelsPatch(params: {
  stored?: unknown;
  draft: Partial<Record<HierarchyEnum, string>>;
}): {
  hierarchyTypeLabels: Partial<Record<HierarchyEnum, string | null>>;
} {
  const stored = readStoredHierarchyTypeLabels(params.stored);
  const next: Partial<Record<HierarchyEnum, string | null>> = {};

  for (const type of HIERARCHY_TYPE_LABEL_KEYS) {
    const trimmed = String(params.draft[type] ?? '').trim();
    const currentOverride = stored[type];
    const canonical = CANONICAL_HIERARCHY_TYPE_LABELS[type];

    if (!trimmed || trimmed === canonical) {
      if (currentOverride) next[type] = null;
      continue;
    }

    if (trimmed !== currentOverride) {
      next[type] = trimmed;
    }
  }

  return { hierarchyTypeLabels: next };
}

export function isHierarchyTypeLabelsDraftDirty(params: {
  stored?: unknown;
  draft: Partial<Record<HierarchyEnum, string>>;
}) {
  return (
    Object.keys(buildHierarchyTypeLabelsPatch(params).hierarchyTypeLabels)
      .length > 0
  );
}

export function applyHierarchyTypeLabelsPatchToMetadata(
  metadata: Record<string, unknown> | undefined,
  nextLabels: ICompanyHierarchyTypeLabels,
) {
  const nextMetadata = { ...(metadata || {}) };
  if (Object.keys(nextLabels).length) {
    nextMetadata.hierarchyTypeLabels = nextLabels;
  } else {
    delete nextMetadata.hierarchyTypeLabels;
  }
  return nextMetadata;
}
