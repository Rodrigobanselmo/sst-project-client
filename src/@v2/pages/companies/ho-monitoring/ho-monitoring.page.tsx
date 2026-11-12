import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { CompanyWorkspaceContextualNavBar } from 'components/organisms/main/CompanyFlow/CompanyWorkspaceContextualNavBar';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { HoMethodsPage } from '@v2/pages/companies/ho-methods/ho-methods.page';
import { useAuth } from 'core/contexts/AuthContext';
import { useEnsureCharacterizationTabWorkspace } from 'core/hooks/useEnsureCharacterizationTabWorkspace';
import { HoMethodLaboratoryAvailabilityStatusEnum } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import {
  CampaignDraft,
  CampaignRiskLevel,
  defaultLevels,
  loadChemicalFactors,
  loadMethodsByFactor,
  readDrafts,
  riskLevels,
} from './ho-campaign-data';

function Campaigns({
  companyId,
  workspaceId,
  userId,
}: {
  companyId: string;
  workspaceId: string;
  userId: number;
}) {
  const storageKey = `sst:ho-campaigns:v1:${userId}:${companyId}:${workspaceId}`;
  const [drafts, setDrafts] = useState<CampaignDraft[]>([]);
  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      setDrafts(readDrafts(storageKey));
    } catch {
      setStorageError(true);
    }
  }, [storageKey]);

  const risks = useQuery(
    ['ho-campaign-factors', companyId, workspaceId],
    () => loadChemicalFactors(companyId, workspaceId),
    { enabled: !!draft },
  );
  const methods = useQuery(
    ['ho-campaign-methods', userId, companyId],
    loadMethodsByFactor,
    { enabled: !!draft && !!risks.data?.length },
  );

  const exposures =
    risks.data?.flatMap((factor) =>
      (factor.riskFactorData ?? []).map((exposure) => ({ factor, exposure })),
    ) ?? [];
  const candidates = exposures.filter(({ exposure }) =>
    draft?.levels.some((level) => level === exposure.level),
  );
  const pendingClassification = exposures.filter(
    ({ exposure }) => !exposure.level,
  );
  const selected = candidates.filter(({ exposure }) =>
    draft?.exposureIds.includes(exposure.id),
  );

  const allCandidatesSelected = selected.length === candidates.length;

  function toggleCandidateSelection() {
    const candidateIds = new Set(candidates.map(({ exposure }) => exposure.id));
    setDraft((current) => {
      if (!current) return current;
      const exposureIds = allCandidatesSelected
        ? current.exposureIds.filter((id) => !candidateIds.has(id))
        : [...new Set([...current.exposureIds, ...candidateIds])];
      return { ...current, exposureIds };
    });
  }

  function changeLevel(level: CampaignRiskLevel, checked: boolean) {
    setDraft((current) => {
      if (!current) return current;
      const levels = checked
        ? [...current.levels, level]
        : current.levels.filter((item) => item !== level);
      return { ...current, levels };
    });
  }

  function saveDraft() {
    if (!draft || !draft.name.trim() || !selected.length) return;
    const saved = {
      ...draft,
      name: draft.name.trim(),
      exposureIds: selected.map(({ exposure }) => exposure.id),
    };
    try {
      const next = [
        saved,
        ...readDrafts(storageKey).filter(({ id }) => id !== saved.id),
      ];
      localStorage.setItem(storageKey, JSON.stringify(next));
      setDrafts(next);
      setDraft(null);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  return (
    <Stack spacing={8}>
      {storageError && (
        <Alert severity="error">
          Não foi possível acessar os rascunhos deste navegador.
        </Alert>
      )}
      {!draft ? (
        <>
          <Box>
            <Button
              variant="contained"
              onClick={() =>
                setDraft({
                  id: crypto.randomUUID(),
                  name: '',
                  levels: defaultLevels,
                  exposureIds: [],
                })
              }
            >
              Nova campanha
            </Button>
          </Box>
          {!drafts.length && (
            <Typography color="text.secondary">
              Nenhuma campanha salva neste estabelecimento.
            </Typography>
          )}
          {drafts.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 8 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={8}
              >
                <Box>
                  <Typography fontWeight={600}>{item.name}</Typography>
                  <Typography color="text.secondary">
                    {item.exposureIds.length} exposições · Rascunho local
                  </Typography>
                </Box>
                <Button onClick={() => setDraft(item)}>Retomar</Button>
              </Stack>
            </Paper>
          ))}
        </>
      ) : (
        <>
          <Stack direction="row" flexWrap="wrap" alignItems="center" gap={6}>
            <Typography component="h2" variant="h6">
              Planejamento da campanha
            </Typography>
            <Chip label="Agentes químicos" size="small" />
            <Button onClick={() => setMethodsOpen(true)} size="small">
              Cadastro de métodos de HO
            </Button>
          </Stack>
          <TextField
            label="Nome da campanha"
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            inputProps={{ maxLength: 160 }}
            required
            sx={{ maxWidth: 520 }}
          />
          <Box component="fieldset" sx={{ m: 0, p: 0, border: 0 }}>
            <Typography component="legend" fontWeight={600}>
              Níveis de risco a incluir
            </Typography>
            <FormGroup row>
              {riskLevels.map((level) => (
                <FormControlLabel
                  key={level}
                  label={matrixRiskMap[level].label}
                  control={
                    <Checkbox
                      checked={draft.levels.includes(level)}
                      onChange={(_, checked) => changeLevel(level, checked)}
                    />
                  }
                />
              ))}
            </FormGroup>
          </Box>
          {risks.isFetching && (
            <Alert severity="info">
              Consultando as exposições da Caracterização…
            </Alert>
          )}
          {risks.isError && (
            <Alert
              severity="error"
              action={
                <Button onClick={() => risks.refetch()}>
                  Tentar novamente
                </Button>
              }
            >
              Não foi possível consultar os riscos do estabelecimento.
            </Alert>
          )}
          {pendingClassification.length > 0 && (
            <Alert severity="warning">
              {pendingClassification.length} exposições químicas sem nível
              calculado. Revise a probabilidade na Caracterização para
              incluí-las na triagem.
            </Alert>
          )}
          {methods.isError && (
            <Alert
              severity="warning"
              action={
                <Button onClick={() => methods.refetch()}>
                  Tentar novamente
                </Button>
              }
            >
              O catálogo de métodos está indisponível. A revisão técnica fica
              pendente.
            </Alert>
          )}
          {risks.isSuccess && !candidates.length && (
            <Alert severity="info">
              Nenhuma exposição química nos níveis selecionados.
            </Alert>
          )}
          {candidates.length > 0 && (
            <Box>
              <Button
                variant="outlined"
                size="small"
                disabled={risks.isError}
                onClick={toggleCandidateSelection}
              >
                {allCandidatesSelected ? 'Desmarcar todos' : 'Selecionar todos'}
              </Button>
            </Box>
          )}
          {candidates.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table
                size="small"
                aria-label="Exposições químicas candidatas"
                sx={{ minWidth: 760 }}
              >
                <TableHead>
                  <TableRow>
                    {[
                      'Incluir',
                      'Fator de risco',
                      'Origem da exposição',
                      'Nível',
                      'Método',
                      'Referência',
                      'Laboratório',
                    ].map((label) => (
                      <TableCell key={label}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map(({ factor, exposure }) => {
                    const linked = methods.data?.get(factor.id) ?? [];
                    const hasReference = [
                      factor.nr15lt,
                      factor.vmp,
                      factor.twa,
                      factor.stel,
                      factor.acgihCeiling,
                    ].some((value) => value && /\d/.test(value));
                    const hasLaboratory = linked.some((method) =>
                      method.laboratories.some(
                        (lab) =>
                          lab.availabilityStatus ===
                          HoMethodLaboratoryAvailabilityStatusEnum.AVAILABLE,
                      ),
                    );
                    const level = exposure.level as CampaignRiskLevel;
                    return (
                      <TableRow key={`${factor.id}:${exposure.id}`}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            inputProps={{
                              'aria-label': `Incluir ${factor.name} — ${exposure.origin || 'origem sem descrição'}`,
                            }}
                            checked={draft.exposureIds.includes(exposure.id)}
                            onChange={(_, checked) =>
                              setDraft({
                                ...draft,
                                exposureIds: checked
                                  ? [...draft.exposureIds, exposure.id]
                                  : draft.exposureIds.filter(
                                      (id) => id !== exposure.id,
                                    ),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>{factor.name}</TableCell>
                        <TableCell>
                          {exposure.origin || 'Sem descrição'}
                        </TableCell>
                        <TableCell>
                          {exposure.resolvedLabel || matrixRiskMap[level].label}
                        </TableCell>
                        <TableCell>
                          {methods.isFetching
                            ? 'Consultando'
                            : linked.length
                              ? linked
                                  .map(
                                    (method) =>
                                      `${method.institution} ${method.methodCode}`,
                                  )
                                  .join(', ')
                              : methods.isSuccess
                                ? 'Sem vínculo no catálogo'
                                : 'Consulta pendente'}
                        </TableCell>
                        <TableCell>
                          {hasReference
                            ? 'Cadastrada · revisar aplicação'
                            : 'Revisar referência'}
                        </TableCell>
                        <TableCell>
                          {hasLaboratory
                            ? 'Disponível no cadastro · confirmar'
                            : 'Disponibilidade a confirmar'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Stack direction="row" flexWrap="wrap" alignItems="center" gap={8}>
            <Button onClick={() => setDraft(null)}>
              Voltar para campanhas
            </Button>
            <Button
              variant="contained"
              onClick={saveDraft}
              disabled={
                !draft.name.trim() ||
                !selected.length ||
                risks.isFetching ||
                risks.isError
              }
            >
              Salvar rascunho local ({selected.length})
            </Button>
          </Stack>
        </>
      )}
      <Dialog
        fullScreen
        open={methodsOpen}
        onClose={() => setMethodsOpen(false)}
        aria-labelledby="campaign-methods-title"
      >
        <DialogTitle id="campaign-methods-title">
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
            gap={4}
          >
            Cadastro de Métodos de HO
            <Button onClick={() => setMethodsOpen(false)}>
              Voltar para a campanha
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <HoMethodsPage />
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

export function HoMonitoringPage() {
  const router = useRouter();
  const { user } = useAuth();
  const companyId =
    typeof router.query.companyId === 'string' ? router.query.companyId : '';
  const { workspaceId, isWorkspaceFilterReady } =
    useEnsureCharacterizationTabWorkspace({ companyId });

  return (
    <>
      <SHeaderTag title="Monitoramento de HO" />
      <SContainer>
        <CompanyWorkspaceContextualNavBar companyId={companyId} />
        <Tabs value="campaigns" aria-label="Monitoramento de HO" sx={{ mb: 8 }}>
          <Tab value="campaigns" label="Campanhas" />
        </Tabs>
        {(!isWorkspaceFilterReady || user?.id == null) && (
          <Alert severity="info">Carregando o contexto da campanha…</Alert>
        )}
        {isWorkspaceFilterReady && !workspaceId && (
          <Alert severity="info">
            Selecione um estabelecimento para planejar uma campanha.
          </Alert>
        )}
        {companyId &&
          workspaceId &&
          isWorkspaceFilterReady &&
          user?.id != null && (
            <Campaigns
              key={`${user.id}:${companyId}:${workspaceId}`}
              companyId={companyId}
              workspaceId={workspaceId}
              userId={user.id}
            />
          )}
      </SContainer>
    </>
  );
}
