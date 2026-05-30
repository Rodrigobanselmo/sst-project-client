export function buildInventoryStatusKey(riskId: string, hierarchyId: string) {
  return `${riskId}:${hierarchyId}`;
}
