import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import { hierarchyFilter } from './constants/filters';

export const HIERARCHY_SELECT_EMPTY_OPTION_ID = '__HIERARCHY_TYPE_EMPTY__';

const EMPTY_MESSAGE_BY_TYPE: Record<HierarchyEnum, string> = {
  [HierarchyEnum.DIRECTORY]: 'Nenhuma superintendência cadastrada',
  [HierarchyEnum.MANAGEMENT]: 'Nenhuma diretoria cadastrada',
  [HierarchyEnum.SECTOR]: 'Nenhum setor cadastrado',
  [HierarchyEnum.SUB_SECTOR]: 'Nenhum subsetor cadastrado',
  [HierarchyEnum.OFFICE]: 'Nenhum cargo cadastrado',
  [HierarchyEnum.SUB_OFFICE]: 'Nenhum cargo desenvolvido cadastrado',
};

/** Chips canônicos: os 6 tipos, ou o recorte explícito de `filterOptions`. */
export function getHierarchySelectChipFilters(
  filterOptions?: HierarchyEnum[],
) {
  if (!filterOptions?.length) return hierarchyFilter;
  return hierarchyFilter.filter((item) => filterOptions.includes(item.filter));
}

export function getHierarchySelectEmptyMessage(type?: string) {
  if (type && type in EMPTY_MESSAGE_BY_TYPE) {
    return EMPTY_MESSAGE_BY_TYPE[type as HierarchyEnum];
  }
  return 'Nenhum item cadastrado';
}

export function isHierarchySelectEmptyOptionId(id?: string) {
  return id === HIERARCHY_SELECT_EMPTY_OPTION_ID;
}
