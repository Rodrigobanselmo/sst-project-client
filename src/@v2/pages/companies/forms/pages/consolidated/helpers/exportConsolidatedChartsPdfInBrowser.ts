import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

import type { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import {
  buildConsolidatedParticipantGroupingForPdf,
  ConsolidatedAnalyticsGroupingMode,
} from '@v2/models/enterprise/company-group/consolidated-view-analytics.helpers';
import type { FormChartType } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/form-chart-type.types';

export async function exportConsolidatedChartsPdfInBrowser(params: {
  formName: string;
  businessGroupName: string;
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  groupingMode: ConsolidatedAnalyticsGroupingMode;
  groupingLabel: string;
  chartType: FormChartType;
}): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer');
  const { default: PdfFormCharts } = await import(
    'components/pdfs/documents/formsCharts/formsCharts.pdf'
  );
  const { buildFormChartsPdfDataset } = await import(
    '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildFormChartsPdfDataset'
  );

  const participantGroupingOverride = buildConsolidatedParticipantGroupingForPdf({
    formQuestionsAnswers: params.formQuestionsAnswers,
    groupingMode: params.groupingMode,
    groupingLabel: params.groupingLabel,
  });

  const dataset = buildFormChartsPdfDataset({
    formQuestionsAnswers: params.formQuestionsAnswers,
    selectedGroupingQuestionId: null,
    chartType: params.chartType,
    isShareableLink: false,
    participantGroupingOverride,
  });

  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  const element = React.createElement(PdfFormCharts, {
    data: dataset,
    meta: {
      formName: params.formName,
      applicationName: `${params.businessGroupName} — visão consolidada`,
      issuedAt,
    },
  });

  const blob = await pdf(
    element as React.ReactElement<DocumentProps>,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'relatorio-graficos-consolidado.pdf';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
