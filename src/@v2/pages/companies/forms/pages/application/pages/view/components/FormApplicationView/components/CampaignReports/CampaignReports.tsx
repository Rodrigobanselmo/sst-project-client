import { CampaignReportEvolution } from './CampaignReportEvolution';
import {
  campaignReportPrintCss,
  type ReportPaperOrientation,
  prepareCampaignReportForPrint,
} from './campaign-report.print';
import { CampaignReportRadar } from './CampaignReportRadar';
import { ReportIllustratedSlide } from './ReportIllustratedSlide';
import {
  CampaignReportConceptImage,
  CampaignReportIllustrationsButton,
  useCampaignReportIllustrations,
} from './CampaignReportIllustrations';
import { ReportDisclosure } from './ReportDisclosure';
import { listeningNarrativeGroups } from './campaign-report.structure';
import { CampaignReportNarrative } from './CampaignReportNarrative';
import { useCampaignReports } from './campaign-reports.api';
import { useTheme } from '@mui/material/styles';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import {
  INDICATOR_QUALITY_BANDS,
  classifyIndicatorPercentage,
} from '../FormQuestionsDashboard/helpers/form-indicator-quality.util';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { readVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/service/read-visual-identity.service';
import { useCampaignCycles } from '../../../../../../components/CampaignCycles/campaign-cycles.api';
import {
  buildCampaignReportDataset,
  REPORT_METHOD_VERSION,
  REPORT_MINIMUM_RESPONDENTS,
} from './campaign-report.dataset';

const plain = (value?: string) =>
  (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();
const percent = (value: number | null) =>
  value === null
    ? 'Não disponível'
    : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
const sections = [
  'Visão executiva',
  'Contexto e metodologia',
  'Resultados objetivos por tema',
  'Escuta dos participantes',
  'Leitura integrada',
  'Orientação para a gestão',
  'Limitações e hipóteses',
];

export function CampaignReports({
  application,
  answers,
  companyId,
}: {
  application: FormApplicationReadModel;
  answers?: FormQuestionsAnswersBrowseModel | null;
  companyId: string;
}) {
  const [document, setDocument] = useState('campaign');
  useEffect(() => { if (window.location.hash.startsWith('#campaign-report-evolution-')) setDocument('evolution'); }, []);
  const [comparisonSimulation, setComparisonSimulation] = useState(false);
  const [viewMode, setViewMode] = useState('presentation');
  const [fullscreen, setFullscreen] = useState(false);
  const [displayError, setDisplayError] = useState('');
  const surface = useRef<HTMLDivElement>(null);
  const presentation = viewMode === 'presentation';
  const theme = useTheme();
  const darkPresentation = presentation && theme.palette.mode === 'dark';
  useEffect(() => {
    const sync = () =>
      setFullscreen(window.document.fullscreenElement === surface.current);
    window.document.addEventListener('fullscreenchange', sync);
    return () => window.document.removeEventListener('fullscreenchange', sync);
  }, []);
  async function toggleFullscreen() {
    setDisplayError('');
    try {
      if (window.document.fullscreenElement === surface.current)
        await window.document.exitFullscreen();
      else if (surface.current?.requestFullscreen)
        await surface.current.requestFullscreen();
      else
        setDisplayError(
          'Este navegador não oferece tela cheia. O modo apresentação continua disponível.',
        );
    } catch {
      setDisplayError(
        'Não foi possível abrir a tela cheia. Tente novamente pelo botão ou use o modo apresentação nesta janela.',
      );
    }
  }

  const [exportError, setExportError] = useState('');
  const report = useRef<HTMLDivElement>(null);
  const { runs, generate } = useCampaignReports(companyId, application.id);
  const [selectedVersion, setSelectedVersion] = useState('auto');
  const selectedRun =
    selectedVersion === 'live'
      ? null
      : ((selectedVersion === 'auto'
          ? runs.data?.find((run) => run.status === 'DONE')
          : runs.data?.find(
              (run) => run.id === selectedVersion && run.status === 'DONE',
            )) ?? null);
  const art = useCampaignReportIllustrations(
    companyId,
    application.id,
    selectedRun?.id,
  );
  const activeRun = runs.data?.find((run) => run.status === 'PROCESSING');
  const pointKinds: Record<string, string> = {
    SUGGESTION: 'Sugestão',
    CONCERN: 'Dificuldade relatada',
    PRAISE: 'Avaliação favorável',
    DESCRIPTION: 'Descrição',
    MIXED: 'Menções de naturezas distintas',
  };
  const failureMessages: Record<string, string> = {
    PROVIDER_TIMEOUT:
      'O provedor excedeu o limite de espera e a chamada foi cancelada.',
    PROVIDER_RATE_LIMITED:
      'O provedor bloqueou a chamada por cota ou limite de uso.',
    INVALID_OUTPUT: 'A resposta da IA não passou na validação integral.',
    SOURCE_CHANGED: 'Os dados mudaram durante a geração; atualize a base.',
    BUDGET_BLOCKED: 'O controle de gastos de IA bloqueou a chamada.',
    INTERRUPTED: 'A execução foi interrompida antes de concluir.',
    INTERRUPTED_BY_LOCAL_UPDATE:
      'A tentativa foi interrompida durante a atualização local do controle de espera.',
    GENERATION_FAILED: 'Não foi possível concluir a chamada de IA.',
  };
  const saved = document === 'campaign' ? selectedRun?.snapshot : null;
  const formatDate = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Bahia' }).format(
          new Date(value),
        )
      : null;
  const reportTitle = saved?.title ?? application.name;
  const groups = useMemo(
    () => saved?.groups ?? buildCampaignReportDataset(answers?.results ?? []),
    [answers, saved],
  );
  const {
    data: cycles,
    isError: cyclesError,
    isPending: cyclesLoading,
  } = useCampaignCycles(companyId, application.id);
  const { data: identity } = useQuery({
    queryKey: ['campaign-report-visual-identity', companyId],
    queryFn: () => readVisualIdentity({ companyId }),
    retry: false,
  });
  const questions = groups.flatMap((group) => group.questions);
  const objective = questions.filter((question) => question.objective);
  const open = questions.filter((question) => question.text);
  const current = cycles?.current;
  const previous =
    cycles?.cycles.filter(
      (cycle) => current && cycle.number < current.number,
    ) ?? [];
  const brand = identity?.visualIdentityEnabled
    ? identity.customLogoUrl ||
      (darkPresentation ? identity.logoDarkUrl : identity.logoLightUrl) ||
      identity.logoUrl
    : null;
  const headings =
    document === 'campaign'
      ? sections
      : [
          'Seleção e compatibilidade',
          'Indicadores por tema e pergunta',
          'Escuta em evolução',
          'Composição dos participantes',
          'Análise comparativa por IA',
        ];

  async function exportPdf(orientation: ReportPaperOrientation = 'portrait') {
    if (!report.current) return;
    setExportError('');
    const frame = window.document.createElement('iframe');
    frame.title = 'Exportação do relatório para PDF';
    frame.style.cssText =
      'position:fixed;width:1px;height:1px;bottom:0;left:-10000px;border:0';
    window.document.body.appendChild(frame);
    try {
      const target = frame.contentDocument;
      if (!target || !frame.contentWindow)
        throw new Error('Não foi possível preparar a impressão.');
      // Clone only the report, never the management UI or hidden responses.
      for (const style of Array.from(
        window.document.querySelectorAll('style,link[rel="stylesheet"]'),
      )) {
        if (style instanceof HTMLStyleElement) {
          const copy = target.createElement('style');
          copy.textContent = style.sheet
            ? Array.from(style.sheet.cssRules)
                .map((rule) => rule.cssText)
                .join('\n')
            : style.textContent;
          target.head.appendChild(copy);
        } else {
          target.head.appendChild(style.cloneNode(true));
        }
      }
      target.title = `${reportTitle} — ${document === 'campaign' ? 'Relatório da campanha' : 'Evolução entre campanhas'}`;
      const style = target.createElement('style');
      style.textContent = campaignReportPrintCss(orientation);
      target.head.appendChild(style);
      const printedArticle = report.current.cloneNode(true) as HTMLElement;
      prepareCampaignReportForPrint(printedArticle);
      target.body.appendChild(printedArticle);
      await target.fonts.ready;
      await Promise.all(
        Array.from(target.images).map((img) =>
          img.decode().catch(() => undefined),
        ),
      );
      frame.contentWindow.addEventListener('afterprint', () => frame.remove(), {
        once: true,
      });
      frame.contentWindow.focus();
      frame.contentWindow.print();
      // Browsers differ on afterprint; bound the lifetime of the hidden document.
      window.setTimeout(() => frame.remove(), 120000);
    } catch (error) {
      frame.remove();
      setExportError(
        error instanceof Error
          ? error.message
          : 'Não foi possível exportar o relatório.',
      );
    }
  }

  return (
    <Box
      ref={surface}
      sx={{
        minWidth: 0,
        '&:fullscreen': {
          overflowY: 'auto',
          height: '100vh',
          backgroundColor: 'background.default',
          p: { xs: '16px', md: '40px' },
        },
        ...(presentation
          ? {
              '& article': {
                maxWidth: 'none',
                minHeight: 0,
                p: { xs: '0', md: '8px' },
                backgroundColor: 'transparent',
                boxShadow: 'none',
                fontSize: { xs: '16px', md: '20px', xl: '23px' },
                lineHeight: 1.8,
              },
              '& article > header': {
                backgroundColor: '#fff',
                borderRadius: '24px',
                p: { xs: '24px', md: '48px' },
                mb: '28px',
              },
              '& article h1': { fontSize: { xs: '30px', md: '44px' } },
              '& article h2': {
                fontSize: { xs: '25px', md: '34px' },
                marginTop: 0,
              },
              '& article h3': { fontSize: { xs: '21px', md: '26px' } },
              '& article section': {
                backgroundColor: '#fff',
                borderRadius: '24px',
                p: { xs: '24px', md: '48px' },
                mb: '28px',
                scrollMarginTop: '100px',
              },
              '& article table': { fontSize: { xs: '13px', md: '18px' } },
              '& article figure': {
                border: '1px solid #dce2ea',
                borderRadius: '16px',
                p: { xs: '16px', md: '28px' },
                margin: '20px 0',
              },
              '& article small': { fontSize: { xs: '12px', md: '15px' } },
              '& article aside': { fontSize: { xs: '15px', md: '19px' } },
              '&& article section.campaign-report-theme': {
                backgroundColor: darkPresentation ? '#171e2b' : '#f8fafc',
                border: '1px solid',
                borderColor: darkPresentation ? '#3c495d' : '#dce2ea',
                borderRadius: '20px',
                p: { xs: '20px', md: '32px' },
                mt: '32px',
                mb: '40px',
                '& > h3': {
                  mt: 0,
                  pb: '20px',
                  mb: '28px',
                  borderBottom: '2px solid',
                  borderColor: darkPresentation ? '#526176' : '#cbd5e1',
                },
              },

              ...(darkPresentation
                ? {
                    '&& article': { color: '#e5eaf2', colorScheme: 'dark' },
                    '&& article > header, && article section': {
                      backgroundColor: '#1b2230',
                      color: '#e5eaf2',
                    },
                    '&& article h1, && article h2, && article h3, && article p':
                      { color: '#e5eaf2' },
                    '&& article small, && article > footer': {
                      color: '#b5c1d3',
                    },
                    '&& article h2, && article th, && article td, && article figure, && article > footer':
                      { borderColor: '#3c495d' },
                    '&& article th': { backgroundColor: '#273244' },
                    '&& article aside': {
                      backgroundColor: '#222e40',
                      borderColor: '#465a74',
                      borderLeftColor: '#8aa9cb',
                    },
                    '&& article figure[data-indicator-summary] > div:nth-of-type(2)':
                      {
                        backgroundColor: '#344155',
                      },
                    '&& article .MuiChip-root': {
                      backgroundColor: '#3e341c',
                      color: '#f5d994',
                    },
                  }
                : {}),
            }
          : {}),
      }}
    >
      <Stack
        direction="row"
        gap={6}
        flexWrap="wrap"
        alignItems="center"
        sx={{
          position: fullscreen ? 'sticky' : 'static',
          top: 0,
          zIndex: 3,
          backgroundColor: 'background.default',
          py: 6,
          mb: 8,
        }}
      >
        <ToggleButtonGroup
          exclusive
          value={viewMode}
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
          aria-label="Modo de exibição"
        >
          <ToggleButton value="presentation">Apresentação (HTML)</ToggleButton>
          <ToggleButton value="technical">Relatório técnico</ToggleButton>
        </ToggleButtonGroup>
        {(presentation || fullscreen) && (
          <Button
            startIcon={fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            onClick={toggleFullscreen}
          >
            {fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          </Button>
        )}
        {fullscreen && (
          <Typography variant="caption" color="text.secondary">
            Esc para sair
          </Typography>
        )}
      </Stack>
      {displayError && (
        <Alert severity="info" sx={{ mb: 8 }}>
          {displayError}
        </Alert>
      )}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        gap={8}
        alignItems={{ md: 'center' }}
        mb={10}
      >
        <Box>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Relatórios
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Uma leitura integrada da campanha e de sua trajetória.
          </Typography>
        </Box>
        <ToggleButtonGroup
          exclusive
          value={document}
          onChange={(_, value) => value && setDocument(value)}
          size="small"
          sx={{ flexWrap: 'wrap' }}
        >
          <ToggleButton value="campaign">Relatório da campanha</ToggleButton>
          <ToggleButton value="evolution">
            Evolução entre campanhas
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {document === 'campaign' && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px',
            p: '20px',
            mb: '24px',
          }}
        >
          <Typography sx={{ color: 'text.primary', fontWeight: 700 }}>
            Análise integrada por IA
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ my: 4 }}>
            Modelo: gpt-6.1-sol. Classificação temática e interpretação em
            rascunho, com base preservada e revisão obrigatória. Novas gerações
            mantêm os rascunhos anteriores.
          </Typography>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            gap={8}
            alignItems={{ md: 'center' }}
          >
            <Button
              variant="contained"
              disabled={
                generate.isPending ||
                !!activeRun ||
                application.status !== 'DONE' ||
                runs.isPending ||
                runs.isError
              }
              onClick={() =>
                generate.mutate(undefined, {
                  onSuccess: () => setSelectedVersion('auto'),
                })
              }
            >
              {generate.isPending
                ? 'Preparando geração…'
                : activeRun
                  ? 'Gerando relatório…'
                  : 'Gerar relatório por IA'}
            </Button>
            <Box
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                color: 'text.primary',
              }}
            >
              Versão exibida
              <Box
                component="select"
                aria-label="Versão do relatório"
                value={selectedVersion}
                onChange={(event) => setSelectedVersion(event.target.value)}
                sx={{
                  p: '10px',
                  minHeight: '44px',
                  maxWidth: '100%',
                  borderRadius: '8px',
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <option value="auto">
                  Automático: último rascunho ou prévia
                </option>
                <option value="live">Prévia descritiva atual</option>
                {runs.data
                  ?.filter((run) => run.status === 'DONE')
                  .map((run, index) => (
                    <option key={run.id} value={run.id}>
                      Rascunho{' '}
                      {new Date(run.createdAt).toLocaleString('pt-BR', {
                        timeZone: 'America/Bahia',
                      })}
                      {index === 0 ? ' · mais recente' : ''}
                    </option>
                  ))}
              </Box>
            </Box>
          </Stack>
          {activeRun && (
            <Typography color="text.secondary" sx={{ mt: 6 }} role="status">
              {activeRun.progress?.stage === 'SYNTHESIZING'
                ? `Sintetizando o conteúdo dos temas: ${activeRun.progress?.completed ?? 0} de ${activeRun.progress?.total ?? 0}.`
                : activeRun.progress?.stage === 'WRITING'
                  ? 'Redigindo a leitura integrada…'
                  : `Classificando respostas abertas: ${activeRun.progress?.completed ?? 0} de ${activeRun.progress?.total ?? 0}.`}{' '}
              Você pode sair desta tela e retornar para acompanhar.
            </Typography>
          )}
          <CampaignReportIllustrationsButton
            art={art}
            available={!!selectedRun && !activeRun}
          />
          {generate.isError && (
            <Alert severity="error" sx={{ mt: 6 }}>
              Não foi possível iniciar:{' '}
              {String(
                (generate.error as any)?.response?.data?.message ??
                  'verifique a conexão e as permissões e tente novamente.',
              )}{' '}
              Nenhum modelo alternativo foi utilizado.
            </Alert>
          )}
          {runs.isError && (
            <Alert severity="error" sx={{ mt: 6 }}>
              Não foi possível consultar os rascunhos.{' '}
              <Button onClick={() => runs.refetch()}>Tentar novamente</Button>
            </Alert>
          )}
          {runs.data?.[0]?.status === 'FAILED' && (
            <Alert severity="warning" sx={{ mt: 6 }}>
              A última geração não foi concluída.{' '}
              {failureMessages[runs.data[0].errorCode ?? ''] ??
                'Falha de processamento.'}
              Nenhum resultado parcial foi liberado e nenhum modelo alternativo
              foi utilizado.{' '}
              {selectedRun
                ? 'O rascunho anterior continua disponível.'
                : 'A prévia descritiva continua disponível.'}
            </Alert>
          )}
          {selectedRun && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 6 }}
            >
              Rascunho salvo em{' '}
              {new Date(selectedRun.createdAt).toLocaleString('pt-BR', {
                timeZone: 'America/Bahia',
              })}{' '}
              · {selectedRun.methodVersion} · Modelo retornado:{' '}
              {selectedRun.returnedModels.join(', ') || 'não informado'}.
            </Typography>
          )}
        </Box>
      )}
      <Alert severity="info" sx={{ mb: 10, borderRadius: '16px' }}>
        {selectedRun && document === 'campaign'
          ? 'Rascunho gerado por IA, ainda não aprovado. Indicadores e análise usam a base preservada desta geração; novas gerações não substituem este registro. A auditoria do cadastro e a revisão metodológica permanecem necessárias.'
          : 'Prévia descritiva para revisão, calculada a partir dos dados atuais. Selecione um rascunho concluído para visualizar a análise integrada por IA. Esta prévia não é uma versão histórica preservada.'}
      </Alert>
      {exportError && (
        <Alert severity="error" sx={{ mb: 8 }}>
          {exportError}
        </Alert>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0,1fr)',
            lg: presentation ? 'minmax(0,1fr)' : '210px minmax(0,1fr)',
          },
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <Box
          component="nav"
          aria-label="Sumário do relatório"
          sx={{
            position: presentation ? 'static' : { lg: 'sticky' },
            top: '24px',
          }}
        >
          <Typography fontWeight={600} mb={5} sx={{ color: 'text.primary' }}>
            Neste documento
          </Typography>
          <Stack
            gap={2}
            direction={presentation ? 'row' : 'column'}
            flexWrap="wrap"
          >
            {headings.map((title, index) => (
              <Button
                key={title}
                href={`#campaign-report-${document}-${index}`}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  textTransform: 'none',
                  color: 'text.secondary',
                  px: 4,
                  py: 3,
                  lineHeight: 1.5,
                }}
              >
                {index + 1}. {title}
              </Button>
            ))}
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap="12px"
            sx={{ mt: 10 }}
          >
            <Button
              startIcon={<DownloadOutlinedIcon />}
              variant="outlined"
              onClick={() => exportPdf('portrait')}
            >
              PDF em retrato
            </Button>
            <Button
              startIcon={<DownloadOutlinedIcon />}
              variant="outlined"
              onClick={() => exportPdf('landscape')}
            >
              PDF em paisagem
            </Button>
          </Stack>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            mt={4}
          >
            No diálogo de impressão, escolha “Salvar como PDF”.
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: presentation ? 'transparent' : 'action.hover',
            borderRadius: '16px',
            p: presentation ? 0 : { xs: 3, sm: 10 },
            minWidth: 0,
          }}
        >
          <Box
            ref={report}
            component="article"
            aria-label={
              document === 'campaign'
                ? 'Relatório da campanha'
                : 'Evolução entre campanhas'
            }
            sx={{
              backgroundColor: '#fff',
              color: '#17212f',
              width: '100%',
              maxWidth: '210mm',
              minHeight: { md: '297mm' },
              mx: 'auto',
              p: { xs: '20px', sm: '36px', xl: '54px' },
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              lineHeight: 1.75,
              boxShadow: '0 4px 24px rgba(15,23,42,.08)',
              overflowWrap: 'anywhere',
              '& h1,& h2,& h3,& p': { color: '#17212f' },
              '& h1': {
                fontSize: { xs: '24px', sm: '30px' },
                lineHeight: 1.3,
                fontWeight: 700,
              },
              '& h2': {
                fontSize: '20px',
                lineHeight: 1.4,
                fontWeight: 700,
                margin: '36px 0 16px',
                borderBottom: '1px solid #dce2ea',
                paddingBottom: '10px',
              },
              '& h3': {
                fontSize: '16px',
                fontWeight: 700,
                margin: '24px 0 10px',
              },
              '& p': { margin: '12px 0' },
              '& section': { scrollMarginTop: '24px' },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                margin: '16px 0',
              },
              '& th,& td': {
                textAlign: 'left',
                borderBottom: '1px solid #dce2ea',
                padding: '10px 6px',
                verticalAlign: 'top',
              },
              '& th': { background: '#f3f5f8' },
              '& small': { color: '#536174' },
              '& figure': { margin: '16px 0' },
            }}
          >
            <Box
              component="header"
              sx={{
                borderBottom: '3px solid',
                borderColor:
                  identity?.visualIdentityEnabled && identity.primaryColor
                    ? identity.primaryColor
                    : '#334155',
                pb: 12,
                mb: 12,
              }}
            >
              {brand && (
                <Box
                  component="img"
                  src={brand}
                  alt={identity?.companyName ?? 'Identidade da organização'}
                  sx={{
                    maxWidth: '180px',
                    maxHeight: '64px',
                    objectFit: 'contain',
                    mb: 8,
                  }}
                />
              )}
              {identity?.companyName && (
                <Typography component="p" variant="overline">
                  {identity.companyName}
                </Typography>
              )}
              <Chip
                label={
                  selectedRun && document === 'campaign'
                    ? 'RASCUNHO IA · NÃO APROVADO'
                    : 'PRÉVIA · NÃO APROVADO'
                }
                size="small"
                sx={{ backgroundColor: '#fff5df', color: '#77520a', mb: 8 }}
              />
              <h1>
                {document === 'campaign'
                  ? 'Relatório da campanha'
                  : comparisonSimulation
                    ? 'SIMULAÇÃO — Evolução entre campanhas'
                    : 'Evolução entre campanhas'}
              </h1>
              <p style={{ fontSize: '18px' }}>
                {document === 'campaign'
                  ? reportTitle
                  : comparisonSimulation
                    ? 'DADOS SINTÉTICOS — sem relação com resultados da empresa'
                    : `Série: ${cycles?.seriesName ?? application.form.name}`}
              </p>
              <small>
                {document === 'campaign' && (
                  <>
                    {current
                      ? `Ciclo ${current.number} · Referência ${current.referencePeriod} · `
                      : ''}
                    Período de coleta:{' '}
                    {(saved
                      ? formatDate(saved.startedAt)
                      : application.formatStartedAt) ?? 'não registrado'}{' '}
                    a{' '}
                    {(saved
                      ? formatDate(saved.endedAt)
                      : application.formatEndedAt) ?? 'não registrado'}
                    <br />
                  </>
                )}
                Metodologia:{' '}
                {(document === 'campaign'
                  ? selectedRun?.methodVersion
                  : 'campaign-comparison-v1') ?? REPORT_METHOD_VERSION}{' '}
                ·{' '}
                {document === 'evolution'
                  ? 'Versões preservadas dos relatórios selecionados'
                  : selectedRun
                    ? `Dados preservados na geração de ${new Date(selectedRun.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Bahia' })}`
                    : 'Dados consultados nesta sessão'}
              </small>
              {selectedRun && document === 'campaign' && (
                <p>
                  <small>
                    IA solicitada: {selectedRun.requestedModel} · Modelo
                    retornado:{' '}
                    {selectedRun.returnedModels.join(', ') || 'não informado'} ·
                    Rascunho sujeito a revisão.
                  </small>
                </p>
              )}
            </Box>
            {document === 'campaign' ? (
              <>
                <section id="campaign-report-campaign-0">
                  <ReportDisclosure
                    presentation={presentation}
                    heading="h2"
                    title="1. Visão executiva"
                  >
                    <CampaignReportNarrative
                      run={selectedRun}
                      section="executive"
                    />
                    {!selectedRun && (
                      <p>
                        Esta prévia reúne os resultados objetivos e a cobertura
                        das perguntas abertas da campanha. A interpretação
                        integrada, os pontos fortes e as prioridades dependem da
                        revisão metodológica e da análise dos textos.
                      </p>
                    )}
                    <table>
                      <thead>
                        <tr>
                          <th>Base da campanha</th>
                          <th>Quantidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            {application.isShareableLink
                              ? 'Questionários respondidos'
                              : 'Participantes que responderam'}
                          </td>
                          <td>
                            {saved?.participantCount ??
                              (application.isShareableLink
                                ? application.totalAnswers
                                : application.respondedParticipantsCount)}
                          </td>
                        </tr>
                        {!application.isShareableLink && (
                          <tr>
                            <td>Participantes cadastrados</td>
                            <td>{application.totalParticipants}</td>
                          </tr>
                        )}
                        <tr>
                          <td>Perguntas objetivas / abertas</td>
                          <td>
                            {objective.length} / {open.length}
                          </td>
                        </tr>
                        <tr>
                          <td>Temas do questionário</td>
                          <td>{groups.length}</td>
                        </tr>
                      </tbody>
                    </table>
                    <Box
                      component="aside"
                      aria-label="Como interpretar os indicadores"
                      sx={{
                        my: 10,
                        p: '18px',
                        border: '1px solid #cbd5e1',
                        borderLeft: '4px solid #476b89',
                        borderRadius: '8px',
                        backgroundColor: '#f3f6fa',
                        breakInside: 'avoid',
                        printColorAdjust: 'exact',
                      }}
                    >
                      <strong>Interpretação da qualidade</strong>
                      <p>
                        O percentual exibido representa a qualidade do indicador
                        com base nas respostas. Percentuais menores indicam
                        condição mais crítica; percentuais maiores, condição
                        mais favorável. Quanto maior o percentual, mais
                        favorável é o resultado do indicador.
                      </p>
                      <Box
                        aria-hidden
                        sx={{
                          height: '14px',
                          borderRadius: '999px',
                          background:
                            'linear-gradient(90deg, #F44336 0%, #E87525 25%, #E3D800 50%, #96BC3D 75%, #229B61 100%)',
                          printColorAdjust: 'exact',
                        }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '12px',
                          mt: 3,
                          mb: 8,
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        <span>0% · Mais crítico</span>
                        <span>100% · Mais favorável</span>
                      </Box>
                      <Box
                        sx={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}
                      >
                        {INDICATOR_QUALITY_BANDS.map((band) => (
                          <Box
                            key={band.id}
                            sx={{ flex: '1 1 100px', fontSize: '12px' }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontWeight: 700,
                              }}
                            >
                              <Box
                                aria-hidden
                                sx={{
                                  width: '14px',
                                  height: '14px',
                                  flexShrink: 0,
                                  borderRadius: '4px',
                                  backgroundColor: band.color,
                                  printColorAdjust: 'exact',
                                }}
                              />
                              {band.name}
                            </Box>
                            <span>{band.rangeLabel}</span>
                          </Box>
                        ))}
                      </Box>
                      <p>
                        As faixas são aplicadas ao percentual arredondado para o
                        inteiro mais próximo, conforme o padrão do sistema. O
                        valor 50 é o ponto neutro da escala. Essas faixas
                        expressam a qualidade do indicador no contexto desta
                        pesquisa.
                      </p>
                      <p>
                        A pontuação segue a classificação cadastrada das
                        alternativas. Respostas ausentes e alternativas “Não
                        contabilizar” ficam fora do cálculo. O indicador
                        expresso em % representa a posição nessa escala, não o
                        percentual de participantes satisfeitos.
                      </p>
                    </Box>
                    <CampaignReportRadar
                      key={selectedRun?.id ?? 'live'}
                      companyId={companyId}
                      applicationId={application.id}
                      reportId={selectedRun?.id}
                      groups={groups}
                      dark={darkPresentation}
                      participants={saved?.participantCount}
                    />
                    {groups
                      .filter((group) => group.score !== null)
                      .map((group) => (
                        <figure
                          data-indicator-summary
                          key={group.id}
                          aria-label={`${plain(group.name)}: ${percent(group.score)}`}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '12px',
                            }}
                          >
                            <strong>{plain(group.name)}</strong>
                            <span style={{ textAlign: 'right' }}>
                              {percent(group.score)} ·{' '}
                              {classifyIndicatorPercentage(group.score!).name}
                            </span>
                          </Box>
                          <Box
                            sx={{
                              height: '8px',
                              background: '#e8edf3',
                              borderRadius: '4px',
                              mt: 3,
                            }}
                          >
                            <Box
                              sx={{
                                width: `${group.score}%`,
                                height: '100%',
                                background: classifyIndicatorPercentage(
                                  group.score!,
                                ).color,
                                borderRadius: '4px',
                                printColorAdjust: 'exact',
                              }}
                            />
                          </Box>
                          <small>
                            {group.scoredQuestions} perguntas com indicador ·{' '}
                            {group.denominator} seleções pontuáveis
                            {group.incomplete
                              ? ' · cobertura parcial: há perguntas sem indicador'
                              : ''}
                          </small>
                        </figure>
                      ))}
                  </ReportDisclosure>
                </section>
                <section id="campaign-report-campaign-1">
                  <ReportDisclosure
                    presentation={presentation}
                    heading="h2"
                    title="2. Contexto e metodologia"
                  >
                    {selectedRun && (
                      <>
                        <h3>Análise das respostas abertas</h3>
                        <p>
                          Taxonomia campaign-themes-v1, com classificação
                          multitemática e rastreabilidade interna por resposta.
                          Textos vazios são excluídos pelo sistema; a IA
                          distingue conteúdo pertinente, ausência de conteúdo
                          substantivo e conteúdo fora do escopo. Brevidade,
                          crítica, ortografia e repetição entre pessoas não são
                          motivos de exclusão. O denominador de cada pergunta é
                          o total de respostas incluídas. Uma resposta pode
                          integrar vários temas, por isso a soma das frequências
                          pode superar cem por cento. Temas com menos de três
                          registros são protegidos. Não foi realizada análise de
                          sentimento; frequência temática não mede aprovação nem
                          prevalência na população.
                        </p>
                        <p>
                          Novos temas propostos ficam registrados para revisão,
                          sem alterar automaticamente a taxonomia. Dados de
                          identificação são excluídos do processamento; contatos
                          e identificadores numéricos detectáveis nos textos são
                          removidos antes do envio. As narrativas usam somente
                          agregados, sem reproduzir relatos individuais.
                        </p>
                      </>
                    )}
                    {selectedRun?.result?.taxonomy && (
                      <Box component="details" sx={{ mb: '24px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
                          Taxonomia utilizada (
                          {selectedRun.result.taxonomyVersion})
                        </summary>
                        <table>
                          <thead>
                            <tr>
                              <th>Tema</th>
                              <th>Definição</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedRun.result.taxonomy.map((theme) => (
                              <tr key={theme.id}>
                                <td>{theme.name}</td>
                                <td>{theme.rule}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    )}
                    {selectedRun?.methodVersion ===
                      'campaign-integrated-draft-v2' && (
                      <>
                        <h3>Síntese qualitativa dos conteúdos</h3>
                        <p>
                          Dentro de cada tema, respostas de conteúdo equivalente
                          são reunidas em um ponto principal por resposta,
                          sustentado por pelo menos três registros distintos.
                          Sugestão identifica uma ação solicitada; dificuldade
                          relatada identifica um problema; avaliação favorável
                          identifica um elogio explícito; descrição não
                          pressupõe avaliação; menções de naturezas distintas
                          são identificadas como tais. Isso descreve a natureza
                          do conteúdo, sem produzir escore de sentimento.
                          Menções singulares ou sem agrupamento seguro ficam
                          fora da síntese pública, mas são preservadas na
                          rastreabilidade interna. Uma resposta pode aparecer em
                          temas diferentes; as contagens de pontos não devem ser
                          somadas como pessoas distintas.
                        </p>
                      </>
                    )}
                    <h3>Objetivo e escopo</h3>
                    <p>
                      {plain(saved?.description ?? application.description) ||
                        'Objetivo não informado no cadastro da campanha. Deve ser revisado antes da análise interpretativa.'}
                    </p>
                    <p>
                      Escopo: campanha inteira, sem os filtros e comparações do
                      painel. Questionário:{' '}
                      {saved?.formName ?? application.form.name}. A leitura
                      segue o objetivo desta pesquisa. Não são aplicadas
                      classificações de risco psicossocial ou metodologia
                      COPSOQ.
                    </p>
                    <h3>Critérios desta prévia</h3>
                    <p>
                      A classificação cadastrada determina a pontuação: muito
                      negativo = 0; negativo = 25; neutro = 50; positivo = 75;
                      muito positivo = 100. Não há inversão adicional pelo
                      enunciado ou pelo texto da alternativa. O editor armazena
                      “Muito positivo” como 1 e “Muito negativo” como 5; esta
                      prévia converte essas classificações para 100 e 0,
                      respectivamente. O cálculo legado do painel usa a direção
                      numérica oposta e não foi alterado. A adequação do
                      cadastro de cada pergunta ainda precisa de revisão.
                    </p>
                    <p>
                      O indicador é a média das seleções pontuáveis, com peso
                      igual por seleção. A seção agrega essas seleções;
                      perguntas com mais seleções válidas contribuem mais. Em
                      múltipla escolha, uma resposta pode contribuir com várias
                      seleções. Ausências e alternativas não contabilizáveis
                      ficam fora da média. Valores fora do contrato bloqueiam o
                      indicador da pergunta.
                    </p>
                    <p>
                      A distribuição usa como denominador os respondentes da
                      pergunta que marcaram ao menos uma alternativa. Em
                      múltipla escolha, a soma dos percentuais pode superar
                      100%. Não é calculada taxa de ausência por pergunta nesta
                      etapa, pois requer validar a base elegível e a
                      obrigatoriedade.
                    </p>
                    <p>
                      A interpretação utiliza as cinco faixas de qualidade já
                      adotadas pelo sistema, apresentadas antes dos indicadores.
                      A classificação usa o percentual arredondado ao inteiro
                      mais próximo: 0–19%, muito negativo; 20–39%, negativo;
                      40–59%, neutro; 60–79%, positivo; 80–100%, muito positivo.
                    </p>
                  </ReportDisclosure>
                </section>
                <section id="campaign-report-campaign-2">
                  <ReportDisclosure
                    presentation={presentation}
                    heading="h2"
                    title="3. Resultados objetivos por tema"
                  >
                    <CampaignReportNarrative
                      run={selectedRun}
                      section="findings"
                    />
                    {!answers && (
                      <p>
                        Os resultados ainda não foram carregados. Reabra esta
                        aba após a consulta dos dados.
                      </p>
                    )}
                    {groups
                      .filter((group) =>
                        group.questions.some((question) => question.objective),
                      )
                      .map((group, groupIndex) => (
                        <Box
                          key={group.id}
                          component="section"
                          aria-label={`3.${groupIndex + 1} ${plain(group.name)}`}
                          className="campaign-report-theme"
                        >
                          <ReportDisclosure
                            presentation={presentation}
                            heading="h3"
                            title={`3.${groupIndex + 1} ${plain(group.name)}`}
                          >
                            {group.questions
                              .filter((question) => question.objective)
                              .map((question, questionIndex) => (
                                <Box
                                  key={question.id}
                                  className="campaign-report-question"
                                  sx={{
                                    mb: '32px',
                                    ...(questionIndex > 0 && {
                                      borderTop: '4px solid',
                                      borderColor: darkPresentation
                                        ? '#8c9db5'
                                        : '#64748b',
                                      pt: { xs: '36px', md: '48px' },
                                      mt: { xs: '48px', md: '64px' },
                                    }),
                                    '& > p:first-of-type': {
                                      mt: 0,
                                      mb: '24px',
                                    },
                                  }}
                                >
                                  <ReportDisclosure
                                    presentation={presentation}
                                    heading="div"
                                    title={plain(question.title)}
                                  >
                                    {question.protectedData ? (
                                      <p>
                                        Base insuficiente para divulgação. Exige
                                        ao menos {REPORT_MINIMUM_RESPONDENTS}{' '}
                                        respondentes nesta prévia.
                                      </p>
                                    ) : (
                                      <>
                                        <p>
                                          Indicador:{' '}
                                          <strong>
                                            {percent(question.score)}
                                          </strong>
                                          {question.score !== null && (
                                            <Box
                                              component="span"
                                              sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                ml: 3,
                                              }}
                                            >
                                              <Box
                                                component="span"
                                                aria-hidden
                                                sx={{
                                                  width: '12px',
                                                  height: '12px',
                                                  borderRadius: '3px',
                                                  backgroundColor:
                                                    classifyIndicatorPercentage(
                                                      question.score,
                                                    ).color,
                                                  printColorAdjust: 'exact',
                                                }}
                                              />
                                              {
                                                classifyIndicatorPercentage(
                                                  question.score,
                                                ).name
                                              }
                                            </Box>
                                          )}{' '}
                                          · {question.respondents} respondentes
                                          · {question.selections} seleções
                                          pontuáveis ·{' '}
                                          {question.excludedSelections} não
                                          contabilizáveis.
                                        </p>
                                        {!!question.invalidSelections && (
                                          <p>
                                            Inconsistência de cadastro ou
                                            seleção detectada. Indicador
                                            suspenso até revisão.
                                          </p>
                                        )}
                                        {question.distribution ? (
                                          <>
                                            <Box
                                              component="figure"
                                              aria-label={`Distribuição das respostas: ${plain(question.title)}`}
                                              sx={{
                                                my: '24px',
                                                breakInside: 'avoid',
                                              }}
                                            >
                                              <Box
                                                component="figcaption"
                                                sx={{
                                                  fontWeight: 700,
                                                  mb: '18px',
                                                }}
                                              >
                                                Distribuição das respostas
                                              </Box>
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: '16px',
                                                }}
                                              >
                                                {question.distribution.map(
                                                  (item) => {
                                                    const color =
                                                      item.score === null
                                                        ? '#8794a8'
                                                        : classifyIndicatorPercentage(
                                                            item.score,
                                                          ).color;
                                                    return (
                                                      <Box
                                                        key={item.id}
                                                        sx={{
                                                          display: 'grid',
                                                          gridTemplateColumns: {
                                                            xs: 'minmax(0,1fr) auto',
                                                            sm: 'minmax(120px, 35%) minmax(0,1fr) auto',
                                                          },
                                                          alignItems: 'center',
                                                          columnGap: '16px',
                                                          rowGap: '6px',
                                                        }}
                                                      >
                                                        <Box
                                                          sx={{
                                                            fontSize:
                                                              presentation
                                                                ? {
                                                                    xs: '15px',
                                                                    md: '20px',
                                                                  }
                                                                : '13px',
                                                            lineHeight: 1.5,
                                                          }}
                                                        >
                                                          {plain(item.label)}
                                                          {item.score === null
                                                            ? ' (não contabilizável)'
                                                            : ''}
                                                        </Box>
                                                        <Box
                                                          sx={{
                                                            gridColumn: {
                                                              xs: '1 / -1',
                                                              sm: 'auto',
                                                            },
                                                            gridRow: {
                                                              xs: 2,
                                                              sm: 'auto',
                                                            },
                                                            minWidth: 0,
                                                          }}
                                                        >
                                                          <svg
                                                            viewBox="0 0 400 28"
                                                            width="100%"
                                                            height={
                                                              presentation
                                                                ? 30
                                                                : 22
                                                            }
                                                            preserveAspectRatio="none"
                                                            role="img"
                                                            aria-label={`${plain(item.label)}: ${percent(item.percentage)}, ${item.count} seleções`}
                                                            style={{
                                                              display: 'block',
                                                              overflow:
                                                                'visible',
                                                              printColorAdjust:
                                                                'exact',
                                                            }}
                                                          >
                                                            <rect
                                                              x="0"
                                                              y="0"
                                                              width="400"
                                                              height="28"
                                                              rx="5"
                                                              fill={
                                                                darkPresentation
                                                                  ? '#344155'
                                                                  : '#e8edf3'
                                                              }
                                                            />
                                                            {[
                                                              80, 160, 240, 320,
                                                            ].map((x) => (
                                                              <line
                                                                key={x}
                                                                x1={x}
                                                                x2={x}
                                                                y1="0"
                                                                y2="28"
                                                                stroke={
                                                                  darkPresentation
                                                                    ? '#526176'
                                                                    : '#cbd5e1'
                                                                }
                                                                strokeWidth="1"
                                                              />
                                                            ))}
                                                            <rect
                                                              x="0"
                                                              y="0"
                                                              width={
                                                                Math.max(
                                                                  0,
                                                                  Math.min(
                                                                    100,
                                                                    item.percentage,
                                                                  ),
                                                                ) * 4
                                                              }
                                                              height="28"
                                                              rx="5"
                                                              fill={color}
                                                            />
                                                          </svg>
                                                        </Box>
                                                        <Box
                                                          sx={{
                                                            gridColumn: {
                                                              xs: 2,
                                                              sm: 'auto',
                                                            },
                                                            gridRow: {
                                                              xs: 1,
                                                              sm: 'auto',
                                                            },
                                                            textAlign: 'right',
                                                            whiteSpace:
                                                              'nowrap',
                                                            fontSize:
                                                              presentation
                                                                ? '18px'
                                                                : '13px',
                                                          }}
                                                        >
                                                          <strong>
                                                            {percent(
                                                              item.percentage,
                                                            )}
                                                          </strong>
                                                          <br />
                                                          <small>
                                                            {item.count}{' '}
                                                            seleções
                                                          </small>
                                                        </Box>
                                                      </Box>
                                                    );
                                                  },
                                                )}
                                              </Box>
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  justifyContent:
                                                    'space-between',
                                                  ml: {
                                                    sm: 'calc(35% + 16px)',
                                                  },
                                                  mr: { sm: '100px' },
                                                  mt: '12px',
                                                  fontSize: '12px',
                                                  color: darkPresentation
                                                    ? '#b5c1d3'
                                                    : '#536174',
                                                }}
                                              >
                                                <span>0%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                              </Box>
                                              <Box
                                                component="figcaption"
                                                sx={{
                                                  mt: '16px',
                                                  fontSize: presentation
                                                    ? '16px'
                                                    : '12px',
                                                  color: darkPresentation
                                                    ? '#b5c1d3'
                                                    : '#536174',
                                                }}
                                              >
                                                Base: {question.respondents}{' '}
                                                respondentes desta pergunta. As
                                                cores seguem a classificação
                                                cadastrada de cada alternativa.
                                                {question.multiple
                                                  ? ' Múltipla escolha: a soma dos percentuais pode superar 100%.'
                                                  : ''}
                                              </Box>
                                            </Box>
                                            <table>
                                              <thead>
                                                <tr>
                                                  <th>Alternativa</th>
                                                  <th>Pontos cadastrados</th>
                                                  <th>Seleções</th>
                                                  <th>% dos respondentes</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {question.distribution.map(
                                                  (item) => (
                                                    <tr key={item.id}>
                                                      <td>
                                                        {plain(item.label)}
                                                        {item.score === null
                                                          ? ' (não contabilizável)'
                                                          : ''}
                                                      </td>
                                                      <td>
                                                        {item.score === null
                                                          ? 'Excluída'
                                                          : item.score}
                                                      </td>
                                                      <td>{item.count}</td>
                                                      <td>
                                                        {percent(
                                                          item.percentage,
                                                        )}
                                                      </td>
                                                    </tr>
                                                  ),
                                                )}
                                              </tbody>
                                            </table>
                                          </>
                                        ) : (
                                          <p>
                                            Distribuição protegida: há
                                            alternativas com menos de{' '}
                                            {REPORT_MINIMUM_RESPONDENTS}{' '}
                                            respostas.
                                          </p>
                                        )}
                                      </>
                                    )}
                                  </ReportDisclosure>
                                </Box>
                              ))}
                          </ReportDisclosure>
                        </Box>
                      ))}
                  </ReportDisclosure>
                </section>
                <section id="campaign-report-campaign-3">
                  <ReportDisclosure
                    presentation={presentation}
                    heading="h2"
                    title="4. Escuta dos participantes"
                  >
                    {selectedRun?.result ? (
                      <>
                        {listeningNarrativeGroups(selectedRun.result).map(
                          (group, index) => (
                            <Box
                              key={group.id}
                              data-print-listening-block
                              sx={{
                                mb: '36px',
                                p: presentation ? '24px' : 0,
                                border: presentation ? '1px solid' : 'none',
                                borderColor: 'divider',
                                borderRadius: '12px',
                              }}
                            >
                              <ReportDisclosure
                                presentation={presentation}
                                heading="h3"
                                title={`4.${index + 1}. ${group.title}`}
                              >
                                <ReportIllustratedSlide
                                  active={presentation && fullscreen}
                                >
                                  {presentation &&
                                    art.query.data?.images?.some(
                                      (image) =>
                                        image.index === index && image.ready,
                                    ) && (
                                      <Box
                                        data-slide-image
                                        sx={{
                                          width: { xs: '100%', lg: '34%' },
                                          maxWidth: '560px',
                                          flexShrink: 0,
                                        }}
                                      >
                                        <CampaignReportConceptImage
                                          path={art.path}
                                          index={index}
                                          title={group.title}
                                        />
                                      </Box>
                                    )}
                                  <Box
                                    data-slide-text
                                    sx={{ flex: 1, minWidth: 0 }}
                                  >
                                    <CampaignReportNarrative
                                      run={selectedRun}
                                      section="listening"
                                      items={group.items}
                                    />
                                  </Box>
                                </ReportIllustratedSlide>
                              </ReportDisclosure>
                            </Box>
                          ),
                        )}
                        <ReportDisclosure
                          presentation={presentation}
                          heading="h3"
                          title={`4.${listeningNarrativeGroups(selectedRun.result).length + 1}. Distribuição e conteúdos por tema`}
                        >
                          {selectedRun.result.listening.map(
                            (question, questionIndex) => (
                              <Box
                                key={question.questionId}
                                sx={{ mb: '36px' }}
                              >
                                <h3>{plain(question.title)}</h3>
                                {question.protected ? (
                                  <p>
                                    Base insuficiente para divulgação temática.
                                  </p>
                                ) : (
                                  <>
                                    <p>
                                      {question.received} registros recebidos ·{' '}
                                      {question.nonempty} com texto não vazio ·{' '}
                                      {question.included} incluídos no
                                      denominador temático · {question.excluded}{' '}
                                      excluídos.
                                    </p>
                                    {question.reasons && (
                                      <p>
                                        Exclusões: {question.empty} vazios;{' '}
                                        {question.reasons.find(
                                          (reason) =>
                                            reason.reason === 'NO_SUBSTANCE',
                                        )?.count ?? 0}{' '}
                                        sem conteúdo substantivo;{' '}
                                        {question.reasons.find(
                                          (reason) =>
                                            reason.reason === 'OFF_TOPIC',
                                        )?.count ?? 0}{' '}
                                        fora do escopo.
                                      </p>
                                    )}
                                    {!question.reasons && (
                                      <p>
                                        Detalhamento das exclusões protegido por
                                        conter contagens pequenas.
                                      </p>
                                    )}
                                    {question.themes.map(
                                      (theme, themeIndex) => (
                                        <Box
                                          key={theme.id}
                                          data-print-theme-block
                                          sx={{
                                            mb: '36px',
                                            p: presentation ? '24px' : 0,
                                            border: presentation
                                              ? '1px solid'
                                              : 'none',
                                            borderColor: 'divider',
                                            borderRadius: '12px',
                                          }}
                                        >
                                          <ReportDisclosure
                                            presentation={presentation}
                                            heading="div"
                                            title={`4.${listeningNarrativeGroups(selectedRun.result).length + 1}.${selectedRun.result!.listening.slice(0, questionIndex).reduce((count, item) => count + item.themes.length, 0) + themeIndex + 1}. ${theme.name}`}
                                          >
                                            <figure>
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  justifyContent:
                                                    'space-between',
                                                  gap: '16px',
                                                }}
                                              >
                                                <strong>{theme.name}</strong>
                                                <span>
                                                  {percent(theme.percentage)} ·{' '}
                                                  {theme.count} respostas
                                                </span>
                                              </Box>
                                              <Box
                                                sx={{
                                                  height: '12px',
                                                  borderRadius: '6px',
                                                  backgroundColor:
                                                    darkPresentation
                                                      ? '#344155'
                                                      : '#e8edf3',
                                                  mt: '12px',
                                                  printColorAdjust: 'exact',
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    height: '100%',
                                                    width: `${theme.percentage}%`,
                                                    backgroundColor: '#648bb2',
                                                    borderRadius: '6px',
                                                    printColorAdjust: 'exact',
                                                  }}
                                                />
                                              </Box>
                                              {!!theme.points?.length && (
                                                <Box
                                                  component="ul"
                                                  sx={{
                                                    mt: '24px',
                                                    pl: '24px',
                                                  }}
                                                >
                                                  {theme.points.map((point) => (
                                                    <li
                                                      key={point.id}
                                                      style={{
                                                        marginBottom: '20px',
                                                      }}
                                                    >
                                                      <strong>
                                                        {pointKinds[
                                                          point.kind
                                                        ] ?? point.kind}
                                                        :
                                                      </strong>{' '}
                                                      {point.text}
                                                      <br />
                                                      <small>
                                                        {point.count} respostas
                                                        ·{' '}
                                                        {percent(
                                                          point.percentage,
                                                        )}{' '}
                                                        da base incluída nesta
                                                        pergunta.
                                                      </small>
                                                    </li>
                                                  ))}
                                                </Box>
                                              )}
                                              {theme.hasUngroupedContent && (
                                                <p>
                                                  <small>
                                                    Há outras menções neste tema
                                                    que não foram reunidas em
                                                    pontos recorrentes com
                                                    divulgação segura.
                                                  </small>
                                                </p>
                                              )}
                                            </figure>
                                          </ReportDisclosure>
                                        </Box>
                                      ),
                                    )}
                                    <table>
                                      <thead>
                                        <tr>
                                          <th>Tema</th>
                                          <th>Respostas incluídas no tema</th>
                                          <th>% da base incluída</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {question.themes.map((theme) => (
                                          <tr key={theme.id}>
                                            <td>{theme.name}</td>
                                            <td>{theme.count}</td>
                                            <td>{percent(theme.percentage)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {question.suppressedThemes && (
                                      <p>
                                        Há temas adicionais com contagens
                                        pequenas que foram protegidos.
                                      </p>
                                    )}
                                  </>
                                )}
                              </Box>
                            ),
                          )}
                        </ReportDisclosure>
                      </>
                    ) : (
                      <>
                        <p>
                          Os textos individuais não são reproduzidos. Gere o
                          relatório por IA para visualizar os temas e
                          frequências, com critérios versionados e evidências
                          agregadas.
                        </p>
                        {open.map((question) => (
                          <p key={question.id}>
                            <strong>{plain(question.title)}</strong>
                            <br />
                            {question.protectedData
                              ? 'Base protegida ou sem respostas.'
                              : `${question.textCount} registros com texto não vazio; esta contagem não representa temas nem sentimento.`}
                          </p>
                        ))}
                      </>
                    )}
                  </ReportDisclosure>
                </section>
                <section id="campaign-report-campaign-4">
                  <ReportDisclosure
                    presentation={presentation}
                    heading="h2"
                    title="5. Leitura integrada"
                  >
                    {selectedRun ? (
                      <CampaignReportNarrative
                        run={selectedRun}
                        section="integration"
                      />
                    ) : (
                      <>
                        <p>
                          A integração entre indicadores e escuta ainda não foi
                          realizada. A cobertura de textos, por si só, não
                          permite inferir concordância, divergência ou
                          explicações para os indicadores.
                        </p>
                      </>
                    )}
                  </ReportDisclosure>
                </section>
                <section id="campaign-report-campaign-5">
                  <ReportDisclosure
                    presentation={presentation}
                    heading="h2"
                    title="6. Orientação para a gestão"
                  >
                    {selectedRun ? (
                      <CampaignReportNarrative
                        run={selectedRun}
                        section="recommendations"
                      />
                    ) : (
                      <>
                        <p>
                          Antes de recomendar ações, revisar o cadastro das
                          alternativas, homologar os critérios de interpretação
                          e concluir a análise temática. Nenhuma recomendação
                          substantiva foi atribuída à IA nesta prévia.
                        </p>
                      </>
                    )}
                  </ReportDisclosure>
                </section>
                <section id="campaign-report-campaign-6">
                  <ReportDisclosure
                    presentation={presentation}
                    heading="h2"
                    title="7. Limitações e hipóteses"
                  >
                    <CampaignReportNarrative
                      run={selectedRun}
                      section="limitations"
                    />
                    {selectedRun && (
                      <ReportDisclosure
                        presentation={presentation}
                        heading="h3"
                        title="7.1. Hipóteses para investigação"
                      >
                        <CampaignReportNarrative
                          run={selectedRun}
                          section="hypotheses"
                        />
                      </ReportDisclosure>
                    )}
                    <p>
                      Os resultados descrevem as respostas disponíveis e não
                      demonstram causalidade. Não há validação de
                      representatividade. A comparação visual entre grupos é
                      descritiva e não demonstra diferenças estatisticamente
                      significativas. O limite provisório de{' '}
                      {REPORT_MINIMUM_RESPONDENTS} respondentes segue o mínimo
                      já usado no painel e não substitui a política final de
                      privacidade.
                    </p>
                    <p>
                      Campos de identificação são excluídos. Distribuições com
                      células pequenas são protegidas integralmente para evitar
                      identificação por subtração. Não há exposição de respostas
                      abertas ou vínculo com pessoas no documento.
                    </p>
                    {!selectedRun && (
                      <p>
                        Esta prévia é recalculada ao consultar a campanha. Ainda
                        não há geração por IA, aprovação, congelamento de versão
                        nem garantia de preservação histórica. Nenhuma hipótese
                        explicativa foi formulada.
                      </p>
                    )}
                  </ReportDisclosure>
                </section>
              </>
            ) : (
              <CampaignReportEvolution
                companyId={companyId}
                applicationId={application.id}
                presentation={presentation}
                dark={darkPresentation}
                onSimulationChange={setComparisonSimulation}
              />
            )}
            <Box
              component="footer"
              sx={{
                mt: 20,
                pt: 8,
                borderTop: '1px solid #dce2ea',
                color: '#536174',
                fontSize: '11px',
              }}
            >
              <DescriptionOutlinedIcon
                sx={{ fontSize: '14px', verticalAlign: 'middle', mr: 2 }}
              />
              {reportTitle} · Rascunho para revisão ·{' '}
              {(document === 'campaign'
                ? selectedRun?.methodVersion
                : 'campaign-comparison-v1') ?? REPORT_METHOD_VERSION}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
