import {
  buildEstablishmentAggregates,
  getFormParticipantEstablishmentLabel,
} from '@v2/models/form/helpers/form-participants-aggregate-by-establishment';
import { buildEstablishmentHierarchyAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment-hierarchy';
import { buildEstablishmentSectorAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment-sector';
import { buildHierarchyTypeAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-hierarchy-type';
import {
  buildHierarchyGroupAggregates,
  buildSectorWithHierarchyGroupAggregates,
  type HierarchyGroupForParticipants,
} from '@v2/models/form/helpers/form-participants-aggregate-by-hierarchy-group';
import { buildSectorAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-sector';
import { getResponseRateBarColor } from '@v2/models/form/helpers/form-participants-response-rate-colors';
import {
  getFormParticipantHierarchyChain,
  getFormParticipantSectorLabel,
} from '@v2/models/form/helpers/form-participant-hierarchy-display';
import {
  buildCombinedHierarchyNestedAggregates,
  type CombinedHierarchyNestedGroup,
} from '@v2/models/form/helpers/form-participants-aggregate-by-combined-hierarchy';
import {
  getCombinedHierarchyGroupingConfig,
  getEstablishmentHierarchyGroupingConfig,
  getFlatHierarchyGroupingConfig,
  getGroupedPdfTitle,
  getHierarchyGroupGroupingConfig,
  isGroupedViewMode,
  isHierarchyGroupViewMode,
  type FormParticipantsPdfViewMode,
} from '@v2/models/form/helpers/form-participants-hierarchy-grouping.config';
import { browseHierarchyGroups } from '@v2/services/forms/hierarchy-group/browse-hierarchy-groups/service/browse-hierarchy-groups.service';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import {
  browseAllFilteredFormParticipants,
  FORM_PARTICIPANTS_GROUPED_FETCH_CAP,
} from '@v2/services/forms/form-participants/browse-form-participants/service/browse-all-filtered-form-participants';
import { browseFormParticipants } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.service';
import {
  BrowseFormParticipantsFilters,
  FormParticipantsOrderByEnum,
} from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { Button, CircularProgress } from '@mui/material';
import { useCallback, useState } from 'react';

const EXPORT_ROW_CAP_LIST = 10_000;

export type { FormParticipantsPdfViewMode };

type Props = {
  companyId: string;
  applicationId: string;
  formApplication?: FormApplicationReadModel;
  filters: BrowseFormParticipantsFilters;
  orderBy: IOrderByParams<FormParticipantsOrderByEnum>[];
  hierarchyLabels: string;
  viewMode: FormParticipantsPdfViewMode;
  hierarchyGroups?: HierarchyGroupForParticipants[];
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const GROUPED_ORDER_BY: IOrderByParams<FormParticipantsOrderByEnum>[] = [
  { field: FormParticipantsOrderByEnum.HIERARCHY, order: 'asc' },
  { field: FormParticipantsOrderByEnum.NAME, order: 'asc' },
];

type AggregatePdfRow = {
  label: string;
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
};

function renderAggregatePdfTableRow(
  g: AggregatePdfRow,
  rowClass: string,
  indentPx = 0,
): string {
  const c = getResponseRateBarColor(g.responseRatePercent);
  const w = Math.min(100, Math.max(0, g.responseRatePercent));
  const pct = g.responseRatePercent.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  const indentStyle =
    indentPx > 0 ? ` style="padding-left:${indentPx}px"` : '';
  return `<tr class="${rowClass}">
    <td${indentStyle}>${escapeHtml(g.label)}</td>
    <td class="num">${g.total}</td>
    <td class="num">${g.responded}</td>
    <td class="num">${g.notResponded}</td>
    <td class="num">${pct}%</td>
    <td><div class="cellbar"><div style="width:${w}%;max-width:100%;background:${c}"></div></div></td>
  </tr>`;
}

function renderCombinedHierarchyNestedPdfRows(
  groups: CombinedHierarchyNestedGroup[],
): string[] {
  const rows: string[] = [];

  const visit = (group: CombinedHierarchyNestedGroup) => {
    rows.push(
      renderAggregatePdfTableRow(
        group,
        group.depth === 0 ? 'est-row' : 'group-row',
        group.depth === 0 ? 0 : 8 + group.depth * 16,
      ),
    );

    group.subgroups.forEach(visit);

    group.leaves.forEach((leaf) => {
      rows.push(
        renderAggregatePdfTableRow(
          leaf,
          'sector-row',
          24 + group.depth * 16,
        ),
      );
    });
  };

  groups.forEach(visit);
  return rows;
}

function renderFlatHierarchyPdfSection(
  rows: FormParticipantsBrowseResultModel[],
  config: NonNullable<ReturnType<typeof getFlatHierarchyGroupingConfig>>,
): string {
  const aggregates = buildHierarchyTypeAggregates(
    rows,
    config.hierarchyType,
    config.missingLabel,
  );
  const tableRows = aggregates
    .map((g) =>
      renderAggregatePdfTableRow({ label: g.groupLabel, ...g }, ''),
    )
    .join('');

  return `<h2 style="font-size:15px;margin:20px 0 8px">${escapeHtml(config.pdfSectionTitle)}</h2>
        <table><thead><tr>
          <th>${escapeHtml(config.groupColumnLabel)}</th><th class="num">Participantes</th><th class="num">Responderam</th>
          <th class="num">Não responderam</th><th class="num">Taxa</th><th>Resposta</th>
        </tr></thead><tbody>${tableRows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody></table>`;
}

function renderCombinedHierarchyPdfSection(
  rows: FormParticipantsBrowseResultModel[],
  config: NonNullable<ReturnType<typeof getCombinedHierarchyGroupingConfig>>,
): string {
  const groups = buildCombinedHierarchyNestedAggregates(rows, config.levels);
  const tableRows = renderCombinedHierarchyNestedPdfRows(groups).join('');

  return `<h2 style="font-size:15px;margin:20px 0 8px">${escapeHtml(config.pdfSectionTitle)}</h2>
        <table><thead><tr>
          <th>${escapeHtml(config.columnLabel)}</th><th class="num">Participantes</th><th class="num">Responderam</th>
          <th class="num">Não responderam</th><th class="num">Taxa</th><th>Resposta</th>
        </tr></thead><tbody>${tableRows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody></table>`;
}

function renderEstablishmentHierarchyPdfSection(
  rows: FormParticipantsBrowseResultModel[],
  config: NonNullable<ReturnType<typeof getEstablishmentHierarchyGroupingConfig>>,
): string {
  const groups = buildEstablishmentHierarchyAggregates(
    rows,
    config.hierarchyType,
    config.missingLabel,
  );
  const tableRows = groups
    .flatMap((est) => [
      renderAggregatePdfTableRow(
        { label: est.establishmentLabel, ...est },
        'est-row',
      ),
      ...est.hierarchyGroups.map((group) =>
        renderAggregatePdfTableRow(
          { label: group.groupLabel, ...group },
          'sector-row',
        ),
      ),
    ])
    .join('');

  return `<h2 style="font-size:15px;margin:20px 0 8px">${escapeHtml(config.pdfSectionTitle)}</h2>
        <table><thead><tr>
          <th>${escapeHtml(config.headerColumnLabel)}</th><th class="num">Participantes</th><th class="num">Responderam</th>
          <th class="num">Não responderam</th><th class="num">Taxa</th><th>Resposta</th>
        </tr></thead><tbody>${tableRows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody></table>`;
}

function renderHierarchyGroupPdfSection(
  rows: FormParticipantsBrowseResultModel[],
  hierarchyGroups: HierarchyGroupForParticipants[],
): string {
  const config = getHierarchyGroupGroupingConfig('grouped_hierarchy_group')!;
  const aggregates = buildHierarchyGroupAggregates(rows, hierarchyGroups);
  const tableRows = aggregates
    .map((g) => renderAggregatePdfTableRow(g, ''))
    .join('');

  return `<h2 style="font-size:15px;margin:20px 0 8px">${escapeHtml(config.pdfSectionTitle)}</h2>
        <table><thead><tr>
          <th>${escapeHtml(config.columnLabel)}</th><th class="num">Participantes</th><th class="num">Responderam</th>
          <th class="num">Não responderam</th><th class="num">Taxa</th><th>Resposta</th>
        </tr></thead><tbody>${tableRows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody></table>`;
}

function renderSectorWithHierarchyGroupPdfSection(
  rows: FormParticipantsBrowseResultModel[],
  hierarchyGroups: HierarchyGroupForParticipants[],
): string {
  const config = getHierarchyGroupGroupingConfig('grouped_sector_hierarchy_group')!;
  const blocks = buildSectorWithHierarchyGroupAggregates(rows, hierarchyGroups);
  const tableRows = blocks
    .flatMap((block) => [
      renderAggregatePdfTableRow(
        { label: block.groupLabel, ...block },
        'group-row',
      ),
      ...block.sectors.map((sector) =>
        renderAggregatePdfTableRow(
          { label: sector.sectorLabel, ...sector },
          'sector-row',
        ),
      ),
    ])
    .join('');

  return `<h2 style="font-size:15px;margin:20px 0 8px">${escapeHtml(config.pdfSectionTitle)}</h2>
        <table><thead><tr>
          <th>${escapeHtml(config.nestedHeaderColumnLabel)}</th><th class="num">Participantes</th><th class="num">Responderam</th>
          <th class="num">Não responderam</th><th class="num">Taxa</th><th>Resposta</th>
        </tr></thead><tbody>${tableRows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody></table>`;
}

function buildGroupedTableSection(
  viewMode: FormParticipantsPdfViewMode,
  rows: FormParticipantsBrowseResultModel[],
  hierarchyGroups: HierarchyGroupForParticipants[],
): string {
  if (viewMode === 'grouped_hierarchy_group') {
    return renderHierarchyGroupPdfSection(rows, hierarchyGroups);
  }

  if (viewMode === 'grouped_sector_hierarchy_group') {
    return renderSectorWithHierarchyGroupPdfSection(rows, hierarchyGroups);
  }

  if (viewMode === 'grouped') {
    const aggregates = buildSectorAggregates(rows);
    const tableRows = aggregates
      .map((g) =>
        renderAggregatePdfTableRow({ label: g.sectorLabel, ...g }, ''),
      )
      .join('');

    return `<h2 style="font-size:15px;margin:20px 0 8px">Por setor</h2>
        <table><thead><tr>
          <th>Setor</th><th class="num">Participantes</th><th class="num">Responderam</th>
          <th class="num">Não responderam</th><th class="num">Taxa</th><th>Resposta</th>
        </tr></thead><tbody>${tableRows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody></table>`;
  }

  if (viewMode === 'grouped_establishment') {
    const aggregates = buildEstablishmentAggregates(rows);
    const tableRows = aggregates
      .map((g) =>
        renderAggregatePdfTableRow(
          { label: g.establishmentLabel, ...g },
          '',
        ),
      )
      .join('');

    return `<h2 style="font-size:15px;margin:20px 0 8px">Por estabelecimento</h2>
        <table><thead><tr>
          <th>Estabelecimento</th><th class="num">Participantes</th><th class="num">Responderam</th>
          <th class="num">Não responderam</th><th class="num">Taxa</th><th>Resposta</th>
        </tr></thead><tbody>${tableRows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody></table>`;
  }

  if (viewMode === 'grouped_establishment_sector') {
    const groups = buildEstablishmentSectorAggregates(rows);
    const tableRows = groups
      .flatMap((est) => [
        renderAggregatePdfTableRow(
          { label: est.establishmentLabel, ...est },
          'est-row',
        ),
        ...est.sectors.map((sector) =>
          renderAggregatePdfTableRow(
            { label: sector.sectorLabel, ...sector },
            'sector-row',
          ),
        ),
      ])
      .join('');

    return `<h2 style="font-size:15px;margin:20px 0 8px">Por estabelecimento e setor</h2>
        <table><thead><tr>
          <th>Estabelecimento / Setor</th><th class="num">Participantes</th><th class="num">Responderam</th>
          <th class="num">Não responderam</th><th class="num">Taxa</th><th>Resposta</th>
        </tr></thead><tbody>${tableRows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody></table>`;
  }

  const flatConfig = getFlatHierarchyGroupingConfig(viewMode);
  if (flatConfig) return renderFlatHierarchyPdfSection(rows, flatConfig);

  const combinedConfig = getCombinedHierarchyGroupingConfig(viewMode);
  if (combinedConfig) {
    return renderCombinedHierarchyPdfSection(rows, combinedConfig);
  }

  const establishmentHierarchyConfig =
    getEstablishmentHierarchyGroupingConfig(viewMode);
  if (establishmentHierarchyConfig) {
    return renderEstablishmentHierarchyPdfSection(
      rows,
      establishmentHierarchyConfig,
    );
  }

  const tableRows = rows
    .map((r) => {
      const hier = `${getFormParticipantSectorLabel(r)} — ${getFormParticipantHierarchyChain(r)}`;
      return `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(getFormParticipantEstablishmentLabel(r))}</td><td>${escapeHtml(hier)}</td><td>${r.hasResponded ? 'Sim' : 'Não'}</td></tr>`;
    })
    .join('');

  return `<h2 style="font-size:15px;margin:20px 0 8px">Lista de participantes</h2>
        <table><thead><tr><th>Nome</th><th>Estabelecimento</th><th>Setor / hierarquia</th><th>Respondeu</th></tr></thead>
        <tbody>${tableRows}</tbody></table>`;
}

export const FormParticipantsRecorteExportButton = ({
  companyId,
  applicationId,
  formApplication,
  filters,
  orderBy,
  hierarchyLabels,
  viewMode,
  hierarchyGroups: hierarchyGroupsProp,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const onExport = useCallback(async () => {
    setLoading(true);
    try {
      const isGroupedFetch = isGroupedViewMode(viewMode);

      const bundle = isGroupedFetch
        ? await browseAllFilteredFormParticipants({
            companyId,
            applicationId,
            filters,
            orderBy: GROUPED_ORDER_BY,
          })
        : await browseFormParticipants({
            companyId,
            applicationId,
            filters,
            orderBy,
            pagination: { page: 1, limit: EXPORT_ROW_CAP_LIST },
          });

      const fs = bundle.filterSummary;
      const rows = bundle.results ?? [];

      let hierarchyGroups = hierarchyGroupsProp ?? [];
      if (isHierarchyGroupViewMode(viewMode) && hierarchyGroups.length === 0) {
        const fetched = await browseHierarchyGroups({ companyId, applicationId });
        hierarchyGroups = fetched.map((g) => ({
          id: g.id,
          name: g.name,
          hierarchyIds: g.hierarchyIds,
        }));
      }
      const groupedRowsIncomplete =
        isGroupedFetch &&
        (rows.length < fs.totalParticipants ||
          fs.totalParticipants > FORM_PARTICIPANTS_GROUPED_FETCH_CAP);
      const generatedAt = new Date().toLocaleString('pt-BR');
      const appName = formApplication?.name ?? applicationId;
      const barColor = getResponseRateBarColor(fs.responseRatePercent);
      const barW = Math.min(100, Math.max(0, fs.responseRatePercent));

      const pctLabel = fs.responseRatePercent.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });

      const sharedStyles = `
          body{font-family:system-ui,sans-serif;padding:24px;color:#222}
          h1{font-size:18px;margin:0 0 8px}
          .meta{color:#555;font-size:13px;margin-bottom:16px}
          .section-title{font-size:14px;font-weight:600;color:#c2410c;text-align:center;margin:24px 0 12px}
          .pct{font-size:32px;font-weight:700;text-align:center;margin:8px 0 16px;color:${barColor}}
          .bar-wrap{max-width:640px;margin:0 auto 20px}
          .bar{height:20px;background:#e0e0e0;border-radius:10px;overflow:hidden;border:1px solid #ccc;box-sizing:border-box}
          .bar > div{height:100%;min-width:2px;border-radius:10px;width:${barW}%;max-width:100%;background:${barColor};-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
          .bar,.bar > div{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
          .sub{font-size:14px;color:#444;text-align:center;margin-bottom:20px;font-weight:500}
          table{border-collapse:collapse;width:100%;font-size:13px;margin-top:8px}
          th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
          th{background:#f5f5f5}
          .note{font-size:12px;color:#666;margin-top:16px}
          .cellbar{height:12px;background:#e0e0e0;border-radius:6px;overflow:hidden;border:1px solid #ddd;min-width:120px}
          .cellbar > div{height:100%;min-width:2px;border-radius:6px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
          .num{text-align:right}
          .est-row td:first-child{font-weight:700;background:#f0f0f0}
          .group-row td:first-child{font-weight:700;background:#f0f0f0}
          .sector-row td:first-child{padding-left:24px;color:#555}
          @media print{
            table{page-break-inside:auto;border-collapse:collapse}
            thead{display:table-header-group!important}
            tbody{display:table-row-group}
            tfoot{display:table-footer-group}
            tr.est-row,tr.group-row{page-break-inside:avoid;break-inside:avoid}
            tbody tr{page-break-inside:auto;break-inside:auto}
          }
      `;

      const tableSection = buildGroupedTableSection(
        viewMode,
        rows,
        hierarchyGroups,
      );

      let noteHtml = '';
      if (isGroupedFetch) {
        const capNote = groupedRowsIncomplete
          ? `Agrupamento limitado a ${rows.length} participantes carregados. Total no recorte: ${fs.totalParticipants}.`
          : '';
        noteHtml = capNote ? `<p class="note">${escapeHtml(capNote)}</p>` : '';
      } else if (
        fs.totalParticipants > EXPORT_ROW_CAP_LIST ||
        rows.length < fs.totalParticipants
      ) {
        noteHtml = `<p class="note">${fs.totalParticipants > EXPORT_ROW_CAP_LIST ? `Listagem limitada a ${EXPORT_ROW_CAP_LIST} linhas. ` : ''}Total no recorte: ${fs.totalParticipants} participantes.</p>`;
      }

      const titleMain = getGroupedPdfTitle(viewMode);

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Recorte — ${escapeHtml(appName)}</title>
        <style>${sharedStyles}</style></head><body>
        <h1>${escapeHtml(titleMain)}</h1>
        <div class="meta">
        <strong>Gerado em:</strong> ${escapeHtml(generatedAt)}<br/>
        <strong>Filtros (hierarquia):</strong> ${escapeHtml(hierarchyLabels || 'Nenhum filtro de hierarquia')}</div>
        <p class="section-title">Taxa de resposta no recorte</p>
        <div class="pct">${pctLabel}%</div>
        <div class="bar-wrap"><div class="bar"><div></div></div></div>
        <div class="sub">Total: ${fs.totalParticipants} participantes | Responderam: ${fs.respondedCount} | Não responderam: ${fs.notRespondedCount}</div>
        ${tableSection}
        ${noteHtml}
        </body></html>`;

      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    } finally {
      setLoading(false);
    }
  }, [
    applicationId,
    companyId,
    filters,
    formApplication?.name,
    orderBy,
    hierarchyLabels,
    viewMode,
    hierarchyGroupsProp,
  ]);

  return (
    <Button
      variant="contained"
      color="primary"
      size="small"
      startIcon={
        loading ? (
          <CircularProgress color="inherit" size={16} />
        ) : (
          <PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} />
        )
      }
      onClick={() => void onExport()}
      disabled={loading}
      sx={{
        textTransform: 'uppercase',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.dark',
          outlineOffset: 2,
        },
      }}
    >
      Recorte (PDF)
    </Button>
  );
};
