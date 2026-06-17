import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

import type { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import {
  buildConsolidatedParticipantGroupingForPdf,
  ConsolidatedAnalyticsGroupingMode,
} from '@v2/models/enterprise/company-group/consolidated-view-analytics.helpers';
import { readConsolidatedIndicatorsNarrativeDiagnostic } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-narrative.service';
import { consolidatedNarrativeMatchesViewMode } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-narrative.scope';
import { ConsolidatedIndicatorsNarrativeScope } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-narrative.types';
import type { FormChartType } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/form-chart-type.types';

export async function exportConsolidatedIndicatorsPdfInBrowser(
  params: {
    companyGroupId: number;
    applicationIds: string[];
    formName: string;
    businessGroupName: string;
    formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
    groupingMode: ConsolidatedAnalyticsGroupingMode;
    groupingLabel: string;
    narrativeScope: ConsolidatedIndicatorsNarrativeScope;
    showOnlyGroupIndicators: boolean;
    executiveDistributionChartType: FormChartType;
  },
  onProgress?: (message: string) => void,
): Promise<void> {
  const yieldToUI = () => new Promise((resolve) => setTimeout(resolve, 0));

  onProgress?.('Carregando bibliotecas...');
  await yieldToUI();

  const { pdf } = await import('@react-pdf/renderer');
  const { default: PdfFormIndicators } = await import(
    'components/pdfs/documents/formsIndicators/formsIndicators.pdf'
  );
  const { buildIndicatorsPdfDataset } = await import(
    '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildIndicatorsPdfDataset'
  );

  onProgress?.('Processando dados dos indicadores...');
  await yieldToUI();

  const participantGroupingOverride = buildConsolidatedParticipantGroupingForPdf({
    formQuestionsAnswers: params.formQuestionsAnswers,
    groupingMode: params.groupingMode,
    groupingLabel: params.groupingLabel,
  });

  onProgress?.('Carregando diagnóstico narrativo salvo...');
  await yieldToUI();

  const narrativeDiagnostic = await readConsolidatedIndicatorsNarrativeDiagnostic({
    companyGroupId: params.companyGroupId,
    applicationIds: params.applicationIds,
    scope: params.narrativeScope,
  });

  const narrativeDiagnosticMarkdown =
    narrativeDiagnostic?.status === FormAiAnalysisStatusEnum.DONE &&
    consolidatedNarrativeMatchesViewMode(
      narrativeDiagnostic,
      params.narrativeScope.showOnlyGroupIndicators,
    )
      ? narrativeDiagnostic.contentMarkdown
      : null;

  const dataset = buildIndicatorsPdfDataset({
    formQuestionsAnswers: params.formQuestionsAnswers,
    selectedGroupingQuestionId: null,
    showOnlyGroupIndicators: params.showOnlyGroupIndicators,
    executiveDistributionChartType: params.executiveDistributionChartType,
    narrativeDiagnosticMarkdown,
    isShareableLink: false,
    participantGroupingOverride,
  });

  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  onProgress?.('Gerando estrutura do PDF...');
  await yieldToUI();

  const element = React.createElement(PdfFormIndicators, {
    data: dataset,
    meta: {
      formName: params.formName,
      applicationName: `${params.businessGroupName} — visão consolidada`,
      issuedAt,
    },
  });

  onProgress?.('Renderizando PDF (isso pode demorar)...');
  await yieldToUI();

  const blob = await pdf(element as React.ReactElement<DocumentProps>).toBlob();

  onProgress?.('Finalizando download...');
  await yieldToUI();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'relatorio-indicadores-consolidado.pdf';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
