import {
  SamplingActivities,
  ExposureActivities,
} from './ho-sampling-activities';
import { useEffect, useState } from 'react';
import {
  HoCombinedCollections,
  CombinedCollection,
} from './ho-combined-collections';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  MenuItem,
  TextField,
  Box,
  Chip,
  Checkbox,
  Tooltip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
const expansionArrowSx = {
  '& .MuiAccordionSummary-expandIconWrapper': { transform: 'rotate(0deg)' },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
};

export type CollectionSummaryRow = {
  exposureId: string;
  group: string;
  agent: string;
  cas?: string;
  evaluationType: string;
  laboratory: string;
  method: string;
  sampler?: string;
  samplerType?: string;
  extractionSolvent?: string;
  analyticalMethod?: string;
  stabilityDays?: number;
  storageTemperature?: number;
  storageTemperatureUnit?: string;
  coveragePercent: number | null;
  plannedMinutes: number | null;
  resultCount: number | null;
  suggestedMinimum: number | null;
  shortAssessment: string | null;
  limits: string[];
  totalSamplers: number | null;
  notes: string[];
  calculation: {
    flowLMin: number | null;
    minutesPerSampler: number | null;
    volumeLitres: number | null;
    samplersPerResult: number | null;
    changesAtMinutes: number[];
    targetVolumeLitres: number | null;
    note: string;
  };
};
const number = (value: number | null | undefined, suffix = '') =>
  value == null
    ? 'Pendente'
    : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}${suffix}`;
const types: Record<string, string> = {
  TWA: 'TWA',
  TWA_CMPT: 'TWA / CMPT',
  CMPT: 'CMPT · NR-15',
  STEL: 'STEL',
  CEILING: 'Teto',
  ACGIH_CEILING: 'Ceiling · ACGIH',
  NR15_TETO: 'Teto · NR-15',
  VMP: 'VMP',
  PENDING: 'Tipo de limite pendente',
};
export type ShortCollectionDecision = {
  exposureId: string;
  evaluationType: string;
  planned: boolean;
  resultCount: number;
  durationMinutes: number;
  justification: string;
};
export type CollectionSelection = {
  combinedIds: string[];
  individualExposureIds: string[];
};
export function HoCollectionSummary({
  rows,
  combined = [],
  selection,
  saveSelection,
  activities = [],
  saved,
  save,
}: {
  rows: CollectionSummaryRow[];
  combined?: CombinedCollection[];
  selection?: CollectionSelection;
  saveSelection: (selection: CollectionSelection) => Promise<void>;
  activities?: ExposureActivities[];
  saved: ShortCollectionDecision[];
  save: (decisions: ShortCollectionDecision[]) => Promise<void>;
}) {
  const defaultIndividuals = () => [
    ...new Set(
      rows
        .filter((r) => ['TWA', 'TWA_CMPT'].includes(r.evaluationType))
        .map((r) => r.exposureId),
    ),
  ];
  const [selected, setSelected] = useState<CollectionSelection>(
    () =>
      selection ?? {
        combinedIds: [],
        individualExposureIds: defaultIndividuals(),
      },
  );
  const [selectionDirty, setSelectionDirty] = useState(false);
  const [selectionBusy, setSelectionBusy] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState('');
  const [selectionError, setSelectionError] = useState('');
  useEffect(() => {
    setSelected(
      selection ?? {
        combinedIds: [],
        individualExposureIds: defaultIndividuals(),
      },
    );
    setSelectionDirty(false);
  }, [JSON.stringify(selection)]);
  const covered = new Set(
    combined
      .filter((s) => selected.combinedIds.includes(s.id))
      .flatMap((s) => s.exposureIds),
  );
  function toggleCombined(suggestion: CombinedCollection, checked: boolean) {
    setSelectionDirty(true);
    setSelectionMessage('');
    setSelected((old) => {
      const combinedIds = checked
        ? [
            ...old.combinedIds.filter(
              (id) =>
                id !== suggestion.id &&
                !combined
                  .find((s) => s.id === id)
                  ?.exposureIds.some((e) => suggestion.exposureIds.includes(e)),
            ),
            suggestion.id,
          ]
        : old.combinedIds.filter((id) => id !== suggestion.id);
      const nextCovered = new Set(
        combined
          .filter((s) => combinedIds.includes(s.id))
          .flatMap((s) => s.exposureIds),
      );
      return {
        combinedIds,
        individualExposureIds: checked
          ? old.individualExposureIds.filter((id) => !nextCovered.has(id))
          : [
              ...new Set([
                ...old.individualExposureIds,
                ...suggestion.exposureIds.filter((id) => !nextCovered.has(id)),
              ]),
            ],
      };
    });
  }
  const [decisions, setDecisions] = useState<ShortCollectionDecision[]>(saved);
  const [peakOpen, setPeakOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    setDecisions(saved);
  }, [JSON.stringify(saved)]);
  const shortRows = rows.filter((r) =>
    ['STEL', 'CEILING', 'ACGIH_CEILING', 'NR15_TETO', 'VMP'].includes(
      r.evaluationType,
    ),
  );
  function update(
    row: CollectionSummaryRow,
    patch: Partial<ShortCollectionDecision>,
  ) {
    setDecisions((old) => {
      const existing = old.find(
        (d) =>
          d.exposureId === row.exposureId &&
          d.evaluationType === row.evaluationType,
      );
      return [
        ...old.filter(
          (d) =>
            !(
              d.exposureId === row.exposureId &&
              d.evaluationType === row.evaluationType
            ),
        ),
        {
          exposureId: row.exposureId,
          evaluationType: row.evaluationType,
          planned: true,
          resultCount: row.suggestedMinimum ?? 1,
          durationMinutes: 15,
          justification: '',
          ...existing,
          ...patch,
        },
      ];
    });
  }
  const groups = [...new Set(rows.map((row) => row.group))];
  return (
    <Stack spacing={10}>
      <Typography variant="h6">3.4 Resumo do planejamento por GSE</Typography>
      <Alert severity="info">
        Calculado a partir da etapa 3.3 salva e dos métodos confirmados. TWA:
        alvo de 90% do volume máximo por amostrador, respeitando vazão e volume
        mínimos/máximos. Vários tubos consecutivos compõem um resultado de
        jornada. Valores são sugestões de planejamento, não resultados de
        medição.
      </Alert>
      <Alert severity="warning">
        STEL e avaliações de pico dependem da atividade crítica, sua duração e
        da decisão técnica. Quantidade pendente não significa zero ou dispensa.
        Estabilidade é o prazo cadastrado após coleta; confirme também
        transporte e prazo de recebimento com o laboratório. Linhas TWA e CMPT
        são critérios distintos: não some tubos automaticamente se uma mesma
        coleta puder atender ambos.
      </Alert>
      {shortRows.length > 0 && (
        <Accordion
          variant="outlined"
          expanded={peakOpen}
          onChange={(_, open) => setPeakOpen(open)}
        >
          <AccordionSummary
            expandIcon={<ChevronRightIcon />}
            sx={{ ...expansionArrowSx, flexDirection: 'row-reverse', gap: 4 }}
          >
            <Typography fontWeight={600}>
              Definir avaliações de curta duração e pico ({shortRows.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={8}>
              <Typography variant="h6">
                Definir avaliações de curta duração e pico
              </Typography>
              <Typography variant="body2">
                Para cada agente e GSE, indique a atividade crítica e a
                quantidade total de resultados prevista nesta campanha. STEL
                começa com referência de 15 minutos. Teto/VMP devem cobrir o
                pico real no menor tempo permitido pelo método (até 15 minutos
                nesta tela). Decisões ainda não preenchidas continuam pendentes.
              </Typography>
              {shortRows.map((row) => {
                const decision = decisions.find(
                  (d) =>
                    d.exposureId === row.exposureId &&
                    d.evaluationType === row.evaluationType,
                );
                return (
                  <Box
                    key={`${row.exposureId}:${row.evaluationType}`}
                    sx={{
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      pt: 8,
                    }}
                  >
                    <Stack spacing={6}>
                      <Typography fontWeight={600}>
                        {row.group} · {row.agent} ·{' '}
                        {types[row.evaluationType] || row.evaluationType}
                      </Typography>
                      <SamplingActivities
                        activities={
                          activities.find(
                            (a) => a.exposureId === row.exposureId,
                          )?.activities ?? []
                        }
                      />
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={6}
                      >
                        <TextField
                          select
                          fullWidth
                          label="Decisão de avaliação"
                          value={
                            decision ? (decision.planned ? 'yes' : 'no') : ''
                          }
                          disabled={busy}
                          onChange={(event) => {
                            if (!event.target.value)
                              setDecisions((old) =>
                                old.filter(
                                  (d) =>
                                    !(
                                      d.exposureId === row.exposureId &&
                                      d.evaluationType === row.evaluationType
                                    ),
                                ),
                              );
                            else
                              update(row, {
                                planned: event.target.value === 'yes',
                              });
                          }}
                        >
                          <MenuItem value="">Pendente de decisão</MenuItem>
                          <MenuItem value="yes">Programar avaliação</MenuItem>
                          {row.evaluationType === 'STEL' && (
                            <MenuItem value="no">
                              Não programar STEL — justificar
                            </MenuItem>
                          )}
                        </TextField>
                        {decision?.planned && (
                          <>
                            <TextField
                              fullWidth
                              type="number"
                              label="Quantidade de resultados"
                              value={decision.resultCount}
                              disabled={busy}
                              inputProps={{
                                min: row.suggestedMinimum ?? 1,
                                max: 10000,
                                step: 1,
                              }}
                              onChange={(event) =>
                                update(row, {
                                  resultCount: Number(event.target.value),
                                })
                              }
                            />
                            <TextField
                              fullWidth
                              type="number"
                              label="Tempo da atividade / coleta (min)"
                              value={decision.durationMinutes}
                              disabled={busy}
                              inputProps={{ min: 0.001, max: 15, step: 0.001 }}
                              onChange={(event) =>
                                update(row, {
                                  durationMinutes: Number(event.target.value),
                                })
                              }
                            />
                          </>
                        )}
                      </Stack>
                      {decision && (
                        <TextField
                          label={
                            decision.planned
                              ? 'Atividade crítica, duração do pico e distribuição das avaliações'
                              : 'Justificativa técnica para não programar STEL'
                          }
                          multiline
                          minRows={2}
                          value={decision.justification}
                          disabled={busy}
                          onChange={(event) =>
                            update(row, { justification: event.target.value })
                          }
                        />
                      )}
                    </Stack>
                  </Box>
                );
              })}
              {error && <Alert severity="error">{error}</Alert>}
              {message && <Alert severity="success">{message}</Alert>}
              <Box>
                <Button
                  variant="contained"
                  disabled={
                    busy ||
                    decisions.some(
                      (d) =>
                        !d.justification.trim() ||
                        !Number.isInteger(d.resultCount) ||
                        d.resultCount <
                          (d.planned
                            ? (shortRows.find(
                                (r) =>
                                  r.exposureId === d.exposureId &&
                                  r.evaluationType === d.evaluationType,
                              )?.suggestedMinimum ?? 1)
                            : 1) ||
                        d.resultCount > 10000 ||
                        !Number.isFinite(d.durationMinutes) ||
                        d.durationMinutes < 0.001 ||
                        d.durationMinutes > 15,
                    )
                  }
                  onClick={async () => {
                    setBusy(true);
                    setError('');
                    setMessage('');
                    try {
                      await save(decisions);
                      setMessage('Decisões salvas. Resumo recalculado.');
                    } catch (error: any) {
                      const detail = error?.response?.data?.message;
                      setError(
                        Array.isArray(detail)
                          ? detail.join(' ')
                          : detail ||
                              'Não foi possível salvar. Reabra a campanha em caso de alteração por outra sessão.',
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? 'Salvando...' : 'Salvar decisões e recalcular resumo'}
                </Button>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
      <Typography>
        {groups.length} grupos/origens · {rows.length} linhas por tipo de
        avaliação. Quantitativos por linha; compartilhamento de coletas e
        brancos ainda precisam ser avaliados.
      </Typography>
      {!rows.length && (
        <Alert severity="warning">
          Salve a estratégia em 3.3 e confirme os métodos para gerar o resumo.
        </Alert>
      )}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={6}
        alignItems={{ md: 'center' }}
      >
        <Button
          variant="contained"
          disabled={selectionBusy || !selectionDirty}
          onClick={async () => {
            setSelectionBusy(true);
            setSelectionError('');
            try {
              await saveSelection(selected);
              setSelectionDirty(false);
              setSelectionMessage('Seleção de coletas salva na campanha.');
            } catch (error: any) {
              const detail = error?.response?.data?.message;
              setSelectionError(
                Array.isArray(detail)
                  ? detail.join(' ')
                  : detail || 'Não foi possível salvar a seleção.',
              );
            } finally {
              setSelectionBusy(false);
            }
          }}
        >
          {selectionBusy ? 'Salvando...' : 'Salvar seleção de coletas TWA'}
        </Button>
        <Typography variant="body2">
          {selected.combinedIds.length} combinações ·{' '}
          {selected.individualExposureIds.length} coletas individuais
          selecionadas. STEL e pico são decisões separadas.
        </Typography>
      </Stack>
      {selectionDirty && (
        <Alert severity="info">
          Seleção alterada; salve para manter após atualizar a página. Desmarcar
          uma combinação reabilita seus TWA individuais.
        </Alert>
      )}
      {selectionMessage && <Alert severity="success">{selectionMessage}</Alert>}
      {selectionError && <Alert severity="error">{selectionError}</Alert>}
      {groups.map((group) => (
        <Accordion
          defaultExpanded
          disableGutters
          variant="outlined"
          key={group}
          sx={{
            borderRadius: '12px !important',
            overflow: 'hidden',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ChevronRightIcon />}
            sx={{
              ...expansionArrowSx,
              bgcolor: 'action.hover',
              flexDirection: 'row-reverse',
              gap: 4,
            }}
          >
            <Typography
              component="h3"
              sx={{ fontWeight: 700, fontSize: { xs: '18px', md: '22px' } }}
            >
              {group || 'Origem não informada'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: { xs: 4, md: 10 }, py: 8 }}>
            <Stack spacing={6}>
              <HoCombinedCollections
                suggestions={combined.filter((s) => s.group === group)}
                selectedIds={selected.combinedIds}
                onToggle={toggleCombined}
                activities={activities}
                busy={selectionBusy}
              />
              {[
                ...new Map(
                  rows
                    .filter((row) => row.group === group)
                    .map((row) => [
                      JSON.stringify([row.agent, row.cas ?? '']),
                      row,
                    ]),
                ).entries(),
              ].map(([agentKey, agent]) => (
                <Accordion
                  defaultExpanded
                  disableGutters
                  key={agentKey}
                  sx={{
                    ml: { xs: 0, md: 8 },
                    boxShadow: 'none',
                    borderLeft: '2px solid',
                    borderColor: 'divider',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ChevronRightIcon />}
                    sx={{
                      ...expansionArrowSx,
                      flexDirection: 'row-reverse',
                      gap: 4,
                      px: 6,
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={4}
                      sx={{ flexWrap: 'wrap', alignItems: { sm: 'baseline' } }}
                    >
                      <Typography
                        component="h4"
                        sx={{
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        {agent.agent}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        CAS {agent.cas || 'não informado'}
                      </Typography>
                      <Box onClick={(event) => event.stopPropagation()}>
                        <SamplingActivities
                          activities={activities
                            .filter((a) =>
                              rows.some(
                                (r) =>
                                  r.group === group &&
                                  r.agent === agent.agent &&
                                  r.cas === agent.cas &&
                                  r.exposureId === a.exposureId,
                              ),
                            )
                            .flatMap((a) => a.activities)}
                        />
                      </Box>
                      {combined.some((s) =>
                        s.exposureIds.includes(agent.exposureId),
                      ) && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label="Candidata à coleta combinada"
                        />
                      )}
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 2, md: 6 }, pb: 6 }}>
                    <TableContainer sx={{ maxHeight: 650 }}>
                      <Table
                        stickyHeader
                        size="small"
                        aria-label={`Resumo de coleta — ${group}`}
                        sx={{
                          minWidth: 2150,
                          '& td, & th': { verticalAlign: 'top', minWidth: 125 },
                          '& th': { fontWeight: 600 },
                          '& td:first-of-type, & th:first-of-type': {
                            position: 'sticky',
                            left: 0,
                            minWidth: 200,
                            backgroundColor: 'background.paper',
                            zIndex: 1,
                          },
                          '& th:first-of-type': { zIndex: 4 },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            {[
                              'Tipo / limite',
                              'Resultados previstos',
                              'Vazão (L/min)',
                              'Cobertura / tempo total',
                              'Volume por tubo (L)',
                              'Tubos por resultado / total',
                              'Tempo por tubo / trocas',
                              'Laboratório / método',
                              'Tipo de amostrador',
                              'Técnica analítica / solvente',
                              'Estabilidade / armazenamento',
                              'Decisão / pendências / observações',
                            ].map((label) => (
                              <TableCell key={label}>{label}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows
                            .filter(
                              (row) =>
                                row.group === group &&
                                JSON.stringify([row.agent, row.cas ?? '']) ===
                                  agentKey,
                            )
                            .map((row) => (
                              <TableRow
                                key={`${row.exposureId}:${row.evaluationType}`}
                                sx={
                                  ['TWA', 'TWA_CMPT'].includes(
                                    row.evaluationType,
                                  ) && covered.has(row.exposureId)
                                    ? {
                                        bgcolor: 'action.disabledBackground',
                                        '& .MuiTableCell-root, & .MuiTypography-root':
                                          { color: 'text.disabled' },
                                        opacity: 0.6,
                                      }
                                    : undefined
                                }
                              >
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={
                                      types[row.evaluationType] ||
                                      row.evaluationType
                                    }
                                  />
                                  {row.limits.map((limit) => (
                                    <Typography variant="body2" key={limit}>
                                      {limit}
                                    </Typography>
                                  ))}
                                </TableCell>
                                <TableCell>
                                  {['TWA', 'TWA_CMPT'].includes(
                                    row.evaluationType,
                                  ) && (
                                    <Tooltip
                                      title={
                                        covered.has(row.exposureId)
                                          ? 'TWA contemplado pela coleta combinada selecionada.'
                                          : 'Selecionar coleta TWA individual'
                                      }
                                    >
                                      <span>
                                        <Checkbox
                                          checked={
                                            !covered.has(row.exposureId) &&
                                            selected.individualExposureIds.includes(
                                              row.exposureId,
                                            )
                                          }
                                          disabled={
                                            selectionBusy ||
                                            covered.has(row.exposureId)
                                          }
                                          onChange={(_, checked) => {
                                            setSelectionDirty(true);
                                            setSelected((old) => ({
                                              ...old,
                                              individualExposureIds: checked
                                                ? [
                                                    ...new Set([
                                                      ...old.individualExposureIds,
                                                      row.exposureId,
                                                    ]),
                                                  ]
                                                : old.individualExposureIds.filter(
                                                    (id) =>
                                                      id !== row.exposureId,
                                                  ),
                                            }));
                                          }}
                                          inputProps={{
                                            'aria-label': `Selecionar TWA individual — ${row.agent} — ${row.group}`,
                                          }}
                                        />
                                      </span>
                                    </Tooltip>
                                  )}
                                  {[
                                    'STEL',
                                    'CEILING',
                                    'ACGIH_CEILING',
                                    'NR15_TETO',
                                    'VMP',
                                  ].includes(row.evaluationType) && (
                                    <Checkbox
                                      checked={decisions.some(
                                        (d) =>
                                          d.exposureId === row.exposureId &&
                                          d.evaluationType ===
                                            row.evaluationType &&
                                          d.planned,
                                      )}
                                      disabled={busy}
                                      onChange={(_, checked) => {
                                        if (checked)
                                          update(row, { planned: true });
                                        else
                                          setDecisions((old) =>
                                            old.filter(
                                              (d) =>
                                                !(
                                                  d.exposureId ===
                                                    row.exposureId &&
                                                  d.evaluationType ===
                                                    row.evaluationType
                                                ),
                                            ),
                                          );
                                        setPeakOpen(true);
                                      }}
                                      inputProps={{
                                        'aria-label': `Programar ${row.evaluationType} — ${row.agent} — ${row.group}`,
                                      }}
                                    />
                                  )}
                                  {number(row.resultCount)}
                                  {['TWA', 'TWA_CMPT'].includes(
                                    row.evaluationType,
                                  ) &&
                                    covered.has(row.exposureId) && (
                                      <Typography variant="body2">
                                        Contemplado na coleta combinada
                                      </Typography>
                                    )}
                                  {row.suggestedMinimum != null && (
                                    <Typography variant="body2">
                                      Mínimo de referência:{' '}
                                      {row.suggestedMinimum} por
                                      condição/atividade crítica; confirmar
                                      distribuição.
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {number(row.calculation.flowLMin)}
                                </TableCell>
                                <TableCell>
                                  {row.coveragePercent != null && (
                                    <Typography variant="body2">
                                      {row.coveragePercent}% da jornada
                                    </Typography>
                                  )}
                                  {number(row.plannedMinutes, ' min')}
                                  {row.evaluationType === 'STEL' && (
                                    <Typography variant="body2">
                                      Referência padrão de 15 min; confirmar
                                      duração real.
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {number(row.calculation.volumeLitres)}
                                  <Typography variant="body2">
                                    Alvo:{' '}
                                    {number(
                                      row.calculation.targetVolumeLitres,
                                      ' L',
                                    )}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {number(row.calculation.samplersPerResult)}{' '}
                                  por resultado
                                  <br />
                                  {number(row.totalSamplers)} no conjunto
                                </TableCell>
                                <TableCell>
                                  {number(
                                    row.calculation.minutesPerSampler,
                                    ' min/tubo',
                                  )}
                                  <Typography variant="body2">
                                    {row.calculation.changesAtMinutes.length
                                      ? `Trocar aos ${row.calculation.changesAtMinutes.map((v) => number(v)).join('; ')} minutos desde o início.`
                                      : row.calculation.samplersPerResult === 1
                                        ? 'Sem troca durante o resultado.'
                                        : 'Trocas pendentes.'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {row.laboratory}
                                  <br />
                                  {row.method}
                                </TableCell>
                                <TableCell>
                                  {row.sampler || 'Não informado'}
                                  <Typography variant="body2">
                                    {row.samplerType || 'Tipo não informado'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {row.analyticalMethod ||
                                    'Técnica não informada'}
                                  <br />
                                  Extração:{' '}
                                  {row.extractionSolvent ||
                                    'Não informado / confirmar aplicabilidade'}
                                </TableCell>
                                <TableCell>
                                  {number(
                                    row.stabilityDays,
                                    ' dias após coleta',
                                  )}
                                  <br />
                                  {row.storageTemperature == null
                                    ? 'Temperatura não informada'
                                    : `${number(row.storageTemperature)} ${row.storageTemperatureUnit || '(unidade pendente)'}`}
                                </TableCell>
                                <TableCell
                                  sx={{ minWidth: '320px !important' }}
                                >
                                  <Typography variant="body2">
                                    {row.calculation.note}
                                  </Typography>
                                  {row.shortAssessment && (
                                    <Typography variant="body2">
                                      {row.shortAssessment}
                                    </Typography>
                                  )}
                                  {row.notes.length > 0 && (
                                    <Box component="details" sx={{ mt: 4 }}>
                                      <Typography
                                        component="summary"
                                        variant="body2"
                                        sx={{ cursor: 'pointer' }}
                                      >
                                        Condições e observações (
                                        {row.notes.length})
                                      </Typography>
                                      {row.notes.map((note, i) => (
                                        <Typography
                                          variant="body2"
                                          key={i}
                                          sx={{ mt: 4 }}
                                        >
                                          • {note}
                                        </Typography>
                                      ))}
                                    </Box>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
      <Box>
        <Typography variant="body2">
          Agrupamento conforme o GSE/origem registrado no snapshot da campanha.
          Tempos iguais por tubo; vazão e volume exibidos com até quatro casas
          decimais, cálculo feito sem arredondamento intermediário. Ajustes
          práticos de bomba exigem recalcular os volumes.
        </Typography>
      </Box>
    </Stack>
  );
}
