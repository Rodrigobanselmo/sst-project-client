import { buildSectorAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-sector';
import { getResponseRateBarColor } from '@v2/models/form/helpers/form-participants-response-rate-colors';
import {
  getFormParticipantHierarchyChain,
  getFormParticipantSectorLabel,
} from '@v2/models/form/helpers/form-participant-hierarchy-display';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
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

export type FormParticipantsPdfViewMode = 'list' | 'grouped';

type Props = {
  companyId: string;
  applicationId: string;
  formApplication?: FormApplicationReadModel;
  filters: BrowseFormParticipantsFilters;
  orderBy: IOrderByParams<FormParticipantsOrderByEnum>[];
  hierarchyLabels: string;
  /** Modo de visualização ativo na tela — define o layout do PDF. */
  viewMode: FormParticipantsPdfViewMode;
  /** Mesmo limite usado na visão agrupada (min(cap, total do recorte)). */
  groupedFetchLimit: number;
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

export const FormParticipantsRecorteExportButton = ({
  companyId,
  applicationId,
  formApplication,
  filters,
  orderBy,
  hierarchyLabels,
  viewMode,
  groupedFetchLimit,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const onExport = useCallback(async () => {
    setLoading(true);
    try {
      const isGrouped = viewMode === 'grouped';

      const bundle = await browseFormParticipants({
        companyId,
        applicationId,
        filters,
        orderBy: isGrouped ? GROUPED_ORDER_BY : orderBy,
        pagination: {
          page: 1,
          limit: isGrouped ? groupedFetchLimit : EXPORT_ROW_CAP_LIST,
        },
      });

      const fs = bundle.filterSummary;
      const rows = bundle.results ?? [];
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
      `;

      let tableSection: string;
      let noteHtml: string;

      if (isGrouped) {
        const aggregates = buildSectorAggregates(rows);
        const tableRows = aggregates
          .map((g) => {
            const c = getResponseRateBarColor(g.responseRatePercent);
            const w = Math.min(100, Math.max(0, g.responseRatePercent));
            const pct = g.responseRatePercent.toLocaleString('pt-BR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 1,
            });
            return `<tr>
              <td>${escapeHtml(g.sectorLabel)}</td>
              <td class="num">${g.total}</td>
              <td class="num">${g.responded}</td>
              <td class="num">${g.notResponded}</td>
              <td class="num">${pct}%</td>
              <td><div class="cellbar"><div style="width:${w}%;max-width:100%;background:${c}"></div></div></td>
            </tr>`;
          })
          .join('');

        tableSection = `<h2 style="font-size:15px;margin:20px 0 8px">Por setor</h2>
        <table><thead><tr>
          <th>Setor</th><th class="num">Participantes</th><th class="num">Responderam</th>
          <th class="num">Não responderam</th><th class="num">Taxa</th><th>Resposta</th>
        </tr></thead><tbody>${tableRows || '<tr><td colspan="6">Nenhum participante no recorte.</td></tr>'}</tbody></table>`;

        const capNote =
          fs.totalParticipants > groupedFetchLimit
            ? `Agrupamento limitado a ${groupedFetchLimit} participantes carregados. Total no recorte: ${fs.totalParticipants}.`
            : '';
        noteHtml = capNote ? `<p class="note">${escapeHtml(capNote)}</p>` : '';
      } else {
        const tableRows = rows
          .map((r) => {
            const hier = `${getFormParticipantSectorLabel(r)} — ${getFormParticipantHierarchyChain(r)}`;
            return `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(hier)}</td><td>${r.hasResponded ? 'Sim' : 'Não'}</td></tr>`;
          })
          .join('');

        tableSection = `<h2 style="font-size:15px;margin:20px 0 8px">Lista de participantes</h2>
        <table><thead><tr><th>Nome</th><th>Setor / hierarquia</th><th>Respondeu</th></tr></thead>
        <tbody>${tableRows}</tbody></table>`;

        noteHtml =
          fs.totalParticipants > EXPORT_ROW_CAP_LIST ||
          rows.length < fs.totalParticipants
            ? `<p class="note">${fs.totalParticipants > EXPORT_ROW_CAP_LIST ? `Listagem limitada a ${EXPORT_ROW_CAP_LIST} linhas. ` : ''}Total no recorte: ${fs.totalParticipants} participantes.</p>`
            : '';
      }

      const titleMain = isGrouped
        ? 'Recorte filtrado — agrupado por setor'
        : 'Participantes — recorte filtrado (lista detalhada)';

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Recorte — ${escapeHtml(appName)}</title>
        <style>${sharedStyles}</style></head><body>
        <h1>${escapeHtml(titleMain)}</h1>
        <div class="meta"><strong>Aplicação:</strong> ${escapeHtml(appName)}<br/>
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
    groupedFetchLimit,
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
