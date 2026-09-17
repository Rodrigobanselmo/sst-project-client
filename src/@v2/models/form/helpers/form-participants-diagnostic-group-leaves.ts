import { buildEstablishmentAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment';
import { buildEstablishmentHierarchyAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment-hierarchy';
import { buildEstablishmentSectorAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment-sector';
import {
  buildCombinedHierarchyNestedAggregates,
  flattenCombinedHierarchyNestedLeaves,
} from '@v2/models/form/helpers/form-participants-aggregate-by-combined-hierarchy';
import {
  buildHierarchyGroupAggregates,
  buildSectorWithHierarchyGroupAggregates,
  type HierarchyGroupForParticipants,
} from '@v2/models/form/helpers/form-participants-aggregate-by-hierarchy-group';
import { buildHierarchyTypeAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-hierarchy-type';
import { buildSectorAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-sector';
import {
  filterCombinedHierarchyDiagnosticGroups,
  filterFlatDiagnosticGroups,
  filterParentChildDiagnosticGroups,
  type DiagnosticGroupMetrics,
  type RecorteDiagnosticFilterParams,
} from '@v2/models/form/helpers/form-participants-diagnostic-group-filters';
import {
  getCombinedHierarchyGroupingConfig,
  getCombinedHierarchyLevelsForDisplay,
  getEstablishmentHierarchyGroupingConfig,
  getEstablishmentHierarchyMissingLabel,
  getFlatHierarchyGroupingConfig,
  getFlatHierarchyMissingLabel,
  type ParticipantsViewMode,
} from '@v2/models/form/helpers/form-participants-hierarchy-grouping.config';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';

export function collectFilteredDiagnosticLeaves(params: {
  viewMode: ParticipantsViewMode;
  rows: FormParticipantsBrowseResultModel[];
  filter: RecorteDiagnosticFilterParams;
  typeLabels?: unknown;
  hierarchyGroups?: HierarchyGroupForParticipants[];
}): DiagnosticGroupMetrics[] {
  const { viewMode, rows, filter, typeLabels, hierarchyGroups = [] } = params;

  if (viewMode === 'list') return [];

  if (viewMode === 'grouped') {
    return filterFlatDiagnosticGroups(buildSectorAggregates(rows), filter);
  }

  if (viewMode === 'grouped_establishment') {
    return filterFlatDiagnosticGroups(
      buildEstablishmentAggregates(rows),
      filter,
    );
  }

  if (viewMode === 'grouped_establishment_sector') {
    return filterParentChildDiagnosticGroups(
      buildEstablishmentSectorAggregates(rows),
      (parent) => parent.sectors,
      (parent, sectors, metrics) => ({ ...parent, sectors, ...metrics }),
      filter,
    ).flatMap((parent) => parent.sectors);
  }

  if (viewMode === 'grouped_hierarchy_group') {
    return filterFlatDiagnosticGroups(
      buildHierarchyGroupAggregates(rows, hierarchyGroups),
      filter,
    );
  }

  if (viewMode === 'grouped_sector_hierarchy_group') {
    return filterParentChildDiagnosticGroups(
      buildSectorWithHierarchyGroupAggregates(rows, hierarchyGroups),
      (parent) => parent.sectors,
      (parent, sectors, metrics) => ({ ...parent, sectors, ...metrics }),
      filter,
    ).flatMap((parent) => parent.sectors);
  }

  const flat = getFlatHierarchyGroupingConfig(viewMode);
  if (flat) {
    return filterFlatDiagnosticGroups(
      buildHierarchyTypeAggregates(
        rows,
        flat.hierarchyType,
        getFlatHierarchyMissingLabel(flat, typeLabels),
      ),
      filter,
    );
  }

  const establishmentHierarchy = getEstablishmentHierarchyGroupingConfig(viewMode);
  if (establishmentHierarchy) {
    return filterParentChildDiagnosticGroups(
      buildEstablishmentHierarchyAggregates(
        rows,
        establishmentHierarchy.hierarchyType,
        getEstablishmentHierarchyMissingLabel(establishmentHierarchy, typeLabels),
      ),
      (parent) => parent.hierarchyGroups,
      (parent, hierarchyGroups, metrics) => ({
        ...parent,
        hierarchyGroups,
        ...metrics,
      }),
      filter,
    ).flatMap((parent) => parent.hierarchyGroups);
  }

  const combined = getCombinedHierarchyGroupingConfig(viewMode);
  if (combined) {
    const nested = filterCombinedHierarchyDiagnosticGroups(
      buildCombinedHierarchyNestedAggregates(
        rows,
        getCombinedHierarchyLevelsForDisplay(viewMode, typeLabels) ??
          combined.levels,
      ),
      filter,
    );
    return flattenCombinedHierarchyNestedLeaves(nested);
  }

  return [];
}
