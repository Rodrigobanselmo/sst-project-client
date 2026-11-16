import { useState } from 'react';
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

type Agent = { id: string; name: string; cas?: string | null };
type NioshSearchEvidence = {
  status: 'NOT_FOUND';
  source: string;
  searchedAt: string;
  cas: string | null;
  names: string[];
  editions: number[];
};

type Result = {
  name: string;
  cas: string | null;
  names: string[];
  methods: {
    code: string;
    edition: string;
    title: string;
    url: string;
    matchedBy: 'CAS' | 'NAME';
  }[];
};

export function HoMethodNioshLookup({
  companyId,
  agent,
  recorded,
  onRecorded,
  inRiskEditor = false,
}: {
  companyId: string;
  agent?: Agent;
  recorded?: boolean;
  onRecorded?: (evidence: NioshSearchEvidence) => void;
  inRiskEditor?: boolean;
}) {
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

  return (
    <>
      <Link
        sx={hoMethodLinkSx}
        component="button"
        type="button"
        variant="caption"
        onClick={() => setOpen(true)}
      >
        Pesquisa automática no NIOSH
      </Link>
      {agent && (recorded || savedId === agent.id) && (
        <Typography variant="caption" display="block" color="text.secondary">
          Método não encontrado no NIOSH NMAM
        </Typography>
      )}
      <Dialog
        open={open}
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
                  {result.cas && ` CAS: ${result.cas}.`} Nomes:{' '}
                  {result.names.join('; ')}.
                </Typography>
                {result.methods.length ? (
                  <>
                    <Typography variant="body2" color="text.primary">
                      Confira a aplicação ao agente no documento original.
                    </Typography>
                    <Box component="ul" sx={{ pl: 10, my: 0 }}>
                      {result.methods.map((method, index) => (
                        <li key={`${method.url}:${index}`}>
                          <Link
                            sx={hoMethodLinkSx}
                            href={method.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            NIOSH {method.code} — {method.title}
                          </Link>
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {method.edition === '5th' ? '5ª' : '4ª'} edição ·{' '}
                            {method.matchedBy === 'CAS'
                              ? 'CAS'
                              : 'Nome ou sinônimo'}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </>
                ) : (
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
          {result && result.methods.length === 0 && savedId !== target?.id && (
            <Button disabled={busy} onClick={() => void run(true)}>
              Registrar resultado
            </Button>
          )}
          <Button
            variant="contained"
            disabled={!target || busy}
            onClick={() => void run(false)}
          >
            {busy ? 'Aguarde…' : 'Pesquisar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
