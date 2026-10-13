import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IRiskData } from 'core/interfaces/api/IRiskData';

const isValidRealProbability = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 1 &&
  value <= 6;

/** Espelha ProbabilityAfterColumn: residual 1 só é clicável com recs e prob. real válida. */
export const canSelectResidualProbability = (
  riskData: IRiskData,
  targetProbability: number,
): boolean => {
  if (!riskData?.recs?.length) return false;
  if (!isValidRealProbability(riskData.probability)) return false;
  return targetProbability < riskData.probability + 1;
};

export const isEligibleForBulkResidualOne = (riskData: IRiskData): boolean => {
  if (!riskData?.id) return false;
  if (riskData.endDate) return false;
  if (!isValidRealProbability(riskData.probability)) return false;
  if (riskData.probabilityAfter === 1) return false;
  if (!riskData.homogeneousGroupId) return false;
  return canSelectResidualProbability(riskData, 1);
};

export const getEligibleForBulkResidualOne = (
  riskDataList: IRiskData[] | undefined,
): IRiskData[] => (riskDataList ?? []).filter(isEligibleForBulkResidualOne);

const CHARACTERIZATION_TYPES = new Set<string>(
  [
    HomoTypeEnum.ENVIRONMENT,
    HomoTypeEnum.WORKSTATION,
    HomoTypeEnum.EQUIPMENT,
    HomoTypeEnum.ACTIVITIES,
  ].map(String),
);

export type BulkResidualOneGroupRef = {
  id: string;
  type?: HomoTypeEnum | string | null;
  workspaceIds?: string[] | null;
};

export type BulkResidualOneItem = {
  riskData: IRiskData;
  isCharacterization: boolean;
};

/**
 * Sem estabelecimento no cabeçalho, mantém o recorte legado (todos os elegíveis).
 * Com ele, só entram registros cujo GSE ou Elemento Caracterizado está vinculado
 * ao estabelecimento; grupo desconhecido fica de fora.
 */
export const getBulkResidualOneScope = (params: {
  riskDataList: IRiskData[] | undefined;
  groups: BulkResidualOneGroupRef[] | undefined;
  headerWorkspaceId?: string | null;
}): BulkResidualOneItem[] => {
  const groups = new Map(
    (params.groups ?? []).map((group) => [String(group.id), group]),
  );
  const groupOf = (riskData: IRiskData) =>
    groups.get(String(riskData.homogeneousGroupId).split('//')[0]);
  const isCharacterizationGroup = (group?: BulkResidualOneGroupRef) =>
    !!group?.type && CHARACTERIZATION_TYPES.has(String(group.type));

  const eligible = getEligibleForBulkResidualOne(params.riskDataList);

  if (!params.headerWorkspaceId) {
    return eligible.map((riskData) => ({
      riskData,
      isCharacterization: riskData.originKind === 'CHARACTERIZATION',
    }));
  }

  return eligible.flatMap((riskData) => {
    const group = groupOf(riskData);
    if (!group?.workspaceIds?.includes(params.headerWorkspaceId as string)) {
      return [];
    }
    return [{ riskData, isCharacterization: isCharacterizationGroup(group) }];
  });
};
