import { esocialEnvironment } from './environment-model';
import { useEffect, useId, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useSstAccess } from './access';
import { LegalDeadlineSummary } from './LegalDeadlineSummary';
import { diagnosticMessage, messageOf, sstGet, sstPost } from './api';
import {
  canCancelRun,
  canConfirmRun,
  canRetryRun,
  declarationOperationLabel,
  declarationDeliveryLabel,
  declarationStatusLabel,
  deliveryErrorMessage,
  deliveryStateLabel,
  hasAcceptedDeclaration,
  isNoChange,
  type DeclarationOverview,
  type DeclarationRun,
  type PreparationMode,
  type PreparationSelection,
  type SendingEnvironment,
} from './delivery-model';

const route = '/esocial-initial/2240';
const dateLabel = (date?: string | null) =>
  date ? date.slice(0, 10).split('-').reverse().join('/') : '—';

export function DeclarationPanel({
  companyId,
  requestedRunId,
  requestSequence,
  initialEnvironment = 2,
}: {
  companyId: string;
  requestedRunId?: string;
  requestSequence?: number;
  initialEnvironment?: SendingEnvironment;
}) {
  const access = useSstAccess();
  const client = useQueryClient();
  const controlId = useId();
  const selectProps = (name: string) => ({
    id: `sst-declaration-${controlId}-${name}`,
    SelectProps: {
      SelectDisplayProps: {
        'aria-labelledby': `sst-declaration-${controlId}-${name}-label`,
      },
    },
  });
  const [selectedEnvironment, setEnvironment] =
    useState<SendingEnvironment>(initialEnvironment);
  const environment = esocialEnvironment(
    access.canChooseEnvironment,
    selectedEnvironment,
  );
  const [registration, setRegistration] = useState('');
  const [selection, setSelection] = useState<PreparationSelection>('CURRENT');
  const [selectedEmployees, setSelectedEmployees] = useState<
    { id: number; name: string }[]
  >([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(employeeSearch), 300);
    return () => clearTimeout(timer);
  }, [employeeSearch]);
  const [selectedId, setSelectedId] = useState('');
  const [prepared, setPrepared] = useState<DeclarationRun>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [xml, setXml] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const focusedRequest = useRef('');
  useEffect(() => {
    if (!requestedRunId) return;
    setSelectedId(requestedRunId);
    setError('');
    void client.invalidateQueries([
      'sst-declaration',
      companyId,
      requestedRunId,
    ]);
    panelRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [companyId, requestedRunId, requestSequence, client]);
  const attempt = useRef<{ key: string; operationId: string } | null>(null);
  const overview = useQuery<DeclarationOverview>(
    ['sst-declarations', companyId, debouncedSearch],
    () =>
      sstGet(
        companyId,
        `${route}${debouncedSearch ? `?employeeSearch=${encodeURIComponent(debouncedSearch)}` : ''}`,
      ),
    {
      enabled: access.canReadDeclaration,
      retry: false,
      refetchInterval: 5000,
      keepPreviousData: true,
    },
  );
  const detail = useQuery<DeclarationRun>(
    ['sst-declaration', companyId, selectedId],
    () => sstGet(companyId, `${route}/${selectedId}`),
    {
      enabled: access.canReadDeclaration && !!selectedId,
      retry: false,
      refetchInterval: 5000,
    },
  );
  const run =
    detail.data || (prepared?.id === selectedId ? prepared : undefined);
  useEffect(() => {
    const requestKey = `${requestedRunId || ''}:${requestSequence || 0}`;
    if (
      !run ||
      run.id !== requestedRunId ||
      focusedRequest.current === requestKey
    )
      return;
    focusedRequest.current = requestKey;
    setEnvironment(run.environment);
    detailRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    detailRef.current?.focus({ preventScroll: true });
  }, [requestedRunId, requestSequence, run?.id, run?.environment]);
  const options = overview.data?.employerRegistrationOptions || [];
  const employerRegistration =
    registration || overview.data?.employerRegistration || '';
  const enabled = !!(environment === 2
    ? overview.data?.environments.restricted
    : overview.data?.environments.production);
  const selectionInvalid =
    selectedEmployees.length > 100 ||
    ((overview.data?.totalEmployeeCount || 0) > 100 &&
      !selectedEmployees.length);
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries(['sst-declarations', companyId]),
      client.invalidateQueries(['sst-declaration', companyId, selectedId]),
      client.invalidateQueries(['sst-pending', companyId]),
    ]);
  };
  const prepare = async (mode: PreparationMode) => {
    setBusy(true);
    setError('');
    const input = {
      mode,
      environment,
      employerRegistration,
      selection,
      ...(selectedEmployees.length && {
        employeeIds: selectedEmployees
          .map((employee) => employee.id)
          .sort((a, b) => a - b),
      }),
    };
    const key = JSON.stringify(input);
    // A network failure may hide a committed preparation. Retry that request
    // with the same operation ID, rather than manufacturing another run.
    if (attempt.current?.key !== key)
      attempt.current = { key, operationId: crypto.randomUUID() };
    try {
      const result: DeclarationRun = await sstPost(
        companyId,
        `${route}/prepare`,
        {
          ...input,
          operationId: attempt.current.operationId,
        },
      );
      setPrepared(result);
      setSelectedId(result.id);
      attempt.current = null;
      await client.invalidateQueries(['sst-declarations', companyId]);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  const act = async (action: 'confirm' | 'cancel' | 'retry-blocked') => {
    if (!run) return;
    setBusy(true);
    setError('');
    try {
      await sstPost(
        companyId,
        `${route}/${run.id}/${action}`,
        action === 'confirm' ? { expectedSourceHash: run.sourceHash } : {},
      );
      await refresh();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  if (!access.canReadDeclaration)
    return (
      <Alert severity="info">
        Sem permissão para consultar as declarações do eSocial.
      </Alert>
    );
  return (
    <Stack
      ref={panelRef}
      spacing={8}
      useFlexGap
      sx={{ scrollMarginTop: '96px' }}
    >
      <Typography variant="h6">Envios S-2240</Typography>
      <Typography>
        Prepare as condições cadastradas, confira os impedimentos e confirme o
        envio. Depois de um envio aceito, confira as alterações para gerar novas
        condições ou retificações já definidas nos cadastros de origem.
      </Typography>
      {overview.isLoading && (
        <CircularProgress size={24} aria-label="Carregando declarações" />
      )}
      {overview.isError && (
        <Alert severity="error">
          Não foi possível consultar as declarações.{' '}
          <Button onClick={() => overview.refetch()}>Tentar novamente</Button>
        </Alert>
      )}
      {overview.data && (
        <>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={8} useFlexGap>
            {access.canChooseEnvironment && (
              <TextField
                {...selectProps('environment')}
                select
                label="Ambiente do eSocial"
                value={environment}
                disabled={busy}
                onChange={(e) => {
                  setEnvironment(Number(e.target.value) as SendingEnvironment);
                  setError('');
                }}
                sx={{
                  minWidth: { xs: 0, md: 250 },
                  width: { xs: '100%', md: 'auto' },
                }}
              >
                <MenuItem value={2}>Produção restrita — testes</MenuItem>
                <MenuItem value={1}>Produção — envio oficial</MenuItem>
              </TextField>
            )}
            <TextField
              {...selectProps('registration')}
              select
              label="Inscrição já cadastrada no S-1000"
              value={employerRegistration}
              disabled={busy}
              helperText="Selecione a mesma inscrição usada no eSocial: CNPJ completo ou raiz."
              sx={{
                minWidth: { xs: 0, md: 310 },
                width: { xs: '100%', md: 'auto' },
              }}
              onChange={(e) => setRegistration(e.target.value)}
            >
              {[
                ...new Set([employerRegistration, ...options].filter(Boolean)),
              ].map((option) => (
                <MenuItem value={option} key={option}>
                  {option}
                  {option.length === 8 ? ' — raiz do CNPJ' : ' — CNPJ completo'}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Alert severity={environment === 1 ? 'warning' : 'info'}>
            {environment === 1
              ? 'Produção: a confirmação transmite uma declaração oficial. Confira o ambiente e os dados antes de confirmar.'
              : 'Produção restrita: ambiente de testes do eSocial.'}
            {!enabled &&
              ' A transmissão está desabilitada neste ambiente do sistema. Você pode preparar e conferir os dados.'}
          </Alert>
          {(overview.data.totalEmployeeCount > 0 ||
            selectedEmployees.length > 0) && (
            <Autocomplete
              multiple
              options={[
                ...new Map(
                  [...selectedEmployees, ...overview.data.employees].map(
                    (employee) => [employee.id, employee],
                  ),
                ).values(),
              ]}
              value={selectedEmployees}
              getOptionLabel={(employee) => employee.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, selected) => setSelectedEmployees(selected)}
              onInputChange={(_, input) => setEmployeeSearch(input)}
              filterOptions={(options) => options}
              loading={overview.isFetching}
              loadingText="Buscando empregados..."
              noOptionsText="Nenhum empregado encontrado"
              disabled={busy}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Empregados para esta preparação"
                  helperText="Selecione até 100 empregados. Em branco, considera todos os empregados da empresa (até 100)."
                />
              )}
            />
          )}
          {overview.data.listTruncated && (
            <Alert severity="info">
              A lista apresenta até 200 resultados. Digite o nome ou a matrícula
              para buscar outros empregados e selecione um grupo de até 100.
            </Alert>
          )}
          {selectionInvalid && (
            <Alert severity="warning">
              Selecione um grupo de até 100 empregados para preparar os eventos.
            </Alert>
          )}
          {access.canSendDeclaration && (
            <TextField
              {...selectProps('selection')}
              select
              label="Períodos para preparar"
              value={selection}
              disabled={busy}
              onChange={(e) =>
                setSelection(e.target.value as PreparationSelection)
              }
              helperText={
                selection === 'HISTORY'
                  ? 'Inclui também os períodos anteriores ao primeiro aceite, desde a data inicial configurada. Confira o histórico antes de transmitir.'
                  : 'Primeiro envio: condição vigente. Vínculos já enviados: todas as mudanças desde o primeiro aceite, mesmo anteriores à data inicial atual.'
              }
            >
              <MenuItem value="CURRENT" sx={{ whiteSpace: 'normal' }}>
                Condição vigente e mudanças após o primeiro aceite
              </MenuItem>
              <MenuItem value="HISTORY" sx={{ whiteSpace: 'normal' }}>
                Incluir histórico anterior ao primeiro aceite
              </MenuItem>
            </TextField>
          )}
          {access.canSendDeclaration && (
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={4}
              useFlexGap
            >
              <Button
                variant="outlined"
                disabled={busy || !employerRegistration || selectionInvalid}
                onClick={() => prepare('INITIAL')}
              >
                Preparar primeiro envio
              </Button>
              <Button
                variant="outlined"
                disabled={busy || !employerRegistration || selectionInvalid}
                onClick={() => prepare('CHANGES')}
              >
                Conferir alterações desde os envios aceitos
              </Button>
            </Stack>
          )}
          {!hasAcceptedDeclaration(overview.data.runs) && (
            <Typography variant="body2">
              Por padrão, o primeiro envio considera a condição vigente de cada
              vínculo e a data inicial configurada. O histórico importado só é
              incluído quando você escolhe essa opção explicitamente.
            </Typography>
          )}
          {(overview.data.runs.length > 0 || !!selectedId) && (
            <TextField
              {...selectProps('run')}
              select
              label="Preparações e envios desta empresa"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const selected = overview.data.runs.find(
                  (item) => item.id === e.target.value,
                );
                if (selected) setEnvironment(selected.environment);
                setError('');
              }}
              disabled={busy}
            >
              <MenuItem value="">Selecione para consultar</MenuItem>
              {selectedId &&
                !overview.data.runs.some((item) => item.id === selectedId) && (
                  <MenuItem value={selectedId}>
                    Declaração da execução ·{' '}
                    {run
                      ? `${dateLabel(run.createdAt)} · ${run.environment === 2 ? 'Testes' : 'Produção'} · ${run.events.length} evento(s)`
                      : 'Consultando resultado…'}
                  </MenuItem>
                )}
              {overview.data.runs.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {dateLabel(item.createdAt)} ·{' '}
                  {item.environment === 2 ? 'Testes' : 'Produção'} ·{' '}
                  {item.events.length} evento(s) · {item.id.slice(0, 8)}
                </MenuItem>
              ))}
            </TextField>
          )}
        </>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {detail.isError && (
        <Alert severity="error">
          Não foi possível atualizar o resultado.{' '}
          <Button onClick={() => detail.refetch()}>Consultar novamente</Button>
        </Alert>
      )}
      {run && (
        <Box
          ref={detailRef}
          role="region"
          aria-label="Declaração S-2240 em consulta"
          tabIndex={-1}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 8,
            scrollMarginTop: '96px',
          }}
        >
          <Stack spacing={8} useFlexGap>
            <Typography variant="subtitle1">
              Declaração preparada ·{' '}
              {run.environment === 2 ? 'Produção restrita' : 'Produção'}
            </Typography>
            {run.fromDate && (
              <Typography variant="body2">
                Data inicial nesta preparação: {dateLabel(run.fromDate)}.
                {run.policyRevision !== undefined &&
                  ` Configuração ${run.policyRevision}.`}
              </Typography>
            )}
            {run.policyStale &&
              (!run.events.length ||
                run.events.some((event) => !event.delivery)) && (
                <Alert severity="warning">
                  A data inicial foi alterada depois desta preparação. Prepare
                  novamente antes de confirmar; os XMLs e recibos existentes
                  permanecem preservados.
                </Alert>
              )}
            {isNoChange(run) ? (
              <Alert severity="success">
                Nenhuma diferença declaratória encontrada em relação aos envios
                aceitos. Nenhum novo evento precisa ser transmitido.
              </Alert>
            ) : (
              <Typography>
                {run.events.length} evento(s) · {declarationStatusLabel(run)}
              </Typography>
            )}
            {run.diagnostics?.map((diagnostic, i) => (
              <Alert key={`${diagnostic.code}-${i}`} severity="warning">
                {diagnosticMessage(diagnostic.code)}
                {diagnostic.effectiveFrom &&
                  ` Período desde ${dateLabel(diagnostic.effectiveFrom)}.`}
              </Alert>
            ))}
            {run.events.length > 0 && (
              <Box sx={{ overflowX: 'auto' }}>
                <Table aria-label="Eventos S-2240 preparados">
                  <TableHead>
                    <TableRow>
                      <TableCell>Empregado / vínculo</TableCell>
                      <TableCell>Desde</TableCell>
                      <TableCell>Declaração</TableCell>
                      <TableCell>Situação</TableCell>
                      <TableCell>Recibo eSocial</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {run.events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {event.employeeName ||
                            (event.matricula ||
                            event.content?.ideVinculo?.matricula
                              ? `Matrícula ${event.matricula || event.content?.ideVinculo?.matricula}`
                              : `Vínculo ${event.employmentId.slice(0, 8)}`)}
                        </TableCell>
                        <TableCell>{dateLabel(event.effectiveFrom)}</TableCell>
                        <TableCell>
                          {declarationOperationLabel(event)}
                          {event.rectifiedReceipt && (
                            <Typography variant="caption" display="block">
                              Corrige o recibo {event.rectifiedReceipt}
                            </Typography>
                          )}
                          {event.unsignedXml && (
                            <Button
                              size="small"
                              onClick={() => setXml(event.unsignedXml!)}
                            >
                              Conferir XML
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {event.delivery
                            ? declarationDeliveryLabel(event.delivery)
                            : event.diagnostics?.length
                              ? 'Confira os impedimentos na origem'
                              : 'Aguardando confirmação'}
                          {event.delivery?.errorCode && (
                            <Typography variant="caption" display="block">
                              {deliveryErrorMessage(event.delivery.errorCode)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {event.delivery?.receipt || 'Ainda sem recibo'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
            {run.events.some((event) => event.legalDeadline) && (
              <Stack spacing={8} useFlexGap>
                {run.events
                  .filter((event) => event.legalDeadline)
                  .map((event) => (
                    <Stack key={event.id} spacing={8} useFlexGap>
                      <Typography variant="body2">
                        {event.employeeName || 'Evento S-2240'} · condição desde{' '}
                        {dateLabel(event.effectiveFrom)}
                      </Typography>
                      <LegalDeadlineSummary
                        value={event.legalDeadline}
                        label="Prazo legal do S-2240"
                      />
                    </Stack>
                  ))}
              </Stack>
            )}
            {access.canSendInEnvironment(run.environment) && (
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={4}
                useFlexGap
              >
                {canConfirmRun(
                  run,
                  run.environment === 2
                    ? !!overview.data?.environments.restricted
                    : !!overview.data?.environments.production,
                ) && (
                  <Button
                    variant="contained"
                    disabled={busy}
                    onClick={() => act('confirm')}
                  >
                    {run.environment === 2
                      ? 'Confirmar e enviar para testes'
                      : 'Confirmar e enviar para produção'}
                  </Button>
                )}
                {canRetryRun(
                  run,
                  run.environment === 2
                    ? !!overview.data?.environments.restricted
                    : !!overview.data?.environments.production,
                ) && (
                  <Button disabled={busy} onClick={() => act('retry-blocked')}>
                    Retomar envio impedido antes da transmissão
                  </Button>
                )}
                {canCancelRun(run) && (
                  <Button disabled={busy} onClick={() => act('cancel')}>
                    Cancelar tarefas não transmitidas
                  </Button>
                )}
                <Button disabled={busy} onClick={refresh}>
                  Atualizar resultado
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>
      )}
      <Dialog open={!!xml} onClose={() => setXml('')} fullWidth maxWidth="lg">
        <DialogTitle sx={{ px: 12, pt: 12, pb: 6 }}>
          XML S-2240 preparado
        </DialogTitle>
        <DialogContent sx={{ px: 12, pb: 8 }}>
          <TextField
            label="Conteúdo do evento antes da assinatura"
            value={xml}
            multiline
            fullWidth
            minRows={12}
            maxRows={22}
            InputProps={{ readOnly: true }}
            sx={{ mt: 4 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 12, pb: 12 }}>
          <Button onClick={() => setXml('')}>Voltar à declaração</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
