import { ConsolidatedViewCapabilityStatusEnum } from '@v2/models/enterprise/company-group/consolidated-view-capability.enum';
import { ConsolidatedViewSummaryModel } from '@v2/models/enterprise/company-group/consolidated-view-summary.model';

import {
  escapeHtml,
  formatConsolidatedPdfIssuedAt,
  openConsolidatedHtmlPrintWindow,
} from './consolidated-pdf-html.utils';

const CAPABILITY_LABELS: Record<string, string> = {
  participants: 'Participantes',
  charts: 'Gráficos',
  indicators: 'Indicadores',
  structuralGroupings: 'Agrupamentos estruturais',
  riskAnalysisOperational: 'Análise operacional de riscos',
  riskNarrativeConcat: 'Narrativa de riscos',
  indicatorsNarrative: 'Narrativa de indicadores',
  pdf: 'PDF consolidado',
  emails: 'E-mails',
  reminders: 'Reforços',
  banner: 'Banner',
  inventory: 'Inventário / PGR',
};

const CAPABILITY_STATUS_LABELS: Record<ConsolidatedViewCapabilityStatusEnum, string> =
  {
    [ConsolidatedViewCapabilityStatusEnum.IMPLEMENTED]: 'Disponível',
    [ConsolidatedViewCapabilityStatusEnum.NOT_IMPLEMENTED]: 'Em breve',
    [ConsolidatedViewCapabilityStatusEnum.DISABLED]: 'Bloqueado',
  };

const CAPABILITY_KEYS_HIDDEN_FROM_SUMMARY = new Set(['pdf']);

export function exportConsolidatedSummaryPdfInBrowser(
  summary: ConsolidatedViewSummaryModel,
) {
  const issuedAt = formatConsolidatedPdfIssuedAt();
  const uniqueCompanies = Array.from(
    new Map(
      summary.applications.map((item) => [item.companyId, item.companyLabel]),
    ).entries(),
  );

  const companyChips = uniqueCompanies
    .map(([, label]) => `<span class="chip">${escapeHtml(label)}</span>`)
    .join('');

  const applicationsRows = summary.applications
    .map(
      (application) => `<tr>
        <td>${escapeHtml(application.applicationName)}</td>
        <td>${escapeHtml(application.companyLabel)}</td>
        <td class="num">${application.totalParticipants}</td>
        <td class="num">${application.totalAnswers}</td>
      </tr>`,
    )
    .join('');

  const capabilityRows = Object.entries(summary.capabilities)
    .filter(([key]) => !CAPABILITY_KEYS_HIDDEN_FROM_SUMMARY.has(key))
    .map(
      ([key, status]) => `<tr>
        <td>${escapeHtml(CAPABILITY_LABELS[key] || key)}</td>
        <td>${escapeHtml(CAPABILITY_STATUS_LABELS[status])}</td>
      </tr>`,
    )
    .join('');

  const bodyHtml = `
    <h1>Resumo da visão consolidada</h1>
    <div class="meta">Grupo empresarial: ${escapeHtml(summary.businessGroupName)}</div>
    <div class="meta">Formulário base: ${escapeHtml(summary.formName)}</div>
    <div class="meta">Emitido em: ${escapeHtml(issuedAt)}</div>
    <div class="banner">
      Leitura analítica e documental read-only do grupo empresarial.
      Não altera aplicações individuais, análises operacionais, inventário ou envio ao PGR.
    </div>

    <h2>Empresas incluídas</h2>
    <div>${companyChips}</div>

    <h2>Aplicações incluídas</h2>
    <table>
      <thead>
        <tr>
          <th>Aplicação</th>
          <th>Empresa</th>
          <th class="num">Participantes</th>
          <th class="num">Respostas</th>
        </tr>
      </thead>
      <tbody>${applicationsRows}</tbody>
    </table>

    <h2>Totais consolidados</h2>
    <table>
      <tbody>
        <tr><td>Participantes</td><td class="num">${summary.totals.totalParticipants}</td></tr>
        <tr><td>Respostas</td><td class="num">${summary.totals.totalAnswers}</td></tr>
        <tr><td>Respondidos</td><td class="num">${summary.totals.totalResponded}</td></tr>
        <tr><td>Não respondidos</td><td class="num">${summary.totals.totalNotResponded}</td></tr>
        <tr><td>Conclusão</td><td class="num">${summary.totals.completionPercent}%</td></tr>
      </tbody>
    </table>

    <h2>Capacidades desta fase</h2>
    <table>
      <thead>
        <tr><th>Recurso</th><th>Status</th></tr>
      </thead>
      <tbody>${capabilityRows}</tbody>
    </table>
  `;

  openConsolidatedHtmlPrintWindow({
    title: 'Resumo consolidado',
    bodyHtml,
  });
}
