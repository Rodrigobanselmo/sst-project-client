import {
  CANONICAL_HIERARCHY_TYPE_LABELS,
  isSupportedHierarchyType,
} from 'core/constants/maps/hierarchy-type-labels';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { matchesWorkspaceFilter } from 'core/utils/matches-workspace-filter.util';

import { hierarchyFilter } from './constants/filters';

export const HIERARCHY_SELECT_EMPTY_OPTION_ID = '__HIERARCHY_TYPE_EMPTY__';

export type HierarchyTypeLabelsMap = Record<HierarchyEnum, string>;

function resolveTypeLabel(
  type: HierarchyEnum,
  labels?: Partial<HierarchyTypeLabelsMap> | null,
) {
  return labels?.[type] || CANONICAL_HIERARCHY_TYPE_LABELS[type];
}

export function isFeminineHierarchyTypeLabel(label: string) {
  const lastWord =
    label
      .trim()
      .split(/\s+/)
      .pop()
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') ?? '';

  return /(?:a|as|dade|cao|sao|encia)$/.test(lastWord);
}

export function formatHierarchyTypeEmptyMessage(label: string) {
  const normalized = label.trim().toLowerCase();
  if (isFeminineHierarchyTypeLabel(label)) {
    return `Nenhuma ${normalized} cadastrada`;
  }
  return `Nenhum ${normalized} cadastrado`;
}

export function formatHierarchySelectItemLabel(
  type: unknown,
  name?: string,
  labels?: Partial<HierarchyTypeLabelsMap> | null,
) {
  const prefix = isSupportedHierarchyType(type)
    ? `(${resolveTypeLabel(type, labels)}) `
    : '';
  return `${prefix}${name ?? ''}`;
}

/** Chips canônicos: os 6 tipos, ou o recorte explícito de `filterOptions`. */
export function getHierarchySelectChipFilters(
  filterOptions?: HierarchyEnum[],
  labels?: Partial<HierarchyTypeLabelsMap> | null,
) {
  const source = !filterOptions?.length
    ? hierarchyFilter
    : hierarchyFilter.filter((item) => filterOptions.includes(item.filter));

  return source.map((item) => ({
    ...item,
    label: resolveTypeLabel(item.filter, labels).toLowerCase(),
  }));
}

export function getHierarchySelectEmptyMessage(
  type?: string,
  labels?: Partial<HierarchyTypeLabelsMap> | null,
) {
  if (!isSupportedHierarchyType(type)) {
    return 'Nenhum item cadastrado';
  }

  return formatHierarchyTypeEmptyMessage(resolveTypeLabel(type, labels));
}

export function isHierarchySelectEmptyOptionId(id?: string) {
  return id === HIERARCHY_SELECT_EMPTY_OPTION_ID;
}

export function matchesHierarchySelectListItem(params: {
  type: string;
  activeType: string;
  parentId?: string;
  parents?: Array<{ id?: string }> | null;
  workspaceId?: string;
  workspaceIds?: string[] | null;
}) {
  const { type, activeType, parentId, parents, workspaceId, workspaceIds } =
    params;

  if (type !== activeType) return false;
  if (
    parentId &&
    !(Array.isArray(parents) && parents.find((parent) => parent.id === parentId))
  ) {
    return false;
  }

  return matchesWorkspaceFilter(workspaceId, workspaceIds);
}
