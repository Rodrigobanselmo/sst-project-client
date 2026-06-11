import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';

export enum PopulationPriorityEnum {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export function computePopulationPriorityMap(
  rows: ActionPlanBrowseResultModel[],
): Record<string, PopulationPriorityEnum | null> {
  const byLevel = new Map<number, { id: string; count: number }[]>();

  rows.forEach((row) => {
    const count = row.exposedWorkersCount ?? 0;
    if (count <= 0) return;

    const level = row.ocupationalRisk ?? 0;
    const items = byLevel.get(level) ?? [];
    items.push({ id: row.id, count });
    byLevel.set(level, items);
  });

  const priorityMap: Record<string, PopulationPriorityEnum | null> = {};

  byLevel.forEach((items) => {
    if (items.length <= 1) {
      if (items[0]?.count > 0) {
        priorityMap[items[0].id] = PopulationPriorityEnum.HIGH;
      }
      return;
    }

    const sortedCounts = [...new Set(items.map((item) => item.count))].sort(
      (a, b) => b - a,
    );
    const highThreshold = sortedCounts[0];
    const mediumThreshold =
      sortedCounts.length > 2
        ? sortedCounts[Math.ceil(sortedCounts.length / 2) - 1]
        : sortedCounts[sortedCounts.length - 1];

    items.forEach((item) => {
      if (item.count >= highThreshold) {
        priorityMap[item.id] = PopulationPriorityEnum.HIGH;
      } else if (item.count >= mediumThreshold) {
        priorityMap[item.id] = PopulationPriorityEnum.MEDIUM;
      } else {
        priorityMap[item.id] = PopulationPriorityEnum.LOW;
      }
    });
  });

  return priorityMap;
}
