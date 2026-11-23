import { coveragePreview, singleSamplerSuggestion } from './ho-coverage-preview';
import type { CollectionSummaryRow } from './ho-collection-summary';
import {
  SamplingResources,
  SamplingResourcesDraft,
  defaultSamplingResources,
  resourcesValid,
  SamplingResourcesFields,
} from './ho-sampling-resources';
import { HoPlanningSection } from './ho-planning-section';
import {
  ShortSamplingPolicy,
  SamplingDistribution,
  defaultShortPolicy,
  defaultDistribution,
  policyValid,
  distributionValid,
  ShortSamplingCriteria,
  SamplingDistributionFields,
  aihaUrl,
} from './ho-sampling-criteria';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQueryCompanyShifts } from 'core/services/hooks/queries/useQueryCompanyShifts';
import { CompanyShiftsPanel } from 'pages/dashboard/empresas/[companyId]/novo/[stage]/components/EmployeeStage/CompanyShiftsPanel';

const coverageMarks = [25, 50, 70, 75, 80, 90, 100].map((value) => ({
  value,
  label: `${value}%`,
}));
const coverageSliderSx = {
  '& .MuiSlider-markLabel': {
    fontSize: '11px',
    transform: 'translateX(-50%) rotate(-45deg)',
    transformOrigin: 'top center',
  },
};

export type SamplingSettings = {
  resources?: SamplingResources;
  stelPolicy?: ShortSamplingPolicy;
  ceilingPolicy?: ShortSamplingPolicy;
  distribution?: SamplingDistribution;
  version: 1;
  shiftId: number | null;
  shiftName: string;
  durationMinutes: number;
  coveragePercent: number;
  strategyId: string;
  resultCount: number;
  justification: string;
  exceptions: {
    exposureId: string;
    durationMinutes?: number;
    coverageConfirmed?: boolean;
    coveragePercent: number;
    justification: string;
  }[];
};
const guide =
  'https://www.unicesumar.edu.br/biblioteca/wp-content/uploads/sites/50/2019/06/Guia-tecnico-sobre-estrategia-de-amostragem-e-interpretacao.pdf';
const strategies = [
  {
    id: 'custom',
    name: 'Personalizada',
    minimum: 1,
    description:
      'Quantidade definida pelo responsável técnico, com justificativa e regras específicas por GSE ou exposição.',
    source: 'Critério técnico próprio da campanha.',
    url: '',
  },
  {
    id: 'fundacentro',
    name: 'Fundacentro + AIHA/ABHO — seis avaliações iniciais (recomendado pelo SimpleSST)',
    minimum: 6,
    description:
      'Seis resultados iniciais de jornada por GSE e agente. Fundacentro adota mínimo de seis; AIHA/ABHO apresenta seis a dez como prática aprimorada para GES nas categorias de exposição 2 ou 3. A variabilidade pode exigir ampliação.',
    source: 'Carvalho, Fundacentro, 2018 — seções 8.3.9 a 8.3.11.',
    url: guide,
  },
  {
    id: 'aiha',
    name: 'AIHA — conforme citada no guia Fundacentro',
    minimum: 6,
    description:
      'Perfil inicial com seis a dez resultados; definir a quantidade inicial e ampliar conforme a variabilidade.',
    source: 'Fundacentro, 2018, seção 8.3.9 — AIHA, 1991 e 2006.',
    url: guide,
  },
  {
    id: 'benzene',
    name: 'Extrapolação da IN01 do benzeno para outros agentes químicos',
    minimum: 5,
    description:
      'Adaptação técnica do mínimo de cinco resultados de MPT. Para outros agentes, não representa aplicação legal automática da regra do benzeno.',
    source:
      'Referência histórica: IN SSST nº 1, de 20/12/1995, item 4.2.4. Extrapolação adotada pelo responsável técnico.',
    url: 'https://acesso.mte.gov.br/data/files/FF8080812BD96D6A012BDA74DD71230F/in_19951220_01.pdf',
  },
  {
    id: 'french',
    name: 'Regulamento francês — três rodadas de avaliação',
    minimum: 3,
    description:
      'Até três rodadas com pelo menos três resultados por GSE em cada uma. As próximas rodadas dependem dos resultados.',
    source: 'Arrêté du 15 décembre 2009, Anexo 1, seção 1.2.',
    url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021488241',
  },
  {
    id: 'en689',
    name: 'EN 689:2018 — triagem e teste estatístico',
    minimum: 3,
    description:
      'Triagem com três, quatro ou cinco resultados. Sem conclusão na triagem, teste estatístico com pelo menos seis resultados válidos.',
    source: 'EN 689:2018 — seções 5.5.2 e 5.5.3.',
    url: 'https://www.boutique.afnor.org/fr-fr/norme/nf-en-689/exposition-sur-les-lieux-de-travail-mesurage-de-lexposition-par-inhalation-/fa181846/1757',
  },
  {
    id: 'niosh',
    name: 'NIOSH — seleção dos trabalhadores',
    minimum: 6,
    description:
      'Trabalhador de maior risco ou subconjunto estatístico. A quantidade de trabalhadores depende do tamanho do GSE e será definida separadamente dos resultados de jornada.',
    source:
      'Fundacentro, 2018, seção 8.3.9.3. Mínimo de resultados conforme o guia; seleção dos trabalhadores conforme NIOSH.',
    url: guide,
  },
];
type Exposure = { exposureId: string; name: string; origin: string };
export function HoSamplingStrategy({
  exposures,
  saved,
  save,
  methodRows = [],
  onBack,
  onContinue,
}: {
  methodRows?: CollectionSummaryRow[];
  onBack: () => void;
  onContinue: () => void;
  exposures: Exposure[];
  saved?: SamplingSettings;
  save: (
    settings: Omit<SamplingSettings, 'version' | 'shiftName'>,
  ) => Promise<void>;
}) {
  const shifts = useQueryCompanyShifts();
  const [resources, setResources] = useState<SamplingResourcesDraft>(
    defaultSamplingResources,
  );
  const [stelPolicy, setStelPolicy] =
    useState<ShortSamplingPolicy>(defaultShortPolicy);
  const [ceilingPolicy, setCeilingPolicy] =
    useState<ShortSamplingPolicy>(defaultShortPolicy);
  const [distribution, setDistribution] =
    useState<SamplingDistribution>(defaultDistribution);
  const [datesValid, setDatesValid] = useState(true);
  const [shift, setShift] = useState('');
  const [duration, setDuration] = useState('');
  const [coverage, setCoverage] = useState(75);
  const [strategyId, setStrategyId] = useState('');
  const [count, setCount] = useState('6');
  const [justification, setJustification] = useState('');
  const [open, setOpen] = useState(false);
  const [exceptions, setExceptions] = useState<Record<string, number>>({});
  const [coverageConfirmed,setCoverageConfirmed]=useState<Record<string,boolean>>({});
  const suggestedOnce=useRef(new Set<string>());
  const [exceptionMinutes,setExceptionMinutes]=useState<Record<string,number>>({});
  const [exceptionNotes, setExceptionNotes] = useState<Record<string, string>>(
    {},
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setCoverageConfirmed(Object.fromEntries((saved?.exceptions??[]).map(e=>[e.exposureId,e.coverageConfirmed??true])));
    setExceptionMinutes(Object.fromEntries((saved?.exceptions??[]).filter(e=>e.durationMinutes!=null).map(e=>[e.exposureId,e.durationMinutes!])));
    setResources(saved?.resources ?? defaultSamplingResources());
    setStelPolicy(saved?.stelPolicy ?? defaultShortPolicy());
    setCeilingPolicy(saved?.ceilingPolicy ?? defaultShortPolicy());
    setDistribution(saved?.distribution ?? defaultDistribution());
    setShift(
      saved
        ? saved.shiftId === null
          ? 'campaign'
          : String(saved.shiftId)
        : '',
    );
    setDuration(saved ? String(saved.durationMinutes) : '');
    setCoverage(saved?.coveragePercent ?? 75);
    setStrategyId(saved?.strategyId ?? 'fundacentro');
    setCount(String(saved?.resultCount ?? 6));
    setJustification(saved?.justification ?? '');
    setExceptions(
      Object.fromEntries(
        (saved?.exceptions ?? []).map((e) => [e.exposureId, e.coveragePercent]),
      ),
    );
    setExceptionNotes(
      Object.fromEntries(
        (saved?.exceptions ?? []).map((e) => [e.exposureId, e.justification]),
      ),
    );
  }, [saved]);
  const payload={resources,stelPolicy,ceilingPolicy,distribution,shiftId:shift==='campaign'?null:Number(shift),durationMinutes:Number(duration),coveragePercent:coverage,strategyId,resultCount:Number(count),justification:justification.trim(),exceptions:Object.entries(exceptions).map(([exposureId,coveragePercent])=>({exposureId,coveragePercent,...(exceptionMinutes[exposureId]!=null?{durationMinutes:exceptionMinutes[exposureId],coverageConfirmed:coverageConfirmed[exposureId]??false}:{}),justification:(exceptionNotes[exposureId]??'').trim()})).sort((a,b)=>a.exposureId.localeCompare(b.exposureId))};
  const stable=(v:unknown):string=>JSON.stringify(v,(_,value)=>value && typeof value==='object' && !Array.isArray(value)?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))):value);
  const baseline=saved?{resources:saved.resources??defaultSamplingResources(),stelPolicy:saved.stelPolicy??defaultShortPolicy(),ceilingPolicy:saved.ceilingPolicy??defaultShortPolicy(),distribution:saved.distribution??defaultDistribution(),shiftId:saved.shiftId,durationMinutes:saved.durationMinutes,coveragePercent:saved.coveragePercent,strategyId:saved.strategyId,resultCount:saved.resultCount,justification:saved.justification.trim(),exceptions:[...saved.exceptions].map(e=>({...e,...(e.durationMinutes!=null?{coverageConfirmed:e.coverageConfirmed??true}:{}),justification:e.justification.trim()})).sort((a,b)=>a.exposureId.localeCompare(b.exposureId))}:null;
  const dirty=!baseline || stable(payload)!==stable(baseline);
  const strategy = strategies.find((s) => s.id === strategyId);
  const minutes = Number(duration);
  const validDuration =
    Number.isInteger(minutes) && minutes > 0 && minutes <= 1440;
  const target = validDuration ? Math.ceil((minutes * coverage) / 100) : null;
  useEffect(()=>{
    if(!validDuration)return;
    for(const exposure of exposures){
      const suggestionKey=`individual:${exposure.exposureId}`;
      if(suggestedOnce.current.has(suggestionKey) || saved?.exceptions.some(e=>e.exposureId===exposure.exposureId))continue;
      const rows=methodRows.filter(r=>r.exposureId===exposure.exposureId && ['TWA','CMPT','TWA_CMPT'].includes(r.evaluationType));
      const single=singleSamplerSuggestion(rows,Math.ceil(minutes*coverage/100));
      if(single==null)continue;
      suggestedOnce.current.add(suggestionKey);
      if(exceptions[exposure.exposureId]!=null)continue;
      if(single<Math.ceil(minutes*coverage/100)){
        setExceptionMinutes(old=>({...old,[exposure.exposureId]:single}));
        setExceptions(old=>({...old,[exposure.exposureId]:Math.max(1,Math.round(single/minutes*100))}));
        setCoverageConfirmed(old=>({...old,[exposure.exposureId]:false}));
      }
    }
  },[singleSamplerSuggestion,saved?.exceptions,validDuration,minutes,coverage,JSON.stringify(methodRows.map(r=>[r.exposureId,r.method,r.bounds]))]);
  const validCount =
    !!strategy &&
    Number.isInteger(Number(count)) &&
    Number(count) >= 1 &&
    Number(count) <= 10000;
  const twaOverride =
    !!strategy && (strategyId === 'custom' || Number(count) < strategy.minimum);
  return (
    <Stack spacing={10}>
      <Typography variant="h6">3.3 Estratégia de amostragem</Typography>
      <Alert severity={saved ? 'success' : 'info'}>
        {saved
          ? 'Estratégia salva recuperada. Salve novamente somente se alterar os dados.'
          : 'Preencha e salve a etapa 3.3 para manter estes dados ao atualizar a página.'}
      </Alert>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Box
        component="fieldset"
        disabled={saving}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <Stack spacing={10}>
          <HoPlanningSection
            title="Tipo de amostragem e recursos de campo"
            defaultExpanded
          >
            <SamplingResourcesFields
              value={resources}
              onChange={setResources}
            />
          </HoPlanningSection>
          <HoPlanningSection title="Jornada de trabalho e cobertura da avaliação">
            <Stack spacing={8}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={8}>
                <TextField
                  select
                  label="Jornada de referência"
                  value={shift}
                  fullWidth
                  onChange={(e) => {
                    setShift(e.target.value);
                    const selected = shifts.data.find(
                      (s) => String(s.id) === e.target.value,
                    );
                    setDuration(
                      selected?.durationMinutes
                        ? String(selected.durationMinutes)
                        : '',
                    );
                  }}
                >
                  <MenuItem value="">Selecione uma jornada</MenuItem>
                  {shifts.data.map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>
                      {s.name}
                      {s.durationMinutes
                        ? ` — ${s.durationMinutes} min`
                        : ' — duração não informada'}
                    </MenuItem>
                  ))}
                  <MenuItem value="campaign">
                    Definir jornada específica para esta campanha
                  </MenuItem>
                </TextField>
                <TextField
                  label="Duração efetiva da jornada (minutos)"
                  type="number"
                  value={duration}
                  fullWidth
                  disabled={!shift}
                  onChange={(e) => setDuration(e.target.value)}
                  inputProps={{ min: 1, max: 1440, step: 1 }}
                  helperText={
                    validDuration
                      ? `${Math.floor(minutes / 60)} h ${minutes % 60} min; intervalos sem exposição devem ser tratados separadamente.`
                      : 'Informe a duração; não presumimos uma jornada de oito horas.'
                  }
                />
              </Stack>
              {shifts.isError && (
                <Alert severity="error">
                  Não foi possível consultar as jornadas.{' '}
                  <Button onClick={() => shifts.refetch()}>
                    Tentar novamente
                  </Button>
                </Alert>
              )}
              <Box>
                <Button variant="outlined" onClick={() => setOpen(true)}>
                  Cadastrar ou editar jornadas da empresa
                </Button>
              </Box>
              <Typography fontWeight={600}>
                Cobertura mínima geral: {coverage}%{' '}
                {target !== null
                  ? `· ${target} minutos de ${minutes} minutos`
                  : ''}
              </Typography>
              <Box sx={{ px: 6, pb: 10 }}>
                <Slider
                  aria-label="Percentual mínimo da jornada"
                  value={coverage}
                  min={1}
                  max={100}
                  onChange={(_, v) => setCoverage(v as number)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={v=>`${v}% = ${Math.ceil(minutes*v/100)} min`}
                  marks={coverageMarks}
                  sx={coverageSliderSx}
                />
              </Box>
              <Typography variant="body2">
                Esse percentual é um critério de planejamento da campanha. O
                tempo adotado orientará os cálculos de vazão e volume,
                respeitando as condições do método. Não altera o período de
                referência do limite.
              </Typography>
            </Stack>
          </HoPlanningSection>
          <HoPlanningSection title="Quantidade de avaliações — TWA / CMPT (jornada de trabalho)">
            <Stack spacing={8}>
              <TextField
                select
                label="Referência de quantidade — TWA / CMPT"
                value={strategyId}
                onChange={(e) => {
                  setStrategyId(e.target.value);
                  setCount(
                    String(
                      strategies.find((s) => s.id === e.target.value)!.minimum,
                    ),
                  );
                }}
                fullWidth
              >
                {strategies.map((s) => (
                  <MenuItem
                    sx={{
                      whiteSpace: 'normal',
                      fontWeight: s.id === 'fundacentro' ? 700 : 400,
                    }}
                    key={s.id}
                    value={s.id}
                  >
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
              {strategy && (
                <>
                  <Typography>{strategy.description}</Typography>
                  <Typography variant="body2">
                    Referência: {strategy.source}{' '}
                    {strategy.url && (
                      <a href={strategy.url} target="_blank" rel="noreferrer">
                        Consultar documento
                      </a>
                    )}
                  </Typography>
                  <TextField
                    label={
                      strategyId === 'french'
                        ? 'Resultados iniciais por GSE e agente — primeira rodada'
                        : 'Resultados iniciais de jornada por GSE e agente'
                    }
                    type="number"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    inputProps={{ min: 1, max: 10000, step: 1 }}
                    error={!validCount}
                    helperText={`Quantidade recomendada nesta opção: ${strategy.minimum}. Um resultado de jornada pode exigir vários tubos ou filtros consecutivos.`}
                  />
                </>
              )}
              {twaOverride && (
                <Alert severity="warning">
                  Decisão profissional independente: quantidade personalizada ou
                  inferior à recomendação. A referência original e a quantidade
                  adotada ficarão registradas.
                </Alert>
              )}
              {strategyId === 'fundacentro' && (
                <Typography variant="body2">
                  Referência complementar:{' '}
                  <a
                    href={aihaUrl + '#page=23'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Princípios de Boas Práticas, AIHA (2025), tradução e
                    publicação ABHO, páginas 22–23
                  </a>
                  . As categorias AIHA não equivalem automaticamente aos níveis
                  qualitativos de risco do sistema.
                </Typography>
              )}
              <TextField
                label={
                  twaOverride
                    ? 'Justificativa obrigatória da decisão profissional — TWA'
                    : 'Observações sobre a quantidade TWA (opcional)'
                }
                required={twaOverride}
                multiline
                minRows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                helperText="Datas, trabalhadores e turnos são definidos no bloco de distribuição. Aqui justifique uma quantidade personalizada ou inferior à recomendada."
              />
              <Typography variant="body2" color="text.secondary">
                Petrobras: opção pendente de validação do documento e da edição.
                Não aplicamos quantitativos ainda não confirmados.
              </Typography>
            </Stack>
          </HoPlanningSection>
          <HoPlanningSection title="Quantidade de avaliações — STEL (curta duração)">
            <ShortSamplingCriteria
              type="STEL"
              value={stelPolicy}
              onChange={setStelPolicy}
            />
          </HoPlanningSection>
          <HoPlanningSection title="Quantidade de avaliações — Teto / Ceiling e condições de pico (VMP)">
            <ShortSamplingCriteria
              type="Teto"
              value={ceilingPolicy}
              onChange={setCeilingPolicy}
            />
            <Alert severity="info" sx={{ mt: 8 }}>
              VMP permanece identificado separadamente no resumo; não é
              transformado em teto ou STEL. Quando presente, a quantidade de
              avaliações de pico segue este planejamento, com ajuste
              profissional específico.
            </Alert>
          </HoPlanningSection>
          <HoPlanningSection title="Período e distribuição das avaliações">
            <SamplingDistributionFields
              value={distribution}
              onChange={setDistribution}
              shifts={shifts.data}
              onDatesValid={setDatesValid}
            />
          </HoPlanningSection>
          {strategyId === 'french' && (
            <Paper variant="outlined" sx={{ p: 10 }}>
              <Stack spacing={6}>
                <Typography variant="h6">
                  Fluxo francês — avaliações de jornada
                </Typography>
                {[
                  '1 · Caracterização e constituição dos GSE',
                  '2 · Primeira rodada: pelo menos três resultados por GSE e agente',
                  'Todos < 0,1 × limite → controle periódico em até um ano',
                  'Algum resultado > limite → ações corretivas',
                  'Sem conclusão → segunda rodada: pelo menos mais três resultados',
                  'Algum resultado > limite → ações corretivas; caso contrário, terceira rodada com pelo menos mais três resultados',
                  'Ao menos nove resultados → julgamento estatístico: limite superior de confiança de 70% da probabilidade de excedência > 5%?',
                  'Sim → ações corretivas · Não → controle periódico em até um ano',
                ].map((text, i) => (
                  <Box
                    key={text}
                    sx={{
                      p: 6,
                      borderLeft: '4px solid',
                      borderColor: i === 1 ? 'primary.main' : 'divider',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography>{text}</Typography>
                  </Box>
                ))}
                <Typography variant="body2">
                  Prazo geral entre a primeira e a terceira rodada: até um ano.
                  As decisões serão tomadas após resultados válidos; o LSC
                  refere-se à probabilidade de excedência, não à média.
                </Typography>
              </Stack>
            </Paper>
          )}
          {strategyId === 'en689' && (
            <Alert severity="info">
              Triagem EN 689: três resultados todos &lt; 10% do limite; quatro
              todos &lt; 15%; ou cinco todos &lt; 20%. Qualquer resultado acima
              do limite indica não conformidade. Sem conclusão, obter pelo menos
              seis resultados para o teste estatístico. Este fluxo é distinto
              das três rodadas francesas.
            </Alert>
          )}
          <HoPlanningSection
            title="Exceções da cobertura por exposição (jornada de trabalho)"
            defaultExpanded={false}
          >
            <Stack spacing={8}>
              <Typography variant="body2">
                As barras herdam a cobertura geral de {coverage}%. Ajuste para a
                direita ou para a esquerda quando necessário. Alterações na
                regra geral atualizam as exposições ainda não personalizadas.
                A sugestão inicial prioriza uma amostra por agente. Reduções aparecem em vermelho e exigem confirmação e justificativa. Aumente a cobertura para ver a quantidade de amostradores necessária. Decisões já salvas são preservadas.
              </Typography>
              {exposures.map((e) => {
                const total=exceptionMinutes[e.exposureId]??Math.ceil(minutes*(exceptions[e.exposureId]??coverage)/100);
                const candidates=methodRows.filter(r=>r.exposureId===e.exposureId && ['TWA','CMPT','TWA_CMPT'].includes(r.evaluationType));
                const previews=candidates.map(r=>({row:r,preview:coveragePreview(r,total)})).filter(v=>v.preview!=null);
                const differentCoverage=validDuration && total!==Math.ceil(minutes*coverage/100);
                const incompatible=previews.some(v=>!v.preview!.valid);
                const constrained=previews.some(v=>v.preview!.maxMinutes<Math.ceil(minutes*coverage/100) || !v.preview!.valid);
                const pct=validDuration?total/minutes*100:0;
                const fmt=(v:number)=>v.toLocaleString('pt-BR',{maximumFractionDigits:4});
                return (
                <Stack
                  key={e.exposureId}
                  spacing={4}
                  sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 6, ...((differentCoverage||incompatible)?{bgcolor:differentCoverage?'rgba(211,47,47,0.06)':'rgba(230,100,40,0.07)',px:6,borderLeft:'3px solid',borderLeftColor:differentCoverage?'#c43b3b':'#c65b32'}:{}) }}
                >
                  <Typography fontWeight={600}>
                    {e.name} · {e.origin}
                  </Typography>
                  <Typography fontWeight={600}>
                    Cobertura: {fmt(pct)}% · {total} minutos de {minutes} minutos
                  </Typography>
                  {!previews.length && <Typography fontWeight={600} color="text.secondary">Quantidade de amostradores: a definir. Confirme o tipo de amostrador e as faixas do método selecionado.</Typography>}
                  {previews.map(({row,preview:p})=><Box key={row.evaluationType}>
                    <Typography fontWeight={600}>Quantidade de amostradores: <Box component="span" sx={{color:p!.valid && p!.count>1?'error.main':'inherit',fontWeight:700}}>{p!.valid?p!.count:'a definir'}</Box></Typography>
                    <Typography variant="body2">{p!.valid ? p!.count===1 ? `Amostra única de ${fmt(p!.time)} minutos.` : `${p!.count} amostras ${differentCoverage?'distribuídas conforme a justificativa,':'consecutivas,'} de ${fmt(p!.time)} minutos.` : `Seriam necessários pelo menos ${p!.count} amostradores, mas a divisão não atende aos volumes mínimo e máximo. Ajuste a cobertura ou reveja o método.`}</Typography>
                    <Typography variant="caption" component="div"><strong>{row.method}:</strong> máximo calculado pelo volume de {fmt(p!.maxMinutes)} min por amostrador, na vazão mínima de {fmt(row.bounds!.minimumFlowRate!)} {row.bounds!.flowRateUnit}. Vazão da coleta: {fmt(p!.flow)} L/min.</Typography>
                    {constrained && <Button sx={{color:'info.main',textDecoration:'underline',textUnderlineOffset:'3px','&:hover':{textDecoration:'underline'}}} disabled={saving || !validDuration || p!.maxMinutes<1 || Math.floor(p!.maxMinutes)<p!.minMinutes} onClick={()=>{
                      const t=Math.min(minutes,Math.floor(p!.maxMinutes+1e-9));
                      setCoverageConfirmed(old=>({...old,[e.exposureId]:false}));
                      setExceptions(old=>({...old,[e.exposureId]:Math.max(1,Math.round(t/minutes*100))}));
                      setExceptionMinutes(old=>({...old,[e.exposureId]:t}));
                    }}>Reduzir cobertura para uma amostra de {fmt(Math.min(minutes,Math.floor(p!.maxMinutes+1e-9)))} min</Button>}
                  </Box>)}
                  <Box sx={{ px: 6, pb: 10 }}>
                    <Slider
                      aria-label={`Cobertura mínima — ${e.name} — ${e.origin}`}
                      value={total}
                      min={1}
                      max={validDuration?minutes:100}
                      step={1}
                      marks={coverageMarks.map(m=>({...m,value:Math.round(minutes*m.value/100)}))}
                      sx={{...coverageSliderSx,...((differentCoverage||incompatible)?{color:differentCoverage?'#c43b3b':'#c65b32'}:{})}}
                      valueLabelDisplay="auto"
                      valueLabelFormat={v=>`${fmt(v/minutes*100)}% = ${v} min`}
                      onChange={(_, value) => {
                        const t=value as number;
                        setCoverageConfirmed(old=>({...old,[e.exposureId]:false}));
                      setExceptions(old=>({...old,[e.exposureId]:Math.max(1,Math.round(t/minutes*100))}));
                        setExceptionMinutes(old=>({...old,[e.exposureId]:t}));
                      }}
                    />
                  </Box>
                  {exceptions[e.exposureId] !== undefined && (
                    <Box>
                      <Button
                        sx={{color:'info.main',textDecoration:'underline',textUnderlineOffset:'3px','&:hover':{textDecoration:'underline'}}}
                        onClick={() => {
                          setExceptionMinutes(previous=>{const copy={...previous};delete copy[e.exposureId];return copy;});
                          setExceptions(old=>{const next={...old};delete next[e.exposureId];return next;});
                        }}
                      >
                        Usar cobertura geral ({coverage}%)
                      </Button>
                    </Box>
                  )}
                  {total < Math.ceil(minutes*coverage/100) && <FormControlLabel control={<Checkbox checked={coverageConfirmed[e.exposureId]??false} onChange={(_,checked)=>setCoverageConfirmed(old=>({...old,[e.exposureId]:checked}))}/>} label={`Confirmo a cobertura reduzida de ${total} minutos e a quantidade de amostradores indicada acima.`}/>}
                  {total < Math.ceil(minutes*coverage/100) && (
                    <TextField
                      label="Justificativa, duração do ciclo e distribuição das coletas (manhã/tarde)"
                      value={exceptionNotes[e.exposureId] ?? ''}
                      onChange={(event) =>
                        setExceptionNotes((old) => ({
                          ...old,
                          [e.exposureId]: event.target.value,
                        }))
                      }
                      multiline
                      minRows={2}
                    />
                  )}
                </Stack>
              );})}
            </Stack>
          </HoPlanningSection>
          <Alert severity="info">
            STEL, teto e VMP serão planejados por condição de exposição e
            atividade crítica. Ausência de pico aparente não gera dispensa
            automática. O tempo de coleta precisa atender ao método ativo,
            passivo ou de leitura direta escolhido.
          </Alert>
          <Stack direction="row" flexWrap="wrap" gap={4}>
            <Chip
              label={
                validDuration ? `Jornada: ${minutes} min` : 'Jornada pendente'
              }
            />
            <Chip
              label={
                target === null
                  ? 'Cobertura pendente'
                  : `Tempo-alvo: ${target} min`
              }
            />
            <Chip
              label={
                validCount
                  ? `${count} resultados iniciais por GSE e agente`
                  : 'Estratégia pendente'
              }
            />
          </Stack>
          {(!distributionValid(distribution) || !datesValid) && (
            <Alert severity="info">
              Complete o período e os horários dos turnos
              para salvar o planejamento estruturado.
            </Alert>
          )}
          <Box>
            <Stack direction="row" spacing={4} useFlexGap flexWrap="wrap">
            <Button disabled={saving} onClick={onBack}>Voltar para 3.2</Button>
            <Button
              variant="contained"
              disabled={
                saving || !dirty ||
                !shift ||
                !validDuration ||
                !validCount ||
                (twaOverride && !justification.trim()) ||
                !policyValid(stelPolicy) ||
                !policyValid(ceilingPolicy) ||
                !distributionValid(distribution) ||
                !datesValid ||
                !resourcesValid(resources) ||
                Object.entries(exceptions).some(
                  ([id, percent]) =>
                    (exceptionMinutes[id]!=null ? exceptionMinutes[id]<Math.ceil(minutes*coverage/100) : percent < coverage) && (!exceptionNotes[id]?.trim() || coverageConfirmed[id]!==true),
                )
              }
              onClick={async () => {
                setSaving(true);
                setError('');
                setMessage('');
                try {
                  if (!resourcesValid(resources)) return;
                  await save({...payload,resources});
                  onContinue();
                  setMessage(
                    'Etapa 3.3 salva. Os dados serão recuperados ao reabrir a campanha.',
                  );
                } catch (error: any) {
                  const detail = error?.response?.data?.message;
                  setError(
                    Array.isArray(detail)
                      ? detail.join(' ')
                      : detail ||
                          'Não foi possível salvar. Seus preenchimentos foram mantidos; em caso de conflito, reabra a campanha antes de tentar novamente.',
                  );
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Salvando...' : 'Salvar estratégia e avançar para 3.4'}
            </Button>
            {!dirty && <Button variant="contained" disabled={saving} onClick={onContinue}>Avançar para 3.4 — estratégia salva</Button>}
            </Stack>
            <Typography variant="caption" display="block">{dirty?'Há alterações na estratégia ainda não salvas.':'Estratégia salva. Nenhuma alteração pendente.'}</Typography>
          </Box>
        </Stack>
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Jornadas de trabalho da empresa</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <CompanyShiftsPanel />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              shifts.refetch();
            }}
          >
            Voltar ao planejamento
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
