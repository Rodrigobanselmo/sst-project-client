import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

import type { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import type { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';

import type { HierarchyGroupForIndicators } from './buildParticipantGroupsForIndicators';

/**
 * Gera o PDF de gráficos no navegador com a mesma base da tela
 * (`buildFormChartsPdfDataset` + `PdfFormCharts`), evitando timeout em ambientes serverless.
 */
export async function exportFormChartsPdfInBrowser(params: {
  formApplication: FormApplicationReadModel;
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  selectedGroupingQuestionId: string | null;
  hierarchyGroups: HierarchyGroupForIndicators[];
}): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer');
  const { default: PdfFormCharts } = await import(
    'components/pdfs/documents/formsCharts/formsCharts.pdf'
  );
  const { buildFormChartsPdfDataset } = await import('./buildFormChartsPdfDataset');

  const dataset = buildFormChartsPdfDataset({
    formQuestionsAnswers: params.formQuestionsAnswers,
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
    isShareableLink: params.formApplication.isShareableLink,
    hierarchyGroups: params.hierarchyGroups,
  });

  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  const element = React.createElement(PdfFormCharts, {
    data: dataset,
    meta: {
      formName: params.formApplication.form.name,
      applicationName: params.formApplication.name,
      issuedAt,
    },
  });

  const blob = await pdf(
    element as React.ReactElement<DocumentProps>,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'relatorio-graficos.pdf';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
