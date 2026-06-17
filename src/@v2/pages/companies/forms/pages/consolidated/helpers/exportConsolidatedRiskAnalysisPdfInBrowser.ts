import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { ConsolidatedViewRiskAnalysisModel } from '@v2/models/enterprise/company-group/consolidated-view-risk-analysis.model';
import { readConsolidatedRiskNarrativeDiagnostic } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-risk-narrative.service';
import { ConsolidatedRiskNarrativeScope } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-risk-narrative.types';

import { ConsolidatedRiskGroupByMode } from '../components/FormConsolidatedRiskAnalysisSection/consolidated-risk-analysis.utils';
import {
  buildConsolidatedRiskAnalysisPdfDataset,
  buildConsolidatedRiskRecorteLabel,
} from './buildConsolidatedRiskAnalysisPdfDataset';

export async function exportConsolidatedRiskAnalysisPdfInBrowser(
  params: {
    companyGroupId: number;
    applicationIds: string[];
    formName: string;
    businessGroupName: string;
    riskAnalysisData: ConsolidatedViewRiskAnalysisModel;
    filteredItems: ConsolidatedViewRiskAnalysisModel['items'];
    groupBy: ConsolidatedRiskGroupByMode;
    narrativeScope: ConsolidatedRiskNarrativeScope;
    companyFilter: string;
    applicationFilter: string;
    riskLevelFilter: string;
    statusFilter: string;
    search: string;
    companyLabel?: string | null;
    applicationLabel?: string | null;
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

  onProgress?.('Carregando diagnóstico narrativo salvo...');
  await yieldToUI();

  const narrativeDiagnostic = await readConsolidatedRiskNarrativeDiagnostic({
    companyGroupId: params.companyGroupId,
    applicationIds: params.applicationIds,
    scope: params.narrativeScope,
  });

  const narrativeDiagnosticMarkdown =
    narrativeDiagnostic?.status === FormAiAnalysisStatusEnum.DONE
      ? narrativeDiagnostic.contentMarkdown
      : null;

  onProgress?.('Processando dados da análise de riscos...');
  await yieldToUI();

  const recorteLabel = buildConsolidatedRiskRecorteLabel({
    groupBy: params.groupBy,
    companyFilter: params.companyFilter,
    applicationFilter: params.applicationFilter,
    riskLevelFilter: params.riskLevelFilter,
    statusFilter: params.statusFilter,
    search: params.search,
    companyLabel: params.companyLabel,
    applicationLabel: params.applicationLabel,
  });

  const dataset = buildConsolidatedRiskAnalysisPdfDataset({
    riskAnalysisData: params.riskAnalysisData,
    filteredItems: params.filteredItems,
    groupBy: params.groupBy,
    recorteLabel,
    narrativeDiagnosticMarkdown,
  });

  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  onProgress?.('Renderizando PDF (isso pode demorar)...');
  await yieldToUI();

  const element = React.createElement(PdfFormRiskAnalysis, {
    data: dataset,
    meta: {
      formName: params.formName,
      applicationName: `${params.businessGroupName} — visão consolidada`,
      issuedAt,
    },
  });

  const blob = await pdf(element as React.ReactElement<DocumentProps>).toBlob();

  onProgress?.('Finalizando download...');
  await yieldToUI();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'relatorio-analise-riscos-consolidado.pdf';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
