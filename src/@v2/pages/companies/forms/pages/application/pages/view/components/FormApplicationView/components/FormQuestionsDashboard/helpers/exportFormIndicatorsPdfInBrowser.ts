import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

import type { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import type { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { readIndicatorsNarrativeDiagnostic } from '@v2/services/forms/indicators-narrative-diagnostic/service/indicators-narrative-diagnostic.service';
import { diagnosticMatchesViewMode } from '@v2/services/forms/indicators-narrative-diagnostic/service/indicators-narrative-diagnostic.scope';

import type { HierarchyGroupForIndicators } from './buildParticipantGroupsForIndicators';
import { buildParticipantGroupsForIndicators } from './buildParticipantGroupsForIndicators';
import { buildIndicatorsNarrativeDiagnosticScope } from './buildIndicatorsNarrativeDiagnosticScope';
import type { FormChartType } from './form-chart-type.types';

/**
 * Gera o PDF de indicadores no navegador com a mesma base da tela
 * (`buildIndicatorsPdfDataset` + `PdfFormIndicators`), evitando timeout em ambientes serverless.
 *
 * Usa setTimeout para permitir que o navegador atualize a UI durante o processamento.
 */
export async function exportFormIndicatorsPdfInBrowser(
  params: {
    accessCompanyId: string;
    formApplication: FormApplicationReadModel;
    formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
    selectedGroupingQuestionId: string | null;
    selectedGroupingLabel?: string | null;
    showOnlyGroupIndicators: boolean;
    executiveDistributionChartType: FormChartType;
    hierarchyGroups: HierarchyGroupForIndicators[];
    /** Com agrupamento ativo: ids dos grupos a incluir no PDF (alinhado à tela). */
    visibleParticipantGroupIds?: string[];
  },
  onProgress?: (message: string) => void,
): Promise<void> {
  // Delay para permitir UI updates
  const yieldToUI = () => new Promise((resolve) => setTimeout(resolve, 0));

  onProgress?.('Carregando bibliotecas...');
  await yieldToUI();

  const { pdf } = await import('@react-pdf/renderer');
  const { default: PdfFormIndicators } = await import(
    'components/pdfs/documents/formsIndicators/formsIndicators.pdf'
  );
  const { buildIndicatorsPdfDataset } = await import(
    './buildIndicatorsPdfDataset'
  );

  onProgress?.('Processando dados dos indicadores...');
  await yieldToUI();

  const participantGroups = buildParticipantGroupsForIndicators({
    formQuestionsAnswers: params.formQuestionsAnswers,
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
    hierarchyGroups: params.hierarchyGroups,
  });

  const visibleParticipantGroups = params.selectedGroupingQuestionId
    ? params.visibleParticipantGroupIds
      ? participantGroups.filter((g) => params.visibleParticipantGroupIds!.includes(g.id))
      : participantGroups
    : participantGroups;

  const narrativeScope = buildIndicatorsNarrativeDiagnosticScope({
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
    visibleParticipantGroups,
    groupingLabel: params.selectedGroupingLabel ?? null,
    showOnlyGroupIndicators: params.showOnlyGroupIndicators,
  });

  onProgress?.('Carregando diagnóstico narrativo salvo...');
  await yieldToUI();

  const narrativeDiagnostic = await readIndicatorsNarrativeDiagnostic({
    companyId: params.accessCompanyId,
    formApplicationId: params.formApplication.id,
    scope: narrativeScope,
  });

  const narrativeDiagnosticMarkdown =
    narrativeDiagnostic?.status === FormAiAnalysisStatusEnum.DONE &&
    diagnosticMatchesViewMode(
      narrativeDiagnostic,
      narrativeScope.showOnlyGroupIndicators,
    )
      ? narrativeDiagnostic.contentMarkdown
      : null;

  const dataset = buildIndicatorsPdfDataset({
    formQuestionsAnswers: params.formQuestionsAnswers,
    selectedGroupingQuestionId: params.selectedGroupingQuestionId,
    showOnlyGroupIndicators: params.showOnlyGroupIndicators,
    executiveDistributionChartType: params.executiveDistributionChartType,
    narrativeDiagnosticMarkdown,
    isShareableLink: params.formApplication.isShareableLink,
    hierarchyGroups: params.hierarchyGroups,
    ...(params.selectedGroupingQuestionId
      ? { visibleParticipantGroupIds: params.visibleParticipantGroupIds }
      : {}),
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
      formName: params.formApplication.form.name,
      applicationName: params.formApplication.name,
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
  anchor.download = 'relatorio-indicadores.pdf';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
