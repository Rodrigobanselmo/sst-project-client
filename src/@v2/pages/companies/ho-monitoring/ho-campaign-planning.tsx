import { useEffect, useState } from 'react';
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

type LaboratorySelection = { exposureId: string; laboratoryId: string };
type Choice = { exposureId: string; optionId: string };
export type HoPlanning = {
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
  );
  const [selections, setSelections] = useState<LaboratorySelection[]>([]);
  const labs = [...new Set(selections.map((s) => s.laboratoryId))];
  const [choices, setChoices] = useState<Choice[]>([]);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const data = query.data;
  useEffect(() => {
    if (data) {
      setSelections(savedSelections(data));
      setChoices(data.planning?.choices || []);
      setStep(data.planning ? 2 : 1);
    }
  }, [data?.revision, campaignId]);
  const save = async (part: string, body: object) => {
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
  }
  if (query.isLoading)
    return <Typography>Carregando planejamento...</Typography>;
  if (query.isError || !data)
    return (
      <Alert severity="error">
        Não foi possível carregar o planejamento.{' '}
        <Button onClick={() => query.refetch()}>Tentar novamente</Button>
      </Alert>
    );
  const savedCells = savedSelections(data);
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
      <Stack direction="row" spacing={4}>
        <Button
          variant={step === 1 ? 'contained' : 'outlined'}
          onClick={() => setStep(1)}
        >
          3.1 Laboratórios
        </Button>
        <Button
          variant={step === 2 ? 'contained' : 'outlined'}
          disabled={!data.planning}
          onClick={() => setStep(2)}
        >
          3.2 Métodos
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {step === 1 ? (
        <>
          <Typography variant="h6">
            3.1 Definir laboratórios parceiros
          </Typography>
          <Typography>
            Selecione um ou mais laboratórios. A cobertura considera os métodos
            cadastrados para cada exposição; encaminhamentos a outros
            laboratórios precisam estar cadastrados.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Marque as células dos laboratórios que deseja usar para cada
            exposição. O cabeçalho seleciona a coluna inteira e indica seleções
            parciais. Passe o mouse ou use Tab sobre a célula para consultar
            métodos e amostradores. — indica ausência de atendimento cadastrado.
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: 640 }}
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
                    <TableCell key={l.id} align="center" sx={{ minWidth: 210 }}>
                      <FormControlLabel
                        sx={{ m: 0 }}
                        control={
                          <Checkbox
                            disabled={busy || !l.coverage}
                            checked={
                              selections.filter((s) => s.laboratoryId === l.id)
                                .length === l.coverage && l.coverage > 0
                            }
                            indeterminate={
                              selections.some((s) => s.laboratoryId === l.id) &&
                              selections.filter((s) => s.laboratoryId === l.id)
                                .length < l.coverage
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
                          backgroundColor: selectedCell(e.exposureId, l.id)
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
              selecionados. Você pode salvar esta escolha, mas deverá resolver a
              cobertura antes de concluir 3.2.
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
              disabled={busy || !labs.length}
              onClick={() =>
                save('laboratories', {
                  laboratoryIds: labs,
                  laboratorySelections: selections,
                })
              }
            >
              Salvar laboratórios e avançar para 3.2
            </Button>
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
              Próxima etapa: definir os parâmetros de coleta (3.3).
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
                              <TableCell>{value(o.analyticalMethod)}</TableCell>
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
                                  <summary>Ver condições e observações</summary>
                                  {o.hasLaboratoryOverrides && (
                                    <Typography variant="body2">
                                      Faixas, amostrador ou solvente específicos
                                      do laboratório têm preferência sobre os
                                      dados gerais.
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
                                        Sem observações adicionais cadastradas.
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
              disabled={busy}
              onClick={() => save('methods', { choices, confirm: false })}
            >
              Salvar escolhas
            </Button>
            <Button
              variant="contained"
              disabled={busy || !complete}
              onClick={() => save('methods', { choices, confirm: true })}
            >
              Concluir 3.2 — confirmar métodos
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}

function CoverageCell({
  agent,
  laboratory,
  options,
  selected,
  disabled,
  onChange,
}: {
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
          <Checkbox
            disabled={disabled}
            checked={selected}
            onChange={(_, checked) => onChange(checked)}
            inputProps={{ 'aria-label': `${agent} — ${laboratory}` }}
            color="success"
          />
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
