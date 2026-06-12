import {
  CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL,
  ConsolidatedParticipantsAggregateRow,
  ConsolidatedParticipantsFilterSummary,
  ConsolidatedParticipantsFilters,
  ConsolidatedParticipantsViewMode,
  maskConsolidatedParticipantForPrivacy,
  shouldProtectConsolidatedParticipantGroup,
} from '@v2/models/enterprise/company-group/consolidated-view-participants.helpers';
import { ConsolidatedViewParticipantModel } from '@v2/models/enterprise/company-group/consolidated-view-participants.model';

import {
  escapeHtml,
  formatConsolidatedPdfIssuedAt,
  openConsolidatedHtmlPrintWindow,
  renderConsolidatedAggregatePdfTableRow,
  renderConsolidatedFilterSummaryBarHtml,
} from './consolidated-pdf-html.utils';

const VIEW_MODE_LABELS: Record<ConsolidatedParticipantsViewMode, string> = {
  list: 'Lista detalhada',
  grouped_company: 'Agrupado por empresa',
  grouped_workspace: 'Agrupado por estabelecimento',
  grouped_sector: 'Agrupado por setor',
  grouped_hierarchy: 'Agrupado por hierarquia',
};

function renderListSection(
  participants: ConsolidatedViewParticipantModel[],
  shouldMaskListPii: boolean,
) {
  const rows = participants
    .map((participant) => {
      const masked = maskConsolidatedParticipantForPrivacy(
        participant,
        shouldMaskListPii,
      );

      return `<tr>
        <td>${escapeHtml(masked.name)}</td>
        <td>${escapeHtml(masked.companyLabel)}</td>
        <td>${escapeHtml(masked.workspaceLabel || '—')}</td>
        <td>${escapeHtml(masked.sectorLabel || '—')}</td>
        <td>${escapeHtml(masked.hierarchyLabel || '—')}</td>
        <td>${participant.hasAnswered ? 'Sim' : 'Não'}</td>
      </tr>`;
    })
    .join('');

  return `<h2>Lista de participantes</h2>
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Empresa</th>
          <th>Estabelecimento</th>
          <th>Setor</th>
          <th>Hierarquia</th>
          <th>Respondeu</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody>
    </table>`;
}

function renderGroupedSection(
  title: string,
  groups: ConsolidatedParticipantsAggregateRow[],
) {
  const rows = groups
    .map((group) => renderConsolidatedAggregatePdfTableRow(group))
    .join('');

  return `<h2>${escapeHtml(title)}</h2>
    <table>
      <thead>
        <tr>
          <th>Agrupamento</th>
          <th class="num">Participantes</th>
          <th class="num">Responderam</th>
          <th class="num">Não responderam</th>
          <th class="num">Taxa</th>
          <th>Resposta</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody>
    </table>`;
}

export function exportConsolidatedParticipantsPdfInBrowser(params: {
  businessGroupName: string;
  formName: string;
  filters: ConsolidatedParticipantsFilters;
  viewMode: ConsolidatedParticipantsViewMode;
  filterSummary: ConsolidatedParticipantsFilterSummary;
  participants: ConsolidatedViewParticipantModel[];
  groups: ConsolidatedParticipantsAggregateRow[];
}) {
  const issuedAt = formatConsolidatedPdfIssuedAt();
  const groupingLabel = VIEW_MODE_LABELS[params.viewMode];

  const shouldMaskListPii = shouldProtectConsolidatedParticipantGroup(
    params.filterSummary.totalParticipants,
  );

  const contentSection =
    params.viewMode === 'list'
      ? renderListSection(params.participants, shouldMaskListPii)
      : renderGroupedSection(groupingLabel, params.groups);

  const bodyHtml = `
    <h1>Participantes consolidados</h1>
    <div class="meta">Grupo empresarial: ${escapeHtml(params.businessGroupName)}</div>
    <div class="meta">Formulário base: ${escapeHtml(params.formName)}</div>
    <div class="meta">Emitido em: ${escapeHtml(issuedAt)}</div>
    <div class="banner">
      Visualização: ${escapeHtml(groupingLabel)}.
      Leitura analítica read-only. Grupos com menos de 3 participantes exibem
      &quot;${escapeHtml(CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL)}&quot;.
    </div>
    ${renderConsolidatedFilterSummaryBarHtml(params.filterSummary)}
    ${contentSection}
  `;

  openConsolidatedHtmlPrintWindow({
    title: 'Participantes consolidados',
    bodyHtml,
  });
}
