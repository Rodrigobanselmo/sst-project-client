import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import {
  Binding,
  Certificate,
  CertificateScope,
  Employer,
  PlatformBinding,
  certificateMessage,
  fetchBinding,
  fetchEmployers,
  fetchPlatformBinding,
  fetchVault,
  vaultRoot,
} from './api';
import { CertificateUploadDialog } from './CertificateUploadDialog';
import {
  SstDateField,
  useSstDateValidity,
} from '../sst-operational/SstDateField';

const statuses = {
  ACTIVE: 'Ativo',
  EXPIRED: 'Vencido',
  NOT_YET_VALID: 'Ainda não válido',
  DISABLED: 'Desativado',
  REPLACED: 'Renovado',
};
const actions: Record<string, string> = {
  IMPORT: 'Importação',
  RENEW: 'Renovação',
  RENEW_BINDING: 'Configuração atualizada na renovação',
  BIND: 'Uso configurado',
  UNBIND: 'Uso interrompido',
  DISABLE: 'Desativação',
};
const date = (value: string) => new Date(value).toLocaleDateString('pt-BR');

export function CertificateManager({
  employerId,
  scope = 'COMPANY',
}: {
  employerId?: string;
  scope?: CertificateScope;
}) {
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const { user } = useAuth();
  const ownerId = user?.companyId || '';
  const isPlatform = scope === 'PLATFORM';
  const root = vaultRoot(ownerId, scope);
  const allowed = (right: string) =>
    (user?.roles || []).includes('master') ||
    (!isPlatform &&
      (user?.permissions || []).some((p: string) => {
        const [code, rights] = p.split('-');
        return (
          ['master', '14.1'].includes(code) &&
          /^[crud]+$/.test(rights || '') &&
          rights.includes(right)
        );
      }));
  const canRead = allowed('r'),
    canCreate = allowed('c'),
    canUpdate = allowed('u'),
    canDisable = allowed('d');
  const query = useQueryClient();
  const [tab, setTab] = useState(0);
  const [upload, setUpload] = useState<{ original?: Certificate }>();
  const [disabling, setDisabling] = useState<Certificate>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [credentialId, setCredentialId] = useState('');
  const [mode, setMode] = useState<'OWN' | 'PROXY'>('OWN');
  const [declared, setDeclared] = useState(false);
  const [expires, setExpires] = useState('');
  const vault = useQuery(
    ['esocial-certificates', ownerId, scope],
    () => fetchVault(ownerId, scope),
    { enabled: !!ownerId && canRead, retry: false },
  );
  const targets = useQuery(
    ['esocial-certificate-targets', ownerId],
    () => fetchEmployers(ownerId),
    { enabled: !!ownerId && canRead && !isPlatform, retry: false },
  );
  const binding = useQuery<Binding | PlatformBinding | null>(
    ['esocial-binding', ownerId, scope, employer?.id],
    () =>
      isPlatform ? fetchPlatformBinding() : fetchBinding(ownerId, employer!.id),
    {
      enabled:
        !!ownerId &&
        (isPlatform ||
          !!targets.data?.some((target) => target.id === employer?.id)) &&
        canRead,
      retry: false,
    },
  );
  const audit = useQuery(
    ['esocial-certificate-audit', ownerId, scope],
    async () => (await api.get(root + '/audit')).data,
    { enabled: !!ownerId && canRead && tab === 2, retry: false },
  );
  useEffect(() => {
    setEmployer(
      (previous) =>
        targets.data?.find(
          (company) =>
            company.id ===
            (employerId ||
              (targets.data.some((target) => target.id === previous?.id)
                ? previous!.id
                : ownerId)),
        ) || null,
    );
  }, [targets.data, employerId, ownerId]);
  useEffect(() => {
    const current = binding.data;
    setCredentialId(current?.credentialId || '');
    setMode(current && 'mode' in current ? current.mode : 'OWN');
    setDeclared(
      !!current &&
        'authorizationDeclaredAt' in current &&
        !!current.authorizationDeclaredAt,
    );
    setExpires(
      current && 'authorizationExpiresAt' in current
        ? current.authorizationExpiresAt?.slice(0, 10) || ''
        : '',
    );
  }, [binding.data, employer?.id]);

  const refresh = async () => {
    await Promise.all([
      query.invalidateQueries(['esocial-certificates', ownerId]),
      query.invalidateQueries(['esocial-binding', ownerId]),
      query.invalidateQueries(['esocial-certificate-audit', ownerId]),
    ]);
  };
  const run = async (work: () => Promise<unknown>, message: string) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await work();
      await refresh();
      setSuccess(message);
    } catch (e) {
      setError(certificateMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const saveBinding = () => {
    if (!isPlatform && !employer) return;
    void run(
      () =>
        api.put(
          isPlatform ? root + '/binding' : root + '/bindings/' + employer!.id,
          {
            credentialId,
            expectedRevision: binding.data?.revision || 0,
            ...(!isPlatform && { mode }),
            ...(!isPlatform &&
              mode === 'PROXY' && {
                authorizationDeclared: declared,
                ...(expires && { authorizationExpiresAt: expires }),
              }),
          },
        ),
      isPlatform
        ? 'Certificado de transmissão configurado.'
        : 'Certificado configurado para esta empresa.',
    );
  };
  const current = binding.data;
  const certificates = vault.data?.certificates || [];

  if (!canRead)
    return (
      <Alert severity="warning">
        Você não tem permissão para gerenciar certificados do eSocial. Solicite
        acesso ao administrador.
      </Alert>
    );
  return (
    <Stack spacing={12} sx={{ p: { xs: 8, md: 12 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={8}
        alignItems={{ sm: 'center' }}
      >
        <Box>
          <Typography variant="h5">
            {isPlatform
              ? 'Certificado de transmissão SimpleSST'
              : 'Certificados do eSocial'}
          </Typography>
          <Typography color="text.secondary">
            {isPlatform
              ? 'Administração interna do certificado utilizado na conexão com o eSocial.'
              : employerId
                ? 'Configure o certificado usado nos envios desta empresa.'
                : 'Gerencie os certificados da sua organização e sua utilização pelas empresas atendidas.'}
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            onClick={() => setUpload({})}
            disabled={
              !vault.data?.configured ||
              busy ||
              ((isPlatform || !!employerId) &&
                canUpdate &&
                (binding.isLoading ||
                  binding.isError ||
                  (!isPlatform && !employer)))
            }
          >
            Adicionar certificado
          </Button>
        )}
      </Stack>
      {vault.data && !vault.data.configured && (
        <Alert severity="warning">
          O armazenamento seguro precisa ser configurado pelo administrador do
          servidor antes da importação.
        </Alert>
      )}
      {(vault.isError ||
        targets.isError ||
        binding.isError ||
        audit.isError) && (
        <Alert severity="error">
          Não foi possível carregar a configuração.{' '}
          <Button
            onClick={() => {
              void vault.refetch();
              void targets.refetch();
              void binding.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Alert severity="info">
        {isPlatform
          ? 'Esta configuração é interna. Os eventos continuam assinados pelo certificado autorizado de cada empresa. Depois de ativar, a transmissão seleciona o certificado automaticamente.'
          : 'Depois de configurar, os envios usam o certificado ativo automaticamente. Ao renovar por esta tela, a nova versão passa a ser usada sem configurar novamente.'}
      </Alert>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        aria-label="Gestão de certificados"
      >
        <Tab label="Certificados" />
        <Tab
          label={
            isPlatform
              ? 'Uso na transmissão'
              : employerId
                ? 'Configuração de envio'
                : 'Empresas e envio'
          }
        />
        <Tab label="Atividade" />
      </Tabs>
      {tab === 0 && (
        <>
          <Typography variant="body2" color="text.secondary">
            A senha é usada na importação. A chave privada fica criptografada no
            servidor.{' '}
            {isPlatform
              ? 'Este certificado identifica a conexão de transmissão da SimpleSST.'
              : 'Este certificado assina os eventos das empresas autorizadas.'}
          </Typography>
          {vault.isLoading ? (
            <Typography>Carregando certificados…</Typography>
          ) : !certificates.length ? (
            <Paper variant="outlined" sx={{ p: 12 }}>
              <Typography variant="h6">
                Nenhum certificado cadastrado
              </Typography>
              <Typography color="text.secondary">
                {isPlatform
                  ? 'Adicione o certificado A1 da SimpleSST em formato .pfx e ative seu uso na transmissão.'
                  : employerId
                    ? 'Adicione o certificado A1 em formato .pfx para configurar os envios desta empresa.'
                    : 'Adicione um certificado A1 em formato .pfx. Depois, configure as empresas autorizadas na aba Empresas e envio.'}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table aria-label="Certificados cadastrados">
                <TableHead>
                  <TableRow>
                    <TableCell>Certificado e titular</TableCell>
                    <TableCell>Validade</TableCell>
                    <TableCell>Situação</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificates.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Typography fontWeight={600}>{c.label}</Typography>
                        <Typography variant="body2">
                          {c.registrationType === 1 ? 'CNPJ' : 'CPF'}{' '}
                          {c.registration}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            whiteSpace: 'pre-line',
                            overflowWrap: 'anywhere',
                            maxWidth: 480,
                          }}
                        >
                          {c.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {date(c.notBefore)} a {date(c.notAfter)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={statuses[c.status]}
                          color={
                            c.status === 'ACTIVE'
                              ? 'success'
                              : ['EXPIRED', 'NOT_YET_VALID'].includes(c.status)
                                ? 'warning'
                                : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={4}
                          justifyContent="flex-end"
                        >
                          {canUpdate && !c.disabledAt && !c.supersededById && (
                            <Button onClick={() => setUpload({ original: c })}>
                              Renovar
                            </Button>
                          )}
                          {canDisable && !c.disabledAt && (
                            <Button
                              color="error"
                              onClick={() => setDisabling(c)}
                            >
                              Desativar
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      {tab === 1 && (
        <Paper variant="outlined" sx={{ p: 12 }}>
          <Stack spacing={8} useFlexGap>
            <Typography variant="h6">
              {isPlatform
                ? 'Certificado utilizado na transmissão'
                : 'Certificado utilizado pela empresa'}
            </Typography>
            {!isPlatform && !employerId && (
              <Autocomplete
                options={targets.data || []}
                value={employer}
                onChange={(_, value) => setEmployer(value)}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                getOptionLabel={(c) => `${c.name} · ${c.cnpj}`}
                renderInput={(params) => (
                  <TextField {...params} label="Empresa empregadora" />
                )}
                disabled={busy}
              />
            )}
            {!isPlatform && employerId && employer && (
              <Typography>
                {employer.name} · {employer.cnpj}
              </Typography>
            )}
            {!isPlatform &&
              employerId &&
              !targets.isLoading &&
              !targets.isError &&
              !employer && (
                <Alert severity="warning">
                  Esta empresa não está disponível para a organização ativa.
                  Confira o acesso ou selecione a organização da empresa.
                </Alert>
              )}
            {(isPlatform || employer) && !binding.isLoading && (
              <>
                <Alert
                  severity={
                    current?.enabled && current.credential.status === 'ACTIVE'
                      ? 'info'
                      : 'warning'
                  }
                >
                  {current?.enabled && current.credential.status !== 'ACTIVE'
                    ? `O certificado configurado está indisponível para novos envios (${statuses[current.credential.status].toLocaleLowerCase('pt-BR')}). Renove ou selecione um certificado ativo para continuar.`
                    : current?.enabled
                      ? `Configuração atual: ${current.credential.label}${!isPlatform && 'mode' in current ? ` · ${current.mode === 'PROXY' ? 'procuração informada' : 'certificado próprio'}` : ''}.`
                      : isPlatform
                        ? 'Nenhum certificado de transmissão está habilitado.'
                        : 'Esta empresa ainda não tem um certificado habilitado para novos envios.'}
                </Alert>
                {canUpdate && (
                  <>
                    <TextField
                      label="Certificado para envio"
                      select
                      value={
                        certificates.some(
                          (c) => c.id === credentialId && c.status === 'ACTIVE',
                        )
                          ? credentialId
                          : ''
                      }
                      onChange={(e) => {
                        setCredentialId(e.target.value);
                        setDeclared(false);
                      }}
                      disabled={busy}
                    >
                      {certificates
                        .filter((c) => c.status === 'ACTIVE')
                        .map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.label} · {c.registration}
                          </MenuItem>
                        ))}
                    </TextField>
                    {!isPlatform && (
                      <TextField
                        select
                        label="Forma de representação"
                        value={mode}
                        onChange={(e) => {
                          setMode(e.target.value as 'OWN' | 'PROXY');
                          setDeclared(false);
                        }}
                        disabled={busy}
                      >
                        <MenuItem value="OWN">
                          Certificado do próprio empregador
                        </MenuItem>
                        <MenuItem value="PROXY">
                          Certificado de procurador
                        </MenuItem>
                      </TextField>
                    )}
                    {!isPlatform && mode === 'PROXY' && (
                      <>
                        <Alert severity="info">
                          O CPF/CNPJ do certificado deve ter procuração na
                          Receita Federal com poderes para os eventos de SST.
                          Esta confirmação registra sua declaração; o eSocial
                          verifica a autorização no processamento.
                        </Alert>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={declared}
                              onChange={(e) => setDeclared(e.target.checked)}
                              disabled={busy}
                            />
                          }
                          label="Confirmo que existe procuração válida para enviar os eventos de SST desta empresa"
                        />
                        <SstDateField
                          label="Término da procuração (opcional)"
                          value={expires}
                          onChange={setExpires}
                          onValidityChange={dateFieldValidity('expires')}
                          disabled={busy}
                        />
                      </>
                    )}
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={8}
                      useFlexGap
                    >
                      <Button
                        variant="contained"
                        disabled={
                          busy ||
                          !datesValid ||
                          binding.isError ||
                          !credentialId ||
                          !certificates.some(
                            (c) =>
                              c.id === credentialId && c.status === 'ACTIVE',
                          ) ||
                          (!isPlatform && mode === 'PROXY' && !declared)
                        }
                        onClick={saveBinding}
                      >
                        {isPlatform
                          ? 'Ativar para transmissão'
                          : 'Salvar configuração de envio'}
                      </Button>
                      {current?.enabled &&
                        (isPlatform ||
                          current.credential.ownerCompanyId === ownerId ||
                          employer?.id === ownerId) && (
                          <Button
                            color="error"
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () =>
                                  api.post(
                                    isPlatform
                                      ? root + '/binding/unbind'
                                      : root +
                                          '/bindings/' +
                                          employer!.id +
                                          '/unbind',
                                    { expectedRevision: current.revision },
                                  ),
                                isPlatform
                                  ? 'Uso interrompido para novas transmissões.'
                                  : 'Uso interrompido para novos envios desta empresa.',
                              )
                            }
                          >
                            {isPlatform
                              ? 'Interromper transmissão'
                              : 'Parar uso nesta empresa'}
                          </Button>
                        )}
                    </Stack>
                  </>
                )}
              </>
            )}
            {!isPlatform && !employerId && !!vault.data?.bindings?.length && (
              <>
                <Typography variant="h6" sx={{ pt: 8 }}>
                  Empresas vinculadas
                </Typography>
                <TableContainer>
                  <Table aria-label="Empresas vinculadas">
                    <TableHead>
                      <TableRow>
                        <TableCell>Empresa</TableCell>
                        <TableCell>Certificado</TableCell>
                        <TableCell>Representação</TableCell>
                        <TableCell>Uso</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vault.data.bindings?.map((b) => (
                        <TableRow key={b.companyId}>
                          <TableCell>{b.company?.name}</TableCell>
                          <TableCell>{b.credential.label}</TableCell>
                          <TableCell>
                            {b.mode === 'PROXY'
                              ? 'Procuração informada'
                              : 'Próprio'}
                          </TableCell>
                          <TableCell>
                            {!b.enabled
                              ? 'Interrompido'
                              : b.credential.status !== 'ACTIVE'
                                ? statuses[b.credential.status]
                                : 'Configurado'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        </Paper>
      )}
      {tab === 2 && (
        <Paper variant="outlined" sx={{ p: 12 }}>
          <Typography variant="h6">Atividade dos certificados</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 8 }}>
            Registro de importações, renovações e alterações de uso.
          </Typography>
          <TableContainer>
            <Table aria-label="Atividade dos certificados">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Operação</TableCell>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Certificado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {audit.data?.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {new Date(a.createdAt).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>{actions[a.action]}</TableCell>
                    <TableCell>#{a.actorId}</TableCell>
                    <TableCell>
                      {certificates.find((c) => c.id === a.credentialId)
                        ?.label || a.credentialId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {upload && (
        <CertificateUploadDialog
          ownerId={ownerId}
          scope={scope}
          binding={
            !isPlatform && employerId && employer && canUpdate
              ? {
                  companyId: employer.id,
                  mode,
                  expectedRevision: current?.revision || 0,
                }
              : undefined
          }
          activationRevision={isPlatform ? current?.revision || 0 : undefined}
          original={upload.original}
          onClose={() => setUpload(undefined)}
          onSaved={async () => {
            await refresh();
            const activated =
              !upload.original && (isPlatform || (!!employerId && canUpdate));
            if (activated) setTab(1);
            setSuccess(
              upload.original
                ? 'Certificado renovado. Os vínculos ativos foram atualizados.'
                : activated
                  ? 'Certificado importado e ativado para os próximos envios.'
                  : 'Certificado importado. Configure seu uso na aba de envio.',
            );
          }}
        />
      )}
      {!!disabling && (
        <Dialog
          open
          onClose={() => !busy && setDisabling(undefined)}
          aria-labelledby="certificate-disable-title"
        >
          <DialogTitle id="certificate-disable-title">
            Desativar certificado
          </DialogTitle>
          <DialogContent>
            <Typography>
              {disabling.label} deixará de ser utilizado. Novas operações que
              dependam dele ficarão impedidas. O histórico dos envios será
              preservado. Uma operação já em andamento pode terminar.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button disabled={busy} onClick={() => setDisabling(undefined)}>
              Cancelar
            </Button>
            <Button
              color="error"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await api.post(root + `/${disabling.id}/disable`);
                  setDisabling(undefined);
                }, 'Certificado desativado.')
              }
            >
              Confirmar desativação
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
