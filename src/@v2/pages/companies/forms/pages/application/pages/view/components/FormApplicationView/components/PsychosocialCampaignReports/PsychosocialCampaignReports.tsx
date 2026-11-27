import { SectorGroupingPlanner } from './SectorGroupingPlanner';
import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { resolveSystemOccupationalChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Checkbox,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import DownloadIcon from '@mui/icons-material/Download';
import { useQuery } from '@tanstack/react-query';
import { api } from 'core/services/apiClient';
import { REPORT_TABLE_PREVIEW_CSS } from '../CampaignReports/report-table-preview';
import { ReportDisclosure } from '../CampaignReports/ReportDisclosure';
import {
  ReportSettings,
  ReportToolbarGroup,
} from '../CampaignReports/ReportSettings';
import { ReportFloatingNavigation } from '../CampaignReports/ReportFloatingNavigation';
import { ReportPresentationInk } from '../CampaignReports/ReportPresentationInk';
import { createCampaignReportHtml } from '../CampaignReports/campaign-report.html';
import {
  campaignReportPrintCss,
  prepareCampaignReportForPrint,
} from '../CampaignReports/campaign-report.print';
import {
  AdherenceChart,
  Bars,
  number,
  Radar,
  riskColors,
  riskLabels,
} from './PsychosocialReportCharts';
import type {
  Indicator,
  PsychContext,
  PsychReport,
} from './psychosocial-report.types';

function SectorRiskDistribution({
  factors,
}: {
  factors: PsychReport['factors'];
}) {
  const presentation = useSystemRiskMatrixPresentation();
  const levels = riskLabels
    .slice(1)
    .map((label, index) => ({
      level: index + 1,
      label,
      count: factors.filter(
        (factor) => !factor.protected && factor.level === index + 1,
      ).length,
    }))
    .filter((item) => item.count > 0);
  const total = levels.reduce((sum, item) => sum + item.count, 0);
  const protectedCount = factors.filter((factor) => factor.protected).length;
  const unclassified = factors.length - total - protectedCount;
  return (
    <Box sx={{ mt: 4, mb: 8, breakInside: 'avoid' }}>
      <Box
        role="img"
        aria-label={
          total
            ? levels.map((item) => `${item.label}: ${item.count}`).join(', ')
            : 'Nenhum fator com classificação disponível'
        }
        sx={{
          display: 'flex',
          width: '100%',
          height: '12px',
          borderRadius: '999px',
          overflow: 'hidden',
          bgcolor: 'action.hover',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {levels.map((item) => (
          <Box
            key={item.level}
            title={`${item.label}: ${item.count} (${number((item.count / total) * 100, '%')})`}
            sx={{
              flex: item.count,
              bgcolor: resolveSystemOccupationalChipColors(
                item.level,
                presentation,
              ).bgcolor,
            }}
          />
        ))}
      </Box>
      <Stack direction="row" flexWrap="wrap" gap={6} sx={{ mt: 3 }}>
        {levels.map((item) => (
          <Typography
            key={item.level}
            variant="caption"
            color="text.primary"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
          >
            <Box
              component="span"
              sx={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                bgcolor: resolveSystemOccupationalChipColors(
                  item.level,
                  presentation,
                ).bgcolor,
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              }}
            />
            {item.label}: {item.count}
          </Typography>
        ))}
        {!!protectedCount && (
          <Typography variant="caption" color="text.secondary">
            Protegidos: {protectedCount}
          </Typography>
        )}
        {!!unclassified && (
          <Typography variant="caption" color="text.secondary">
            Não classificados: {unclassified}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

const HEADINGS = [
  'Aplicação e escopo',
  'Adesão e participação',
  'Como ler o COPSOQ',
  'Resultados por escala',
  'Resultados por dimensão',
  'Distribuição das respostas',
  'Fatores e riscos psicossociais',
  'Orientações para gestão e SESMT',
  'Evolução entre campanhas',
  'Método, rastreabilidade e limitações',
];
const date = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString('pt-BR') : 'Não informado';
function Table({
  headers,
  rows,
  title,
}: {
  headers: string[];
  rows: ReactNode[][];
  title?: string;
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  const compact = rows.length > 10;
  const heading = title ?? `Detalhamento: ${headers[0]}`;
  const expand = () => {
    if (disclosure.current) disclosure.current.open = true;
  };
  return (
    <Box
      sx={{ my: '20px' }}
      data-report-table-preview={compact ? 'true' : undefined}
    >
      {compact ? (
        <details ref={disclosure}>
          <summary>
            <Typography component="h4" color="text.primary" fontWeight={700}>
              {heading}
            </Typography>
          </summary>
        </details>
      ) : (
        title && (
          <Typography
            component="h4"
            color="text.primary"
            fontWeight={700}
            sx={{ mb: 6 }}
          >
            {heading}
          </Typography>
        )
      )}
      <Box data-table-viewport sx={{ overflowX: 'auto' }}>
        <Box
          component="table"
          aria-label={heading}
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'inherit',
            '& td, & th': {
              textAlign: 'left',
              p: '12px',
              borderBottom: '1px solid',
              borderColor: 'divider',
              verticalAlign: 'top',
            },
            '& th': { bgcolor: 'action.hover', fontWeight: 700 },
          }}
        >
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, i) => (
              <tr key={i} onClick={compact && i >= 4 ? expand : undefined}>
                {cells.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
      {compact && (
        <a
          href="#"
          role="button"
          data-table-expand
          aria-label={`Expandir tabela: ${heading}`}
          onClick={(event) => {
            event.preventDefault();
            expand();
          }}
          onKeyDown={(event) => {
            if (event.key === ' ') {
              event.preventDefault();
              expand();
            }
          }}
        >
          ↓
        </a>
      )}
    </Box>
  );
}
function IndicatorTable({ rows }: { rows: Indicator[] }) {
  return (
    <Table
      headers={[
        'Indicador',
        'Pontuação (0–100)',
        'Respondentes válidos',
        'Seleções pontuáveis',
      ]}
      rows={rows.map((r) => [
        r.name,
        r.protected ? 'Dados protegidos' : number(r.score),
        number(r.respondents),
        number(r.selections),
      ])}
    />
  );
}
function Section({
  index,
  children,
  documentType,
  presentation,
}: {
  index: number;
  children: ReactNode;
  documentType: string;
  presentation: boolean;
}) {
  return (
    <Box
      component="section"
      id={`campaign-report-${documentType}-${index}`}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: presentation ? '24px' : 0,
        p: presentation ? { xs: '22px', md: '40px' } : '20px',
        my: '24px',
        scrollMarginTop: '24px',
        minWidth: 0,
      }}
    >
      <ReportDisclosure
        presentation={true}
        title={`${index + 1}. ${HEADINGS[index]}`}
        heading="h2"
      >
        {children}
      </ReportDisclosure>
    </Box>
  );
}

export function PsychosocialCampaignReports({
  companyId,
  applicationId,
}: {
  companyId: string;
  applicationId: string;
}) {
  const [dimensionScales, setDimensionScales] = useState<string[]>(['all']);
  const [unit, setUnit] = useState<string | undefined>();
  const [presentation, setPresentation] = useState(true);
  const [documentType, setDocumentType] = useState('psychosocial');
  const [version, setVersion] = useState('current');
  const [archived, setArchived] = useState<PsychReport | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const surface = useRef<HTMLDivElement>(null),
    report = useRef<HTMLElement>(null);
  const base = `/v2/companies/${companyId}/forms/applications/${applicationId}/psychosocial-reports`;
  const query = useQuery<PsychContext>({
    queryKey: ['psychosocial-report', 'v4', companyId, applicationId, unit],
    queryFn: async () => {
      const context: PsychContext = (
        await api.get(`${base}/context`, { params: { unit } })
      ).data;
      if (
        context.snapshot.method !== 'psychosocial-objective-v4' ||
        context.snapshot.sectors.some(
          (sector) =>
            typeof sector.anonymityBlocked !== 'boolean' ||
            !Number.isFinite(sector.anonymityMinimum),
        )
      ) {
        throw new Error(
          'Os dados do relatório precisam ser atualizados para conferir o anonimato dos setores.',
        );
      }
      return context;
    },
    retry: false,
    staleTime: 60000,
  });
  const data = query.data;
  const s = archived ?? data?.snapshot;
  const allDimensionScales = dimensionScales.includes('all');
  const selectedDimensionScales =
    s?.scales.filter((scale) => dimensionScales.includes(scale.id)) ?? [];
  const visibleDimensions =
    s?.dimensions.filter(
      (dimension) =>
        allDimensionScales ||
        selectedDimensionScales.some((scale) => scale.id === dimension.scaleId),
    ) ?? [];
  const dimensionNumbers = new Map(
    s?.dimensions.map((dimension, index) => [dimension.id, index + 1]),
  );
  useEffect(() => {
    const sync = () =>
      setFullscreen(window.document.fullscreenElement === surface.current);
    window.document.addEventListener('fullscreenchange', sync);
    return () => window.document.removeEventListener('fullscreenchange', sync);
  }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          e?.message ??
          'Não foi possível concluir esta ação.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function chooseVersion(id: string) {
    if (id === 'current') {
      setVersion(id);
      setArchived(null);
      return;
    }
    await run(async () => {
      const snapshot = (await api.get(`${base}/${id}`)).data;
      setArchived(snapshot);
      setVersion(id);
    });
  }
  const valid =
    !!s && !query.isFetching && !busy && (version === 'current' || !!archived);
  async function exportHtml() {
    await run(async () => {
      if (!report.current || !s) return;
      const html = await createCampaignReportHtml(
        report.current,
        `${s.title} — ${s.unit.name}`,
      );
      const url = URL.createObjectURL(
        new Blob([html], { type: 'text/html;charset=utf-8' }),
      );
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `Relatorio-psicossocial-${s.unit.name.replace(/[^\p{L}\p{N} -]/gu, '')}.html`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    });
  }
  async function print(orientation: 'portrait' | 'landscape') {
    await run(async () => {
      if (!report.current) return;
      const frame = window.document.createElement('iframe');
      frame.title = 'Impressão do relatório psicossocial';
      frame.style.cssText =
        'position:fixed;width:1px;height:1px;left:-10000px;border:0';
      window.document.body.appendChild(frame);
      try {
        const target = frame.contentDocument;
        if (!target || !frame.contentWindow)
          throw Error('Não foi possível preparar a impressão.');
        for (const style of Array.from(
          window.document.querySelectorAll('style,link[rel="stylesheet"]'),
        )) {
          if (style instanceof HTMLStyleElement) {
            const copy = target.createElement('style');
            copy.textContent = style.sheet
              ? Array.from(style.sheet.cssRules)
                  .map((r) => r.cssText)
                  .join('\n')
              : style.textContent;
            target.head.appendChild(copy);
          } else target.head.appendChild(style.cloneNode(true));
        }
        target.title = `Relatório psicossocial — ${s?.unit.name}`;
        const css = target.createElement('style');
        css.textContent = campaignReportPrintCss(orientation);
        target.head.appendChild(css);
        const clone = report.current.cloneNode(true) as HTMLElement;
        clone
          .querySelectorAll('[data-report-controls]')
          .forEach((node) => node.remove());
        prepareCampaignReportForPrint(clone);
        target.body.appendChild(clone);
        await target.fonts.ready;
        frame.contentWindow.addEventListener(
          'afterprint',
          () => frame.remove(),
          { once: true },
        );
        frame.contentWindow.focus();
        frame.contentWindow.print();
        window.setTimeout(() => frame.remove(), 120000);
      } catch (e) {
        frame.remove();
        throw e;
      }
    });
  }
  const paragraph = (text: string) => (
    <Typography
      color="text.primary"
      component="p"
      sx={{ my: '16px', lineHeight: 1.75 }}
    >
      {text}
    </Typography>
  );
  if (query.isLoading)
    return (
      <Stack direction="row" spacing={6} alignItems="center">
        <CircularProgress size={24} />{' '}
        <Typography color="text.primary">
          Consolidando os dados objetivos da campanha…
        </Typography>
      </Stack>
    );
  if (query.isError || !s || !data)
    return (
      <Alert severity="error">
        Não foi possível montar o relatório.{' '}
        {(query.error as any)?.response?.data?.message ?? ''}
        <Button onClick={() => query.refetch()}>Tentar novamente</Button>
      </Alert>
    );
  const factors = s.factors;
  const classified = factors.filter((f) => !f.protected && f.level != null);
  const groupedMembers = new Set(
    s.hierarchyGroups.flatMap((group) => group.hierarchyIds),
  );
  const sectorAssessments = s.sectors
    .filter((sector) => !groupedMembers.has(sector.id))
    .map((sector) => {
      const rows = factors.filter((factor) => factor.entityId === sector.id);
      return { ...sector, rows, establishment: rows[0]?.establishment ?? '' };
    });
  const availableSectors = [
    ...sectorAssessments
      .filter((sector) => !sector.anonymityBlocked && sector.rows.length > 0)
      .map((sector) => ({ ...sector, title: sector.name })),
    ...s.hierarchyGroups
      .filter((group) => !group.anonymityBlocked && !group.scopeProtected)
      .map((group) => ({
        id: group.id,
        name: group.name,
        title: `${group.name} (Agrupamento: ${group.members.map((member) => member.name).join('; ')})`,
      })),
  ].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  const unavailableSectors = sectorAssessments.filter(
    (sector) => sector.anonymityBlocked,
  );
  const comparison: PsychContext['comparison'] = archived
    ? {
        available: false,
        reason:
          'A evolução é consultada na prévia atual, usando o último relatório compatível preservado do ciclo anterior.',
      }
    : data.comparison;
  const cumulative = s.evolution.reduce<{ name: string; value: number }[]>(
    (rows, p) => {
      rows.push({
        name: date(p.date + 'T12:00:00'),
        value: (rows.at(-1)?.value ?? 0) + p.newResponses,
      });
      return rows;
    },
    [],
  );
  return (
    <Box
      ref={surface}
      sx={{
        position: 'relative',
        minWidth: 0,
        color: 'text.primary',
        '&:fullscreen': {
          bgcolor: 'background.default',
          overflowY: 'auto',
          p: { xs: '16px', md: '40px' },
          pb: '100px',
        },
        '& h2': {
          fontSize: presentation ? { xs: '1.6rem', md: '2rem' } : '1.4rem',
          lineHeight: 1.4,
        },
        '& h3': { fontSize: '1.2rem' },
        '& p': { lineHeight: 1.7 },
        '@media print': { '[data-report-controls]': { display: 'none' } },
      }}
    >
      <style>{REPORT_TABLE_PREVIEW_CSS}</style>
      {fullscreen && (
        <Button
          data-report-controls
          variant="contained"
          sx={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 10000,
            bgcolor: 'background.paper',
            color: 'primary.main',
            boxShadow: 3,
          }}
          onClick={() =>
            run(async () => {
              await window.document.exitFullscreen();
            })
          }
        >
          Sair da tela cheia
        </Button>
      )}
      {!fullscreen && (
        <Box data-report-controls>
          <TextField
            select
            label="Estabelecimento do relatório"
            value={unit ?? data.snapshot.unit.key}
            onChange={(e) => {
              setUnit(e.target.value);
              setVersion('current');
              setArchived(null);
            }}
            fullWidth
            sx={{ mb: '24px' }}
          >
            {data.units
              .filter((u) => u.key !== 'unassigned')
              .map((u) => (
                <MenuItem key={u.key} value={u.key}>
                  {u.name}
                </MenuItem>
              ))}
            <MenuItem value="all">
              Todos os estabelecimentos — consolidado
            </MenuItem>
          </TextField>
          <ReportSettings subtitle="Preserve versões e exporte a apresentação independente em HTML.">
            <Stack spacing={8}>
              <Typography color="text.primary">
                Relatório objetivo, sem geração por IA. Preserve uma versão para
                registrar a base desta campanha e permitir a comparação com
                ciclos futuros.
              </Typography>
              <Stack direction="row" spacing={8} flexWrap="wrap" useFlexGap>
                <TextField
                  select
                  label="Versão exibida"
                  value={version}
                  disabled={busy}
                  sx={{ minWidth: '280px' }}
                  onChange={(e) => chooseVersion(e.target.value)}
                >
                  <MenuItem value="current">
                    Prévia com os dados atuais
                  </MenuItem>
                  {data.versions
                    .filter(
                      (v) => v.unit.key === (unit ?? data.snapshot.unit.key),
                    )
                    .map((v) => (
                      <MenuItem key={v.id} value={v.id}>
                        Versão preservada ·{' '}
                        {new Date(v.createdAt).toLocaleString('pt-BR')}
                      </MenuItem>
                    ))}
                </TextField>
                <Button
                  variant="contained"
                  disabled={!valid}
                  onClick={() =>
                    run(async () => {
                      const result = (
                        await api.post(base, { unit: s.unit.key })
                      ).data;
                      await query.refetch();
                      setVersion(result.id);
                      setArchived(result.snapshot);
                    })
                  }
                >
                  Preservar versão da campanha
                </Button>
                <Button
                  variant="outlined"
                  disabled={!valid}
                  startIcon={<DownloadIcon />}
                  onClick={exportHtml}
                >
                  Gerar HTML
                </Button>
              </Stack>
            </Stack>
          </ReportSettings>
        </Box>
      )}
      <Box
        data-report-controls
        sx={{
          display: fullscreen ? 'none' : 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '24px',
          flexWrap: 'wrap',
          mb: '28px',
        }}
      >
        <ReportToolbarGroup
          title="Tipo de relatório"
          description="Consulte a campanha ou sua evolução."
        >
          <ToggleButtonGroup
            exclusive
            value={documentType}
            onChange={(_, v) => v && setDocumentType(v)}
          >
            <ToggleButton value="psychosocial">
              Relatório da campanha
            </ToggleButton>
            <ToggleButton value="psychosocial-evolution">
              Evolução entre campanhas
            </ToggleButton>
          </ToggleButtonGroup>
        </ReportToolbarGroup>
        <ReportToolbarGroup
          title="Forma de apresentação"
          description="Escolha como visualizar o relatório."
        >
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <ToggleButtonGroup
              exclusive
              value={presentation ? 'html' : 'technical'}
              onChange={(_, v) => v && setPresentation(v === 'html')}
            >
              <ToggleButton value="html">Apresentação (HTML)</ToggleButton>
              <ToggleButton value="technical">Relatório técnico</ToggleButton>
            </ToggleButtonGroup>
            <Button
              startIcon={<FullscreenIcon />}
              onClick={() =>
                run(async () => {
                  if (fullscreen) await window.document.exitFullscreen();
                  else await surface.current?.requestFullscreen();
                })
              }
            >
              {fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            </Button>
          </Stack>
        </ReportToolbarGroup>
        <ReportToolbarGroup
          title="Exportação em PDF"
          description="No diálogo de impressão, escolha “Salvar como PDF”."
          align="right"
        >
          <Stack direction="row" spacing={4}>
            <Button
              variant="outlined"
              disabled={!valid}
              onClick={() => print('portrait')}
            >
              PDF em retrato
            </Button>
            <Button
              variant="outlined"
              disabled={!valid}
              onClick={() => print('landscape')}
            >
              PDF em paisagem
            </Button>
          </Stack>
        </ReportToolbarGroup>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: '20px' }}>
          {error}
        </Alert>
      )}
      {query.isFetching && (
        <Alert severity="info">
          Atualizando o recorte… A exportação será liberada ao concluir.
        </Alert>
      )}
      <Box
        component="article"
        ref={report}
        aria-label={
          documentType === 'psychosocial'
            ? 'Relatório técnico psicossocial'
            : 'Evolução entre campanhas'
        }
        sx={{
          position: 'relative',
          minWidth: 0,
          fontSize: presentation ? '1.05rem' : '1rem',
          '& table': { fontSize: '0.92em' },
        }}
      >
        <Box
          component="header"
          sx={{
            bgcolor: 'background.paper',
            p: { xs: '28px', md: '56px' },
            borderRadius: '24px',
            borderBottom: '3px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography color="text.primary" variant="overline">
            SIMPLESST · RELATÓRIO TÉCNICO PSICOSSOCIAL
          </Typography>
          <Typography
            color="text.primary"
            component="h1"
            sx={{
              fontSize: { xs: '2rem', md: '3.1rem' },
              my: '24px',
              fontWeight: 700,
            }}
          >
            {documentType === 'psychosocial'
              ? 'Relatório da campanha'
              : 'Evolução entre campanhas'}
          </Typography>
          <Typography color="text.primary" variant="h5">
            {s.unit.name}
          </Typography>
          {paragraph(s.title)}
          {paragraph(
            `Período de coleta: ${date(s.startedAt)} a ${date(s.endedAt)} · ${s.cycleNumber ? `Ciclo ${s.cycleNumber}` : 'Campanha inicial · série registrada ao criar o próximo ciclo'}`,
          )}
          <Typography color="text.secondary">
            {version === 'current'
              ? 'Prévia dos dados atuais'
              : 'Versão preservada'}{' '}
            · Base consultada em {new Date(s.asOf).toLocaleString('pt-BR')} ·
            Resultados objetivos, sem geração por IA.
          </Typography>
        </Box>
        {s.warnings.map((w) => (
          <Alert key={w} severity="warning" sx={{ my: '20px' }}>
            {w}
          </Alert>
        ))}
        {documentType !== 'psychosocial' ? (
          <Box
            component="section"
            id="campaign-report-psychosocial-evolution-0"
            sx={{ p: '32px' }}
          >
            <h2>Evolução entre campanhas</h2>
            {!comparison.available ? (
              paragraph(comparison.reason ?? 'Sem base anterior compatível.')
            ) : (
              <>
                <h3>{comparison.beforeTitle}</h3>
                {paragraph(
                  'Diferenças em pontos na escala de 0 a 100. O sinal da diferença exige interpretação conforme o sentido de cada item; não representa diagnóstico ou causalidade.',
                )}
                <Table
                  headers={[
                    'Escala / dimensão',
                    'Anterior',
                    'Atual',
                    'Diferença (pontos)',
                  ]}
                  rows={[
                    ...(comparison.scales ?? []),
                    ...(comparison.dimensions ?? []),
                  ].map((r) => [
                    r.name,
                    number(r.before),
                    number(r.after),
                    number(r.delta),
                  ])}
                />
                <h3>Riscos ocupacionais por setor e fator</h3>
                <Table
                  headers={[
                    'Setor',
                    'Fator',
                    'Classificação anterior',
                    'Classificação atual',
                    'Probabilidade anterior / atual',
                    'Leitura',
                  ]}
                  rows={(comparison.risks ?? []).map((r) => [
                    r.entity,
                    r.name,
                    r.before == null ? 'Não disponível' : riskLabels[r.before],
                    r.after == null ? 'Não disponível' : riskLabels[r.after],
                    `${number(r.beforeProbability)} / ${number(r.afterProbability)}`,
                    r.severityChanged
                      ? 'Severidade alterada — revisar a comparabilidade'
                      : r.status,
                  ])}
                />
                {paragraph(
                  `Adesão anterior: ${number(comparison.adherence?.before, '%')}; atual: ${number(comparison.adherence?.after, '%')}.`,
                )}
              </>
            )}
            {paragraph(
              'A comparação utiliza versões preservadas de ciclos da mesma série, do mesmo estabelecimento e com estrutura e método compatíveis. Mudanças de quadro, composição e participação precisam acompanhar a leitura das diferenças.',
            )}
          </Box>
        ) : (
          <>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={0}
            >
              {paragraph(
                `Instrumento aplicado: ${s.formName}. Este documento reúne aplicação, participação, resultados do questionário e classificação dos fatores de risco no recorte “${s.unit.name}”.`,
              )}
              <Table
                headers={['Informação', 'Registro']}
                rows={[
                  ['Situação da campanha', 'Concluída'],
                  ['Estabelecimento', s.unit.name],
                  ['Público elegível', number(s.performance.total)],
                  ['Pessoas que responderam', number(s.performance.responded)],
                  [
                    'Submissões com respostas no recorte',
                    number(s.submissions),
                  ],
                  [
                    'Perguntas objetivas',
                    number(
                      s.groups.reduce((n, g) => n + g.questions.length, 0),
                    ),
                  ],
                  [
                    'Escalas / dimensões',
                    `${s.scales.length} / ${s.dimensions.length}`,
                  ],
                  ['Meta de adesão', number(s.participationGoal, '%')],
                ]}
              />
              {paragraph(
                'O consolidado conta pessoas distintas. Resultados por estabelecimento usam a estrutura organizacional vinculada às respostas; eles não devem ser somados indiscriminadamente quando houver vínculos sobrepostos. Nenhuma identificação pessoal integra este relatório.',
              )}
            </Section>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={1}
            >
              <ReportDisclosure
                presentation={true}
                title="2.1 Participação no recorte"
                heading="h3"
              >
                <Bars
                  rows={[
                    { name: 'Responderam', value: s.performance.responded },
                    { name: 'Não responderam', value: s.performance.pending },
                  ]}
                  percent={false}
                />
                {paragraph(
                  `Adesão: ${number(s.performance.adherence, '%')}. Denominador: ${number(s.performance.total)} pessoas elegíveis; numerador: ${number(s.performance.responded)} pessoas com resposta válida no escopo operacional da campanha.`,
                )}
              </ReportDisclosure>
              <ReportDisclosure
                presentation={true}
                title="2.2 Evolução da adesão"
                heading="h3"
              >
                <AdherenceChart
                  series={s.evolution}
                  total={s.performance.total}
                />
                <Table
                  title="Evolução diária das respostas e da adesão"
                  headers={[
                    'Data',
                    'Novas respostas',
                    'Respostas acumuladas',
                    'Adesão acumulada',
                  ]}
                  rows={s.evolution.map((p, i) => [
                    date(p.date + 'T12:00:00'),
                    number(p.newResponses),
                    number(cumulative[i].value),
                    number(
                      s.performance.total
                        ? (cumulative[i].value / s.performance.total) * 100
                        : null,
                      '%',
                    ),
                  ])}
                />
              </ReportDisclosure>
              <ReportDisclosure
                presentation={true}
                title="2.3 Desempenho por setor"
                heading="h3"
              >
                <Table
                  headers={[
                    'Setor',
                    'Elegíveis',
                    'Responderam',
                    'Não responderam',
                    'Adesão',
                  ]}
                  rows={s.sectors.map((r) => [
                    r.name,
                    number(r.total),
                    number(r.responded),
                    number(r.pending),
                    number(r.adherence, '%'),
                  ])}
                />
              </ReportDisclosure>
              <ReportDisclosure
                presentation={true}
                title="2.4 Desempenho nas demais hierarquias"
                heading="h3"
              >
                <Table
                  headers={[
                    'Nível',
                    'Unidade organizacional',
                    'Elegíveis',
                    'Responderam',
                    'Não responderam',
                    'Adesão',
                  ]}
                  rows={(s.organizationalPerformance ?? []).map((r) => [
                    (
                      {
                        DIRECTORY: 'Diretoria',
                        MANAGEMENT: 'Gerência',
                        SUB_SECTOR: 'Subsetor',
                      } as Record<string, string>
                    )[r.type] ?? r.type,
                    r.name,
                    number(r.total),
                    number(r.responded),
                    number(r.pending),
                    number(r.adherence, '%'),
                  ])}
                />
              </ReportDisclosure>
              <ReportDisclosure
                presentation={true}
                title="2.5 Perfil agregado dos respondentes"
                heading="h3"
              >
                {paragraph(
                  'Distribuições de idade e sexo, quando cadastradas, sem identificação individual. Campos pessoais, texto livre e combinações de atributos não são exibidos. Células pequenas são protegidas.',
                )}
                {(s.profile ?? []).map((p) => (
                  <Box key={p.id} sx={{ my: '24px' }}>
                    <h3>{p.text}</h3>
                    {p.distributionProtected ? (
                      <Typography color="text.primary">
                        Distribuição protegida.
                      </Typography>
                    ) : (
                      <Bars
                        rows={p.options.map((o) => ({
                          name: o.text,
                          value: o.percentage,
                          detail: `${number(o.count)} respostas`,
                        }))}
                      />
                    )}
                  </Box>
                ))}
              </ReportDisclosure>
              {paragraph(
                'A ausência de resposta não permite inferir a percepção ou a condição de saúde de quem não participou. Diferenças de adesão entre setores devem orientar a leitura da representatividade.',
              )}
            </Section>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={2}
            >
              {paragraph(
                'O COPSOQ organiza perguntas sobre o ambiente psicossocial de trabalho em construtos. No cadastro desta aplicação, “escala” identifica o bloco temático mais amplo e “dimensão” identifica o aspecto específico dentro dele. Essa nomenclatura descreve a organização adotada no sistema; versões do instrumento podem usar escalas e dimensões de outra forma.',
              )}
              <Table
                headers={['Camada', 'O que informa', 'Como utilizar']}
                rows={[
                  [
                    'Pergunta',
                    'Frequência ou intensidade declarada em cada item',
                    'Ler a distribuição completa das alternativas',
                  ],
                  [
                    'Dimensão',
                    'Síntese das perguntas de um aspecto específico',
                    'Localizar os aspectos que merecem investigação',
                  ],
                  [
                    'Escala',
                    'Síntese do bloco temático configurado',
                    'Orientar a leitura executiva sem substituir as dimensões',
                  ],
                  [
                    'Fator de risco',
                    'Vínculo entre perguntas e fatores cadastrados',
                    'Examinar a exposição por setor e sua classificação ocupacional',
                  ],
                ]}
              />
              {paragraph(
                'Os indicadores reproduzem a pontuação cadastrada nas alternativas, incluindo os itens com codificação invertida. A pontuação de 0 a 100 não é percentual de pessoas doentes, probabilidade clínica ou nível de risco ocupacional. A interpretação deve acompanhar o conteúdo e o sentido dos itens.',
              )}
              <Typography color="text.primary" component="p">
                Referência conceitual:{' '}
                <a
                  href="https://www.copsoq-network.org/licence-guidelines-and-questionnaire"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Diretrizes e questionário da rede internacional COPSOQ
                </a>
                . A composição efetiva abaixo é a versão aplicada nesta
                campanha.
              </Typography>
            </Section>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={3}
            >
              {paragraph(
                'Visão sintética por bloco temático, calculada sobre as seleções pontuáveis de suas perguntas. A média agregada pondera a quantidade de seleções válidas; não é uma média de médias das dimensões.',
              )}
              <Radar rows={s.scales} />
              <Bars
                rows={s.scales.map((r) => ({ name: r.name, value: r.score }))}
              />
              <IndicatorTable rows={s.scales} />
            </Section>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={4}
            >
              {paragraph(
                'As dimensões detalham os blocos e permitem distinguir aspectos que poderiam ficar ocultos na síntese da escala. Bases pequenas ou sem seleções válidas são protegidas, sem substituição por zero.',
              )}
              <h3>Radar das dimensões</h3>
              <Box
                data-report-controls
                sx={{ my: 8, '@media print': { display: 'none' } }}
              >
                <TextField
                  select
                  label="Escalas das dimensões"
                  size="small"
                  value={dimensionScales}
                  sx={{ width: '100%', maxWidth: 480 }}
                  SelectProps={{
                    multiple: true,
                    renderValue: () =>
                      allDimensionScales
                        ? 'Exibir todas as dimensões'
                        : selectedDimensionScales
                            .map((scale) =>
                              scale.name.replace(/^Escala — /, ''),
                            )
                            .join(', '),
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          '& .MuiMenuItem-root, & .MuiListItemText-primary': {
                            color: 'text.primary',
                          },
                          '& .MuiMenuItem-root.Mui-selected': {
                            bgcolor: 'action.selected',
                          },
                          '& .MuiCheckbox-root': {
                            color: 'text.secondary',
                            '&.Mui-checked': { color: 'primary.main' },
                          },
                        },
                      },
                    },
                  }}
                  onChange={(event) => {
                    const value = event.target.value as unknown as
                      | string
                      | string[];
                    const next =
                      typeof value === 'string' ? value.split(',') : value;
                    setDimensionScales(
                      next.includes('all') && !allDimensionScales
                        ? ['all']
                        : next.filter((id) => id !== 'all'),
                    );
                  }}
                >
                  <MenuItem value="all">
                    <Checkbox checked={allDimensionScales} />
                    <ListItemText primary="Exibir todas as dimensões" />
                  </MenuItem>
                  {s.scales.map((scale) => (
                    <MenuItem key={scale.id} value={scale.id}>
                      <Checkbox
                        checked={
                          !allDimensionScales &&
                          dimensionScales.includes(scale.id)
                        }
                      />
                      <ListItemText
                        primary={scale.name.replace(/^Escala — /, '')}
                      />
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {!allDimensionScales && (
                <Typography color="text.primary" sx={{ mb: 6 }}>
                  Escalas exibidas:{' '}
                  {selectedDimensionScales
                    .map((scale) => scale.name.replace(/^Escala — /, ''))
                    .join(', ') || 'Nenhuma escala selecionada'}
                  . A exportação acompanha esta seleção.
                </Typography>
              )}
              <Radar
                rows={visibleDimensions}
                axisNumbers={visibleDimensions.map(
                  (dimension) => dimensionNumbers.get(dimension.id)!,
                )}
                series={
                  selectedDimensionScales.length > 1 && !allDimensionScales
                    ? selectedDimensionScales.map((scale) => ({
                        name: scale.name,
                        rows: visibleDimensions.filter(
                          (dimension) => dimension.scaleId === scale.id,
                        ),
                      }))
                    : undefined
                }
                title="Radar das dimensões, pontuação de 0 a 100"
                numberedAxes
              />
              <Bars
                rows={visibleDimensions.map((r) => ({
                  name: `${dimensionNumbers.get(r.id)}. ${r.name}`,
                  value: r.score,
                }))}
              />
              <IndicatorTable rows={visibleDimensions} />
              <ReportDisclosure
                presentation={true}
                title="5.1 Dimensões por setor"
                heading="h3"
              >
                {s.sectors.map((sector, i) => (
                  <ReportDisclosure
                    key={sector.id}
                    presentation={presentation}
                    title={`5.1.${i + 1} ${sector.name}`}
                    heading="h3"
                  >
                    <Table
                      headers={['Dimensão', 'Pontuação (0–100)', 'Base válida']}
                      rows={sector.dimensionScores
                        .filter((d) =>
                          visibleDimensions.some(
                            (dimension) => dimension.key === d.key,
                          ),
                        )
                        .map((d) => [
                          d.name,
                          d.protected ? 'Dados protegidos' : number(d.score),
                          number(d.respondents),
                        ])}
                    />
                  </ReportDisclosure>
                ))}
              </ReportDisclosure>
            </Section>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={5}
            >
              {paragraph(
                'Frequência e percentual das alternativas em cada pergunta. O denominador é o número de submissões que responderam ao item. Alternativas sem valor pontuável aparecem na distribuição, mas não entram no indicador. Distribuições com células pequenas são protegidas integralmente para impedir a dedução por diferença.',
              )}
              {s.groups.map((group, i) => (
                <Box key={group.id} className="campaign-report-theme">
                  <ReportDisclosure
                    presentation={true}
                    title={`6.${i + 1} ${group.name}`}
                    heading="h3"
                  >
                    {group.questions.map((q, j) => (
                      <Box
                        key={q.id}
                        className="campaign-report-question"
                        sx={{
                          my: '32px',
                          p: { xs: '12px', md: '24px' },
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '16px',
                        }}
                      >
                        <ReportDisclosure
                          presentation={true}
                          title={`6.${i + 1}.${j + 1} ${q.text}`}
                          heading="h3"
                        >
                          {paragraph(
                            `Pontuação: ${number(q.score)} / 100 · ${number(q.respondents)} respondentes com seleção pontuável.`,
                          )}
                          {q.distributionProtected ? (
                            <Typography color="text.secondary">
                              Distribuição protegida por base insuficiente ou
                              célula com menos de três respostas.
                            </Typography>
                          ) : (
                            <>
                              <Bars
                                rows={q.options.map((o) => ({
                                  name: o.text,
                                  value: o.percentage,
                                  detail: `${number(o.count)} seleções`,
                                }))}
                              />
                              <Table
                                headers={[
                                  'Alternativa',
                                  'Valor cadastrado',
                                  'Seleções',
                                  '% das respostas',
                                ]}
                                rows={q.options.map((o) => [
                                  o.text,
                                  o.value ?? 'Não pontuável',
                                  number(o.count),
                                  number(o.percentage, '%'),
                                ])}
                              />
                            </>
                          )}
                        </ReportDisclosure>
                      </Box>
                    ))}
                  </ReportDisclosure>
                </Box>
              ))}
            </Section>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={6}
            >
              {paragraph(
                'A leitura passa dos construtos do questionário para os fatores associados no cadastro do sistema. A probabilidade por fator e setor vem do motor de análise existente; a classificação ocupacional combina probabilidade e severidade pela matriz qualitativa do sistema. Esse resultado demanda validação técnica do contexto de trabalho e das medidas existentes.',
              )}
              <ReportDisclosure
                presentation={true}
                title="7.1 Como as perguntas chegam aos fatores de risco"
                heading="h3"
              >
                <Table
                  headers={[
                    'Fator psicossocial',
                    'Dimensões relacionadas',
                    'Perguntas vinculadas',
                  ]}
                  rows={(s.factorLinks ?? []).map((f) => [
                    f.name,
                    f.dimensions.join('; '),
                    f.questions.join(' · '),
                  ])}
                />
                <Typography color="text.primary">
                  Consulta da matriz qualitativa: linhas = probabilidade;
                  colunas = severidade. A classe resulta da célula da matriz,
                  não da multiplicação aritmética de P por S.
                </Typography>
                <Table
                  headers={['P / S', '1', '2', '3', '4', '5']}
                  rows={(s.matrix ?? []).map((r) => [
                    String(r.probability),
                    ...r.cells.map((c) => (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          borderLeft: '5px solid',
                          borderColor: riskColors[c.level],
                          pl: '8px',
                        }}
                      >
                        {riskLabels[c.level]}
                      </Box>
                    )),
                  ])}
                />
              </ReportDisclosure>
              <ReportDisclosure
                presentation={true}
                title="7.2 Distribuição da classificação ocupacional"
                heading="h3"
              >
                <Bars
                  percent={false}
                  rows={riskLabels.slice(1).map((name, i) => ({
                    name,
                    value: classified.filter((f) => f.level === i + 1).length,
                    color: riskColors[i + 1],
                  }))}
                />
                {paragraph(
                  `Unidade de contagem: par setor × fator, e não pessoa. ${number(classified.length)} pares classificados; ${number(factors.filter((f) => f.protected).length)} pares com resultados protegidos.`,
                )}
              </ReportDisclosure>
              <ReportDisclosure
                presentation={true}
                title="7.3 Avaliação dos setores com diagnóstico disponível"
                heading="h3"
              >
                {availableSectors.map(({ id, title }, i) => (
                  <ReportDisclosure
                    key={id}
                    presentation={presentation}
                    title={`7.3.${i + 1} ${title}`}
                    heading="h3"
                  >
                    <SectorRiskDistribution
                      factors={factors.filter(
                        (factor) => factor.entityId === id,
                      )}
                    />
                    <Table
                      headers={[
                        'Fator psicossocial',
                        'Probabilidade',
                        'Severidade',
                        'Risco ocupacional',
                        'Inventário',
                      ]}
                      rows={factors
                        .filter((f) => f.entityId === id)
                        .map((f) => [
                          f.name,
                          f.protected ? 'Protegido' : number(f.probability),
                          f.protected
                            ? 'Protegido'
                            : f.severity == null
                              ? 'Não informada'
                              : number(f.severity),
                          f.protected
                            ? 'Dados protegidos'
                            : riskLabels[f.level ?? 0],
                          f.inInventory
                            ? 'Vinculado'
                            : 'Sem vínculo identificado',
                        ])}
                    />
                  </ReportDisclosure>
                ))}
              </ReportDisclosure>
              <ReportDisclosure
                presentation={true}
                title="7.4 Setores abaixo do mínimo de respondentes"
                heading="h3"
              >
                <Box
                  sx={{
                    p: 8,
                    my: 8,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '16px',
                    color: 'text.primary',
                  }}
                >
                  <Typography
                    component="h4"
                    fontWeight={700}
                    color="text.primary"
                  >
                    Cobertura do diagnóstico e decisões de agrupamento
                  </Typography>
                  {paragraph(
                    `${number(unavailableSectors.length)} setores abaixo do mínimo de respondentes definido pela empresa. O critério considera respondentes, não pessoas cadastradas nem quantidade de perguntas por fator. O mínimo padrão é três, mas este relatório respeita a configuração vigente de cada empresa.`,
                  )}
                  {unavailableSectors.length ? (
                    <>
                      <Typography
                        component="p"
                        color="text.primary"
                        sx={{ my: '16px', lineHeight: 1.75 }}
                      >
                        <Box
                          component="strong"
                          sx={{
                            fontWeight: 800,
                            color: (theme) =>
                              theme.palette.mode === 'dark'
                                ? theme.palette.primary.main
                                : theme.palette.text.primary,
                          }}
                        >
                          Setores a revisar:
                        </Box>{' '}
                        {unavailableSectors
                          .map((sector) =>
                            s.unit.key === 'all' && sector.establishment
                              ? `${sector.name} (${sector.establishment})`
                              : sector.name,
                          )
                          .join('; ')}
                        .
                      </Typography>
                      {paragraph(
                        'Estes setores não atingiram o mínimo configurado de respondentes para diagnóstico individual. Avalie um agrupamento tecnicamente compatível para obter uma base coletiva suficiente. A ausência de diagnóstico não significa ausência de risco. Indicadores de saúde não são fatores de risco e não entram na classificação ocupacional.',
                      )}
                      {paragraph(
                        'Para RH e SESMT: revisar primeiro o estabelecimento e o contexto de trabalho; avaliar agrupamentos apenas entre setores com atividades, exposições e organização do trabalho comparáveis. Nomes semelhantes são pistas para revisão, não evidência suficiente de equivalência. Confirmar a composição e a base válida no cadastro de agrupamentos e recalcular pelo motor de análise. Não somar médias nem respostas manualmente.',
                      )}
                      {paragraph(
                        'O relatório não dispõe da composição detalhada dos agrupamentos nem da descrição das atividades para recomendar combinações específicas com segurança. Os agrupamentos já cadastrados aparecem no item 7.5; sua existência não comprova cobertura destes setores nem elegibilidade para o diagnóstico.',
                      )}
                    </>
                  ) : (
                    paragraph(
                      'Nenhum setor deste recorte está abaixo do mínimo configurado de respondentes.',
                    )
                  )}
                </Box>
                {!!unavailableSectors.length && (
                  <SectorGroupingPlanner
                    key={`${s.applicationId}:${s.unit.key}`}
                    sectors={unavailableSectors}
                    existingGroupMemberIds={[...groupedMembers]}
                    companyId={companyId}
                    applicationId={applicationId}
                    consolidated={s.unit.key === 'all'}
                  />
                )}
                {!!unavailableSectors.length && (
                  <Table
                    title="Setores que precisam de revisão para disponibilizar o diagnóstico"
                    headers={[
                      'Estabelecimento',
                      'Setor',
                      'Respondentes',
                      'Mínimo configurado',
                      'Encaminhamento',
                    ]}
                    rows={unavailableSectors.map((sector) => [
                      sector.establishment,
                      sector.name,
                      number(sector.responded),
                      number(sector.anonymityMinimum),
                      'Avaliar agrupamento com contexto de trabalho e exposições comparáveis',
                    ])}
                  />
                )}
              </ReportDisclosure>
              <ReportDisclosure
                presentation={true}
                title="7.5 Agrupamentos organizacionais"
                heading="h3"
              >
                {s.hierarchyGroups.length ? (
                  <Table
                    headers={[
                      'Agrupamento',
                      'Setores vinculados',
                      'Elegíveis',
                      'Responderam',
                      'Adesão',
                    ]}
                    rows={s.hierarchyGroups.map((g) => [
                      g.name,
                      number(g.sectorCount),
                      number(g.total),
                      number(g.responded),
                      number(g.adherence, '%'),
                    ])}
                  />
                ) : (
                  paragraph(
                    'Não há agrupamentos inteiramente contidos neste estabelecimento. A tabela mantém os resultados por setor para evitar misturar recortes ou contar novamente os mesmos fatores.',
                  )
                )}
                {paragraph(
                  'A classificação exibida é a do motor de fatores psicossociais da campanha. O vínculo com o inventário não equivale à aprovação deste relatório, nem comprova implantação de medidas ou encerramento de um plano de ação.',
                )}
              </ReportDisclosure>
              <ReportDisclosure
                presentation={true}
                title="7.6 Fontes geradoras e medidas já validadas"
                heading="h3"
              >
                {paragraph(
                  'Itens já registrados e aceitos na análise dos setores ou agrupamentos inteiramente contidos no recorte, sem nova geração por IA. Os nomes dos revisores e seus comentários não integram o documento. A aceitação do item não comprova implantação da medida.',
                )}
                <Table
                  headers={[
                    'Setor',
                    'Fator',
                    'Tipo',
                    'Item aceito',
                    'Origem do registro',
                  ]}
                  rows={(s.registeredMeasures ?? [])
                    .filter((r) => r.accepted)
                    .map((r) => [
                      r.sector,
                      r.risk,
                      (
                        {
                          fontesGeradoras: 'Fonte geradora',
                          medidasEngenhariaRecomendadas: 'Medida de engenharia',
                          medidasAdministrativasRecomendadas:
                            'Medida administrativa',
                        } as Record<string, string>
                      )[r.type] ?? r.type,
                      r.name,
                      r.origin,
                    ])}
                />
                {paragraph(
                  `${(s.registeredMeasures ?? []).filter((r) => !r.accepted).length} itens ainda sem aceite registrado não foram reproduzidos. Cópias da mesma análise de agrupamento são reunidas; esta lista não declara ausência de fontes ou medidas.`,
                )}
              </ReportDisclosure>
            </Section>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={7}
            >
              {paragraph(
                'Para a diretoria e os gestores: examine primeiro a cobertura da campanha e as diferenças entre setores. Use os blocos e dimensões para localizar os temas e consulte as distribuições antes de estabelecer prioridades. Evite ordenar estabelecimentos por uma média global isolada.',
              )}
              <Table
                headers={[
                  'Destinatário',
                  'Uso recomendado',
                  'Registro a completar',
                ]}
                rows={[
                  [
                    'Gestores e diretoria',
                    'Priorizar a verificação dos fatores classificados como altos e muito altos, considerando a cobertura do setor',
                    'Responsável, prazo e recursos necessários',
                  ],
                  [
                    'Engenharia de segurança / SESMT',
                    'Confrontar os fatores com a atividade real, a organização do trabalho e as medidas existentes',
                    'Validação da exposição, medidas e integração com inventário/plano de ação',
                  ],
                  [
                    'Medicina do trabalho',
                    'Utilizar os achados coletivos como subsídio contextual, preservando a confidencialidade clínica',
                    'Avaliação profissional pertinente, sem inferir diagnósticos individuais do questionário',
                  ],
                ]}
              />
              {paragraph(
                'Estas orientações são fixas e não foram produzidas por IA. Ações, responsáveis e prazos precisam ser definidos e validados pela equipe competente; o documento não inventa medidas aprovadas nem conclusões clínicas.',
              )}
            </Section>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={8}
            >
              {comparison.available
                ? paragraph(
                    'Existe uma base anterior compatível. Selecione “Evolução entre campanhas” para consultar as diferenças.',
                  )
                : paragraph(
                    comparison.reason ?? 'Sem base anterior compatível.',
                  )}
              {paragraph(
                'Preserve esta versão nas configurações do relatório. Na próxima campanha, a comparação mantém o estabelecimento e confronta apenas ciclos da mesma série, estrutura e método. Serão exibidas diferenças por escala e dimensão, acompanhadas da adesão; bases protegidas permanecem sem resultado. Não se atribui causalidade às variações.',
              )}
            </Section>
            <Section
              documentType={documentType}
              presentation={presentation}
              index={9}
            >
              {paragraph(
                'Indicadores: soma de (5 − valor cadastrado da alternativa), equivalente à inversão (6 − valor) seguida da normalização (valor invertido − 1), dividida por quatro vezes a quantidade de seleções válidas, multiplicada por 100 e arredondada como nas abas do sistema. São pontuáveis os valores cadastrados de 1 a 5. Questões sem seleção válida não recebem pontuação zero. Não há ponderação clínica ou benchmark externo acrescentado por este relatório.',
              )}
              {paragraph(
                'Privacidade: nenhuma lista nominal, CPF, e-mail, resposta individual ou identificador de pessoa integra a tela do relatório ou seus arquivos exportados. Indicadores exigem ao menos três respondentes válidos; a análise de fatores respeita também o limite configurado no sistema. Distribuições com células pequenas são suprimidas integralmente. Não foram geradas análises de texto livre.',
              )}
              <Table
                headers={['Rastreabilidade', 'Valor']}
                rows={[
                  ['Método', s.method],
                  ['Aplicação', s.applicationId],
                  ['Recorte', s.unit.name],
                  ['Coleta', `${date(s.startedAt)} a ${date(s.endedAt)}`],
                  ['Base consultada', new Date(s.asOf).toLocaleString('pt-BR')],
                  ['Estrutura do questionário', s.questionnaireDigest],
                  [
                    'Série / ciclo',
                    s.seriesId
                      ? `${s.seriesId} / ${s.cycleNumber}`
                      : 'Não vinculada a uma série de campanhas',
                  ],
                ]}
              />
              {paragraph(
                'A participação pode sofrer viés de não resposta. O universo elegível e o vínculo organizacional refletem a base operacional consultada; alterações cadastrais posteriores podem modificar uma nova prévia. Versões preservadas mantêm os agregados registrados na emissão. O questionário e a matriz não substituem a análise profissional do trabalho nem constituem diagnóstico individual.',
              )}
            </Section>
          </>
        )}
      </Box>
      <ReportFloatingNavigation
        documentType={documentType}
        headings={
          documentType === 'psychosocial'
            ? HEADINGS
            : ['Evolução entre campanhas']
        }
        report={report}
      />
      {fullscreen && (
        <ReportPresentationInk
          key={`${s.unit.key}:${version}:${documentType}`}
          surface={surface}
          report={report}
        />
      )}
    </Box>
  );
}
