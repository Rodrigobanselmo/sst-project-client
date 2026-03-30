import React from 'react';
import { pdf } from '@react-pdf/renderer';

import PdfFormCharts from 'components/pdfs/documents/formsCharts/formsCharts.pdf';
import PdfFormIndicators from 'components/pdfs/documents/formsIndicators/formsIndicators.pdf';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';

import { buildFormChartsPdfDataset } from './buildFormChartsPdfDataset';
import { buildIndicatorsPdfDataset } from './buildIndicatorsPdfDataset';

function formatIssuedAt(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());
}

function openPdfBlobInBrowser(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const newTab = window.open(url, '_blank', 'noopener,noreferrer');

  if (!newTab) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

export async function generateFormIndicatorsPdfBlob(params: {
  formApplication: FormApplicationReadModel;
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  selectedGroupingQuestionId: string | null;
  showOnlyGroupIndicators: boolean;
}): Promise<Blob> {
  const dataset = buildIndicatorsPdfDataset({
    formQuestionsAnswers: params.formQuestionsAnswers,
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
    showOnlyGroupIndicators: params.showOnlyGroupIndicators,
  });

  const issuedAt = formatIssuedAt();

  const doc = (
    <PdfFormIndicators
      data={dataset}
      meta={{
        formName: params.formApplication.form.name,
        applicationName: params.formApplication.name,
        issuedAt,
      }}
    />
  );

  return pdf(doc).toBlob();
}

export async function generateFormChartsPdfBlob(params: {
  formApplication: FormApplicationReadModel;
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  selectedGroupingQuestionId: string | null;
}): Promise<Blob> {
  const dataset = buildFormChartsPdfDataset({
    formQuestionsAnswers: params.formQuestionsAnswers,
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
  });

  const issuedAt = formatIssuedAt();

  const doc = (
    <PdfFormCharts
      data={dataset}
      meta={{
        formName: params.formApplication.form.name,
        applicationName: params.formApplication.name,
        issuedAt,
      }}
    />
  );

  return pdf(doc).toBlob();
}

export async function openFormIndicatorsPdfClient(params: {
  formApplication: FormApplicationReadModel;
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  selectedGroupingQuestionId: string | null;
  showOnlyGroupIndicators: boolean;
}): Promise<void> {
  const blob = await generateFormIndicatorsPdfBlob(params);
  openPdfBlobInBrowser(blob, 'relatorio-indicadores.pdf');
}

export async function openFormChartsPdfClient(params: {
  formApplication: FormApplicationReadModel;
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  selectedGroupingQuestionId: string | null;
}): Promise<void> {
  const blob = await generateFormChartsPdfBlob(params);
  openPdfBlobInBrowser(blob, 'relatorio-graficos.pdf');
}
