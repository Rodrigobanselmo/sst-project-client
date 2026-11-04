import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from 'core/services/apiClient';
import {
  SstDateField,
  useSstDateValidity,
} from '@v2/features/sst-operational/SstDateField';
import {
  AccountingState,
  accountingError,
  AI_ACCOUNTING_ROOT,
  BudgetPolicy,
  Lookup,
  Tariff,
  todayInSaoPaulo,
  usd,
} from './api';

const moneyPattern = /^(0|[1-9]\d{0,7})(\.\d{1,10})?$/;
const normalizeUsd = (v: string) => v.replace(',', '.');
export function BudgetSettings({
  state,
  users,
  companies,
}: {
  state: AccountingState;
  users: Lookup[];
  companies: Lookup[];
}) {
  const query = useQueryClient();
  const [kind, setKind] = useState('GLOBAL'),
    [subject, setSubject] = useState('');
  const [limit, setLimit] = useState(''),
    [enabled, setEnabled] = useState(true),
    [notice, setNotice] = useState('');
  const scope = kind.endsWith(':') ? kind + subject : kind;
  const existing = state.policies.find((p) => p.scope === scope);
  const save = useMutation({
    mutationFn: (body: {
      scope: string;
      limitUsd: string;
      enabled: boolean;
      expectedVersion: number;
    }) => api.put(AI_ACCOUNTING_ROOT + '/policy', body),
    onSuccess: () => {
      setNotice('Limite salvo e registrado no histórico de alterações.');
      void query.invalidateQueries({ queryKey: ['ai-accounting'] });
    },
  });
  const choose = (value: string) => {
    setKind(value);
    setSubject('');
    setLimit('');
    setNotice('');
  };
  const edit = (p: BudgetPolicy) => {
    const prefix = p.scope.startsWith('USER:')
      ? 'USER:'
      : p.scope.startsWith('COMPANY:')
        ? 'COMPANY:'
        : p.scope.startsWith('SYSTEM:')
          ? 'SYSTEM:'
          : '';
    setKind(p.scope.endsWith(':*') || !prefix ? p.scope : prefix);
    setSubject(
      prefix && !p.scope.endsWith(':*') ? p.scope.slice(prefix.length) : '',
    );
    setLimit(p.limitUsd);
    setEnabled(p.enabled);
    setNotice('');
  };
  return (
    <Stack spacing={10}>
      <Alert severity="info">
        Todos os limites são verificados: usuário, empresa e plataforma,
        inclusive para MASTER e rotinas automáticas. Após atingir o gasto
        diário, novas chamadas são bloqueadas. A última chamada e chamadas
        paralelas podem ultrapassar o limite. Zero bloqueia desde a primeira
        chamada.
      </Alert>
      <Typography variant="h6">Limites diários em dólares</Typography>
      {notice && <Alert severity="success">{notice}</Alert>}
      {save.isError && (
        <Alert severity="error">{accountingError(save.error)}</Alert>
      )}
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate({
            scope,
            limitUsd: normalizeUsd(limit),
            enabled,
            expectedVersion: existing?.version ?? 0,
          });
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={8}
          sx={{ alignItems: { md: 'flex-start' }, flexWrap: 'wrap' }}
        >
          <TextField
            select
            label="Limite para"
            value={kind}
            onChange={(e) => choose(e.target.value)}
            sx={{ minWidth: '220px' }}
          >
            <MenuItem value="GLOBAL">Toda a plataforma</MenuItem>
            <MenuItem value="USER:*">Padrão por usuário</MenuItem>
            <MenuItem value="COMPANY:*">Padrão por empresa</MenuItem>
            <MenuItem value="SYSTEM:*">Padrão por rotina automática</MenuItem>
            <MenuItem value="USER:">Um usuário</MenuItem>
            <MenuItem value="COMPANY:">Uma empresa</MenuItem>
            <MenuItem value="SYSTEM:">Uma rotina automática</MenuItem>
          </TextField>
          {(kind === 'USER:' || kind === 'COMPANY:') && (
            <TextField
              select
              label={kind === 'USER:' ? 'Usuário' : 'Empresa'}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setLimit('');
              }}
              sx={{ minWidth: '240px' }}
            >
              {(kind === 'USER:' ? users : companies).map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          )}
          {kind === 'SYSTEM:' && (
            <TextField
              label="Nome da rotina"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              helperText="Nome registrado pela rotina automática"
            />
          )}
          <TextField
            label="Máximo por dia (US$)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            helperText={
              existing ? `Atual: ${usd(existing.limitUsd)}` : 'Novo limite'
            }
            inputProps={{ inputMode: 'decimal' }}
          />
          <FormControlLabel
            label="Uso liberado dentro do limite"
            control={
              <Switch checked={enabled} onChange={(_, v) => setEnabled(v)} />
            }
          />
          <Button
            type="submit"
            variant="contained"
            disabled={
              !state.infrastructureEnabled ||
              save.isPending ||
              !moneyPattern.test(normalizeUsd(limit)) ||
              (kind.endsWith(':') && !subject)
            }
          >
            Salvar limite
          </Button>
        </Stack>
      </Box>
      <TableContainer>
        <Table size="small" aria-label="Limites de IA">
          <TableHead>
            <TableRow>
              {[
                'Abrangência',
                'Máximo diário',
                'Contabilizado hoje',
                'Situação',
                '',
              ].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {state.policies.map((p) => (
              <TableRow key={p.scope}>
                <TableCell>
                  {p.scope === 'GLOBAL'
                    ? 'Plataforma'
                    : p.scope === 'USER:*'
                      ? 'Padrão por usuário'
                      : p.scope === 'COMPANY:*'
                        ? 'Padrão por empresa'
                        : p.scope === 'SYSTEM:*'
                          ? 'Padrão por rotina'
                          : p.scope.startsWith('USER:')
                            ? users.find((u) => u.id === p.scope.slice(5))
                                ?.label || p.scope
                            : p.scope.startsWith('COMPANY:')
                              ? companies.find((c) => c.id === p.scope.slice(8))
                                  ?.label || p.scope
                              : p.scope}
                </TableCell>
                <TableCell>{usd(p.limitUsd)}</TableCell>
                <TableCell>
                  {p.scope.endsWith(':*') ? '—' : usd(p.spentUsd)}
                </TableCell>
                <TableCell>
                  {!p.enabled
                    ? 'Pausado'
                    : !p.scope.endsWith(':*') &&
                        Number(p.spentUsd) >= Number(p.limitUsd)
                      ? 'Limite atingido'
                      : 'Liberado dentro do limite'}
                </TableCell>
                <TableCell>
                  <Button onClick={() => edit(p)}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

const emptyTariff = () => ({
  provider: 'openai' as Tariff['provider'],
  model: '',
  inputUsdPerMillion: '0',
  cachedInputUsdPerMillion: '0',
  outputUsdPerMillion: '0',
  audioUsdPerMinute: '0',
  requestUsd: '0',
  sourceUrl: '',
});
export function TariffSettings({ state }: { state: AccountingState }) {
  const [customOpen, setCustomOpen] = useState(false),
    [modelSearch, setModelSearch] = useState(''),
    [providerFilter, setProviderFilter] = useState('');
  const visibleTariffs = state.tariffs.filter(
    (t) =>
      (!providerFilter || t.provider === providerFilter) &&
      t.model.toLowerCase().includes(modelSearch.toLowerCase()),
  );
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const query = useQueryClient(),
    { datesValid, dateFieldValidity } = useSstDateValidity();
  const [form, setForm] = useState(emptyTariff),
    [expires, setExpires] = useState(todayInSaoPaulo()),
    [notice, setNotice] = useState('');
  const existing = state.tariffs.find(
    (t) => t.provider === form.provider && t.model === form.model,
  );
  const save = useMutation({
    mutationFn: () =>
      api.put(AI_ACCOUNTING_ROOT + '/tariff', {
        ...form,
        validUntil: `${expires}T23:59:59-03:00`,
        expectedVersion: existing?.version ?? 0,
      }),
    onSuccess: () => {
      setNotice(
        'Tarifa salva. Chamadas anteriores mantêm a versão original do cálculo.',
      );
      void query.invalidateQueries({ queryKey: ['ai-accounting'] });
    },
  });
  const restore = useMutation({
    mutationFn: (t: Tariff) =>
      api.delete(AI_ACCOUNTING_ROOT + '/tariff', {
        data: {
          provider: t.provider,
          model: t.model,
          expectedVersion: t.version,
        },
      }),
    onSuccess: () => {
      setNotice('Tarifa oficial restaurada.');
      setCustomOpen(false);
      void query.invalidateQueries({ queryKey: ['ai-accounting'] });
    },
  });
  const edit = (t: Tariff) => {
    setCustomOpen(true);
    const { version, validUntil, ...fields } = t;
    setForm({
      provider: fields.provider,
      model: fields.model,
      inputUsdPerMillion: fields.inputUsdPerMillion,
      cachedInputUsdPerMillion: fields.cachedInputUsdPerMillion,
      outputUsdPerMillion: fields.outputUsdPerMillion,
      audioUsdPerMinute: fields.audioUsdPerMinute,
      requestUsd: fields.requestUsd ?? '0',
      sourceUrl: fields.sourceUrl,
    });
    setExpires(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(validUntil)),
    );
    setNotice('');
  };
  const valid =
    [
      form.inputUsdPerMillion,
      form.cachedInputUsdPerMillion,
      form.outputUsdPerMillion,
      form.audioUsdPerMinute,
      form.requestUsd,
    ].every((v) => moneyPattern.test(v)) &&
    !!form.model &&
    !!form.sourceUrl &&
    !!expires &&
    datesValid;
  return (
    <Stack spacing={10}>
      <Alert severity="info">
        OpenAI e Gemini já usam o catálogo oficial incluído no sistema. Você não
        precisa cadastrar as tarifas para começar.
        {state.catalog &&
          ` São ${state.catalog.modelCount} modelos, com revisão em ${new Date(state.catalog.reviewedAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.`}{' '}
        As regras de contexto longo, imagem e mudanças de preço já publicadas
        são aplicadas automaticamente ao consumo retornado.
      </Alert>
      {notice && <Alert severity="success">{notice}</Alert>}
      {save.isError && (
        <Alert severity="error">{accountingError(save.error)}</Alert>
      )}
      {restore.isError && (
        <Alert severity="error">{accountingError(restore.error)}</Alert>
      )}
      <Button
        variant="outlined"
        onClick={() => setCustomOpen((v) => !v)}
        sx={{ alignSelf: 'flex-start' }}
      >
        {customOpen
          ? 'Fechar tarifa personalizada'
          : 'Cadastrar tarifa personalizada'}
      </Button>
      <Collapse in={customOpen} unmountOnExit>
        <Alert severity="warning" sx={{ mb: 8 }}>
          Cadastro opcional para preço contratado ou modelo fora do catálogo.
          Uma tarifa personalizada de preço único substitui a oficial daquele
          modelo. Modelos com faixas ou modalidades são geridos pelo catálogo.
        </Alert>
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3,minmax(0,1fr))' },
              gap: '20px',
            }}
          >
            <TextField
              select
              label="Provedor"
              value={form.provider}
              onChange={(e) =>
                setForm({
                  ...emptyTariff(),
                  provider: e.target.value as Tariff['provider'],
                  model: e.target.value === 'tavily' ? 'search-basic' : '',
                })
              }
            >
              <MenuItem value="openai">OpenAI</MenuItem>
              <MenuItem value="gemini">Gemini</MenuItem>
              <MenuItem value="tavily">Tavily · pesquisa externa</MenuItem>
            </TextField>
            <TextField
              label="Modelo"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              helperText="Identificador usado pela integração"
            />
            <SstDateField
              label="Tarifa válida até"
              value={expires}
              onChange={setExpires}
              onValidityChange={dateFieldValidity('expires')}
            />
            {(
              [
                ['inputUsdPerMillion', 'Entrada / milhão de tokens (US$)'],
                ['cachedInputUsdPerMillion', 'Entrada em cache / milhão (US$)'],
                ['outputUsdPerMillion', 'Saída / milhão de tokens (US$)'],
                ['audioUsdPerMinute', 'Áudio / minuto (US$)'],
                ['requestUsd', 'Busca / crédito (US$)'],
              ] as const
            ).map(([key, label]) => (
              <TextField
                key={key}
                label={label}
                disabled={
                  key === 'requestUsd'
                    ? form.provider !== 'tavily'
                    : form.provider === 'tavily'
                }
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: normalizeUsd(e.target.value) })
                }
                inputProps={{ inputMode: 'decimal' }}
              />
            ))}
            <TextField
              label="Fonte oficial da tarifa"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              sx={{ gridColumn: { md: 'span 2' } }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            disabled={!state.infrastructureEnabled || !valid || save.isPending}
            sx={{ mt: 10 }}
          >
            Salvar tarifa
          </Button>
        </Box>
      </Collapse>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={8}>
        <TextField
          label="Pesquisar modelo"
          value={modelSearch}
          onChange={(e) => setModelSearch(e.target.value)}
        />
        <TextField
          select
          label="Filtrar provedor"
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          sx={{ minWidth: '200px' }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="openai">OpenAI</MenuItem>
          <MenuItem value="gemini">Gemini</MenuItem>
          <MenuItem value="tavily">Busca externa · Tavily</MenuItem>
        </TextField>
      </Stack>
      <TableContainer>
        <Table size="small" aria-label="Tarifas de IA">
          <TableHead>
            <TableRow>
              {[
                'Provedor / modelo',
                'Entrada / milhão',
                'Cache / milhão',
                'Saída / milhão',
                'Áudio / minuto',
                'Busca / crédito',
                'Origem e regras',
                'Validade',
                '',
              ].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleTariffs.map((t) => (
              <TableRow key={`${t.provider}:${t.model}`}>
                <TableCell>
                  {t.provider} / {t.model}
                </TableCell>
                <TableCell>{usd(t.inputUsdPerMillion)}</TableCell>
                <TableCell>{usd(t.cachedInputUsdPerMillion)}</TableCell>
                <TableCell>{usd(t.outputUsdPerMillion)}</TableCell>
                <TableCell>{usd(t.audioUsdPerMinute)}</TableCell>
                <TableCell>
                  {t.provider === 'tavily' ? usd(t.requestUsd) : '—'}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {t.origin === 'OFFICIAL'
                      ? 'Oficial automática'
                      : 'Personalizada'}
                  </Typography>
                  <a href={t.sourceUrl} target="_blank" rel="noreferrer">
                    Ver fonte
                  </a>
                  {t.pricingNote && (
                    <Box component="details" sx={{ mt: 4, maxWidth: '300px' }}>
                      <summary>Ver regras</summary>
                      <Typography variant="caption">{t.pricingNote}</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(t.validUntil).toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                  })}
                  {Date.parse(t.validUntil) < now ? ' · Vencida' : ''}
                </TableCell>
                <TableCell>
                  {t.canCustomize !== false && (
                    <Button onClick={() => edit(t)}>
                      {t.origin === 'OFFICIAL' ? 'Personalizar' : 'Editar'}
                    </Button>
                  )}
                  {t.origin === 'CUSTOM' && t.hasOfficialPrice && (
                    <Button
                      disabled={
                        restore.isPending || !state.infrastructureEnabled
                      }
                      onClick={() => restore.mutate(t)}
                    >
                      Usar oficial
                    </Button>
                  )}
                  {t.canCustomize === false && t.origin === 'OFFICIAL' && (
                    <Typography variant="caption">
                      Regras automáticas
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!visibleTariffs.length && (
        <Typography>Nenhuma tarifa encontrada para os filtros.</Typography>
      )}
    </Stack>
  );
}
