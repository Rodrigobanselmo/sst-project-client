import { ReportConfigurationContent } from './ReportSettings';
import { Alert, Box, Button, Stack } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from 'core/services/apiClient';
import { ReportDisclosure } from './ReportDisclosure';
import type { NarrativeItem, NarrativeSection } from './campaign-reports.api';

type Measure = {
  score: number | null;
  selections?: number;
  respondents?: number;
  questions?: number;
};
type Comparison = {
  version: string;
  fingerprint: string;
  simulation: boolean;
  before: {
    reportId: string;
    title: string;
    cycleNumber: number;
    referencePeriod: string;
    participants: number | null;
    methodVersion: string;
    model?: string | null;
    scoringVersion?: string | null;
    taxonomyVersion?: string | null;
    classificationVersion?: string | null;
    startedAt: string;
    endedAt: string;
  };
  after: Comparison['before'];
  compatibility: {
    compatible: boolean;
    issues: string[];
    thematicCompatible: boolean;
    thematicIssues: string[];
  };
  groups: {
    id: string;
    title: string;
    before: Measure;
    after: Measure;
    delta: number | null;
    comparable: boolean;
    reason: string | null;
  }[];
  questions: {
    id: string;
    groupId: string;
    title: string;
    before: Measure;
    after: Measure;
    delta: number | null;
    comparable: boolean;
  }[];
  listening: {
    id: string;
    title: string;
    comparable: boolean;
    before: { included: number; received: number; excluded: number } | null;
    after: Comparison['listening'][number]['before'];
    themes: {
      id: string;
      title: string;
      comparable: boolean;
      delta: number | null;
      before: {
        count: number;
        denominator: number;
        percentage: number;
        points: {
          kind: string;
          text: string;
          count: number;
          percentage: number;
        }[];
      } | null;
      after: Comparison['listening'][number]['themes'][number]['before'];
    }[];
  }[];
  demographics: {
    id: string;
    title: string;
    protectedGroups: boolean;
    groups: {
      id: string;
      title: string;
      before: { participants: number; percentage: number };
      after: { participants: number; percentage: number };
      delta: number;
      indicators?: {
        id: string;
        title: string;
        before: Measure;
        after: Measure;
        delta: number | null;
        comparable: boolean;
      }[];
    }[];
  }[];
  evidence: {
    id: string;
    label: string;
    before: any;
    after: any;
    delta: number | null;
    unit: string;
  }[];
};
type Context = {
  simulationAvailable: boolean;
  cycles: {
    applicationId: string;
    cycleNumber: number;
    referencePeriod: string;
    title: string;
    status: string;
    reports: { id: string; createdAt: string; methodVersion: string }[];
  }[];
};
type Run = {
  id: string;
  status: 'PROCESSING' | 'DONE' | 'FAILED';
  createdAt: string;
  fingerprint: string;
  simulation: boolean;
  errorCode: string | null;
  requestedModel: string;
  returnedModel: string | null;
  comparison: Comparison;
  narrative: Record<NarrativeSection, NarrativeItem[]> | null;
};
const plain = (s: string) =>
  s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();
const number = (n: number) =>
  n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const percent = (n?: number | null) =>
  n == null ? 'Não comparável' : `${number(n)}%`;
const difference = (n: number | null) =>
  n == null ? 'Não comparável' : `${n > 0 ? '+' : ''}${number(n)} p.p.`;
const kinds: Record<string, string> = {
  SUGGESTION: 'Sugestão',
  CONCERN: 'Dificuldade relatada',
  PRAISE: 'Avaliação favorável',
  DESCRIPTION: 'Descrição',
  MIXED: 'Naturezas distintas',
};
const narrativeTitles: Record<NarrativeSection, string> = {
  executive: 'Síntese da evolução',
  findings: 'Evolução dos indicadores',
  listening: 'Evolução da escuta',
  integration: 'Leitura integrada',
  recommendations: 'Orientações para a gestão',
  limitations: 'Limitações',
  hypotheses: 'Hipóteses para investigação',
};

export function CampaignReportEvolution({
  companyId,
  applicationId,
  presentation,
  dark,
  onSimulationChange,
  controlsContainer,
}: {
  companyId: string;
  applicationId: string;
  presentation: boolean;
  dark: boolean;
  onSimulationChange?: (value: boolean) => void;
  controlsContainer: HTMLElement | null;
}) {
  const path = `/v2/companies/${encodeURIComponent(companyId)}/forms/applications/${encodeURIComponent(applicationId)}/reports/comparison`;
  const context = useQuery<Context>({
    queryKey: ['campaign-comparison-context', companyId, applicationId],
    queryFn: async () => (await api.get(`${path}/context`)).data,
    retry: false,
  });
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [scenario, setScenario] = useState('');
  const [version, setVersion] = useState('auto');
  useEffect(() => {
    if (before || after || !context.data) return;
    const eligible = context.data.cycles.filter(
      (c) => c.status === 'DONE' && c.reports.length,
    );
    if (eligible.length > 1) {
      setBefore(eligible.at(-2)!.reports[0].id);
      setAfter(eligible.at(-1)!.reports[0].id);
    }
  }, [context.data, before, after]);
  const input = scenario
    ? { scenario }
    : { beforeReportId: before, afterReportId: after };
  const preview = useQuery<Comparison>({
    queryKey: ['campaign-comparison-preview', path, input],
    enabled: !!scenario || (!!before && !!after),
    queryFn: async () => (await api.post(`${path}/preview`, input)).data,
    retry: false,
  });
  const history = useQuery<Run[]>({
    queryKey: ['campaign-comparison-history', companyId, applicationId],
    queryFn: async () => (await api.get(`${path}/history`)).data,
    refetchInterval: (q) =>
      q.state.data?.some((r) => r.status === 'PROCESSING') ? 3000 : false,
    retry: false,
  });
  const matching =
    history.data?.filter((r) => r.fingerprint === preview.data?.fingerprint) ??
    [];
  const saved =
    version === 'live'
      ? null
      : version === 'auto'
        ? matching.find((r) => r.status === 'DONE')
        : history.data?.find((r) => r.id === version && r.status === 'DONE');
  const comparison = saved?.comparison ?? preview.data;
  useEffect(() => {
    onSimulationChange?.(!!comparison?.simulation);
    return () => onSimulationChange?.(false);
  }, [comparison?.simulation, onSimulationChange]);
  const generate = useMutation({
    mutationFn: async () =>
      (
        await api.post(`${path}/generation`, {
          ...input,
          fingerprint: preview.data?.fingerprint,
        })
      ).data,
    onSuccess: () => {
      setVersion('auto');
      void history.refetch();
    },
  });
  const active = history.data?.some((r) => r.status === 'PROCESSING');
  const failure = matching.find((r) => r.status === 'FAILED');
  const textColor = dark ? '#e1e7ef' : '#17212f';
  const selectStyle = {
    color: textColor,
    backgroundColor: dark ? '#263244' : '#fff',
    p: '10px',
    borderRadius: '8px',
    maxWidth: '100%',
    minHeight: '44px',
    border: '1px solid',
    borderColor: 'divider',
  };
  const options =
    context.data?.cycles.flatMap((c) =>
      c.reports.map((r) => ({
        ...r,
        label: `Ciclo ${c.cycleNumber} · ${c.referencePeriod} · ${new Date(r.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Bahia' })}`,
      })),
    ) ?? [];
  const simulationBadge = comparison?.simulation ? (
    <Alert severity="warning" sx={{ mb: '20px' }}>
      SIMULAÇÃO LOCAL — DADOS SINTÉTICOS. Não são resultados da SEFAZ nem de
      qualquer cliente.
    </Alert>
  ) : null;
  const evidenceValue = (value: any) =>
    value?.score != null
      ? `${percent(value.score)} · ${value.selections ?? '—'} seleções pontuáveis`
      : value?.count != null
        ? `${value.count}/${value.denominator} textos incluídos · ${percent(value.percentage)}`
        : value?.participants != null
          ? `${value.participants} participantes · ${percent(value.percentage)}`
          : 'Base não disponível';
  return (
    <>
      <section id="campaign-report-evolution-0">
        <ReportDisclosure
          presentation={presentation}
          heading="h2"
          title="1. Seleção e compatibilidade"
        >
          <ReportConfigurationContent container={controlsContainer}>
            <Box
              data-comparison-controls
              sx={{ '@media print': { display: 'none' } }}
            >
              <Stack gap="16px" sx={{ mb: '24px' }}>
                <Box component="label">
                  Ciclo anterior e versão do relatório{' '}
                  <Box
                    component="select"
                    aria-label="Relatório do ciclo anterior"
                    value={before}
                    onChange={(e) => {
                      setBefore(e.target.value);
                      setScenario('');
                      setVersion('live');
                    }}
                    sx={selectStyle}
                  >
                    <option value="">Selecione uma versão concluída</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </Box>
                </Box>
                <Box component="label">
                  Ciclo posterior e versão do relatório{' '}
                  <Box
                    component="select"
                    aria-label="Relatório do ciclo posterior"
                    value={after}
                    onChange={(e) => {
                      setAfter(e.target.value);
                      setScenario('');
                      setVersion('live');
                    }}
                    sx={selectStyle}
                  >
                    <option value="">Selecione uma versão concluída</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </Box>
                </Box>
                {context.data?.simulationAvailable && (
                  <Box component="label">
                    Laboratório local{' '}
                    <Box
                      component="select"
                      aria-label="Cenário de simulação comparativa"
                      value={scenario}
                      onChange={(e) => {
                        setScenario(e.target.value);
                        setVersion('live');
                      }}
                      sx={selectStyle}
                    >
                      <option value="">Dados reais selecionados</option>
                      <option value="standard">
                        Simulação: dois ciclos compatíveis
                      </option>
                      <option value="changed-score">
                        Simulação: pontuação alterada
                      </option>
                      <option value="changed-taxonomy">
                        Simulação: taxonomia alterada
                      </option>
                      <option value="small-base">
                        Simulação: base insuficiente
                      </option>
                      <option value="missing-question-base">
                        Simulação: cobertura de pergunta diferente
                      </option>
                    </Box>
                  </Box>
                )}
                <Box component="label">
                  Análise exibida{' '}
                  <Box
                    component="select"
                    aria-label="Versão da análise comparativa"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    sx={selectStyle}
                  >
                    <option value="auto">Última análise desta seleção</option>
                    <option value="live">
                      Comparação calculada, sem análise por IA
                    </option>
                    {history.data
                      ?.filter((r) => r.status === 'DONE')
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.simulation ? 'SIMULAÇÃO · ' : ''}
                          {r.comparison.before.referencePeriod} →{' '}
                          {r.comparison.after.referencePeriod} ·{' '}
                          {new Date(r.createdAt).toLocaleString('pt-BR', {
                            timeZone: 'America/Bahia',
                          })}
                        </option>
                      ))}
                  </Box>
                </Box>
              </Stack>
              <Button
                variant="contained"
                disabled={
                  !preview.data?.compatibility.compatible ||
                  !preview.data.evidence.length ||
                  !!active ||
                  generate.isPending ||
                  (version !== 'live' && version !== 'auto')
                }
                onClick={() => generate.mutate()}
              >
                {active
                  ? 'Gerando análise comparativa…'
                  : 'Gerar análise comparativa por IA'}
              </Button>
              <p>
                <small>
                  Modelo: gpt-6.1-sol. A análise usa as versões selecionadas e
                  mantém os números calculados pelo sistema. Geração com consumo
                  de IA; rascunho sujeito a revisão.
                </small>
              </p>
            </Box>
          </ReportConfigurationContent>
          {context.isError && (
            <Alert severity="error">
              Não foi possível consultar os ciclos desta empresa.
            </Alert>
          )}
          {!scenario && options.length < 2 && (
            <Alert severity="info">
              Para uma comparação real, conclua dois ciclos da mesma série e
              gere um relatório em cada um. Campanhas sem relatório aparecem no
              histórico abaixo. Não é necessário repetir a coleta para testar: o
              laboratório local usa somente dados sintéticos.
            </Alert>
          )}
          {!scenario && context.data && (
            <table>
              <thead>
                <tr>
                  <th>Ciclo</th>
                  <th>Referência</th>
                  <th>Estado</th>
                  <th>Relatórios concluídos</th>
                </tr>
              </thead>
              <tbody>
                {context.data.cycles.map((c) => (
                  <tr key={c.applicationId}>
                    <td>{c.cycleNumber}</td>
                    <td>{c.referencePeriod}</td>
                    <td>
                      {{
                        DONE: 'Concluída',
                        PENDING: 'Pendente',
                        IN_PROGRESS: 'Em andamento',
                        CANCELED: 'Cancelada',
                      }[c.status] ?? c.status}
                    </td>
                    <td>{c.reports.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {preview.isFetching && (
            <p>Verificando as versões e calculando as diferenças…</p>
          )}
          {preview.isError && (
            <Alert severity="error">
              {(preview.error as any)?.response?.data?.message ??
                'Não foi possível comparar esta seleção.'}
            </Alert>
          )}
          {generate.isError && (
            <Alert severity="error">
              {(generate.error as any)?.response?.data?.message ??
                'Não foi possível iniciar a análise.'}
            </Alert>
          )}
          {failure && !saved && (
            <Alert severity="warning">
              A análise por IA não foi liberada: {failure.errorCode}. A
              comparação calculada permanece disponível, sem substituir uma
              análise anterior.
            </Alert>
          )}
          {simulationBadge}
          {comparison && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Versão preservada</th>
                    <th>Anterior</th>
                    <th>Posterior</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Campanha</td>
                    <td>{plain(comparison.before.title)}</td>
                    <td>{plain(comparison.after.title)}</td>
                  </tr>
                  <tr>
                    <td>Ciclo / referência</td>
                    <td>
                      {comparison.before.cycleNumber} /{' '}
                      {comparison.before.referencePeriod}
                    </td>
                    <td>
                      {comparison.after.cycleNumber} /{' '}
                      {comparison.after.referencePeriod}
                    </td>
                  </tr>
                  <tr>
                    <td>Participantes</td>
                    <td>{comparison.before.participants ?? 'Protegido'}</td>
                    <td>{comparison.after.participants ?? 'Protegido'}</td>
                  </tr>
                  <tr>
                    <td>Metodologia</td>
                    <td>{comparison.before.methodVersion}</td>
                    <td>{comparison.after.methodVersion}</td>
                  </tr>
                  <tr>
                    <td>Modelo de classificação</td>
                    <td>{comparison.before.model || 'Não registrado'}</td>
                    <td>{comparison.after.model || 'Não registrado'}</td>
                  </tr>
                  <tr>
                    <td>Versão da pontuação</td>
                    <td>{comparison.before.scoringVersion}</td>
                    <td>{comparison.after.scoringVersion}</td>
                  </tr>
                  <tr>
                    <td>Relatório de origem</td>
                    <td>{comparison.before.reportId}</td>
                    <td>{comparison.after.reportId}</td>
                  </tr>
                </tbody>
              </table>
              <Alert
                severity={
                  comparison.compatibility.compatible ? 'success' : 'error'
                }
              >
                {comparison.compatibility.compatible
                  ? 'Questionário, pontuação, série e metodologia objetiva compatíveis.'
                  : 'Comparação bloqueada: as versões não atendem aos critérios de compatibilidade.'}
              </Alert>
              {!!comparison.compatibility.issues.length && (
                <ul>
                  {comparison.compatibility.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
              <p>
                As diferenças são descritivas, em pontos percentuais (p.p.). Não
                demonstram causalidade, significância estatística nem evolução
                das mesmas pessoas. Bases e composição podem mudar entre ciclos.
                Somente perguntas de cobertura comparável sustentam a diferença
                de um tema.
              </p>
            </>
          )}
        </ReportDisclosure>
      </section>
      {comparison?.compatibility.compatible && (
        <>
          <section id="campaign-report-evolution-1" data-comparison-page>
            <ReportDisclosure
              presentation={presentation}
              heading="h2"
              title="2. Indicadores por tema e pergunta"
            >
              {simulationBadge}
              <figure>
                <figcaption>
                  Anterior: {comparison.before.referencePeriod} (azul) ·
                  Posterior: {comparison.after.referencePeriod} (laranja)
                </figcaption>
                <svg
                  role="img"
                  aria-label="Evolução dos indicadores por tema"
                  viewBox={`0 0 1000 ${comparison.groups.length * 100 + 60}`}
                  style={{ width: '100%', display: 'block', color: textColor }}
                >
                  {[0, 25, 50, 75, 100].map((v) => (
                    <g key={v}>
                      <line
                        x1={450 + v * 4.6}
                        x2={450 + v * 4.6}
                        y1="20"
                        y2={comparison.groups.length * 100 + 15}
                        stroke={dark ? '#536174' : '#ccd5df'}
                      />
                      <text
                        x={450 + v * 4.6}
                        y={comparison.groups.length * 100 + 45}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="16"
                      >
                        {v}%
                      </text>
                    </g>
                  ))}
                  {comparison.groups.map((g, i) => (
                    <g key={g.id}>
                      <text
                        x="10"
                        y={i * 100 + 58}
                        fill="currentColor"
                        fontSize="18"
                      >
                        {g.title.length > 38
                          ? g.title.slice(0, 36) + '…'
                          : g.title}
                      </text>
                      {g.comparable ? (
                        <>
                          <line
                            x1={450 + g.before.score! * 4.6}
                            x2={450 + g.after.score! * 4.6}
                            y1={i * 100 + 52}
                            y2={i * 100 + 52}
                            stroke="#8794a8"
                            strokeWidth="4"
                          />
                          <circle
                            cx={450 + g.before.score! * 4.6}
                            cy={i * 100 + 52}
                            r="8"
                            fill="#3689df"
                          >
                            <title>
                              {g.title}: {percent(g.before.score)}
                            </title>
                          </circle>
                          <circle
                            cx={450 + g.after.score! * 4.6}
                            cy={i * 100 + 52}
                            r="8"
                            fill="#df8b35"
                          >
                            <title>
                              {g.title}: {percent(g.after.score)}
                            </title>
                          </circle>
                        </>
                      ) : (
                        <text
                          x="450"
                          y={i * 100 + 58}
                          fill="currentColor"
                          fontSize="16"
                        >
                          Não comparável
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </figure>
              <table>
                <thead>
                  <tr>
                    <th>Tema</th>
                    <th>{comparison.before.referencePeriod}</th>
                    <th>{comparison.after.referencePeriod}</th>
                    <th>Diferença</th>
                    <th>Base anterior / posterior</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.groups.map((g) => (
                    <tr key={g.id}>
                      <td>
                        {g.title}
                        {g.reason && (
                          <>
                            <br />
                            <small>{g.reason}</small>
                          </>
                        )}
                      </td>
                      <td>{percent(g.before.score)}</td>
                      <td>{percent(g.after.score)}</td>
                      <td>{difference(g.delta)}</td>
                      <td>
                        {g.before.selections} / {g.after.selections} seleções
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {comparison.groups.map((g) => (
                <Box key={g.id} data-comparison-page>
                  <ReportDisclosure
                    presentation={presentation}
                    heading="h3"
                    title={g.title}
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>Pergunta</th>
                          <th>Anterior</th>
                          <th>Posterior</th>
                          <th>Diferença</th>
                          <th>Respondentes anterior / posterior</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.questions
                          .filter((q) => q.groupId === g.id)
                          .map((q) => (
                            <tr key={q.id}>
                              <td>{q.title}</td>
                              <td>{percent(q.before.score)}</td>
                              <td>{percent(q.after.score)}</td>
                              <td>{difference(q.delta)}</td>
                              <td>
                                {q.before.respondents ?? 'Protegido'} /{' '}
                                {q.after.respondents ?? 'Protegido'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </ReportDisclosure>
                </Box>
              ))}
            </ReportDisclosure>
          </section>
          <section id="campaign-report-evolution-2" data-comparison-page>
            <ReportDisclosure
              presentation={presentation}
              heading="h2"
              title="3. Escuta em evolução"
            >
              {simulationBadge}
              <p>
                Frequências são calculadas sobre os textos incluídos em cada
                ciclo. Uma resposta pode integrar vários temas. Variação de
                menções não mede aprovação, sentimento ou prevalência. Ausência
                de divulgação não equivale a zero. Os pontos qualitativos abaixo
                são sínteses independentes, sem pareamento individual.
              </p>
              {!comparison.compatibility.thematicCompatible && (
                <Alert severity="warning">
                  Comparação temática indisponível:{' '}
                  {comparison.compatibility.thematicIssues.join(' ')}
                </Alert>
              )}
              {comparison.listening.map((q) => (
                <Box key={q.id}>
                  <h3>{q.title}</h3>
                  <p>
                    Textos incluídos: {q.before?.included ?? 'Protegido'} →{' '}
                    {q.after?.included ?? 'Protegido'} · Recebidos:{' '}
                    {q.before?.received ?? '—'} → {q.after?.received ?? '—'}.
                  </p>
                  {q.themes
                    .filter((t) => t.before || t.after)
                    .map((t) => (
                      <Box key={t.id} data-comparison-page>
                        <ReportDisclosure
                          presentation={presentation}
                          heading="h3"
                          title={t.title}
                        >
                          <table>
                            <thead>
                              <tr>
                                <th>Ciclo</th>
                                <th>Menções / base incluída</th>
                                <th>Frequência</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{comparison.before.referencePeriod}</td>
                                <td>
                                  {t.before
                                    ? `${t.before.count}/${t.before.denominator}`
                                    : 'Não divulgado'}
                                </td>
                                <td>{percent(t.before?.percentage)}</td>
                              </tr>
                              <tr>
                                <td>{comparison.after.referencePeriod}</td>
                                <td>
                                  {t.after
                                    ? `${t.after.count}/${t.after.denominator}`
                                    : 'Não divulgado'}
                                </td>
                                <td>{percent(t.after?.percentage)}</td>
                              </tr>
                            </tbody>
                          </table>
                          {t.before && t.after && (
                            <svg
                              role="img"
                              aria-label={`Frequência temática: ${t.title}`}
                              viewBox="0 0 600 110"
                              style={{
                                width: '100%',
                                maxWidth: '800px',
                                color: textColor,
                                display: 'block',
                              }}
                            >
                              <text
                                x="0"
                                y="30"
                                fill="currentColor"
                                fontSize="16"
                              >
                                Anterior
                              </text>
                              <rect
                                x="100"
                                y="10"
                                width={t.before.percentage * 3.8}
                                height="24"
                                rx="4"
                                fill="#3689df"
                              />
                              <text
                                x="505"
                                y="30"
                                fill="currentColor"
                                fontSize="16"
                              >
                                {percent(t.before.percentage)}
                              </text>
                              <text
                                x="0"
                                y="82"
                                fill="currentColor"
                                fontSize="16"
                              >
                                Posterior
                              </text>
                              <rect
                                x="100"
                                y="62"
                                width={t.after.percentage * 3.8}
                                height="24"
                                rx="4"
                                fill="#df8b35"
                              />
                              <text
                                x="505"
                                y="82"
                                fill="currentColor"
                                fontSize="16"
                              >
                                {percent(t.after.percentage)}
                              </text>
                            </svg>
                          )}
                          <p>
                            Diferença descritiva:{' '}
                            <strong>{difference(t.delta)}</strong>
                          </p>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                              gap: '24px',
                            }}
                          >
                            {[t.before, t.after].map((side, i) => (
                              <Box key={i}>
                                <strong>
                                  {i === 0
                                    ? comparison.before.referencePeriod
                                    : comparison.after.referencePeriod}
                                </strong>
                                <ul>
                                  {side?.points.map((point, index) => (
                                    <li key={index}>
                                      {kinds[point.kind] ?? point.kind}:{' '}
                                      {point.text}
                                      <br />
                                      <small>
                                        {point.count} textos ·{' '}
                                        {percent(point.percentage)} da base
                                        incluída.
                                      </small>
                                    </li>
                                  ))}
                                </ul>
                                {!side && (
                                  <p>
                                    Não divulgado ou sem menção publicável; não
                                    interpretar como ausência do assunto.
                                  </p>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </ReportDisclosure>
                      </Box>
                    ))}
                </Box>
              ))}
            </ReportDisclosure>
          </section>
          <section id="campaign-report-evolution-3" data-comparison-page>
            <ReportDisclosure
              presentation={presentation}
              heading="h2"
              title="4. Composição dos participantes"
            >
              {simulationBadge}
              <p>
                As campanhas podem ter populações respondentes distintas.
                Mudanças na composição ajudam a contextualizar a comparação, mas
                não explicam causalmente os indicadores. Categorias protegidas
                não são divulgadas nem tratadas como zero.
              </p>
              {!comparison.demographics.length && (
                <Alert severity="info">
                  As versões escolhidas não têm duas fotografias demográficas
                  compatíveis preservadas. A análise não pode afirmar que a
                  composição foi estável.
                </Alert>
              )}
              {comparison.demographics.map((d) => (
                <Box key={d.id}>
                  <h3>{d.title}</h3>
                  {d.protectedGroups && (
                    <p>
                      <small>
                        Há categorias protegidas; os grupos visíveis não
                        representam necessariamente toda a população.
                      </small>
                    </p>
                  )}
                  <table>
                    <thead>
                      <tr>
                        <th>Grupo</th>
                        <th>Anterior</th>
                        <th>Posterior</th>
                        <th>Diferença de composição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.groups.map((g) => (
                        <tr key={g.id}>
                          <td>{g.title}</td>
                          <td>
                            {g.before.participants} ·{' '}
                            {percent(g.before.percentage)}
                          </td>
                          <td>
                            {g.after.participants} ·{' '}
                            {percent(g.after.percentage)}
                          </td>
                          <td>{difference(g.delta)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {d.groups.map(
                    (g) =>
                      !!g.indicators?.length && (
                        <Box key={g.id} data-comparison-page>
                          <ReportDisclosure
                            presentation={presentation}
                            heading="h3"
                            title={`Indicadores no grupo: ${g.title}`}
                          >
                            <p>
                              Comparação descritiva dentro desta categoria, sem
                              parear pessoas. Bases pequenas ou coberturas de
                              perguntas distintas não recebem diferença.
                            </p>
                            <table>
                              <thead>
                                <tr>
                                  <th>Tema</th>
                                  <th>Anterior</th>
                                  <th>Posterior</th>
                                  <th>Diferença</th>
                                  <th>Seleções pontuáveis</th>
                                </tr>
                              </thead>
                              <tbody>
                                {g.indicators.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.title}</td>
                                    <td>{percent(item.before.score)}</td>
                                    <td>{percent(item.after.score)}</td>
                                    <td>{difference(item.delta)}</td>
                                    <td>
                                      {item.before.selections ?? '—'} /{' '}
                                      {item.after.selections ?? '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </ReportDisclosure>
                        </Box>
                      ),
                  )}
                </Box>
              ))}
            </ReportDisclosure>
          </section>
          <section id="campaign-report-evolution-4" data-comparison-page>
            <ReportDisclosure
              presentation={presentation}
              heading="h2"
              title="5. Análise comparativa por IA"
            >
              {simulationBadge}
              {!saved?.narrative && (
                <p>
                  A comparação numérica está pronta. Use “Gerar análise
                  comparativa por IA” para obter uma interpretação fundamentada
                  nas evidências agregadas destes dois ciclos.
                </p>
              )}
              {saved?.narrative && (
                <>
                  <p>
                    RASCUNHO NÃO APROVADO · Modelo solicitado:{' '}
                    {saved.requestedModel} · Retornado:{' '}
                    {saved.returnedModel ?? 'não informado'} · Gerado em{' '}
                    {new Date(saved.createdAt).toLocaleString('pt-BR', {
                      timeZone: 'America/Bahia',
                    })}
                    .
                  </p>
                  {(Object.keys(narrativeTitles) as NarrativeSection[]).map(
                    (section) => (
                      <Box key={section}>
                        <h3>{narrativeTitles[section]}</h3>
                        {saved.narrative![section].map((item, index) => (
                          <Box key={index}>
                            <p>{item.text}</p>
                            <details>
                              <summary>Evidências utilizadas</summary>
                              <ul>
                                {item.evidenceRefs.map((ref) => {
                                  const e = comparison.evidence.find(
                                    (e) => e.id === ref,
                                  );
                                  return e ? (
                                    <li key={ref}>
                                      {e.label}
                                      <br />
                                      Anterior: {evidenceValue(e.before)} ·
                                      Posterior: {evidenceValue(e.after)} ·
                                      Diferença: {difference(e.delta)}.
                                    </li>
                                  ) : null;
                                })}
                              </ul>
                            </details>
                          </Box>
                        ))}
                      </Box>
                    ),
                  )}
                </>
              )}
            </ReportDisclosure>
          </section>
        </>
      )}
    </>
  );
}
