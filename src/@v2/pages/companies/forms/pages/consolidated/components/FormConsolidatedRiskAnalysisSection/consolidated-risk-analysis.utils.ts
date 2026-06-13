import { ConsolidatedViewRiskAnalysisItemModel } from '@v2/models/enterprise/company-group/consolidated-view-risk-analysis.model';

export type ConsolidatedRiskGroupByMode =
  | 'none'
  | 'company'
  | 'application'
  | 'establishment'
  | 'sector'
  | 'riskFactor'
  | 'riskLevel'
  | 'status';

export const CONSOLIDATED_RISK_GROUP_BY_LABELS: Record<
  ConsolidatedRiskGroupByMode,
  string
> = {
  none: 'Por fator de risco (padrão)',
  company: 'Empresa',
  application: 'Aplicação',
  establishment: 'Estabelecimento',
  sector: 'Setor',
  riskFactor: 'Fator de risco',
  riskLevel: 'Nível de risco (NRO)',
  status: 'Status',
};

const NRO_ORDER: Record<string, number> = {
  'Muito Alto': 5,
  Alto: 4,
  Moderado: 3,
  Baixo: 2,
  'Muito Baixo': 1,
  'Não informado': 0,
};

export function getConsolidatedRiskGroupKey(
  item: ConsolidatedViewRiskAnalysisItemModel,
  groupBy: ConsolidatedRiskGroupByMode,
): string {
  switch (groupBy) {
    case 'company':
      return item.companyName;
    case 'application':
      return item.applicationName;
    case 'establishment':
      return item.establishmentName || '—';
    case 'sector':
      return item.sectorName;
    case 'riskFactor':
      return item.riskFactor;
    case 'riskLevel':
      return item.occupationalRisk;
    case 'status':
      return item.status || 'Sem análise registrada';
    default:
      return '';
  }
}

export function filterConsolidatedRiskItems(
  items: ConsolidatedViewRiskAnalysisItemModel[],
  params: {
    search: string;
    companyFilter: string;
    applicationFilter: string;
    riskLevelFilter: string;
    statusFilter: string;
  },
) {
  const normalizedSearch = params.search.trim().toLowerCase();

  return items.filter((item) => {
    if (params.companyFilter && item.companyId !== params.companyFilter) {
      return false;
    }
    if (
      params.applicationFilter &&
      item.formApplicationId !== params.applicationFilter
    ) {
      return false;
    }
    if (
      params.riskLevelFilter &&
      item.occupationalRisk !== params.riskLevelFilter
    ) {
      return false;
    }
    if (
      params.statusFilter &&
      (item.status || 'Sem análise registrada') !== params.statusFilter
    ) {
      return false;
    }

    if (!normalizedSearch) return true;

    const haystack = [
      item.companyName,
      item.applicationName,
      item.establishmentName,
      item.sectorName,
      item.riskFactor,
      item.riskCategory,
      item.occupationalRisk,
      item.probabilityLabel,
      item.severityLabel,
      item.status,
      ...(item.aiAnalysis?.fontesGeradoras ?? []).map((source) => source.nome),
      ...(item.aiAnalysis?.medidasEngenhariaRecomendadas ?? []).map(
        (rec) => rec.nome,
      ),
      ...(item.aiAnalysis?.medidasAdministrativasRecomendadas ?? []).map(
        (rec) => rec.nome,
      ),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

export type ConsolidatedRiskViewSection = {
  key: string;
  label: string;
  items: ConsolidatedViewRiskAnalysisItemModel[];
};

export function buildConsolidatedRiskViewSections(
  items: ConsolidatedViewRiskAnalysisItemModel[],
  groupBy: ConsolidatedRiskGroupByMode,
): ConsolidatedRiskViewSection[] {
  if (groupBy === 'none' || groupBy === 'riskFactor') {
    return [{ key: 'all', label: '', items }];
  }

  const map = new Map<string, ConsolidatedViewRiskAnalysisItemModel[]>();
  items.forEach((item) => {
    const key = getConsolidatedRiskGroupKey(item, groupBy);
    const current = map.get(key) ?? [];
    current.push(item);
    map.set(key, current);
  });

  return Array.from(map.entries())
    .sort(([left], [right]) => left.localeCompare(right, 'pt-BR'))
    .map(([key, sectionItems]) => ({ key, label: key, items: sectionItems }));
}

export type ConsolidatedRiskFactorGroup = {
  riskFactorId: string;
  riskFactor: string;
  riskType: string;
  riskCategory: string | null;
  entries: ConsolidatedViewRiskAnalysisItemModel[];
  stats: {
    totalEntries: number;
    totalCompanies: number;
    totalSectors: number;
    totalAiAnalyses: number;
    highestNro: string;
    nroDistribution: Array<{ label: string; count: number }>;
  };
};

export function buildConsolidatedRiskFactorGroups(
  items: ConsolidatedViewRiskAnalysisItemModel[],
): ConsolidatedRiskFactorGroup[] {
  const map = new Map<string, ConsolidatedViewRiskAnalysisItemModel[]>();

  items.forEach((item) => {
    const current = map.get(item.riskFactorId) ?? [];
    current.push(item);
    map.set(item.riskFactorId, current);
  });

  return Array.from(map.entries())
    .map(([riskFactorId, entries]) => {
      const sample = entries[0];
      const companies = new Set(entries.map((entry) => entry.companyId));
      const sectors = new Set(
        entries.map(
          (entry) => `${entry.formApplicationId}:${entry.hierarchyId}`,
        ),
      );
      const nroCounts = new Map<string, number>();

      entries.forEach((entry) => {
        nroCounts.set(
          entry.occupationalRisk,
          (nroCounts.get(entry.occupationalRisk) ?? 0) + 1,
        );
      });

      const highestNro =
        Array.from(nroCounts.keys()).sort(
          (left, right) => (NRO_ORDER[right] ?? 0) - (NRO_ORDER[left] ?? 0),
        )[0] ?? 'Não informado';

      return {
        riskFactorId,
        riskFactor: sample.riskFactor,
        riskType: sample.riskType,
        riskCategory: sample.riskCategory,
        entries: entries.sort((left, right) => {
          const companyCompare = left.companyName.localeCompare(
            right.companyName,
            'pt-BR',
          );
          if (companyCompare !== 0) return companyCompare;
          return left.sectorName.localeCompare(right.sectorName, 'pt-BR');
        }),
        stats: {
          totalEntries: entries.length,
          totalCompanies: companies.size,
          totalSectors: sectors.size,
          totalAiAnalyses: entries.filter((entry) => entry.riskAnalysisId).length,
          highestNro,
          nroDistribution: Array.from(nroCounts.entries())
            .sort(
              ([left], [right]) =>
                (NRO_ORDER[right] ?? 0) - (NRO_ORDER[left] ?? 0),
            )
            .map(([label, count]) => ({ label, count })),
        },
      };
    })
    .sort((left, right) =>
      left.riskFactor.localeCompare(right.riskFactor, 'pt-BR'),
    );
}

export function toNarrativeGroupingMode(
  groupBy: ConsolidatedRiskGroupByMode,
): import('@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-risk-narrative.types').ConsolidatedRiskNarrativeGroupingMode {
  if (groupBy === 'none') return 'overview';
  return groupBy;
}
