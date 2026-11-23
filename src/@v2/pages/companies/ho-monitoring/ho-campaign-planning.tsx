import { methodAdaptation } from './ho-method-adaptation';
import { HoExecutionPlanning } from './ho-execution-planning';
import { PlanningReadiness } from './ho-planning-pending';
import type { ExposureActivities } from './ho-sampling-activities';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Radio,
  Stack,
  Step,
  StepButton,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';
import { api } from 'core/services/apiClient';
import { HoSamplingStrategy, SamplingSettings } from './ho-sampling-strategy';

import {
  HoCollectionSummary,
  HoAdaptationDocumentActions,
  CollectionSummaryRow,
  ShortCollectionDecision,
  CollectionSelection,
} from './ho-collection-summary';

import type { CombinedCollection } from './ho-combined-collections';

type LaboratorySelection = { exposureId: string; laboratoryId: string };
type Choice = { exposureId: string; optionId: string };
export type HoPlanning = {
  collectionSelection?: CollectionSelection;
  shortCollections?: ShortCollectionDecision[];
  sampling?: SamplingSettings;
  step: 'METHODS' | 'METHODS_CONFIRMED';
  laboratoryIds: string[];
  laboratorySelections?: LaboratorySelection[];
  choices: Choice[];
  updatedAt: string;
};
type Option = {
  id: string;
  laboratoryId: string;
  laboratoryName: string;
  institution: string;
  methodCode: string;
  methodVersion?: string;
  analyticalMethod?: string;
  minimumFlowRate?: number;
  maximumFlowRate?: number;
  flowRateUnit?: string;
  minimumVolume?: number;
  maximumVolume?: number;
  volumeUnit?: string;
  samplerName?: string;
  samplerDescription?: string;
  samplerType?: string;
  extractionSolventName?: string;
  hasLaboratoryOverrides: boolean;
  methodNotes?: string;
  laboratoryNotes?: string;
  analyticalNotes?: string;
  conditions: {
    evaluationType: string;
    minimumFlowRate?: number;
    maximumFlowRate?: number;
    flowRateUnit?: string;
    minimumVolume?: number;
    maximumVolume?: number;
    volumeUnit?: string;
    notes?: string;
  }[];
};
type View = {
  preliminaryOptions?: {exposureId:string;optionId:string;rows:CollectionSummaryRow[]}[];
  readiness?: PlanningReadiness;
  activities?: ExposureActivities[];
  combinedCollections?: CombinedCollection[];
  collectionSummary?: CollectionSummaryRow[];
  revision: number;
  planning: HoPlanning | null;
  laboratories: { id: string; name: string; coverage: number }[];
  exposures: {
    exposureId: string;
    name: string;
    cas?: string;
    origin: string;
    options: Option[];
  }[];
};
function savedSelections(view: View): LaboratorySelection[] {
  return (
    view.planning?.laboratorySelections ??
    view.exposures.flatMap((e) =>
      (view.planning?.laboratoryIds || [])
        .filter((laboratoryId) =>
          e.options.some((o) => o.laboratoryId === laboratoryId),
        )
        .map((laboratoryId) => ({ exposureId: e.exposureId, laboratoryId })),
    )
  );
}
const value = (v: unknown) =>
  v === null || v === undefined || v === '' ? 'Não informado' : String(v);
const range = (min: unknown, max: unknown, unit: unknown) =>
  `${value(min)} a ${value(max)} ${unit || '(unidade não informada)'}`;
export function HoCampaignPlanning({
  base,
  campaignId,
  revision,
  onSaved,
}: {
  base: string;
  campaignId: string;
  revision: number;
  onSaved: () => unknown;
}) {
  const client = useQueryClient();
  const endpoint = `${base}/${campaignId}/planning`;
  const query = useQuery<View>(
    ['ho-planning', campaignId, revision],
    async () => (await api.get(endpoint)).data,
    { keepPreviousData: true },
  );
  const [selections, setSelections] = useState<LaboratorySelection[]>([]);
  const labs = [...new Set(selections.map((s) => s.laboratoryId))];
  const [choices, setChoices] = useState<Choice[]>([]);
  const [step, setStep] = useState(1);
  const stepNavigation=useRef<HTMLElement|null>(null);
  const previousStep=useRef(step);
  useEffect(()=>{
    if(previousStep.current!==step){
      previousStep.current=step;
      const frame=requestAnimationFrame(()=>stepNavigation.current?.scrollIntoView({block:'start'}));
      return ()=>cancelAnimationFrame(frame);
    }
  },[step]);
  const [collectionDraftDirty, setCollectionDraftDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const data = query.data;
  const estimateDays = useCallback(
    async () =>
      (
        await api.post(`${endpoint}/sampling-days`, {
          revision: data?.revision,
        })
      ).data,
    [endpoint, data?.revision],
  );
  useEffect(() => {
    if (data) {
      setSelections(savedSelections(data));
      setChoices(data.planning?.choices || []);
      setStep(
        data.planning?.sampling && data.planning.step === 'METHODS_CONFIRMED'
          ? data.planning.shortCollections || data.planning.collectionSelection
            ? 4
            : 3
          : data.planning
            ? 2
            : 1,
      );
    }
  }, [!!data, campaignId]);
  const save = async (part: string, body: { confirm?: boolean; [key:string]: unknown }) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post<View>(`${endpoint}/${part}`, {
        revision: data!.revision,
        ...body,
      });
      queryClientUpdate(response.data);
      await onSaved();
      if(part==='methods' && body.confirm)setStep(3);
      setSuccess(
        part === 'laboratories'
          ? 'Laboratórios salvos. Confira os métodos na etapa 3.2.'
          : 'Escolhas de métodos salvas no sistema.',
      );
    } catch (e: any) {
      const message = e?.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(' ')
          : message || 'Não foi possível salvar o planejamento.',
      );
    } finally {
      setBusy(false);
    }
  };
  function queryClientUpdate(next: View) {
    setSelections(savedSelections(next));
    setChoices(next.planning?.choices || []);
    setStep(2);
    client.setQueryData(['ho-planning', campaignId, revision], next);
    client.setQueryData(['ho-planning', campaignId, next.revision], next);
  }
  if (query.isLoading)
    return <Typography>Carregando planejamento...</Typography>;
  if (!data)
    return (
      <Alert severity="error">
        Não foi possível carregar o planejamento.{' '}
        <Button onClick={() => query.refetch()}>Tentar novamente</Button>
      </Alert>
    );
  const optionRows=(optionId:string)=>data.preliminaryOptions?.find(p=>p.optionId===optionId)?.rows??[];
  const preliminaryRows=data.exposures.flatMap(e=>e.options.filter(o=>selectedCellForReport(e.exposureId,o.laboratoryId)).flatMap(o=>optionRows(o.id)));
  function selectedCellForReport(exposureId:string,laboratoryId:string){return selections.some(s=>s.exposureId===exposureId&&s.laboratoryId===laboratoryId);}
  const savedCells = savedSelections(data);
  const canonical=(values:string[])=>JSON.stringify([...values].sort());
  const labsDirty=!data.planning || canonical(selections.map(s=>JSON.stringify([s.exposureId,s.laboratoryId])))!==canonical(savedCells.map(s=>JSON.stringify([s.exposureId,s.laboratoryId])));
  const methodsDirty=canonical(choices.map(c=>JSON.stringify([c.exposureId,c.optionId])))!==canonical((data.planning?.choices??[]).map(c=>JSON.stringify([c.exposureId,c.optionId])));
  const selectedCell = (exposureId: string, laboratoryId: string) =>
    selections.some(
      (s) => s.exposureId === exposureId && s.laboratoryId === laboratoryId,
    );
  const uncovered = data.exposures.filter(
    (e) => !selections.some((s) => s.exposureId === e.exposureId),
  );
  const complete =
    data.exposures.length > 0 &&
    data.exposures.every((e) =>
      choices.some(
        (c) =>
          c.exposureId === e.exposureId &&
          e.options.some(
            (o) =>
              o.id === c.optionId &&
              savedCells.some(
                (s) =>
                  s.exposureId === e.exposureId &&
                  s.laboratoryId === o.laboratoryId,
              ),
          ),
      ),
    );
  return (
    <Stack spacing={8}>
      <HoAdaptationDocumentActions campaignId={campaignId} rows={step<=2?preliminaryRows:data.collectionSummary??[]} />
      <Box>
        <Button variant="outlined" disabled={query.isFetching} onClick={() => query.refetch()}>
          Atualizar cálculos sem recarregar
        </Button>
        <Typography variant="caption" component="div">
          Busca os cálculos atuais sem salvar nem recarregar a página.
        </Typography>
      </Box>
      <Box
        component="nav"
        ref={stepNavigation}
        aria-label="Etapas do planejamento da coleta"
        sx={{ overflowX: 'auto', py: 4, scrollMarginTop: '80px' }}
      >
        <Stepper
          nonLinear
          alternativeLabel
          activeStep={step - 1}
          sx={{ minWidth: 560 }}
        >
          {[
            {
              label: '3.1 Laboratórios',
              enabled: true,
              completed: !!data.planning,
            },
            {
              label: '3.2 Métodos',
              enabled: !!data.planning,
              completed: data.planning?.step === 'METHODS_CONFIRMED',
            },
            {
              label: '3.3 Estratégia de amostragem',
              enabled: data.planning?.step === 'METHODS_CONFIRMED',
              completed:
                data.planning?.step === 'METHODS_CONFIRMED' &&
                !!data.planning.sampling,
            },
            {
              label: '3.4 Definição das coletas',
              enabled:
                data.planning?.step === 'METHODS_CONFIRMED' &&
                !!data.planning.sampling,
              completed: !!data.planning?.collectionSelection && !(data.collectionSummary ?? []).filter(r=>!['TWA','TWA_CMPT','CMPT','PENDING'].includes(r.evaluationType)).some(r=>!data.planning?.shortCollections?.some(d=>d.exposureId===r.exposureId && d.evaluationType===r.evaluationType && !d.reviewRequired)),
            },
            {
              label: '3.5 Conferência por GSE',
              enabled: !!data.planning?.collectionSelection && !collectionDraftDirty && !(data.collectionSummary ?? []).filter(r=>!['TWA','TWA_CMPT','CMPT','PENDING'].includes(r.evaluationType)).some(r=>!data.planning?.shortCollections?.some(d=>d.exposureId===r.exposureId && d.evaluationType===r.evaluationType && !d.reviewRequired)),
              completed: !!data.readiness?.ready,
            },
            {
              label: '3.6 Dimensionamento',
              enabled: !!data.readiness?.ready && !collectionDraftDirty,
              completed: false,
            },
          ].map((item, index) => (
            <Step
              key={item.label}
              completed={item.completed}
              disabled={!item.enabled}
            >
              <StepButton
                onClick={() => setStep(index + 1)}
                aria-current={step === index + 1 ? 'step' : undefined}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: step === index + 1 ? 600 : 400,
                  },
                }}
              >
                {item.label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Box hidden={step >= 3}>
        {step === 1 ? (
          <>
            <Typography variant="h6">
              3.1 Definir laboratórios parceiros
            </Typography>
            <Typography>
              Selecione um ou mais laboratórios. A cobertura considera os
              métodos cadastrados para cada exposição; encaminhamentos a outros
              laboratórios precisam estar cadastrados.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Marque as células dos laboratórios que deseja usar para cada
              exposição. O cabeçalho seleciona a coluna inteira e indica
              seleções parciais. Passe o mouse ou use Tab sobre a célula para
              consultar métodos e amostradores. — indica ausência de atendimento
              cadastrado.
            </Typography>
            <Alert severity="info">Triagem antecipada: células em tom laranja têm ao menos um método com limitação; consulte o tooltip para comparar as opções. Picos usam referência de 15 minutos, a confirmar para VMP/Teto. Jornada depende da estratégia salva na 3.3. As faixas verificadas são as cadastradas e não substituem a validação do laboratório.</Alert>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ overflowX:'auto' }}
            >
              <Table
                stickyHeader
                size="small"
                aria-label="Cobertura dos fatores de risco por laboratório"
                sx={{ minWidth: 1100 }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 4,
                        minWidth: 280,
                        backgroundColor: 'background.paper',
                      }}
                    >
                      Fator de risco / Origem
                    </TableCell>
                    {data.laboratories.map((l) => (
                      <TableCell
                        key={l.id}
                        align="center"
                        sx={{ minWidth: 210 }}
                      >
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Checkbox
                              disabled={busy || !l.coverage}
                              checked={
                                selections.filter(
                                  (s) => s.laboratoryId === l.id,
                                ).length === l.coverage && l.coverage > 0
                              }
                              indeterminate={
                                selections.some(
                                  (s) => s.laboratoryId === l.id,
                                ) &&
                                selections.filter(
                                  (s) => s.laboratoryId === l.id,
                                ).length < l.coverage
                              }
                              onChange={(_, checked) =>
                                setSelections((current) => [
                                  ...current.filter(
                                    (s) => s.laboratoryId !== l.id,
                                  ),
                                  ...(checked
                                    ? data.exposures
                                        .filter((e) =>
                                          e.options.some(
                                            (o) => o.laboratoryId === l.id,
                                          ),
                                        )
                                        .map((e) => ({
                                          exposureId: e.exposureId,
                                          laboratoryId: l.id,
                                        }))
                                    : []),
                                ])
                              }
                            />
                          }
                          label={l.name}
                        />
                        <Typography variant="body2">
                          {
                            selections.filter((s) => s.laboratoryId === l.id)
                              .length
                          }{' '}
                          selecionadas · {l.coverage} atendidas
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.exposures.map((e) => (
                    <TableRow key={e.exposureId}>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <Typography fontWeight={600}>{e.name}</Typography>
                        <Typography variant="caption">
                          CAS {e.cas || 'não informado'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: 'pre-line' }}
                        >
                          {e.origin}
                        </Typography>
                      </TableCell>
                      {data.laboratories.map((l) => (
                        <TableCell
                          key={l.id}
                          align="center"
                          sx={{
                            backgroundColor: e.options.filter(o=>o.laboratoryId===l.id).some(o=>optionRows(o.id).some(r=>methodAdaptation(r))) ? 'rgba(211, 93, 50, 0.10)' : selectedCell(e.exposureId, l.id)
                              ? 'action.selected'
                              : undefined,
                          }}
                        >
                          <CoverageCell
                            selected={selectedCell(e.exposureId, l.id)}
                            disabled={busy}
                            onChange={(checked) =>
                              setSelections((current) => [
                                ...current.filter(
                                  (s) =>
                                    !(
                                      s.exposureId === e.exposureId &&
                                      s.laboratoryId === l.id
                                    ),
                                ),
                                ...(checked
                                  ? [
                                      {
                                        exposureId: e.exposureId,
                                        laboratoryId: l.id,
                                      },
                                    ]
                                  : []),
                              ])
                            }
                            preliminaryOptions={data.preliminaryOptions??[]}
                            agent={e.name}
                            laboratory={l.name}
                            options={e.options.filter(
                              (o) => o.laboratoryId === l.id,
                            )}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {labs.length > 0 && (
              <Typography fontWeight={600}>
                Cobertura conjunta dos laboratórios selecionados:{' '}
                {data.exposures.length - uncovered.length} de{' '}
                {data.exposures.length} exposições.
              </Typography>
            )}
            {labs.length > 0 && uncovered.length > 0 && (
              <Alert severity="warning">
                {uncovered.length} exposições sem método nos laboratórios
                selecionados. Você pode salvar esta escolha, mas deverá resolver
                a cobertura antes de concluir 3.2.
                <ul>
                  {uncovered.map((e) => (
                    <li key={e.exposureId}>
                      {e.name} — {e.origin}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
            <Box>
              <Button
                variant="contained"
                disabled={busy || !labs.length || !labsDirty}
                onClick={() =>
                  save('laboratories', {
                    laboratoryIds: labs,
                    laboratorySelections: selections,
                  })
                }
              >
                Salvar laboratórios e avançar para 3.2
              </Button>
              {!labsDirty && <Button disabled={busy} onClick={()=>setStep(2)}>Avançar para 3.2 — laboratórios salvos</Button>}
              <Typography variant="caption" display="block">{labsDirty?'Há alterações nos laboratórios ainda não salvas.':'Laboratórios salvos. Nenhuma alteração pendente.'}</Typography>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6">
              3.2 Escolher método por exposição
            </Typography>
            <Typography>
              Uma única opção é selecionada automaticamente. Compare as
              alternativas e confirme as escolhas. As faixas abaixo são
              referências do catálogo; os parâmetros adotados serão definidos na
              próxima etapa.
            </Typography>
            {data.planning?.step === 'METHODS_CONFIRMED' && (
              <Alert severity="success">
                Etapas 3.1 e 3.2 concluídas. Laboratórios e métodos definidos.
                Próxima etapa: estratégia de amostragem (3.3).
                <Button onClick={() => setStep(3)}>Abrir etapa 3.3</Button>
              </Alert>
            )}
            {data.exposures.map((e) => {
              const options = e.options.filter((o) =>
                savedCells.some(
                  (s) =>
                    s.exposureId === e.exposureId &&
                    s.laboratoryId === o.laboratoryId,
                ),
              );
              return (
                <Paper key={e.exposureId} variant="outlined" sx={{ p: 8 }}>
                  <Stack spacing={5}>
                    <Typography variant="h6">{e.name}</Typography>
                    <Typography variant="body2">
                      CAS {e.cas || 'não informado'} · {e.origin}
                    </Typography>
                    {!options.length ? (
                      <Alert severity="warning">
                        Nenhum método cadastrado para esta exposição nos
                        laboratórios escolhidos. Volte à etapa 3.1 para incluir
                        outro laboratório. A exposição permanece pendente.
                      </Alert>
                    ) : (
                      <TableContainer>
                        <Table size="small" sx={{ minWidth: 1100 }}>
                          <TableHead>
                            <TableRow>
                              {[
                                'Escolher / Método / Laboratório',
                                'Vazão mínima a máxima',
                                'Volume mínimo a máximo',
                                'Técnica analítica',
                                'Amostrador / Tipo',
                                'Solvente de extração',
                                'Condições e observações',
                              ].map((h) => (
                                <TableCell key={h}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {options.map((o) => (
                              <TableRow
                                key={o.id}
                                selected={choices.some(
                                  (c) =>
                                    c.exposureId === e.exposureId &&
                                    c.optionId === o.id,
                                )}
                              >
                                <TableCell>
                                  <FormControlLabel
                                    label={`${o.institution} ${o.methodCode}${o.methodVersion ? ` · ${o.methodVersion}` : ''}`}
                                    control={
                                      <Radio
                                        disabled={busy}
                                        checked={choices.some(
                                          (c) =>
                                            c.exposureId === e.exposureId &&
                                            c.optionId === o.id,
                                        )}
                                        onChange={() =>
                                          setChoices((current) => [
                                            ...current.filter(
                                              (c) =>
                                                c.exposureId !== e.exposureId,
                                            ),
                                            {
                                              exposureId: e.exposureId,
                                              optionId: o.id,
                                            },
                                          ])
                                        }
                                        inputProps={{
                                          'aria-label': `${e.name}: ${o.institution} ${o.methodCode} — ${o.laboratoryName}`,
                                        }}
                                      />
                                    }
                                  />
                                  <Typography variant="body2">
                                    {o.laboratoryName}
                                  </Typography>
                                  {options.length === 1 && (
                                    <Typography variant="caption">
                                      Única opção cadastrada
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {range(
                                    o.minimumFlowRate,
                                    o.maximumFlowRate,
                                    o.flowRateUnit,
                                  )}
                                </TableCell>
                                <TableCell>
                                  {range(
                                    o.minimumVolume,
                                    o.maximumVolume,
                                    o.volumeUnit,
                                  )}
                                </TableCell>
                                <TableCell>
                                  {value(o.analyticalMethod)}
                                </TableCell>
                                <TableCell>
                                  {value(o.samplerName)}
                                  <Typography variant="body2">
                                    Tipo: {value(o.samplerType)}
                                  </Typography>
                                  <Typography variant="caption">
                                    {o.samplerDescription}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {value(o.extractionSolventName)}
                                </TableCell>
                                <TableCell>
                                  <details>
                                    <summary>
                                      Ver condições e observações
                                    </summary>
                                    {o.hasLaboratoryOverrides && (
                                      <Typography variant="body2">
                                        Faixas, amostrador ou solvente
                                        específicos do laboratório têm
                                        preferência sobre os dados gerais.
                                      </Typography>
                                    )}
                                    {o.conditions.map((c, i) => (
                                      <Box key={i} sx={{ mt: 4 }}>
                                        <Typography variant="body2">
                                          {c.evaluationType} · Vazão:{' '}
                                          {range(
                                            c.minimumFlowRate,
                                            c.maximumFlowRate,
                                            c.flowRateUnit,
                                          )}{' '}
                                          · Volume:{' '}
                                          {range(
                                            c.minimumVolume,
                                            c.maximumVolume,
                                            c.volumeUnit,
                                          )}
                                        </Typography>
                                        <Typography variant="body2">
                                          {c.notes}
                                        </Typography>
                                      </Box>
                                    ))}
                                    {[
                                      o.methodNotes,
                                      o.laboratoryNotes,
                                      o.analyticalNotes,
                                    ]
                                      .filter(Boolean)
                                      .map((n, i) => (
                                        <Typography
                                          key={i}
                                          variant="body2"
                                          sx={{ whiteSpace: 'pre-line', mt: 4 }}
                                        >
                                          {n}
                                        </Typography>
                                      ))}
                                    {!o.conditions.length &&
                                      !o.methodNotes &&
                                      !o.laboratoryNotes &&
                                      !o.analyticalNotes && (
                                        <Typography variant="body2">
                                          Sem observações adicionais
                                          cadastradas.
                                        </Typography>
                                      )}
                                  </details>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Stack>
                </Paper>
              );
            })}
            <Typography>
              {choices.length} de {data.exposures.length} exposições com método
              escolhido.
            </Typography>
            <Stack direction="row" spacing={4}>
              <Button disabled={busy} onClick={() => setStep(1)}>
                Voltar para 3.1
              </Button>
              <Button
                disabled={busy || !methodsDirty}
                onClick={() => save('methods', { choices, confirm: false })}
              >
                Salvar escolhas
              </Button>
              <Button
                variant="contained"
                disabled={busy || !complete || labsDirty}
                onClick={() => !methodsDirty && data.planning?.step==='METHODS_CONFIRMED' ? setStep(3) : save('methods', { choices, confirm: true })}
              >
                {!methodsDirty && data.planning?.step==='METHODS_CONFIRMED' ? 'Avançar para 3.3 — métodos confirmados' : methodsDirty ? 'Salvar métodos e avançar para 3.3' : 'Confirmar métodos e avançar para 3.3'}
              </Button>
            </Stack>
            <Typography variant="caption">{methodsDirty ? 'Há alterações nos métodos ainda não salvas.' : data.planning?.step==='METHODS_CONFIRMED' ? 'Métodos confirmados. Nenhuma alteração pendente.' : 'Escolhas salvas. Confirme os métodos para concluir a etapa 3.2.'}</Typography>
          </>
        )}
      </Box>
      {data.planning?.step === 'METHODS_CONFIRMED' && (
        <Box hidden={step !== 3}>
          <HoSamplingStrategy
            key={campaignId}
            exposures={data.exposures}
            saved={data.planning?.sampling}
            methodRows={data.exposures.flatMap(e=>{const choice=choices.find(c=>c.exposureId===e.exposureId);return data.preliminaryOptions?.find(p=>p.exposureId===e.exposureId && p.optionId===choice?.optionId)?.rows??[];})}
            onBack={()=>setStep(2)}
            onContinue={()=>setStep(4)}
            save={async (settings) => {
              const response = await api.post<View>(`${endpoint}/sampling`, {
                ...settings,
                revision: data.revision,
              });
              client.setQueryData(
                ['ho-planning', campaignId, revision],
                response.data,
              );
              client.setQueryData(['ho-planning',campaignId,response.data.revision],response.data);
              await onSaved();
            }}
          />
        </Box>
      )}{' '}
      {step === 6 &&
        data.readiness?.ready &&
        !collectionDraftDirty &&
        data.planning?.sampling && (
          <HoExecutionPlanning
            onBack={()=>setStep(5)}
            sampling={data.planning.sampling}
            estimate={estimateDays}
            save={async (plannedDays) => {
              const response = await api.post<View>(
                `${endpoint}/execution-days`,
                { revision: data.revision, plannedDays },
              );
              client.setQueryData(
                ['ho-planning', campaignId, revision],
                response.data,
              );
              await onSaved();
              setStep(6);
            }}
          />
        )}
      {!!data.planning?.sampling && (
        <Box hidden={step !== 4 && step !== 5}>
        <HoCollectionSummary
          reportCampaignId={campaignId}
          phase={step === 5 ? 'review' : 'definition'}
          onContinue={() => setStep(6)}
          savePlan={async (decisions, selection) => {
            const first = await api.post<View>(`${endpoint}/short-collections`, {revision:data.revision,decisions});
            client.setQueryData(['ho-planning',campaignId,revision],first.data);
            const second = await api.post<View>(`${endpoint}/collection-selection`, {revision:first.data.revision,...selection});
            client.setQueryData(['ho-planning',campaignId,revision],second.data);
            client.setQueryData(['ho-planning',campaignId,second.data.revision],second.data);
            await onSaved();
            setCollectionDraftDirty(false);
            setStep(5);
          }}
          sampling={data.planning?.sampling}
          key={campaignId}
          readiness={data.readiness ?? { ready: false, pending: [] }}
          onResolve={setStep}
          onDraftChange={setCollectionDraftDirty}
          rows={data.collectionSummary ?? []}
          combined={data.combinedCollections ?? []}
          activities={data.activities ?? []}
          selection={data.planning?.collectionSelection}
          saveSelection={async (selection) => {
            const response = await api.post<View>(
              `${endpoint}/collection-selection`,
              { revision: data.revision, ...selection },
            );
            client.setQueryData(
              ['ho-planning', campaignId, revision],
              response.data,
            );
            await onSaved();
            setStep(4);
          }}
          saved={data.planning?.shortCollections ?? []}
          save={async (decisions) => {
            const response = await api.post<View>(
              `${endpoint}/short-collections`,
              { revision: data.revision, decisions },
            );
            client.setQueryData(
              ['ho-planning', campaignId, revision],
              response.data,
            );
            await onSaved();
            setStep(4);
          }}
        />
        </Box>
      )}
    </Stack>
  );
}

function CoverageCell({
  agent,
  laboratory,
  preliminaryOptions,
  options,
  selected,
  disabled,
  onChange,
}: {
  preliminaryOptions:{optionId:string;rows:CollectionSummaryRow[]}[];
  agent: string;
  laboratory: string;
  options: Option[];
  selected: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const attended = options.length > 0;
  return (
    <Tooltip
      arrow
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      title={
        <Stack
          spacing={4}
          sx={{
            p: 2,
            color: 'common.white',
            '& .MuiTypography-root': { color: 'inherit' },
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {laboratory}
          </Typography>
          {attended ? (
            options.map((o) => (
              <Box key={o.id}>
                <Typography variant="body2" fontWeight={600}>
                  {o.institution} {o.methodCode}
                  {o.methodVersion ? ` · ${o.methodVersion}` : ''}
                </Typography>
                <Typography variant="body2">
                  Amostrador: {value(o.samplerName)}
                </Typography>
                {o.samplerType && (
                  <Typography variant="body2">Tipo: {o.samplerType}</Typography>
                )}
                {(preliminaryOptions.find(p=>p.optionId===o.id)?.rows??[]).map(row=><Typography key={row.evaluationType} variant="body2">
                  {row.evaluationType.replace('TWA_CMPT','TWA / CMPT').replace('CEILING','Teto')}: {methodAdaptation(row)?.deviations.join(' ') || (row.calculation.flowLMin!=null ? `Atende às faixas cadastradas em ${row.plannedMinutes} min.` : row.calculation.note)}
                  {!['TWA','TWA_CMPT','CMPT','STEL'].includes(row.evaluationType) ? ' Triagem em 15 min; confirmar duração do pico.' : ''}
                </Typography>)}
                {o.analyticalMethod && (
                  <Typography variant="body2">
                    Técnica: {o.analyticalMethod}
                  </Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body2">
              Sem método com atendimento cadastrado para este fator de risco
              neste laboratório.
            </Typography>
          )}
        </Stack>
      }
    >
      <span>
        {attended ? (
          <Box>
          <Checkbox
            disabled={disabled}
            checked={selected}
            onChange={(_, checked) => onChange(checked)}
            inputProps={{ 'aria-label': `${agent} — ${laboratory}` }}
            color="success"
          />
          {[...new Set(options.flatMap(o=>(preliminaryOptions.find(p=>p.optionId===o.id)?.rows??[]).map(r=>r.evaluationType)))].map(type=>{
            const candidates=options.flatMap(o=>(preliminaryOptions.find(p=>p.optionId===o.id)?.rows??[]).filter(r=>r.evaluationType===type));
            const valid=candidates.some(r=>r.calculation.flowLMin!=null && !methodAdaptation(r));
            const limited=candidates.some(r=>!!methodAdaptation(r));
            return <Typography key={type} variant="caption" display="block" color={valid?'success.main':limited?'warning.dark':'text.secondary'}>{type.replace('TWA_CMPT','TWA / CMPT').replace('CEILING','Teto')}: {valid?(limited?'há alternativa que atende':'atende às faixas'):limited?'requer adaptação':'revisar definição / cadastro'}{!['TWA','TWA_CMPT','CMPT'].includes(type)?' (15 min)':''}</Typography>;
          })}
          </Box>
        ) : (
          <Typography
            component="span"
            aria-label={`${agent} — ${laboratory}: sem atendimento cadastrado`}
            sx={{ px: 6, color: 'text.secondary' }}
          >
            —
          </Typography>
        )}
      </span>
    </Tooltip>
  );
}
