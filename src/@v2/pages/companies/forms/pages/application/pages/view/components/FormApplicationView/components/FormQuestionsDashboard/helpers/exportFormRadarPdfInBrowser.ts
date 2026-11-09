import React from 'react';
import { Chart } from 'chart.js';
import type { DocumentProps } from '@react-pdf/renderer';
import type { IndicatorRadarPage } from 'components/pdfs/documents/formIndicatorsRadar/formIndicatorsRadar.pdf';
import {
  buildIndicatorRadarChart,
  canDrawIndicatorRadar,
  getScalesForDimensionRadar,
  type RadarGroup,
  type RadarPoint,
} from './formIndicatorRadar';

function renderRadarImage(points: RadarPoint[]): string {
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 500;
  const { data, options } = buildIndicatorRadarChart(points, {
    color: '#9A7400',
    textColor: '#202A38',
    gridColor: '#CDD3DD',
    paperColor: '#FFFFFF',
  });
  const chart = new Chart(canvas, {
    type: 'radar',
    data,
    options: {
      ...options,
      responsive: false,
      animation: false,
      devicePixelRatio: 2,
    },
  });
  try {
    return chart.toBase64Image();
  } finally {
    chart.destroy();
  }
}

export async function exportFormRadarPdfInBrowser(
  {
    byDimension,
    groups,
    ...meta
  }: {
    byDimension: boolean;
    groups: RadarGroup[];
    applicationName: string;
    formName: string;
    groupingLabel?: string | null;
  },
  onProgress?: (message: string) => void,
) {
  onProgress?.('Preparando os gráficos do radar...');
  const [{ pdf }, { default: PdfFormIndicatorsRadar }] = await Promise.all([
    import('@react-pdf/renderer'),
    import(
      'components/pdfs/documents/formIndicatorsRadar/formIndicatorsRadar.pdf'
    ),
  ]);
  const pages: IndicatorRadarPage[] = groups.flatMap((group) => {
    if (group.protected) {
      return [
        {
          groupName: group.name,
          points: [],
          message: 'Dados protegidos para este grupo.',
        },
      ];
    }

    const series = byDimension
      ? getScalesForDimensionRadar(group).map((scale) => ({
          scaleName: scale.name,
          points: scale.dimensions,
        }))
      : [{ points: group.scales }];

    return series.map((item): IndicatorRadarPage => {
      const hasValues = item.points.some((point) => point.hasValidAnswers);
      const showChart =
        hasValues && canDrawIndicatorRadar(item.points, byDimension);
      return {
        ...item,
        groupName: group.name,
        chartImage: showChart ? renderRadarImage(item.points) : undefined,
        message: !hasValues
          ? 'Sem respostas válidas no recorte atual.'
          : showChart
            ? undefined
            : 'Os indicadores disponíveis estão na lista abaixo.',
      };
    });
  });

  if (!pages.length) {
    pages.push({
      groupName: '',
      points: [],
      message: 'Sem indicadores disponíveis no recorte atual.',
    });
  }

  onProgress?.('Renderizando PDF dos radares...');
  const title = byDimension
    ? 'Indicadores - Radar por dimensões'
    : 'Indicadores - Radar por escalas';
  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());
  const element = React.createElement(PdfFormIndicatorsRadar, {
    ...meta,
    title,
    issuedAt,
    pages,
  });
  const blob = await pdf(element as React.ReactElement<DocumentProps>).toBlob();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = byDimension
    ? 'relatorio-indicadores-radar-dimensoes.pdf'
    : 'relatorio-indicadores-radar-escalas.pdf';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
