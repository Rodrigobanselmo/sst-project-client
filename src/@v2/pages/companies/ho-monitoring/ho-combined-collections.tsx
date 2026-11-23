import { HoVolumeCalculation } from './ho-volume-calculation';
import { shortLaboratory } from './ho-method-adaptation';
import {
  SamplingActivities,
  ExposureActivities,
} from './ho-sampling-activities';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Box,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { CollectionSummaryRow } from './ho-collection-summary';
const expansionArrowSx = {
  '& .MuiAccordionSummary-expandIconWrapper': { transform: 'rotate(0deg)' },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
};

export type CombinedCollection = {
  id: string;
  group: string;
  agent: string;
  exposureIds: string[];
  agents: { name: string; cas: string | null; factorId: string }[];
  laboratory: string;
  method: string;
  sampler: string | null;
  analyticalMethod: string | null;
  extractionSolvent: string | null;
  plannedMinutes: number;
  resultCount: number;
  calculation: CollectionSummaryRow['calculation'];
  stabilityDays: number;
  storageTemperature: number;
  storageTemperatureUnit: string;
  separateSamplers: number;
  combinedSamplers: number;
  potentialReduction: number;
  excludedAgents: { name: string; reason: string }[];
};
const display = (n: number | null) =>
  n == null
    ? 'Pendente'
    : n.toLocaleString('pt-BR', { maximumFractionDigits: 6 });
export function HoCombinedCollections({
  suggestions,
  rows,
  selectedIds,
  onToggle,
  activities,
  busy,
}: {
  suggestions: CombinedCollection[];
  rows: CollectionSummaryRow[];
  selectedIds: string[];
  onToggle: (suggestion: CombinedCollection, checked: boolean) => void;
  activities: ExposureActivities[];
  busy: boolean;
}) {
  return (
    <>
      {suggestions.map((s) => (
        <Accordion
          defaultExpanded
          disableGutters
          key={s.id}
          variant="outlined"
          sx={{
            ml: { xs: 0, md: 8 },
            bgcolor: 'action.hover',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ChevronRightIcon />}
            sx={{ ...expansionArrowSx, flexDirection: 'row-reverse', gap: 4 }}
          >
            <Stack spacing={4}>
              <Typography
                component="h4"
                sx={{ fontSize: '14px', fontWeight: 700 }}
              >
                Coleta combinada sugerida · {s.agent}
              </Typography>
              <Stack
                direction="row"
                spacing={4}
                sx={{ flexWrap: 'wrap', gap: 2 }}
              >
                <Chip size="small" label="TWA · confirmar com laboratório" />
                <Chip
                  size="small"
                  label={`${s.agents.length} agentes · ${s.combinedSamplers} amostradores em conjunto`}
                />
              </Stack>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={6}>
              <Typography variant="body2">
                {s.agents
                  .map((a) => `${a.name} — CAS ${a.cas || 'não informado'}`)
                  .join(' · ')}
              </Typography>
              <Typography variant="body2">
                Mesmo GSE, laboratório, método, amostrador, técnica e solvente;
                faixas comuns de vazão e volume compatíveis com o tempo
                planejado. Cada agente continua com seu próprio resultado
                analítico e julgamento do limite.
              </Typography>
              <SamplingActivities
                activities={activities
                  .filter((a) => s.exposureIds.includes(a.exposureId))
                  .flatMap((a) => a.activities)}
              />
              <TableContainer>
                <Table
                  size="small"
                  aria-label={`Sugestão de coleta combinada — ${s.group}`}
                  sx={{ minWidth: 1300, '& td, & th, & .MuiTypography-root': {lineHeight:1.15,verticalAlign:'top'} }}
                >
                  <TableHead>
                    <TableRow>
                      {[
                        'Tipo / limite',
                        'Resultados TWA por agente',
                        'Vazão comum (L/min)',
                        'Tempo coberto / por amostrador',
                        'Volume por amostrador (L)',
                        'Amostradores / trocas',
                        'Laboratório / método',
                        'Amostrador / técnica / extração',
                        'Estabilidade / armazenamento',
                      ].map((label) => (
                        <TableCell key={label}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Chip size="small" label="TWA / CMPT" />
                        <Tooltip title={<Box sx={{color:'#fff','& p':{color:'inherit',lineHeight:1.15,fontSize:'inherit'}}}>{s.exposureIds.map(id=><Box key={id} sx={{mb:2}}>{rows.filter(r=>r.exposureId===id && ['TWA','CMPT','TWA_CMPT'].includes(r.evaluationType)).map(r=><Box key={r.evaluationType}><Typography component="p" fontWeight={700}>{r.agent} · {r.evaluationType === 'TWA_CMPT' ? 'TWA / CMPT' : r.evaluationType}</Typography>{r.limits.map(limit=><Typography component="p" key={limit}>{limit}</Typography>)}</Box>)}</Box>)}</Box>}>
                          <Typography component="div" variant="body2" sx={{cursor:'help',textDecoration:'underline dotted'}}>Vários itens</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(s.id)}
                          disabled={busy}
                          onChange={(_, checked) => onToggle(s, checked)}
                          inputProps={{
                            'aria-label': `Selecionar TWA combinado — ${s.agent} — ${s.group}`,
                          }}
                        />
                        {s.resultCount} por agente
                      </TableCell>
                      <TableCell>{display(s.calculation.flowLMin)}</TableCell>
                      <TableCell>
                        {display(s.plannedMinutes)} min no total
                        <br />
                        {display(s.calculation.minutesPerSampler)} min por
                        amostrador
                      </TableCell>
                      <TableCell>
                        <HoVolumeCalculation flow={s.calculation.flowLMin} minutes={s.calculation.minutesPerSampler} totalMinutes={s.plannedMinutes} samplers={s.calculation.samplersPerResult} volume={s.calculation.volumeLitres} />
                      </TableCell>
                      <TableCell>
                        {s.calculation.samplersPerResult} por resultado ·{' '}
                        {s.combinedSamplers} no conjunto
                        <br />
                        {s.calculation.changesAtMinutes.length
                          ? `Trocar aos ${s.calculation.changesAtMinutes.map(display).join('; ')} min.`
                          : 'Sem troca durante cada resultado.'}
                      </TableCell>
                      <TableCell>
                        {shortLaboratory(s.laboratory)} ({s.method})
                      </TableCell>
                      <TableCell>
                        {s.sampler}
                        <br />
                        {s.analyticalMethod}
                        <br />
                        Extração: {s.extractionSolvent}
                      </TableCell>
                      <TableCell>
                        Até {s.stabilityDays} dias (menor prazo entre os
                        agentes)
                        <br />
                        {s.storageTemperature} {s.storageTemperatureUnit}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body2">
                Separadamente: {s.separateSamplers} amostradores. Sugestão
                conjunta: {s.combinedSamplers}.
                {s.potentialReduction > 0
                  ? ` Redução potencial de ${s.potentialReduction} amostradores.`
                  : ' Sem redução de amostradores neste planejamento.'}{' '}
                Não somar a sugestão às linhas individuais.
              </Typography>
              {s.excludedAgents?.length > 0 && (
                <Stack spacing={3}>
                  <Typography variant="body2" fontWeight={600}>
                    Agentes semelhantes que ficaram fora desta sugestão
                  </Typography>
                  {s.excludedAgents.map((a) => (
                    <Typography variant="body2" key={a.name}>
                      {a.name}: {a.reason}
                    </Typography>
                  ))}
                </Stack>
              )}
              <Alert severity="info">
                {selectedIds.includes(s.id)
                  ? 'Selecionada para o planejamento conjunto; confirmação analítica ainda pendente.'
                  : 'Candidata à coleta conjunta, ainda não selecionada.'}{' '}
                Confirmar com o laboratório análise multianalito, capacidade do
                meio, recuperação, interferências, limites de quantificação e
                condições adicionais de armazenamento. STEL, teto e VMP
                permanecem separados.
              </Alert>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
