/** Transport/application identity only: no new database columns or per-workspace RFD copies. */
export const AI_RISK_OCCURRENCE_HIERARCHY_TYPES = [
  'DIRECTORY',
  'MANAGEMENT',
  'SECTOR',
  'SUB_SECTOR',
  'OFFICE',
  'SUB_OFFICE',
] as const;
export type AiRiskOccurrenceIdentity = Readonly<
  {
    companyId: string;
    workspaceId: string;
    riskGroupId: string;
    riskId: string;
    riskFactorDataId: string;
  } & (
    | {
        ownerType: 'GSE' | 'CHARACTERIZATION';
        ownerId: string;
        hierarchyId?: never;
        hierarchyType?: never;
      }
    | {
        ownerType: 'HIERARCHY';
        ownerId: string;
        hierarchyId: string;
        hierarchyType: (typeof AI_RISK_OCCURRENCE_HIERARCHY_TYPES)[number];
      }
  )
>;

export function createAiRiskOccurrenceIdentity(
  value: unknown,
): AiRiskOccurrenceIdentity {
  if (!value || typeof value !== 'object') throw new Error('INVALID_IDENTITY');
  const row = value as Record<string, unknown>;
  const required = [
    'companyId',
    'workspaceId',
    'riskGroupId',
    'riskId',
    'riskFactorDataId',
    'ownerId',
  ];
  if (
    required.some(
      (key) =>
        typeof row[key] !== 'string' ||
        !String(row[key]).trim() ||
        row[key] !== String(row[key]).trim() ||
        String(row[key]).includes('//'),
    )
  )
    throw new Error('INVALID_IDENTITY');
  if (!['GSE', 'CHARACTERIZATION', 'HIERARCHY'].includes(String(row.ownerType)))
    throw new Error('INVALID_OWNER');
  if (row.ownerType === 'HIERARCHY') {
    if (
      row.hierarchyId !== row.ownerId ||
      !(AI_RISK_OCCURRENCE_HIERARCHY_TYPES as readonly unknown[]).includes(
        row.hierarchyType,
      )
    )
      throw new Error('INVALID_HIERARCHY');
  } else if (row.hierarchyId != null || row.hierarchyType != null)
    throw new Error('INVALID_HIERARCHY');
  return Object.freeze({
    companyId: row.companyId,
    workspaceId: row.workspaceId,
    riskGroupId: row.riskGroupId,
    riskId: row.riskId,
    riskFactorDataId: row.riskFactorDataId,
    ownerType: row.ownerType,
    ownerId: row.ownerId,
    ...(row.ownerType === 'HIERARCHY'
      ? { hierarchyId: row.hierarchyId, hierarchyType: row.hierarchyType }
      : {}),
  }) as AiRiskOccurrenceIdentity;
}

/** Persistent identity excludes the operational establishment. */
export function aiRiskOccurrenceRecordKey(
  value: AiRiskOccurrenceIdentity,
): string {
  const id = createAiRiskOccurrenceIdentity(value);
  return JSON.stringify([
    'risk-factor-data',
    1,
    id.companyId,
    id.riskGroupId,
    id.riskId,
    id.riskFactorDataId,
  ]);
}
/** Full analysis/session identity includes both owner and establishment. Keep client contract in sync. */
export function aiRiskOccurrenceContextKey(
  value: AiRiskOccurrenceIdentity,
): string {
  const id = createAiRiskOccurrenceIdentity(value);
  return JSON.stringify([
    'risk-by-occurrence-ai',
    1,
    id.companyId,
    id.workspaceId,
    id.riskGroupId,
    id.riskId,
    id.riskFactorDataId,
    id.ownerType,
    id.ownerId,
    id.hierarchyId || null,
    id.hierarchyType || null,
  ]);
}
