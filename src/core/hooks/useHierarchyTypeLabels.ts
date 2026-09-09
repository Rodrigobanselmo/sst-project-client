import { useMemo } from 'react';

import { resolveHierarchyTypeLabelsMap } from 'core/constants/maps/hierarchy-type-labels';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export function useHierarchyTypeLabels(
  company?: Pick<ICompany, 'metadata'> | null,
) {
  const query = useQueryCompany();
  const source = company !== undefined ? company : query.data;
  const labels = source?.metadata?.hierarchyTypeLabels;

  return useMemo(() => resolveHierarchyTypeLabelsMap(labels), [labels]);
}
