import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import type { NioshMethodDraft } from './HoMethodFormModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HoMethodAvailabilityStatusEnum, type HoMethodRecord } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { browseHoMethods, resolveHoMethodDocumentUrl } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.service';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { RoutesEnum } from 'core/enums/routes.enums';
import { api } from 'core/services/apiClient';
import { useFetchHoMethodRiskSearch } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchHoMethodRiskSearch';
import { hoMethodLinkSx } from './ho-method-link-style';
import { getHoMethodApiErrorMessage } from '../utils/ho-method-error.util';

const HoMethodFormModal = dynamic(() =>
  import('./HoMethodFormModal').then((module) => module.HoMethodFormModal),
  { ssr: false },
);

type Agent = { id: string; name: string; cas?: string | null };
type NioshSearchEvidence = {
  status: 'NOT_FOUND';
  source: string;
  searchedAt: string;
  cas: string | null;
  casNumbers?: string[];
  names: string[];
  editions: number[];
};

type LinkedMethod = {
  id: string;
  institution: string;
  methodCode: string;
  casNumbers: string[];
  originalDocumentUrl: string | null;
  originalDocumentDownloadPath: string | null;
};

type CatalogMethod = {
  id: string;
  displayName: string;
  methodCode: string;
  methodVersion: string | null;
  linked: boolean;
  linkedCasNumbers: string[];
  matchedCasNumbers: string[];
  canLink: boolean;
};

type Result = {
  catalog?: CatalogMethod[];
  name: string;
  cas: string | null;
  casNumbers?: string[];
  names: string[];
  methods: {
    code: string;
    edition: string;
    title: string;
    url: string;
    matchedBy: 'CAS' | 'NAME';
    matchedCasNumbers?: string[];
  }[];
};

export function HoMethodNioshLookup({
  companyId,
  agent,
  recorded,
  onRecorded,
  onLinked,
  inRiskEditor = false,
  allowCatalogLink = false,
}: {
  companyId: string;
  agent?: Agent;
  recorded?: boolean;
  onRecorded?: (evidence: NioshSearchEvidence) => void;
  inRiskEditor?: boolean;
  allowCatalogLink?: boolean;
  onLinked?: () => void;
}) {
  const { isAuthSuccess } = useAuthShow();
  const canCreateMethod = isAuthSuccess({ permissions: [PermissionEnum.RISK], cruds: 'c' });
  const [nioshDraft, setNioshDraft] = useState<NioshMethodDraft | null>(null);
  const [pendingLink, setPendingLink] = useState<CatalogMethod | null>(null);
  const [linkedId, setLinkedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState<Agent | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const { data, isFetching } = useFetchHoMethodRiskSearch(
    input,
    companyId,
    open && !agent,
  );
  const target = agent ?? selected;
  const url = target
    ? `v2/companies/${encodeURIComponent(companyId)}/ho-methods/niosh/${encodeURIComponent(target.id)}`
    : '';
  const queryClient = useQueryClient();
  const linkedMethodsKey = ['risk-linked-ho-methods', companyId, target?.id];
  const linkedMethods = useQuery({
    queryKey: linkedMethodsKey,
    enabled: inRiskEditor && Boolean(url),
    queryFn: async () => (await api.get<LinkedMethod[]>(`${url}/linked-methods`)).data,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSelection, setCatalogSelection] = useState<HoMethodRecord | null>(null);
  const [catalogError, setCatalogError] = useState('');
  const [catalogSaving, setCatalogSaving] = useState(false);
  const catalogMethods = useQuery({
    queryKey: ['ho-method-risk-picker', companyId, catalogSearch],
    enabled: inRiskEditor && allowCatalogLink && pickerOpen,
    queryFn: () => browseHoMethods({ status: HoMethodAvailabilityStatusEnum.ACTIVE, search: catalogSearch, limit: 50 }),
  });
  const saveCatalogLink = async () => {
    if (!catalogSelection || !url || catalogSaving) return;
    setCatalogSaving(true);
    setCatalogError('');
    try {
      await api.post(`${url}/catalog/${encodeURIComponent(catalogSelection.id)}/manual-link`);
      await queryClient.invalidateQueries({ queryKey: linkedMethodsKey });
      setCatalogSelection(null);
      setCatalogSearch('');
      setLinkedId(target?.id ?? null);
      onLinked?.();
    } catch (cause) {
      setCatalogError(getHoMethodApiErrorMessage(cause, 'Não foi possível vincular o método.'));
    } finally {
      setCatalogSaving(false);
    }
  };
  const unmatchedCasNumbers =
    result?.casNumbers?.filter(
      (cas) =>
        !result.methods.some((method) =>
          method.matchedCasNumbers?.includes(cas),
        ),
    ) ?? [];
  const editUrl =
    target &&
    RoutesEnum.RISK_EDIT.replace(
      ':companyId',
      encodeURIComponent(companyId),
    ).replace(':riskId', encodeURIComponent(target.id));

  const run = async (save: boolean) => {
    if (!url || !target || busy) return;
    setBusy(true);
    setError('');
    if (!save) setResult(null);
    try {
      if (save) {
        const { data: evidence } = await api.post<NioshSearchEvidence>(
          `${url}/not-found`,
        );
        setSavedId(target.id);
        onRecorded?.(evidence);
      } else {
        const response = await api.get<Result>(url);
        setResult(response.data);
      }
    } catch (cause) {
      setError(
        getHoMethodApiErrorMessage(
          cause,
          'Não foi possível concluir a consulta.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const link = async () => {
    if (!url || !pendingLink || busy) return;
    setBusy(true);
    setError('');
    try {
      await api.post(`${url}/catalog/${encodeURIComponent(pendingLink.id)}/link`, {
        casNumbers: pendingLink.matchedCasNumbers,
      });
      setResult((current) => current && ({
        ...current,
        catalog: current.catalog?.map((method) => method.id === pendingLink.id
          ? { ...method, linked: true, linkedCasNumbers: method.matchedCasNumbers }
          : method),
      }));
      setLinkedId(target?.id ?? null);
      setPendingLink(null);
      if (inRiskEditor) void queryClient.invalidateQueries({ queryKey: linkedMethodsKey });
      onLinked?.();
    } catch (cause) {
      setError(getHoMethodApiErrorMessage(cause, 'Não foi possível vincular o método.'));
    } finally {
      setBusy(false);
    }
  };
  const hasLinkedMethod = result?.catalog?.some((method) => method.linked);

  return (
    <>
      {inRiskEditor && (
        <Typography variant="subtitle2" color="text.primary" sx={{ mb: 2 }}>
          Métodos vinculados
        </Typography>
      )}
      {inRiskEditor && !linkedMethods.isError && (
        linkedMethods.isPending || !linkedMethods.data?.length
      ) && (
        <Typography variant="body2" color="text.secondary">
          {linkedMethods.isPending ? 'Carregando métodos…' : 'Nenhum método vinculado'}
        </Typography>
      )}
      {!!linkedMethods.data?.length && (
        <Stack spacing={2} mb={2} aria-label="Métodos de HO vinculados">
          {linkedMethods.data.map((method) => {
            const label = `${method.institution} ${method.methodCode}`;
            const pdfUrl = method.originalDocumentUrl || method.originalDocumentDownloadPath
              ? resolveHoMethodDocumentUrl(method)
              : null;

            return (
              <Typography key={method.id} variant="body2" color="text.dark">
                {pdfUrl ? (
                  <Link
                    sx={hoMethodLinkSx}
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir PDF do método ${label}`}
                  >
                    {label} (PDF)
                  </Link>
                ) : label}
                {method.casNumbers.length > 0 && ` · CAS ${method.casNumbers.join('; ')}`}
              </Typography>
            );
          })}
        </Stack>
      )}
      {linkedMethods.isError && (
        <Typography variant="caption" display="block" color="error.main">
          Não foi possível carregar os métodos vinculados.
        </Typography>
      )}
      {inRiskEditor && allowCatalogLink && (
        <Stack spacing={2} sx={{ my: 3 }}>
          <Autocomplete
            size="small"
            options={(catalogMethods.data?.results ?? []).filter((method) =>
              method.agentType === 'CHEMICAL' &&
              !linkedMethods.data?.some(({ id }) => id === method.id),
            )}
            value={catalogSelection}
            inputValue={catalogSearch}
            filterOptions={(options) => options}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(method) => {
              const code = `${method.institution} ${method.methodCode}`;
              return method.displayName.startsWith(code) ? method.displayName : `${code} · ${method.displayName}`;
            }}
            onOpen={() => setPickerOpen(true)}
            onClose={() => setPickerOpen(false)}
            onInputChange={(_, value) => setCatalogSearch(value)}
            onChange={(_, value) => {
              setCatalogSelection(value);
              setCatalogError('');
            }}
            loading={catalogMethods.isFetching}
            disabled={catalogSaving}
            noOptionsText={catalogMethods.isError ? 'Erro ao consultar o catálogo' : 'Nenhum método encontrado'}
            renderInput={(params) => (
              <TextField {...params} label="Vincular método do catálogo" placeholder="Busque pelo nome ou código" />
            )}
          />
          {catalogSelection && (
            <Button
              type="button"
              onClick={() => void saveCatalogLink()}
              disabled={catalogSaving}
              sx={{ alignSelf: 'flex-start' }}
            >
              {catalogSaving ? 'Vinculando…' : 'Confirmar vínculo'}
            </Button>
          )}
          {catalogError && <Alert severity="error">{catalogError}</Alert>}
        </Stack>
      )}
      <Link
        sx={hoMethodLinkSx}
        component="button"
        type="button"
        variant="caption"
        onClick={() => { setPendingLink(null); setOpen(true); }}
      >
        Pesquisa automática no NIOSH
      </Link>
      {agent && !linkedMethods.data?.length && linkedId !== agent.id && (recorded || savedId === agent.id) && (
        <Typography variant="caption" display="block" color="text.secondary">
          Método não encontrado no NIOSH NMAM
        </Typography>
      )}
      <Dialog
        open={open && !nioshDraft}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={(theme) => ({
            ...(theme.palette.mode === 'dark' && { color: 'text.dark' }),
          })}
        >
          Pesquisar métodos no NIOSH NMAM
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={4}>
            {agent ? (
              <Typography color="text.primary">
                {agent.name}
                {agent.cas && ` · CAS ${agent.cas}`}
              </Typography>
            ) : (
              <Autocomplete<Agent>
                value={selected}
                options={data ?? []}
                filterOptions={(options) => options}
                loading={isFetching}
                disabled={busy}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) =>
                  option.cas
                    ? `${option.name} · CAS ${option.cas}`
                    : option.name
                }
                onInputChange={(_, value) => setInput(value)}
                onChange={(_, value) => {
                  setSelected(value);
                  setResult(null);
                  setPendingLink(null);
                  setError('');
                }}
                noOptionsText="Digite o nome ou CAS do agente"
                renderInput={(params) => (
                  <TextField {...params} label="Fator de risco químico" />
                )}
              />
            )}
            <Link
              sx={hoMethodLinkSx}
              href="https://www.cdc.gov/niosh/nmam/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pesquisa manual no NIOSH ↗
            </Link>
            {error && <Alert severity="error">{error}</Alert>}
            {result && (
              <>
                <Typography variant="body2" color="text.primary">
                  Busca no índice oficial da 4ª e da 5ª edições.
                  {result.casNumbers?.length
                    ? ` CAS consultados: ${result.casNumbers.join('; ')}.`
                    : result.cas && ` CAS: ${result.cas}.`}{' '}
                  Nomes: {result.names.join('; ')}.
                </Typography>
                {!!result.catalog?.length && (
                  <Stack spacing={4}>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      Métodos no cadastro de HO
                    </Typography>
                    {result.catalog.map((method) => (
                      <Box key={method.id}>
                        <Typography variant="body2" color="text.primary">
                          {method.displayName.startsWith(`NIOSH ${method.methodCode} —`)
                            ? method.displayName
                            : `NIOSH ${method.methodCode} — ${method.displayName}`}
                          {method.methodVersion && ` · ${method.methodVersion}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {method.linked
                            ? `Vinculado ao fator${method.linkedCasNumbers.length ? ` · CAS ${method.linkedCasNumbers.join('; ')}` : ''}`
                            : method.matchedCasNumbers.length
                              ? `Correspondência no índice: CAS ${method.matchedCasNumbers.join('; ')}`
                              : 'Correspondência apenas por nome no índice.'}
                        </Typography>
                        {!method.linked && method.canLink && !!method.matchedCasNumbers.length && (
                          <Button size="small" disabled={busy} onClick={() => setPendingLink(method)}>
                            Vincular método
                          </Button>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
                {pendingLink && (
                  <Alert severity="warning">
                    Vincular NIOSH {pendingLink.methodCode} ao fator do catálogo padrão para o CAS{' '}
                    {pendingLink.matchedCasNumbers.join('; ')}? As condições de avaliação podem ser
                    preenchidas depois no cadastro do método.
                  </Alert>
                )}
                {result.methods.length ? (
                  <>
                    <Typography variant="body2" color="text.primary">
                      Confira a aplicação ao agente no documento original.
                    </Typography>
                    {result.casNumbers &&
                      result.casNumbers.length > 1 &&
                      unmatchedCasNumbers.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          CAS sem correspondência no índice:{' '}
                          {unmatchedCasNumbers.join('; ')}.
                        </Typography>
                      )}
                    <Box component="ul" sx={{ pl: 10, my: 0 }}>
                      {result.methods.map((method, index) => {
                        const casNumbers = method.matchedCasNumbers ?? [];
                        const label = `NIOSH ${method.code} — ${method.title}`;
                        const canRegister = canCreateMethod && target && casNumbers.length > 0 &&
                          result.catalog && !result.catalog.some(({ methodCode }) => methodCode === method.code);

                        return (
                          <li key={`${method.url}:${index}`}>
                            {canRegister ? (
                              <Link
                                sx={hoMethodLinkSx}
                                component="button"
                                type="button"
                                onClick={() => setNioshDraft({ ...method, agent: target, casNumbers })}
                                aria-label={`Cadastrar e vincular ${label}`}
                              >
                                {label} · Cadastrar e vincular
                              </Link>
                            ) : (
                              <Link sx={hoMethodLinkSx} href={method.url} target="_blank" rel="noopener noreferrer">
                                {label}
                              </Link>
                            )}
                            <Typography variant="caption" display="block" color="text.secondary">
                              {method.edition === '5th' ? '5ª' : '4ª'} edição ·{' '}
                              {method.matchedBy === 'CAS'
                                ? `CAS ${casNumbers.join('; ')}`
                                : 'Nome ou sinônimo'}
                            </Typography>
                          </li>
                        );
                      })}
                    </Box>
                  </>
                ) : !hasLinkedMethod && (
                  <>
                    <Alert
                      severity={savedId === target?.id ? 'success' : 'info'}
                    >
                      {savedId === target?.id
                        ? 'Resultado registrado no fator de risco.'
                        : 'Método não encontrado no índice consultado do NIOSH NMAM. Deseja registrar esse resultado no fator de risco?'}
                    </Alert>
                    {editUrl && !inRiskEditor && (
                      <Link
                        sx={hoMethodLinkSx}
                        href={editUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir cadastro do fator de risco ↗
                      </Link>
                    )}
                  </>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap' }}>
          <Button disabled={busy} onClick={() => setOpen(false)}>
            Fechar
          </Button>
          {pendingLink && <>
            <Button disabled={busy} onClick={() => setPendingLink(null)}>Cancelar vínculo</Button>
            <Button variant="contained" disabled={busy} onClick={() => void link()}>Confirmar vínculo</Button>
          </>}
          {result && result.methods.length === 0 && !hasLinkedMethod && savedId !== target?.id && (
            <Button disabled={busy} onClick={() => void run(true)}>
              Registrar resultado
            </Button>
          )}
          <Button
            variant="contained"
            disabled={!target || busy || !!pendingLink}
            onClick={() => void run(false)}
          >
            {busy ? 'Aguarde…' : 'Pesquisar'}
          </Button>
        </DialogActions>
      </Dialog>
      {nioshDraft && (
        <HoMethodFormModal
          open
          method={null}
          nioshDraft={nioshDraft}
          onClose={() => setNioshDraft(null)}
          onSaved={() => {
            setOpen(false);
            setResult(null);
            setLinkedId(target?.id ?? null);
            void queryClient.invalidateQueries({ queryKey: linkedMethodsKey });
            void queryClient.invalidateQueries({ queryKey: ['ho-method-risk-picker', companyId] });
            onLinked?.();
          }}
        />
      )}
    </>
  );
}
