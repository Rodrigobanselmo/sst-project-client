import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

import type { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import type { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { browseFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/browse-form-questions-answers-analysis/service/browse-form-questions-answers-analysis.service';
import { browseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/service/browse-form-questions-answers-risks.service';

import type { ParticipantGroupForIndicators } from './buildParticipantGroupsForIndicators';
import { buildParticipantGroupsForIndicators } from './buildParticipantGroupsForIndicators';

/**
 * Gera o PDF de Análise de Riscos no navegador (`buildRiskAnalysisPdfDataset` + `PdfFormRiskAnalysis`).
 */
export async function exportFormRiskAnalysisPdfInBrowser(
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

  onProgress?.('Carregando bibliotecas...');
  await yieldToUI();

  const { pdf } = await import('@react-pdf/renderer');
  const { default: PdfFormRiskAnalysis } = await import(
    'components/pdfs/documents/formsRiskAnalysis/formsRiskAnalysis.pdf'
  );
  const { buildRiskAnalysisPdfDataset } = await import(
    './buildRiskAnalysisPdfDataset'
  );

  onProgress?.('Carregando dados de riscos...');
  await yieldToUI();

  const [risksData, analysisData] = await Promise.all([
    browseFormQuestionsAnswersRisks({
      companyId: params.accessCompanyId,
      applicationId: params.formApplication.id,
    }),
    browseFormQuestionsAnswersAnalysis({
      companyId: params.accessCompanyId,
      applicationId: params.formApplication.id,
    }),
  ]);

  if (!risksData) {
    throw new Error('Não foi possível carregar os dados de análise de riscos.');
  }

  onProgress?.('Aplicando recorte visível...');
  await yieldToUI();

  const participantGroups = buildParticipantGroupsForIndicators({
    formQuestionsAnswers: params.formQuestionsAnswers,
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
    hierarchyGroups: params.hierarchyGroups,
  });

  const visibleParticipantGroups = params.selectedGroupingQuestionId
    ? params.visibleParticipantGroupIds
      ? participantGroups.filter((g) =>
          params.visibleParticipantGroupIds!.includes(g.id),
        )
      : participantGroups
    : participantGroups;

  const dataset = buildRiskAnalysisPdfDataset({
    risksData,
    analysisData,
    formQuestionsAnswers: params.formQuestionsAnswers,
    visibleParticipantGroups,
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
    selectedGroupingLabel: params.selectedGroupingLabel,
  });

  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  onProgress?.('Renderizando PDF...');
  await yieldToUI();

  const element = React.createElement(PdfFormRiskAnalysis, {
    data: dataset,
    meta: {
      formName: params.formApplication.form.name,
      applicationName: params.formApplication.name,
      issuedAt,
    },
  });

  const blob = await pdf(element as React.ReactElement<DocumentProps>).toBlob();

  onProgress?.('Finalizando download...');
  await yieldToUI();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'relatorio-analise-riscos.pdf';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
