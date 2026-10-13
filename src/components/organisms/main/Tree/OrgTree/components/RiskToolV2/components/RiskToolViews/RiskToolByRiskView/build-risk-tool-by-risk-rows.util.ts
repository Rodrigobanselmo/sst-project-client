import { ViewsDataEnum as V1ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

/** Mesmo recorte da visualização por risco V1 (`RiskToolRiskView/Gho`). */
const CHARACTERIZATION_TYPES: HomoTypeEnum[] = [
  HomoTypeEnum.WORKSTATION,
  HomoTypeEnum.EQUIPMENT,
  HomoTypeEnum.ACTIVITIES,
];

export type RiskToolByRiskRow = {
  /** `riskData.id`: um GSE pode ter registro ativo e encerrados. */
  rowId: string;
  gho: IGho;
  ghoName: string;
  riskData: IRiskData;
  isHistorical: boolean;
  readOnly: boolean;
};

export type RiskToolByRiskRows = {
  active: RiskToolByRiskRow[];
  historical: RiskToolByRiskRow[];
};

/** Mesmo critério de nome da visualização por risco V1 (`SideRow`). */
export function getRiskToolByRiskGhoName(gho: Pick<IGho, 'name' | 'type' | 'description'>) {
  if (!gho.type) return gho.name || '';
  return String(gho.description || gho.name || '').split('(//)')[0];
}

/** `viewData` em valores da V1 (`state.riskAdd.viewData`). */
export function isGhoInRiskToolByRiskView(
  gho: Pick<IGho, 'type'>,
  viewData: string,
): boolean {
  if (viewData === V1ViewsDataEnum.GSE) return !gho.type;
  if (viewData === V1ViewsDataEnum.ENVIRONMENT) {
    return gho.type === HomoTypeEnum.ENVIRONMENT;
  }
  if (viewData === V1ViewsDataEnum.CHARACTERIZATION) {
    return !!gho.type && CHARACTERIZATION_TYPES.includes(gho.type);
  }
  return false;
}

/** Com estabelecimento selecionado, só GSEs vinculados a ele (ou sem vínculo declarado). */
export function isGhoInSelectedWorkspace(
  gho: Pick<IGho, 'workspaceIds'>,
  workspaceId?: string | null,
): boolean {
  if (!workspaceId) return true;
  const ids = Array.isArray(gho.workspaceIds) ? gho.workspaceIds : [];
  if (!ids.length) return true;
  return ids.includes(workspaceId);
}

export function buildRiskToolByRiskRows(params: {
  ghos: IGho[] | null | undefined;
  riskDataList: IRiskData[] | null | undefined;
  viewData: string;
  workspaceId?: string | null;
}): RiskToolByRiskRows {
  const ghoById = new Map<string, IGho>();
  (params.ghos ?? []).forEach((gho) => {
    if (!gho?.id) return;
    if (!isGhoInRiskToolByRiskView(gho, params.viewData)) return;
    if (!isGhoInSelectedWorkspace(gho, params.workspaceId)) return;
    ghoById.set(gho.id, gho);
  });

  const seen = new Set<string>();
  const rows: RiskToolByRiskRow[] = [];
  (params.riskDataList ?? []).forEach((riskData) => {
    if (!riskData?.id || seen.has(riskData.id)) return;
    const gho = riskData.homogeneousGroupId
      ? ghoById.get(riskData.homogeneousGroupId)
      : undefined;
    if (!gho) return;
    seen.add(riskData.id);
    const isHistorical = !!riskData.endDate;
    rows.push({
      rowId: riskData.id,
      gho,
      ghoName: getRiskToolByRiskGhoName(gho),
      riskData,
      isHistorical,
      readOnly: isHistorical || riskData.canEditOnThisEntity === false,
    });
  });

  const byName = (a: RiskToolByRiskRow, b: RiskToolByRiskRow) =>
    a.ghoName.localeCompare(b.ghoName, 'pt-BR', { sensitivity: 'base' });
  const byEndDateDesc = (a: RiskToolByRiskRow, b: RiskToolByRiskRow) =>
    new Date(b.riskData.endDate as Date).getTime() -
      new Date(a.riskData.endDate as Date).getTime() || byName(a, b);

  return {
    active: rows.filter((r) => !r.isHistorical).sort(byName),
    historical: rows.filter((r) => r.isHistorical).sort(byEndDateDesc),
  };
}

export function filterRiskToolByRiskRows(
  rows: RiskToolByRiskRow[],
  search: string,
): RiskToolByRiskRow[] {
  const term = stringNormalize(search || '').trim();
  if (!term) return rows;
  return rows.filter((row) => stringNormalize(row.ghoName).includes(term));
}

export function riskToolByRiskRowIds(rows: RiskToolByRiskRows): string[] {
  return [...rows.active, ...rows.historical].map((row) => row.rowId);
}
