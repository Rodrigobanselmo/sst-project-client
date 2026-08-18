import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';

import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  formatActivityRiskFactorsListCell,
  formatUseScenarioBoardStatusChip,
  getScenarioActivityRiskFactors,
} from './chemical-use-scenario-activity-risk.util';
import {
  formatUseScenarioBoardExposureGroupCell,
  USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS,
  type UseScenarioBoardViewFilters,
  type UseScenarioBoardViewSort,
} from './chemical-use-scenario-board-view.util';

export const USE_SCENARIO_BOARD_PDF_FILENAME = 'cenarios-de-uso.pdf';

export const USE_SCENARIO_BOARD_PDF_EMPTY_MESSAGE =
  'Nenhum cenário corresponde aos filtros atuais.';

export type UseScenarioBoardPdfRow = {
  id: string;
  product: string;
  riskFactors: string;
  activity: string;
  sector: string;
  gse: string;
  frequency: string;
  duration: string;
  quantity: string;
  sourceRows: string;
  status: string;
};

export type UseScenarioBoardPdfDataset = {
  rows: UseScenarioBoardPdfRow[];
  filterSummary: string[];
};

const SORT_FIELD_LABEL: Record<UseScenarioBoardViewSort['field'], string> = {
  product: 'Produto',
  riskFactors: 'Fator(es) de risco',
  activity: 'Tarefa',
  sector: 'Setor',
  exposureGroup: 'GSE',
  frequency: 'Freq.',
  duration: 'Duração',
  quantity: 'Qtd',
  sourceRows: 'Linhas',
  status: 'Status',
};

function dash(value: string | null | undefined) {
  const text = (value || '').trim();
  return text || '—';
}

function formatFrequency(row: ChemicalUseScenarioBoardRow) {
  if (row.frequencyCount == null) return '—';
  return `${row.frequencyCount} ${row.frequencyPeriod || ''}`.trim();
}

function formatDuration(row: ChemicalUseScenarioBoardRow) {
  if (row.durationMinutes == null) return '—';
  return `${row.durationMinutes} min`;
}

function formatQuantity(row: ChemicalUseScenarioBoardRow) {
  if (!row.quantity) return '—';
  return `${row.quantity} ${row.quantityUnit || ''}`.trim();
}

function formatSourceRows(row: ChemicalUseScenarioBoardRow) {
  return (row.sourceRows || []).join(', ') || '—';
}

function statusFilterLabel(value: string) {
  return (
    USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS.find(
      (option) => option.value === value,
    )?.label || value
  );
}

export function buildUseScenarioBoardPdfFilterSummary(
  filters?: UseScenarioBoardViewFilters,
  sort?: UseScenarioBoardViewSort | null,
): string[] {
  const summary: string[] = [];
  if (!filters && !sort) return summary;
  if (filters?.search.trim()) summary.push(`Busca: ${filters.search.trim()}`);
  if (filters?.product.trim()) summary.push(`Produto: ${filters.product.trim()}`);
  if (filters?.riskFactor.trim()) {
    summary.push(`Fator de risco: ${filters.riskFactor.trim()}`);
  }
  if (filters?.activity.trim()) summary.push(`Tarefa: ${filters.activity.trim()}`);
  if (filters?.sector.trim()) summary.push(`Setor: ${filters.sector.trim()}`);
  if (filters?.exposureGroup.trim()) {
    summary.push(`GSE: ${filters.exposureGroup.trim()}`);
  }
  if (filters?.status.trim()) {
    summary.push(`Status: ${statusFilterLabel(filters.status.trim())}`);
  }
  if (sort) {
    const order = sort.order === 'asc' ? 'A–Z' : 'Z–A';
    summary.push(`Ordenação: ${SORT_FIELD_LABEL[sort.field]} (${order})`);
  }
  return summary;
}

export function mapUseScenarioBoardPdfRow(
  row: ChemicalUseScenarioBoardRow,
): UseScenarioBoardPdfRow {
  return {
    id: row.id,
    product: dash(row.product?.tradeName),
    riskFactors: formatActivityRiskFactorsListCell(
      getScenarioActivityRiskFactors(row),
      row,
    ),
    activity: dash(row.activityName),
    sector: dash(row.sectorSnapshot),
    gse: formatUseScenarioBoardExposureGroupCell(row),
    frequency: formatFrequency(row),
    duration: formatDuration(row),
    quantity: formatQuantity(row),
    sourceRows: formatSourceRows(row),
    status: formatUseScenarioBoardStatusChip(row),
  };
}

/**
 * Presentation mapper: one PDF row per visibleRows item, same order.
 * Does not mutate `visibleRows`, group, or dedupe.
 */
export function buildUseScenarioBoardPdfDataset(
  visibleRows: ChemicalUseScenarioBoardRow[],
  params: {
    filters?: UseScenarioBoardViewFilters;
    sort?: UseScenarioBoardViewSort | null;
  } = {},
): UseScenarioBoardPdfDataset {
  return {
    rows: visibleRows.map(mapUseScenarioBoardPdfRow),
    filterSummary: buildUseScenarioBoardPdfFilterSummary(
      params.filters,
      params.sort,
    ),
  };
}

/**
 * Gera o PDF do board no navegador a partir de `visibleRows`
 * (`buildUseScenarioBoardPdfDataset` + `PdfUseScenarioBoard`),
 * evitando timeout em ambientes serverless e sem novo GET.
 */
export async function exportUseScenarioBoardPdfInBrowser(
  params: {
    visibleRows: ChemicalUseScenarioBoardRow[];
    filters?: UseScenarioBoardViewFilters;
    sort?: UseScenarioBoardViewSort | null;
  },
  onProgress?: (message: string) => void,
): Promise<void> {
  const yieldToUI = () => new Promise((resolve) => setTimeout(resolve, 0));

  if (!params.visibleRows.length) {
    throw new Error(USE_SCENARIO_BOARD_PDF_EMPTY_MESSAGE);
  }

  onProgress?.('Carregando bibliotecas...');
  await yieldToUI();

  const { pdf } = await import('@react-pdf/renderer');
  const { default: PdfUseScenarioBoard } = await import(
    'components/pdfs/documents/chemicalUseScenarioBoard/chemicalUseScenarioBoard.pdf'
  );

  onProgress?.('Aplicando recorte visível...');
  await yieldToUI();

  const dataset = buildUseScenarioBoardPdfDataset(params.visibleRows, {
    filters: params.filters,
    sort: params.sort,
  });

  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  onProgress?.('Renderizando PDF...');
  await yieldToUI();

  const element = React.createElement(PdfUseScenarioBoard, {
    data: dataset,
    meta: { issuedAt },
  });

  const blob = await pdf(
    element as React.ReactElement<DocumentProps>,
  ).toBlob();

  onProgress?.('Finalizando download...');
  await yieldToUI();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = USE_SCENARIO_BOARD_PDF_FILENAME;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
