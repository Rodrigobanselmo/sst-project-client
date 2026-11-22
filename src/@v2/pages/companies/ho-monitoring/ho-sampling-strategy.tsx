import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
    name: 'Fundacentro — recomendação do guia',
    minimum: 6,
    description:
      'Pelo menos seis resultados representativos por GSE e parâmetro avaliado. A variabilidade pode exigir ampliação.',
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
}: {
  exposures: Exposure[];
  saved?: SamplingSettings;
  save: (
    settings: Omit<SamplingSettings, 'version' | 'shiftName'>,
  ) => Promise<void>;
}) {
  const shifts = useQueryCompanyShifts();
  const [shift, setShift] = useState('');
  const [duration, setDuration] = useState('');
  const [coverage, setCoverage] = useState(75);
  const [strategyId, setStrategyId] = useState('');
  const [count, setCount] = useState('6');
  const [justification, setJustification] = useState('');
  const [open, setOpen] = useState(false);
  const [exceptions, setExceptions] = useState<Record<string, number>>({});
  const [exceptionNotes, setExceptionNotes] = useState<Record<string, string>>(
    {},
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setShift(
      saved
        ? saved.shiftId === null
          ? 'campaign'
          : String(saved.shiftId)
        : '',
    );
    setDuration(saved ? String(saved.durationMinutes) : '');
    setCoverage(saved?.coveragePercent ?? 75);
    setStrategyId(saved?.strategyId ?? '');
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
  const strategy = strategies.find((s) => s.id === strategyId);
  const minutes = Number(duration);
  const validDuration =
    Number.isInteger(minutes) && minutes > 0 && minutes <= 1440;
  const target = validDuration ? Math.ceil((minutes * coverage) / 100) : null;
  const validCount =
    !!strategy &&
    Number.isInteger(Number(count)) &&
    Number(count) >= strategy.minimum;
  return (
    <Stack spacing={10}>
      <Typography variant="h6">3.3 Estratégia de amostragem</Typography>
      <Alert severity={saved ? 'success' : 'info'}>
        {saved
          ? 'Estratégia salva na campanha. Use Salvar etapa 3.3 após novas alterações.'
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
          <Paper variant="outlined" sx={{ p: 10 }}>
            <Stack spacing={8}>
              <Typography variant="h6">
                Jornada e cobertura da avaliação de jornada
              </Typography>
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
          </Paper>
          <Paper variant="outlined" sx={{ p: 10 }}>
            <Stack spacing={8}>
              <Typography variant="h6">
                Estratégia de quantidade e distribuição das avaliações
              </Typography>
              <TextField
                select
                label="Estratégia de referência"
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
                    sx={{ whiteSpace: 'normal' }}
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
                    inputProps={{ min: strategy.minimum, step: 1 }}
                    error={!validCount}
                    helperText={`Mínimo desta opção: ${strategy.minimum}. Um resultado de jornada pode exigir vários tubos ou filtros consecutivos.`}
                  />
                </>
              )}
              <TextField
                label="Justificativa técnica e distribuição prevista das avaliações"
                multiline
                minRows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                helperText="Registre dias, trabalhadores, variabilidade esperada e fundamento dos critérios personalizados."
              />
              <Typography variant="body2" color="text.secondary">
                Petrobras: opção pendente de validação do documento e da edição.
                Não aplicamos quantitativos ainda não confirmados.
              </Typography>
            </Stack>
          </Paper>
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
          <Paper variant="outlined" sx={{ p: 10 }}>
            <Stack spacing={8}>
              <Typography variant="h6">
                Exceções à cobertura por exposição
              </Typography>
              <Typography variant="body2">
                Todas as barras começam com a cobertura geral de 75%. Ajuste
                para a direita ou para a esquerda quando necessário. Alterações
                na regra geral atualizam as exposições ainda não personalizadas.
                Reduções exigem justificativa, incluindo duração e repetição do
                ciclo.
              </Typography>
              {exposures.map((e) => (
                <Stack
                  key={e.exposureId}
                  spacing={4}
                  sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 6 }}
                >
                  <Typography fontWeight={600}>
                    {e.name} · {e.origin}
                  </Typography>
                  <Typography fontWeight={600}>
                    Cobertura: {exceptions[e.exposureId] ?? coverage}%
                    {validDuration
                      ? ` · ${Math.ceil((minutes * (exceptions[e.exposureId] ?? coverage)) / 100)} minutos de ${minutes} minutos`
                      : ' · informe a jornada para calcular os minutos'}
                  </Typography>
                  <Box sx={{ px: 6, pb: 10 }}>
                    <Slider
                      aria-label={`Cobertura mínima — ${e.name} — ${e.origin}`}
                      value={exceptions[e.exposureId] ?? coverage}
                      min={1}
                      max={100}
                      step={1}
                      marks={coverageMarks}
                      sx={coverageSliderSx}
                      valueLabelDisplay="auto"
                      onChange={(_, value) =>
                        setExceptions((old) => ({
                          ...old,
                          [e.exposureId]: value as number,
                        }))
                      }
                    />
                  </Box>
                  {exceptions[e.exposureId] !== undefined && (
                    <Box>
                      <Button
                        onClick={() =>
                          setExceptions((old) => {
                            const next = { ...old };
                            delete next[e.exposureId];
                            return next;
                          })
                        }
                      >
                        Usar cobertura geral ({coverage}%)
                      </Button>
                    </Box>
                  )}
                  {(exceptions[e.exposureId] ?? coverage) < coverage && (
                    <TextField
                      label="Justificativa da exceção e duração do ciclo"
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
              ))}
            </Stack>
          </Paper>
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
          <Box>
            <Button
              variant="contained"
              disabled={
                saving ||
                !shift ||
                !validDuration ||
                !validCount ||
                (strategyId === 'custom' && !justification.trim()) ||
                Object.entries(exceptions).some(
                  ([id, percent]) =>
                    percent < coverage && !exceptionNotes[id]?.trim(),
                )
              }
              onClick={async () => {
                setSaving(true);
                setError('');
                setMessage('');
                try {
                  await save({
                    shiftId: shift === 'campaign' ? null : Number(shift),
                    durationMinutes: minutes,
                    coveragePercent: coverage,
                    strategyId,
                    resultCount: Number(count),
                    justification,
                    exceptions: Object.entries(exceptions).map(
                      ([exposureId, coveragePercent]) => ({
                        exposureId,
                        coveragePercent,
                        justification: exceptionNotes[exposureId] ?? '',
                      }),
                    ),
                  });
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
              {saving ? 'Salvando...' : 'Salvar etapa 3.3'}
            </Button>
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
