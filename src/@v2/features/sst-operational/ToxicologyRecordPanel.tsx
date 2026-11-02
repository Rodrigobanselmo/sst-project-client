import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Box,
  Button,
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
import { api } from 'core/services/apiClient';

import { useSstAccess } from './access';
import { SstDateField, useSstDateValidity } from './SstDateField';
import { companyRoot, messageOf } from './api';
import {
  BRAZILIAN_STATES,
  toxicologyDraft,
  toxicologyPayload,
  type ToxicologyDraft,
  type ToxicologyRecord,
} from './toxicology-model';

export function ToxicologyRecordPanel({
  companyId,
  employeeId,
  employeeName,
}: {
  companyId: string;
  employeeId: number;
  employeeName?: string;
}) {
  const access = useSstAccess();
  const client = useQueryClient();
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const path = `${companyRoot(companyId)}/esocial-events/toxicology-records`;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ToxicologyRecord>();
  const [draft, setDraft] = useState<ToxicologyDraft>(() => toxicologyDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [localError, setLocalError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [correctionRequired, setCorrectionRequired] = useState(false);
  const attempt = useRef<{ key: string; operationId: string } | null>(null);
  const statusChanged =
    !!editing && draft.status !== (editing.status || 'ACTIVE');
  const needsReason =
    !!editing?.lastAcceptedDeliveryId ||
    !!editing?.hasAcceptedHistory ||
    correctionRequired ||
    statusChanged;
  const records = useQuery<{ records: ToxicologyRecord[] }>(
    ['sst-toxicology-records', companyId, employeeId],
    async () => (await api.get(`${path}?employeeId=${employeeId}`)).data,
    { enabled: access.canReadToxicology && !!employeeId, retry: false },
  );
  const start = (record?: ToxicologyRecord) => {
    setEditing(record);
    setDraft(toxicologyDraft(record));
    setError('');
    setLocalError('');
    setConflict(false);
    setCorrectionRequired(false);
    setOpen(true);
    attempt.current = null;
  };
  const close = () => {
    if (!busy) setOpen(false);
  };
  const save = async () => {
    setError('');
    setLocalError('');
    let body: ReturnType<typeof toxicologyPayload>;
    try {
      body = toxicologyPayload(draft, employeeId, editing, correctionRequired);
    } catch (failure) {
      setLocalError(messageOf(failure));
      return;
    }
    const key = JSON.stringify({ id: editing?.id || null, body });
    if (attempt.current?.key !== key)
      attempt.current = { key, operationId: crypto.randomUUID() };
    setBusy(true);
    try {
      const payload = { ...body, operationId: attempt.current.operationId };
      if (editing) await api.patch(`${path}/${editing.id}`, payload);
      else await api.post(path, payload);
      await Promise.all([
        client.invalidateQueries([
          'sst-toxicology-records',
          companyId,
          employeeId,
        ]),
        client.invalidateQueries([
          'sst-secondary-declarations',
          companyId,
          'S-2221',
        ]),
        client.invalidateQueries(['sst-secondary-reviews', companyId]),
        client.invalidateQueries(['sst-operational-health', companyId]),
      ]);
      attempt.current = null;
      setOpen(false);
    } catch (failure: any) {
      setError(messageOf(failure));
      const code = failure.response?.data?.code || '';
      if (/REVISION|STALE|SOURCE_CHANGED/.test(code)) setConflict(true);
      if (code === 'SECONDARY_CORRECTION_REQUIRED' && editing) {
        setCorrectionRequired(true);
        setEditing({
          ...editing,
          lastReceipt: failure.response?.data?.lastReceipt,
        });
        if (
          typeof failure.response?.data?.currentRevision === 'number' &&
          failure.response.data.currentRevision !== editing.revision
        )
          setConflict(true);
      }
    } finally {
      setBusy(false);
    }
  };
  const loadCurrent = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      const latest = await records.refetch();
      const current = latest.data?.records.find(
        (item) => item.id === editing.id,
      );
      if (latest.isError || !current) {
        setError(
          'Não foi possível carregar este exame. O rascunho foi mantido.',
        );
        return;
      }
      setEditing(current);
      setDraft(toxicologyDraft(current));
      setConflict(false);
      setCorrectionRequired(false);
      setError('');
      setLocalError('');
      attempt.current = null;
    } finally {
      setBusy(false);
    }
  };
  const field = (
    name: keyof ToxicologyDraft,
    label: string,
    extra: Record<string, unknown> = {},
  ) => (
    <TextField
      fullWidth
      label={label}
      value={draft[name]}
      disabled={busy}
      onChange={(e) => {
        setDraft((current) => ({ ...current, [name]: e.target.value }));
        setLocalError('');
      }}
      {...extra}
    />
  );
  if (!access.canReadToxicology) return null;
  return (
    <Box
      sx={{
        mt: '24px',
        p: '16px',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack spacing={8} useFlexGap>
        <Typography variant="h6">Exames toxicológicos</Typography>
        <Typography variant="body2">
          Registre o exame do empregado nesta origem. Salvar não transmite ao
          eSocial; o evento S-2221 é preparado no acompanhamento.
        </Typography>
        {records.isError && (
          <Alert severity="error">
            Não foi possível consultar os exames.{' '}
            <Button onClick={() => records.refetch()}>Tentar novamente</Button>
          </Alert>
        )}
        {access.canCreateToxicology && (
          <Button variant="outlined" onClick={() => start()}>
            Cadastrar exame toxicológico
          </Button>
        )}
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label="Exames toxicológicos do empregado">
            <TableHead>
              <TableRow>
                <TableCell>Data do exame</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Laboratório</TableCell>
                <TableCell>Situação</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(records.data?.records || []).map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.examDate
                      .slice(0, 10)
                      .split('-')
                      .reverse()
                      .join('/')}
                  </TableCell>
                  <TableCell>{record.examCode}</TableCell>
                  <TableCell>{record.laboratoryCnpj}</TableCell>
                  <TableCell>
                    {record.status === 'INACTIVE' ? 'Inativo' : 'Ativo'}
                  </TableCell>
                  <TableCell>
                    {access.canUpdateToxicology && (
                      <Button onClick={() => start(record)}>
                        Corrigir exame
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {records.data && !records.data.records.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    Nenhum exame toxicológico cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Stack>
      <Dialog
        open={open}
        onClose={close}
        fullWidth
        maxWidth="sm"
        aria-labelledby="toxicology-record-title"
        PaperProps={{ sx: { maxHeight: 'calc(100% - 32px)' } }}
      >
        <DialogTitle
          id="toxicology-record-title"
          sx={{ p: '24px', pb: '16px' }}
        >
          {editing
            ? 'Corrigir exame toxicológico'
            : 'Cadastrar exame toxicológico'}
        </DialogTitle>
        <DialogContent sx={{ px: '24px', py: '8px' }}>
          <Stack spacing={8} useFlexGap>
            {employeeName && <Typography>{employeeName}</Typography>}
            <Alert severity="info">
              Outro exame, realizado em uma nova data, deve ser cadastrado como
              um novo registro. A correção mantém a identificação deste exame.
            </Alert>
            {(editing?.lastAcceptedDeliveryId ||
              editing?.hasAcceptedHistory ||
              correctionRequired) && (
              <Alert severity="warning">
                Este exame já foi declarado
                {editing?.lastReceipt
                  ? ` com recibo ${editing?.lastReceipt}`
                  : ''}
                . Explique a correção; o conteúdo já enviado será preservado.
              </Alert>
            )}
            {editing && (
              <Box>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={8}
                  useFlexGap
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Typography>
                    Situação do exame:{' '}
                    <strong>
                      {draft.status === 'INACTIVE' ? 'Inativo' : 'Ativo'}
                    </strong>
                  </Typography>
                  <Button
                    variant="outlined"
                    disabled={busy || conflict}
                    onClick={() => {
                      setDraft((current) => ({
                        ...current,
                        status:
                          current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                      }));
                      setLocalError('');
                    }}
                  >
                    {draft.status === 'ACTIVE'
                      ? 'Inativar exame'
                      : 'Reativar exame'}
                  </Button>
                </Stack>
                {statusChanged && (
                  <Alert severity="warning" sx={{ mt: '16px' }}>
                    {draft.status === 'INACTIVE'
                      ? 'Ao salvar, este exame ficará inativo sem apagar seus dados. Se houver um aceite, a exclusão deverá ser preparada e confirmada no painel do eSocial.'
                      : 'Ao salvar, este exame voltará a ficar ativo. Uma exclusão já aceita continuará preservada; um novo envio exige preparação e confirmação no painel.'}{' '}
                    Informe o motivo abaixo. Esta ação não transmite ao eSocial.
                  </Alert>
                )}
              </Box>
            )}
            <SstDateField
              label="Data de realização do exame"
              value={draft.examDate}
              disabled={busy}
              onValidityChange={dateFieldValidity('examDate')}
              onChange={(value) => {
                setDraft((current) => ({ ...current, examDate: value }));
                setLocalError('');
              }}
            />
            {field('laboratoryCnpj', 'CNPJ do laboratório', {
              inputProps: { inputMode: 'numeric', maxLength: 18 },
            })}
            {field('examCode', 'Código do exame', {
              helperText: 'Duas letras e nove números, conforme o laboratório.',
              inputProps: { maxLength: 11 },
            })}
            {field('doctorName', 'Nome do médico responsável')}
            <TextField
              select
              fullWidth
              label="Empregado reside no exterior?"
              value={draft.workerLivesAbroad}
              disabled={busy}
              onChange={(e) => {
                setDraft((current) => ({
                  ...current,
                  workerLivesAbroad: e.target
                    .value as ToxicologyDraft['workerLivesAbroad'],
                }));
                setLocalError('');
              }}
            >
              <MenuItem value="YES">Sim</MenuItem>
              <MenuItem value="NO">Não</MenuItem>
            </TextField>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={8}
              useFlexGap
            >
              {field('doctorCrm', 'CRM do médico', {
                inputProps: { maxLength: 10 },
                helperText:
                  draft.workerLivesAbroad === 'YES'
                    ? 'Opcional para empregado residente no exterior.'
                    : undefined,
              })}
              <TextField
                fullWidth
                select
                label="UF do CRM"
                helperText={
                  draft.workerLivesAbroad === 'YES'
                    ? 'Se informada, selecione uma UF válida.'
                    : undefined
                }
                value={draft.doctorUf}
                disabled={busy}
                onChange={(e) => {
                  setDraft((current) => ({
                    ...current,
                    doctorUf: e.target.value,
                  }));
                  setLocalError('');
                }}
              >
                {draft.workerLivesAbroad === 'YES' && (
                  <MenuItem value="">Não informado</MenuItem>
                )}
                {BRAZILIAN_STATES.map((uf) => (
                  <MenuItem value={uf} key={uf}>
                    {uf}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            {needsReason &&
              field('correctionReason', 'Motivo da correção', {
                multiline: true,
                minRows: 2,
              })}
            {(localError || error) && (
              <Alert severity="error">{localError || error}</Alert>
            )}
            {conflict && (
              <Alert severity="warning">
                Este exame foi atualizado por outra sessão. Seu rascunho foi
                mantido. Carregar a versão atual descarta as alterações não
                salvas.
                <Button disabled={busy} onClick={() => void loadCurrent()}>
                  Carregar exame atual
                </Button>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions
          disableSpacing
          sx={{ p: '24px', gap: '16px', flexWrap: 'wrap' }}
        >
          <Button disabled={busy} onClick={close}>
            Voltar ao histórico
          </Button>
          <Button
            variant="contained"
            disabled={busy || conflict || !datesValid}
            onClick={() => void save()}
          >
            Salvar exame
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
