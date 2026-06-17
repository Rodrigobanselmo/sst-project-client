import {
  ConsolidatedViewRiskAnalysisItemModel,
  ConsolidatedViewRiskAnalysisModel,
} from '@v2/models/enterprise/company-group/consolidated-view-risk-analysis.model';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import type {
  RiskAnalysisPdfDataset,
  RiskAnalysisPdfEstablishmentBlock,
  RiskAnalysisPdfFactor,
  RiskAnalysisPdfSector,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildRiskAnalysisPdfDataset';
import { buildSectorRiskClassificationPdf } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/riskAnalysisMatrixLabels';

import {
  buildConsolidatedRiskFactorGroups,
  buildConsolidatedRiskViewSections,
  CONSOLIDATED_RISK_GROUP_BY_LABELS,
  ConsolidatedRiskGroupByMode,
} from '../components/FormConsolidatedRiskAnalysisSection/consolidated-risk-analysis.utils';

function mapConsolidatedItemToSector(
  item: ConsolidatedViewRiskAnalysisItemModel,
): RiskAnalysisPdfSector {
  const classification = buildSectorRiskClassificationPdf(
    item.severity ?? 0,
    item.probability ?? 0,
  );
  const aiAnalysis = item.aiAnalysis;

  const traceabilityParts = [
    item.companyName,
    item.applicationName,
    item.establishmentName,
    `Status: ${item.status || 'Sem análise registrada'}`,
  ].filter(Boolean);

  return {
    sectorTypeLabel:
      hierarchyTypeTranslation[item.hierarchyType as HierarchyTypeEnum] ??
      'Setor',
    sectorName: item.sectorName,
    classification,
    fontesGeradoras: (aiAnalysis?.fontesGeradoras ?? []).map((source) => ({
      nome: source.nome,
      ...(source.justificativa?.trim()
        ? { justificativa: source.justificativa.trim() }
        : {}),
    })),
    medidasEngenharia: (aiAnalysis?.medidasEngenhariaRecomendadas ?? []).map(
      (measure) => ({
        nome: measure.nome,
        ...(measure.justificativa?.trim()
          ? { justificativa: measure.justificativa.trim() }
          : {}),
      }),
    ),
    medidasAdministrativas: (
      aiAnalysis?.medidasAdministrativasRecomendadas ?? []
    ).map((measure) => ({
      nome: measure.nome,
      ...(measure.justificativa?.trim()
        ? { justificativa: measure.justificativa.trim() }
        : {}),
    })),
    ...(aiAnalysis?.confidence != null
      ? { aiConfidencePercent: Math.round(aiAnalysis.confidence * 100) }
      : {}),
    traceabilityLine: traceabilityParts.join(' · '),
  };
}

function buildFactorsFromConsolidatedItems(
  items: ConsolidatedViewRiskAnalysisItemModel[],
): RiskAnalysisPdfFactor[] {
  return buildConsolidatedRiskFactorGroups(items).map((group) => {
    const establishmentMap = new Map<
      string,
      ConsolidatedViewRiskAnalysisItemModel[]
    >();

    group.entries.forEach((entry) => {
      const establishmentKey = `${entry.companyName} — ${
        entry.establishmentName || entry.applicationName
      }`;
      const current = establishmentMap.get(establishmentKey) ?? [];
      current.push(entry);
      establishmentMap.set(establishmentKey, current);
    });

    const establishmentBlocks: RiskAnalysisPdfEstablishmentBlock[] = Array.from(
      establishmentMap.entries(),
    ).map(([establishment, entries]) => ({
      establishment,
      sectors: entries.map(mapConsolidatedItemToSector),
    }));

    return {
      riskId: group.riskFactorId,
      name: group.riskFactor,
      typeLabel: group.riskType,
      establishmentBlocks,
    };
  });
}

export function buildConsolidatedRiskRecorteLabel(params: {
  groupBy: ConsolidatedRiskGroupByMode;
  companyFilter: string;
  applicationFilter: string;
  riskLevelFilter: string;
  statusFilter: string;
  search: string;
  companyLabel?: string | null;
  applicationLabel?: string | null;
}): string {
  const parts = ['visão consolidada read-only'];

  if (params.groupBy !== 'none') {
    parts.push(`organizar por: ${CONSOLIDATED_RISK_GROUP_BY_LABELS[params.groupBy]}`);
  }

  if (params.companyFilter) {
    parts.push(`empresa: ${params.companyLabel ?? params.companyFilter}`);
  }

  if (params.applicationFilter) {
    parts.push(
      `aplicação: ${params.applicationLabel ?? params.applicationFilter}`,
    );
  }

  if (params.riskLevelFilter) {
    parts.push(`nível de risco: ${params.riskLevelFilter}`);
  }

  if (params.statusFilter) {
    parts.push(`status: ${params.statusFilter}`);
  }

  if (params.search.trim()) {
    parts.push(`busca: "${params.search.trim()}"`);
  }

  return parts.join(' · ');
}

export function buildConsolidatedRiskAnalysisPdfDataset(params: {
  riskAnalysisData: ConsolidatedViewRiskAnalysisModel;
  filteredItems: ConsolidatedViewRiskAnalysisItemModel[];
  groupBy: ConsolidatedRiskGroupByMode;
  recorteLabel: string;
  narrativeDiagnosticMarkdown?: string | null;
}): RiskAnalysisPdfDataset {
  const viewSections = buildConsolidatedRiskViewSections(
    params.filteredItems,
    params.groupBy,
  ).map((section) => ({
    label: section.label,
    itemCount: section.items.length,
    factors: buildFactorsFromConsolidatedItems(section.items),
  }));

  const factors = viewSections.flatMap((section) => section.factors);
  const { summary } = params.riskAnalysisData;
  const warningsCount = params.riskAnalysisData.warnings?.length ?? 0;

  const consolidatedSummary = [
    `${summary.totalApplications} aplicações`,
    `${summary.totalCompanies} empresas`,
    `${params.filteredItems.length} registros consolidados de leitura`,
    `${summary.totalRiskFactors} fatores de risco`,
    `${summary.totalSectors ?? 0} setores/unidades`,
    `${summary.totalRiskAnalyses} análises IA já registradas`,
    ...(warningsCount > 0 ? [`${warningsCount} avisos`] : []),
  ];

  return {
    grouping: {
      active: true,
      questionLabel: params.recorteLabel,
    },
    isConsolidatedView: true,
    consolidatedSummary,
    narrativeSectionTitle: 'Diagnóstico narrativo consolidado com IA',
    narrativeDiagnosticMarkdown: params.narrativeDiagnosticMarkdown,
    viewSections,
    factors,
  };
}
