import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

import type { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import type { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { browseFormParticipants } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.service';
import { browseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/service/browse-form-questions-answers-risks.service';
import { readFrpsExplainabilityTechnicalReport } from '@v2/services/forms/form-questions-answers-analysis/frps-explainability-technical-report/frps-explainability-technical-report.service';

import { buildParticipantGroupsForIndicators } from './buildParticipantGroupsForIndicators';
import { buildParticipantGroupingEnrichmentContext } from './buildParticipantGroupingEnrichmentContext';
import { buildRiskAnalysisViewContext } from './buildRiskAnalysisViewContext';
import { buildFrpsTechnicalReportFilename } from './sanitizeFrpsTechnicalReportFilename';

/**
 * Gera o Relatório Técnico de Fontes Geradoras e Medidas de Prevenção.
 * Consome somente o endpoint batch de relatório (sem resolve/alias no client).
 */
export async function exportFrpsExplainabilityTechnicalReportPdfInBrowser(
  params: {
    formApplication: FormApplicationReadModel;
    accessCompanyId: string;
    formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
    selectedGroupingQuestionId: string | null;
    selectedGroupingLabel?: string | null;
    hierarchyGroups: Array<{
      id: string;
      name: string;
      hierarchyIds: string[];
    }>;
    visibleParticipantGroupIds?: string[];
  },
  onProgress?: (message: string) => void,
): Promise<void> {
  const yieldToUI = () => new Promise((resolve) => setTimeout(resolve, 0));

  onProgress?.('Gerando relatório técnico...');
  await yieldToUI();

  const { pdf } = await import('@react-pdf/renderer');
  const { default: FrpsExplainabilityTechnicalReportPdf } = await import(
    'components/pdfs/documents/frpsExplainabilityTechnicalReport/frpsExplainabilityTechnicalReport.pdf'
  );

  onProgress?.('Carregando recorte da análise...');
  await yieldToUI();

  const [risksData, formParticipants] = await Promise.all([
    browseFormQuestionsAnswersRisks({
      companyId: params.accessCompanyId,
      applicationId: params.formApplication.id,
    }),
    browseFormParticipants({
      companyId: params.accessCompanyId,
      applicationId: params.formApplication.id,
      pagination: { page: 1, limit: 10_000 },
    }),
  ]);

  if (!risksData) {
    throw new Error('Não foi possível carregar os dados do recorte.');
  }

  const participantGroups = buildParticipantGroupsForIndicators({
    formQuestionsAnswers: params.formQuestionsAnswers,
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
    hierarchyGroups: params.hierarchyGroups,
    groupingEnrichment: buildParticipantGroupingEnrichmentContext({
      entityMap: risksData.entityMap,
      participants: formParticipants?.results ?? [],
      applicationWorkspaces: params.formApplication.participants.workspaces,
    }),
  });

  const visibleParticipantGroups = params.selectedGroupingQuestionId
    ? params.visibleParticipantGroupIds
      ? participantGroups.filter((g) =>
          params.visibleParticipantGroupIds!.includes(g.id),
        )
      : participantGroups
    : participantGroups;

  const { allowedEntityIds } = buildRiskAnalysisViewContext({
    formQuestionsAnswers: params.formQuestionsAnswers,
    visibleParticipantGroups,
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
    entityMap: risksData.entityMap,
  });

  // null = sem filtro de agrupamento (mesmo comportamento da Análise de Riscos).
  const hierarchyIds =
    allowedEntityIds == null ? undefined : [...allowedEntityIds];
  const recorteLabel = params.selectedGroupingQuestionId
    ? params.selectedGroupingLabel || 'Recorte por agrupamento'
    : 'Todos os setores do formulário';

  onProgress?.('Carregando fundamentação conceitual...');
  await yieldToUI();

  const report = await readFrpsExplainabilityTechnicalReport({
    companyId: params.accessCompanyId,
    applicationId: params.formApplication.id,
    hierarchyIds:
      hierarchyIds && hierarchyIds.length > 0 ? hierarchyIds : undefined,
    groupingLabel: params.selectedGroupingLabel ?? null,
    recorteLabel,
  });

  onProgress?.('Montando PDF...');
  await yieldToUI();

  const element = React.createElement(FrpsExplainabilityTechnicalReportPdf, {
    data: report,
  });
  const blob = await pdf(element as React.ReactElement<DocumentProps>).toBlob();

  onProgress?.('Finalizando download...');
  await yieldToUI();

  const filename = buildFrpsTechnicalReportFilename({
    applicationName: params.formApplication.name,
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
