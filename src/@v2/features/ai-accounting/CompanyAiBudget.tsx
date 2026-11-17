import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FormControlLabel,
  Link,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'core/contexts/AuthContext';
import { RoutesEnum } from 'core/enums/routes.enums';
import {
  accountingError,
  AI_ACCOUNTING_ROOT,
  BudgetPolicy,
  fetchAccountingState,
  usd,
} from './api';
import { api } from 'core/services/apiClient';

function status(policy?: BudgetPolicy, inherited = false) {
  if (!policy) return 'Sem política aplicável';
  if (!policy.enabled) return 'Pausado';
  if (
    Number(policy.limitUsd) === 0 ||
    (!inherited && Number(policy.spentUsd) >= Number(policy.limitUsd))
  ) {
    return 'Limite atingido';
  }
  return inherited
    ? 'Ativo · saldo do dia não exibido'
    : 'Liberado dentro do limite';
}

export function CompanyAiBudget({
  companyId,
  registerCloseGuard,
}: {
  companyId: string;
  registerCloseGuard: (guard: () => boolean) => () => void;
}) {
  const { user } = useAuth();
  const identity = user ? `${user.companyId}:${user.id}` : '';
  const query = useQueryClient();
  const state = useQuery({
    queryKey: ['ai-accounting', identity, 'state'],
    queryFn: fetchAccountingState,
    retry: false,
    enabled: !!identity,
  });
  const scope = `COMPANY:${companyId}`;
  const policies = state.data?.policies ?? [];
  const company = policies.find((p) => p.scope === scope);
  const effective = company ?? policies.find((p) => p.scope === 'COMPANY:*');
  const global = policies.find((p) => p.scope === 'GLOBAL');
  const [draft, setDraft] = useState<{
    enabled: boolean;
    limit: string;
    version: number;
  }>();
  const validLimit =
    !!draft && /^(0|[1-9]\d{0,7})([.,]\d{1,10})?$/.test(draft.limit.trim());
  const save = useMutation({
    mutationFn: (values: {
      enabled: boolean;
      limit: string;
      version: number;
    }) =>
      api.put(AI_ACCOUNTING_ROOT + '/policy', {
        scope,
        enabled: values.enabled,
        limitUsd: values.limit.trim().replace(',', '.'),
        expectedVersion: values.version,
      }),
    onSuccess: async () => {
      await query.invalidateQueries({ queryKey: ['ai-accounting'] });
      setDraft(undefined);
    },
    onError: () => {
      void state.refetch();
    },
  });

  useEffect(
    () =>
      registerCloseGuard(
        () =>
          !save.isPending &&
          (!draft || window.confirm('Descartar a edição do limite de IA?')),
      ),
    [registerCloseGuard, save.isPending, draft],
  );

  return (
    <Stack spacing={8}>
      <Typography variant="h6">Uso e limite diário de IA</Typography>
      <Link
        href={RoutesEnum.AI_CONSUMPTION}
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir Consumo de IA para gerenciar a plataforma, usuários e políticas
        padrão
      </Link>
      <Link
        href={RoutesEnum.TEAM_GROUPS.replace(
          ':companyId',
          encodeURIComponent(companyId),
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir grupos de permissões da empresa
      </Link>
      {state.isLoading && (
        <Typography role="status">Carregando políticas de IA…</Typography>
      )}
      {state.isError && (
        <Alert
          severity="error"
          action={
            <Button onClick={() => void state.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          {accountingError(state.error)}
        </Alert>
      )}
      {state.data && !state.data.infrastructureEnabled && (
        <Alert severity="warning">
          O controle financeiro de IA está indisponível neste ambiente.
        </Alert>
      )}
      {state.data?.infrastructureEnabled && (
        <>
          <Typography>
            <strong>Plataforma:</strong> {status(global)}
          </Typography>
          <Typography>
            <strong>Empresa:</strong> {status(effective, !company)}
            {effective &&
              ` · ${usd(effective.limitUsd)}/dia · ${company ? 'Regra própria' : 'Padrão por empresa'}`}
          </Typography>
          <Typography>
            <strong>Seu usuário:</strong> usa o saldo global da plataforma
          </Typography>
          <Typography color="text.secondary">
            O limite da empresa se aplica ao administrador máximo e aos demais
            usuários da empresa. As permissões dos módulos são administradas
            pelos grupos de acesso.
          </Typography>
          {company && (
            <Typography>
              Consumo contabilizado hoje na empresa: {usd(company.spentUsd)}
            </Typography>
          )}
          {save.isSuccess && (
            <Alert severity="success">Limite da empresa salvo.</Alert>
          )}
          {save.isError && (
            <Alert severity="error">{accountingError(save.error)}</Alert>
          )}
          {draft ? (
            <Stack
              spacing={6}
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                if (validLimit && !save.isPending) save.mutate(draft);
              }}
            >
              <TextField
                label="Máximo por dia (US$)"
                value={draft.limit}
                disabled={save.isPending}
                inputProps={{ inputMode: 'decimal' }}
                onChange={(event) =>
                  setDraft({ ...draft, limit: event.target.value })
                }
                helperText="Zero bloqueia desde a primeira chamada. O período segue o horário de São Paulo."
              />
              <FormControlLabel
                label="Uso liberado dentro do limite"
                control={
                  <Switch
                    checked={draft.enabled}
                    sx={(theme) => ({
                      '& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb': {
                        outline:
                          theme.palette.mode === 'dark'
                            ? `1px solid ${theme.palette.primary.main}`
                            : undefined,
                        outlineOffset: '-1px',
                      },
                    })}
                    disabled={save.isPending}
                    onChange={(_, enabled) => setDraft({ ...draft, enabled })}
                  />
                }
              />
              <Stack direction="row" spacing={6}>
                <Button
                  disabled={save.isPending}
                  onClick={() => {
                    setDraft(undefined);
                    save.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={save.isPending || !validLimit}
                >
                  Salvar limite da empresa
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Button
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => {
                save.reset();
                setDraft({
                  enabled: effective?.enabled ?? false,
                  limit: effective?.limitUsd ?? '',
                  version: company?.version ?? 0,
                });
              }}
            >
              {company ? 'Editar limite da empresa' : 'Definir limite próprio'}
            </Button>
          )}
        </>
      )}
    </Stack>
  );
}
