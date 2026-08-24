import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';

import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { findCatalogItemByNormalizedName } from '../risk-catalog-dnd/find-risk-catalog-item-match.util';

export type RiskCatalogBulkAddKind =
  | 'generateSource'
  | 'adm'
  | 'eng'
  | 'rec';

type CatalogNamedItem = {
  id?: string | number;
  name?: string | null;
  medName?: string | null;
  recName?: string | null;
  recType?: RecTypeEnum | string | null;
  status?: string | null;
};

export type ClassifiedBulkNames = {
  existingIds: string[];
  existingItems: CatalogNamedItem[];
  namesToCreate: string[];
};

export function classifyBulkNamesAgainstCatalog(
  names: string[],
  catalog: CatalogNamedItem[],
  getName: (item: CatalogNamedItem) => string | null | undefined,
): ClassifiedBulkNames {
  const existingIds: string[] = [];
  const existingItems: CatalogNamedItem[] = [];
  const namesToCreate: string[] = [];
  const usedIds = new Set<string>();

  for (const name of names) {
    const match = findCatalogItemByNormalizedName(catalog, name, getName);
    const matchId =
      match?.id == null || match.id === '' ? '' : String(match.id);

    if (match && matchId && !usedIds.has(matchId)) {
      usedIds.add(matchId);
      existingIds.push(matchId);
      existingItems.push(match);
      continue;
    }

    namesToCreate.push(name);
  }

  return { existingIds, existingItems, namesToCreate };
}

export function getBulkCatalogNameGetter(
  kind: RiskCatalogBulkAddKind,
): (item: CatalogNamedItem) => string | null | undefined {
  if (kind === 'generateSource') return (item) => item.name;
  if (kind === 'rec') return (item) => item.recName;
  return (item) => item.medName;
}

/**
 * IDs existentes vão nos campos de vínculo (mesclados depois por
 * onHandleSelectSave). Nomes novos vão em *AddOnly.
 */
export function buildRiskCatalogBulkAddPayload(params: {
  kind: RiskCatalogBulkAddKind;
  existingIds: string[];
  namesToCreate: string[];
  companyId: string;
  recType?: RecTypeEnum;
}): Partial<IUpsertRiskData> | null {
  const { kind, existingIds, namesToCreate, companyId, recType } = params;
  const payload: Partial<IUpsertRiskData> = {};
  let hasWork = false;

  if (kind === 'generateSource') {
    if (existingIds.length) {
      payload.generateSources = existingIds;
      hasWork = true;
    }
    if (namesToCreate.length) {
      payload.generateSourcesAddOnly = namesToCreate.map((name) => ({
        name,
        companyId,
      }));
      hasWork = true;
    }
  }

  if (kind === 'adm') {
    if (existingIds.length) {
      payload.adms = existingIds;
      hasWork = true;
    }
    if (namesToCreate.length) {
      payload.admsAddOnly = namesToCreate.map((medName) => ({
        medName,
        medType: MedTypeEnum.ADM,
        companyId,
      }));
      hasWork = true;
    }
  }

  if (kind === 'eng') {
    if (existingIds.length) {
      payload.engs = existingIds.map((recMedId) => ({ recMedId }));
      hasWork = true;
    }
    if (namesToCreate.length) {
      payload.engsAddOnly = namesToCreate.map((medName) => ({
        medName,
        medType: MedTypeEnum.ENG,
        companyId,
      }));
      hasWork = true;
    }
  }

  if (kind === 'rec') {
    if (existingIds.length) {
      payload.recs = existingIds;
      hasWork = true;
    }
    if (namesToCreate.length) {
      payload.recAddOnly = namesToCreate.map((recName) => ({
        recName,
        recType: recType || RecTypeEnum.ADM,
        companyId,
      }));
      hasWork = true;
    }
  }

  return hasWork ? payload : null;
}

export const RISK_CATALOG_BULK_ADD_TITLE: Record<
  RiskCatalogBulkAddKind,
  string
> = {
  generateSource: 'Cadastrar várias fontes geradoras',
  adm: 'Cadastrar várias medidas administrativas',
  eng: 'Cadastrar várias medidas de engenharia (EPC/ENG)',
  rec: 'Cadastrar várias recomendações',
};

export const RISK_CATALOG_BULK_ADD_PLACEHOLDER: Record<
  RiskCatalogBulkAddKind,
  string
> = {
  generateSource:
    'Fonte geradora 1\nFonte geradora 2\nFonte geradora 3',
  adm: 'Medida administrativa 1\nMedida administrativa 2',
  eng: 'Medida de engenharia 1\nMedida de engenharia 2',
  rec: 'Recomendação 1\nRecomendação 2',
};

export const RISK_CATALOG_BULK_ADD_TOOLTIP: Record<
  RiskCatalogBulkAddKind,
  string
> = {
  generateSource: 'Cadastrar várias fontes geradoras',
  adm: 'Cadastrar várias medidas administrativas',
  eng: 'Cadastrar várias medidas de engenharia',
  rec: 'Cadastrar várias recomendações',
};

export const RISK_CATALOG_BULK_ADD_SUCCESS_LABEL: Record<
  RiskCatalogBulkAddKind,
  { one: string; many: string }
> = {
  generateSource: {
    one: 'fonte geradora',
    many: 'fontes geradoras',
  },
  adm: {
    one: 'medida administrativa',
    many: 'medidas administrativas',
  },
  eng: {
    one: 'medida de engenharia',
    many: 'medidas de engenharia',
  },
  rec: {
    one: 'recomendação',
    many: 'recomendações',
  },
};
