import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from 'react-query';
import {
  asIllustrationError,
  capabilityMessage,
  ILLUSTRATION_CAPTION,
  IllustrationApi,
  Scope,
} from './illustrations.api';
import { browserSessionStorage, IllustrationFlow } from './illustrations.flow';

function PrivateImage({
  load,
  onOpen,
  preview = false,
}: {
  load: (signal: AbortSignal) => Promise<Blob>;
  onOpen?: (url: string) => void;
  preview?: boolean;
}) {
  const [url, setUrl] = useState(''),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    let objectUrl = '';
    setUrl('');
    setError('');
    void load(abort.signal)
      .then((blob) => {
        if (abort.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(async (e) => {
        if (!abort.signal.aborted)
          setError((await asIllustrationError(e)).message);
      });
    return () => {
      abort.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [load, retry]);
  if (error)
    return (
      <Alert severity="warning">
        {error}
        <Button onClick={() => setRetry((n) => n + 1)}>Tentar novamente</Button>
      </Alert>
    );
  if (!url)
    return <CircularProgress size={24} aria-label="Carregando ilustração" />;
  return (
    <Box
      component="img"
      src={url}
      alt={ILLUSTRATION_CAPTION}
      onClick={() => onOpen?.(url)}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(event) => {
        if (onOpen && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onOpen(url);
        }
      }}
      sx={{
        width: '100%',
        maxHeight: preview ? 'min(480px, calc(100dvh - 360px))' : 320,
        objectFit: 'contain',
        cursor: onOpen ? 'zoom-in' : undefined,
      }}
    />
  );
}
function IllustrationCard({
  id,
  api,
  scope,
  refresh,
}: {
  id: string;
  api: IllustrationApi;
  scope: Scope;
  refresh: () => Promise<unknown>;
}) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [view, setView] = useState(''),
    [confirm, setConfirm] = useState(false);
  const load = useCallback(
    (signal: AbortSignal) => api.file(scope, id, signal),
    [api, scope, id],
  );
  const download = async () => {
    setBusy(true);
    setError('');
    let url = '';
    try {
      url = URL.createObjectURL(await api.file(scope, id));
      const a = document.createElement('a');
      a.href = url;
      a.download = `ilustracao-ia-${id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setError((await asIllustrationError(e)).message);
    } finally {
      if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await api.remove(scope, id);
      setConfirm(false);
      await refresh();
    } catch (e) {
      setError((await asIllustrationError(e)).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card variant="outlined" sx={{ maxWidth: 360 }}>
      <CardContent>
        <Chip
          label="Ilustração gerada por IA"
          color="warning"
          size="small"
          sx={{ mb: 1 }}
        />
        <PrivateImage load={load} onOpen={setView} />
        {error && <Alert severity="error">{error}</Alert>}
      </CardContent>
      <CardActions>
        <Button disabled={busy} onClick={() => void download()}>
          Baixar
        </Button>
        <Button color="error" disabled={busy} onClick={() => setConfirm(true)}>
          Excluir
        </Button>
      </CardActions>
      <Dialog open={!!view} onClose={() => setView('')} maxWidth="md" fullWidth>
        <DialogTitle>Ilustração do elemento</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={view || undefined}
            alt={ILLUSTRATION_CAPTION}
            sx={{ width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setView('')}>Fechar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirm} onClose={() => !busy && setConfirm(false)}>
        <DialogTitle>Excluir ilustração?</DialogTitle>
        <DialogContent>
          A ilustração será removida da galeria. As fotografias serão
          preservadas.
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setConfirm(false)}>
            Cancelar
          </Button>
          <Button disabled={busy} color="error" onClick={() => void remove()}>
            Excluir ilustração
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
export function IllustrationsPanel({
  scope,
  api,
  canEdit,
  saved,
  dirty,
}: {
  scope: Scope;
  api: IllustrationApi;
  canEdit: boolean;
  saved: boolean;
  dirty: boolean;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const scopeId = JSON.stringify([
    scope.userId,
    scope.companyId,
    scope.workspaceId,
    scope.characterizationId,
  ]);
  // A stable scope also prevents stale blob fetches when the editor re-renders.
  const stableScope = useMemo(() => scope, [scopeId]); // eslint-disable-line react-hooks/exhaustive-deps
  const enabled = !!(
    saved &&
    canEdit &&
    scope.userId &&
    scope.companyId &&
    scope.workspaceId &&
    scope.characterizationId
  );
  const listing = useQuery(
    ['characterization-illustrations', scopeId],
    () => api.list(stableScope),
    { enabled, retry: false, refetchOnWindowFocus: false, cacheTime: 0 },
  );
  const capabilities = useQuery(
    ['characterization-illustration-capabilities', scope.companyId, scopeId],
    () => api.capabilities(stableScope),
    { enabled, retry: false, refetchOnWindowFocus: false, cacheTime: 0 },
  );
  const flow = useMemo(
    () => new IllustrationFlow(api, stableScope, browserSessionStorage()),
    [api, stableScope],
  );
  const state = useSyncExternalStore(
    flow.subscribe,
    flow.snapshot,
    flow.snapshot,
  );
  const currentBillingMode =
    state.generation?.billingMode ?? capabilities.data?.billingMode;
  const previewId =
    state.generation?.status === 'READY' ? state.generation.generationId : '';
  const loadPreview = useCallback(
    (signal: AbortSignal) => api.preview(stableScope, previewId, signal),
    [api, stableScope, previewId],
  );
  const refresh = useCallback(async () => {
    await Promise.all([listing.refetch(), capabilities.refetch()]);
  }, [listing.refetch, capabilities.refetch]);
  const canGenerate =
    capabilities.isSuccess &&
    capabilities.data.canGenerate &&
    !capabilities.isFetching;
  const updateConsumption = async () => {
    await capabilities.refetch();
    void queryClient.invalidateQueries({
      predicate: (q) =>
        q.queryKey[0] === 'illustration-administration' &&
        ((q.queryKey[1] === scope.companyId &&
          (q.queryKey[3] === 'usage' || q.queryKey[3] === 'generations')) ||
          (q.queryKey[1] === capabilities.data?.billingCompanyId &&
            (q.queryKey[3] === 'platform-master-usage' ||
              q.queryKey[3] === 'platform-master-generations'))),
    });
  };
  const generate = async (regenerate = false) => {
    const current = await capabilities.refetch();
    if (!current.isSuccess || !current.data?.canGenerate) return;
    if (regenerate) await flow.regenerate(dirty);
    else await flow.generate(dirty);
    await updateConsumption();
  };
  const approve = async () => {
    if (await flow.approve()) await refresh();
  };
  const status = state.generation?.status;
  const canPreview =
    !!previewId &&
    (!state.generation?.expiresAt ||
      new Date(state.generation.expiresAt) > new Date());
  useEffect(() => {
    setOpen(false);
    setConfirmRegenerate(false);
  }, [scopeId]);
  if (!enabled) return null;
  return (
    <Box sx={{ mt: 2 }}>
      {capabilities.isLoading && (
        <Typography role="status">
          Consultando disponibilidade de geração…
        </Typography>
      )}
      {capabilities.isError && (
        <Alert severity="error">
          {(capabilities.error as Error).message}
          <Button onClick={() => void capabilities.refetch()}>
            Atualizar disponibilidade
          </Button>
        </Alert>
      )}
      {capabilities.data && !capabilities.data.canGenerate && (
        <Alert severity="info">
          {capabilityMessage(capabilities.data)}
          <Button onClick={() => void capabilities.refetch()}>
            Atualizar disponibilidade
          </Button>
        </Alert>
      )}
      {currentBillingMode === 'PLATFORM_MASTER' && (
        <Alert severity="info">Consumo atribuído à SimpleSST</Alert>
      )}
      <Button
        variant="outlined"
        type="button"
        disabled={!canGenerate}
        onClick={() => setOpen(true)}
      >
        Gerar ilustração com IA
      </Button>
      {state.pending && (
        <Button onClick={() => setOpen(true)}>
          Retomar tentativa existente
        </Button>
      )}
      {listing.isError && (
        <Alert severity="error">
          {(listing.error as Error).message}
          <Button onClick={() => void listing.refetch()}>
            Atualizar galeria
          </Button>
        </Alert>
      )}
      {listing.isLoading && (
        <Typography role="status">Carregando ilustrações…</Typography>
      )}
      {dirty && (
        <Typography variant="caption" display="block">
          Salve as alterações antes de gerar uma ilustração.
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
          gap: 2,
          mt: 2,
        }}
      >
        {(listing.data || []).map((row) => (
          <IllustrationCard
            key={row.id}
            id={row.id}
            api={api}
            scope={stableScope}
            refresh={refresh}
          />
        ))}
      </Box>
      <Dialog
        open={open}
        onClose={() => !state.busy && setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Gerar ilustração com IA</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            A imagem usa os textos já salvos deste elemento.{' '}
            {currentBillingMode === 'PLATFORM_MASTER'
              ? 'Consumo atribuído à SimpleSST'
              : 'Cada geração consome o limite disponível.'}
          </Alert>
          {capabilities.data && !capabilities.data.canGenerate && (
            <Alert severity="info">
              {capabilityMessage(capabilities.data)}
            </Alert>
          )}
          {capabilities.isError && (
            <Alert severity="error">
              {(capabilities.error as Error).message}
            </Alert>
          )}
          {dirty && (
            <Alert severity="warning">
              Salve as alterações da caracterização antes de gerar.
            </Alert>
          )}
          {state.busy && (
            <Box
              role="status"
              sx={{ display: 'flex', gap: 2, alignItems: 'center', my: 2 }}
            >
              <CircularProgress size={24} />
              Processando. Aguarde a confirmação da API.
            </Box>
          )}
          {state.error && (
            <Alert severity="error" sx={{ my: 1 }}>
              {state.error}
            </Alert>
          )}
          {state.pending && !state.generation && !state.busy && (
            <Alert severity="warning">
              {state.pending.generationId
                ? 'Solicitação registrada. Consulte o status antes de gerar outra imagem.'
                : 'Há uma solicitação pendente. Retome a mesma solicitação antes de gerar outra. Se a API ainda não a recebeu, a retomada poderá iniciar essa geração.'}
            </Alert>
          )}
          {canPreview && <PrivateImage load={loadPreview} preview />}
          {(status === 'GENERATING' || status === 'APPROVING') && (
            <Alert severity="info">
              Operação em andamento. Consulte o status para acompanhar.
            </Alert>
          )}
          {status === 'UNKNOWN' && (
            <Alert severity="warning">
              Resultado incerto. Aguarde a reconciliação da API; não gere outra
              imagem.
            </Alert>
          )}
          {(status === 'EXPIRED' || (previewId && !canPreview)) && (
            <Alert severity="warning">
              Prévia expirada. Consulte o status antes de iniciar outra
              solicitação.
            </Alert>
          )}
          {status === 'FAILED' && (
            <Alert severity="error">
              A geração falhou.{' '}
              {capabilities.data?.billingMode === 'PLATFORM_MASTER'
                ? 'Uma nova tentativa terá seu consumo atribuído à SimpleSST.'
                : 'Uma nova tentativa consumirá o limite disponível.'}
            </Alert>
          )}
          {state.approved && (
            <Alert severity="success">
              Ilustração aprovada e adicionada à galeria.
            </Alert>
          )}
          {status === 'APPROVED' && !state.approved && (
            <Alert severity="success">
              Esta solicitação já foi aprovada. Atualize a galeria para
              visualizá-la.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button disabled={state.busy} onClick={() => setOpen(false)}>
            Fechar
          </Button>
          {state.pending && !canPreview && (
            <Button
              disabled={
                state.busy || (!state.pending.generationId && !canGenerate)
              }
              onClick={() =>
                void flow.recover().then(() => {
                  if (flow.snapshot().generation?.status === 'APPROVED')
                    void refresh();
                })
              }
            >
              {state.pending.generationId
                ? 'Consultar status'
                : 'Retomar mesma solicitação'}
            </Button>
          )}
          {canPreview && (
            <>
              <Button disabled={state.busy} onClick={() => void flow.discard()}>
                Descartar
              </Button>
              <Button
                disabled={state.busy || dirty || !canGenerate}
                onClick={() => setConfirmRegenerate(true)}
              >
                Gerar outra imagem
              </Button>
              <Button
                variant="contained"
                disabled={state.busy}
                onClick={() => void approve()}
              >
                Aprovar e adicionar à galeria
              </Button>
            </>
          )}
          {!state.pending && (
            <Button
              variant="contained"
              disabled={state.busy || dirty || !canGenerate}
              onClick={() => void generate()}
            >
              Gerar imagem
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog
        open={open && confirmRegenerate}
        onClose={() => !state.busy && setConfirmRegenerate(false)}
      >
        <DialogTitle>Gerar outra imagem?</DialogTitle>
        <DialogContent>
          {capabilities.data?.billingMode === 'PLATFORM_MASTER'
            ? 'Uma nova geração terá seu consumo atribuído à SimpleSST.'
            : 'Uma nova geração consome o limite disponível.'}{' '}
          A prévia atual será descartada, sem aprovação.
        </DialogContent>
        <DialogActions>
          <Button
            disabled={state.busy}
            onClick={() => setConfirmRegenerate(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={state.busy || dirty || !canPreview || !canGenerate}
            onClick={() => {
              setConfirmRegenerate(false);
              void generate(true);
            }}
          >
            Confirmar nova geração
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
