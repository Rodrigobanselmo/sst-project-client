import { getResponseRateBarColor } from '@v2/models/form/helpers/form-participants-response-rate-colors';
import {
  ConsolidatedParticipantsAggregateRow,
  ConsolidatedParticipantsFilterSummary,
} from '@v2/models/enterprise/company-group/consolidated-view-participants.helpers';

const PRINT_COLOR_ADJUST_STYLE =
  '-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact';

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const CONSOLIDATED_PDF_PRINT_STYLES = `
  body { font-family: Arial, Helvetica, sans-serif; color: #212121; margin: 24px; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  h2 { font-size: 15px; margin: 20px 0 8px; }
  .meta { font-size: 12px; color: #616161; margin-bottom: 4px; }
  .banner { background: #f5f5f5; border: 1px solid #e0e0e0; padding: 10px 12px; margin: 16px 0; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
  th, td { border: 1px solid #e0e0e0; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #fafafa; font-weight: 600; }
  td.num, th.num { text-align: right; }
  .protected { color: #757575; font-style: italic; }
  .chip { display: inline-block; border: 1px solid #bdbdbd; border-radius: 12px; padding: 2px 8px; margin: 2px 4px 2px 0; font-size: 10px; }
  @media print {
    * { ${PRINT_COLOR_ADJUST_STYLE} !important; }
  }
`;

export function renderConsolidatedResponseRateBarHtml(
  percent: number,
  variant: 'summary' | 'cell' = 'cell',
): string {
  const width = Math.min(100, Math.max(0, percent));
  const color = getResponseRateBarColor(percent);
  const trackHeight = variant === 'summary' ? 20 : 12;
  const borderRadius = variant === 'summary' ? 10 : 6;

  const trackStyle = [
    `height:${trackHeight}px`,
    'background-color:#e0e0e0',
    `border-radius:${borderRadius}px`,
    'overflow:hidden',
    'border:1px solid #ccc',
    'box-sizing:border-box',
    variant === 'cell' ? 'min-width:120px;width:100%' : 'max-width:640px;width:100%',
    variant === 'summary' ? 'margin:0 auto 12px' : '',
    PRINT_COLOR_ADJUST_STYLE,
  ]
    .filter(Boolean)
    .join(';');

  const fillStyle = [
    `width:${width}%`,
    'max-width:100%',
    `height:${trackHeight}px`,
    'min-height:2px',
    `background-color:${color}`,
    `border-radius:${borderRadius}px`,
    'display:block',
    PRINT_COLOR_ADJUST_STYLE,
  ].join(';');

  return `<div style="${trackStyle}"><div style="${fillStyle}"></div></div>`;
}

export function renderConsolidatedFilterSummaryBarHtml(
  summary: ConsolidatedParticipantsFilterSummary,
): string {
  const pct = summary.responseRatePercent;
  const color = getResponseRateBarColor(pct);
  const pctLabel = pct.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return `<div style="max-width:720px;margin:16px auto 20px;text-align:center;${PRINT_COLOR_ADJUST_STYLE}">
    <div style="font-size:13px;font-weight:600;color:#c2410c;margin-bottom:8px;">Taxa de resposta no recorte</div>
    <div style="font-size:32px;font-weight:700;color:${color};margin:8px 0 12px;${PRINT_COLOR_ADJUST_STYLE}">${pctLabel}%</div>
    ${renderConsolidatedResponseRateBarHtml(pct, 'summary')}
    <div style="font-size:13px;color:#444;font-weight:500;">
      Total: ${summary.totalParticipants} participantes |
      Responderam: ${summary.respondedCount} |
      Não responderam: ${summary.notRespondedCount}
    </div>
  </div>`;
}

export function openConsolidatedHtmlPrintWindow(params: {
  title: string;
  bodyHtml: string;
}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão do PDF.');
  }

  printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(params.title)}</title>
  <style>${CONSOLIDATED_PDF_PRINT_STYLES}</style>
</head>
<body>
${params.bodyHtml}
</body>
</html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function renderConsolidatedAggregatePdfTableRow(
  row: ConsolidatedParticipantsAggregateRow,
  rowClass = '',
): string {
  if (row.isProtected) {
    return `<tr class="${rowClass}">
      <td class="protected">${escapeHtml(row.groupLabel)}</td>
      <td class="num protected" colspan="5">Dados Protegidos — menos de 3 participantes</td>
    </tr>`;
  }

  const pct = row.responseRatePercent.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return `<tr class="${rowClass}">
    <td>${escapeHtml(row.groupLabel)}</td>
    <td class="num">${row.total}</td>
    <td class="num">${row.responded}</td>
    <td class="num">${row.notResponded}</td>
    <td class="num">${pct}%</td>
    <td style="min-width:120px;vertical-align:middle;">${renderConsolidatedResponseRateBarHtml(row.responseRatePercent, 'cell')}</td>
  </tr>`;
}

export function formatConsolidatedPdfIssuedAt() {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());
}
