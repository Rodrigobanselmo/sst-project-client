import { HoCampaignPlanning, HoPlanning } from './ho-campaign-planning';
import { HoDeleteConfirmation } from './ho-delete-confirmation';
import { downloadHoJustification } from './ho-justification-pdf';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Chip,
  Tab,
  Tabs,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { api } from 'core/services/apiClient';
import { HoMethodRecord } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

export type Entry = {
  exposureId: string;
  factorId: string;
  name: string;
  cas: string | null;
  origin: string;
  level: number;
  levelLabel: string | null;
  eligible: boolean;
  reason: string | null;
  justification: string | null;
  methods: HoMethodRecord[];
};
export type Snapshot = {
  context?: {
    companyId: string;
    workspaceId: string;
    companyName: string;
    workspaceName: string;
  };
  fingerprint: string;
  levels: number[];
  consolidatedAt?: string;
  consolidatedById?: number;
  libraries: { id: string; name: string }[];
  entries: Entry[];
  pendingClassification: number;
};
export type Campaign = {
  id: string;
  name: string;
  revision: number;
  stage: string;
  createdAt: string;
  selectedExposureIds: string[];
  snapshot: Snapshot;
  planning?: HoPlanning | null;
};

function planningStatus(campaign: Campaign) {
  return campaign.planning?.step === 'METHODS_CONFIRMED'
    ? campaign.planning.sampling
      ? '3.3 Estratégia salva · Parâmetros de coleta pendentes'
      : '3.2 concluída · Estratégia de amostragem pendente'
    : campaign.planning
      ? '3.2 Escolha de métodos pendente'
      : '3.1 Escolha de laboratórios pendente';
}

function errorMessage(error: any) {
  const message = error?.response?.data?.message;
  return Array.isArray(message)
    ? message.join(' ')
    : message || 'Não foi possível concluir a operação. Tente novamente.';
}

export function HoConsolidation({
  companyId,
  workspaceId,
  draft,
  activeCampaignId,
  onOpenCampaign,
  onConsolidated,
  onBack,
}: {
  companyId: string;
  workspaceId: string;
  draft: { id: string; name: string; levels: number[] } | null;
  activeCampaignId: string | null;
  onOpenCampaign: (id: string) => void;
  onConsolidated: (id: string) => void;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const base = `/v2/companies/${companyId}/workspaces/${workspaceId}/ho-campaigns`;
  const records = useQuery(
    ['ho-campaigns-persisted', companyId, workspaceId],
    async () => (await api.get<Campaign[]>(base)).data,
  );
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Snapshot | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');
  const [planningTab, setPlanningTab] = useState('selected');
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  useEffect(() => {
    setOpen(false);
    setPreview(null);
    setCampaign(null);
    setSelection([]);
    setError('');
    setDeleteTarget(null);
  }, [companyId, workspaceId]);
  const snapshot = campaign?.snapshot || preview;
  const eligible = snapshot?.entries.filter((e) => e.eligible) || [];
  const excluded = snapshot?.entries.filter((e) => !e.eligible) || [];
  const stage = !campaign ? 0 : campaign.stage === 'PLANNING' ? 2 : 1;
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function begin() {
    setPreview(null);
    setCampaign(null);
    setSelection([]);
    setOpen(true);
    setRequestId(crypto.randomUUID());
    void run(async () => {
      setPreview(
        (await api.post<Snapshot>(`${base}/preview`, { levels: draft!.levels }))
          .data,
      );
    });
  }
  function resume(item: Campaign) {
    setError('');
    setCampaign(item);
    setPreview(null);
    setSelection(item.selectedExposureIds);
    setOpen(true);
  }
  async function consolidate() {
    if (!preview || !draft) return;
    await run(async () => {
      const saved = (
        await api.post<Campaign>(base, {
          id: requestId,
          name: draft.name.trim(),
          levels: draft.levels,
          fingerprint: preview.fingerprint,
        })
      ).data;
      setCampaign(saved);
      setSelection(saved.selectedExposureIds);
      onConsolidated(saved.id);
      await records.refetch();
    });
  }
  async function advance() {
    if (!campaign) return;
    await run(async () => {
      const saved = (
        await api.post<Campaign>(`${base}/${campaign.id}/advance`, {
          revision: campaign.revision,
          exposureIds: selection,
        })
      ).data;
      setCampaign(saved);
      await records.refetch();
      setOpen(false);
      onOpenCampaign(saved.id);
    });
  }
  async function removeCampaign() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    await run(async () => {
      await api.delete(`${base}/${target.id}`, {
        data: { revision: target.revision },
      });
      queryClient.setQueryData<Campaign[]>(
        ['ho-campaigns-persisted', companyId, workspaceId],
        (current) => (current ?? []).filter((item) => item.id !== target.id),
      );
      await records.refetch();
      setDeleteTarget(null);
      if (activeCampaignId === target.id) onBack();
    });
  }
  const activeCampaign = records.data?.find(
    (item) => item.id === activeCampaignId,
  );
  const activeSelected =
    activeCampaign?.snapshot.entries.filter(
      (e) =>
        e.eligible && activeCampaign.selectedExposureIds.includes(e.exposureId),
    ) || [];
  const activeEligible =
    activeCampaign?.snapshot.entries.filter((e) => e.eligible) || [];
  const activeExcluded =
    activeCampaign?.snapshot.entries.filter((e) => !e.eligible) || [];
  function closeReview() {
    setOpen(false);
    if (campaign) onOpenCampaign(campaign.id);
  }
  async function download(c: Campaign) {
    await run(() => downloadHoJustification(c));
  }
  return (
    <>
      {activeCampaignId && (
        <Stack spacing={8}>
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={6}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography component="h2" variant="h5">
                {activeCampaign?.name || 'Campanha'}
              </Typography>
              <Typography color="text.secondary">
                Planejamento de monitoramento químico
              </Typography>
            </Box>
            <Stack direction="row" gap={4} flexWrap="wrap">
              <Button onClick={onBack}>Voltar para campanhas</Button>
              {activeCampaign && (
                <Button
                  color="error"
                  disabled={busy}
                  onClick={() => {
                    setError('');
                    setDeleteTarget(activeCampaign);
                  }}
                >
                  Excluir campanha
                </Button>
              )}
            </Stack>
          </Stack>
          {records.isLoading && (
            <Typography role="status">Carregando a campanha salva…</Typography>
          )}
          {records.isError && (
            <Alert severity="error">
              Não foi possível carregar a campanha.{' '}
              <Button onClick={() => void records.refetch()}>
                Tentar novamente
              </Button>
            </Alert>
          )}
          {records.isSuccess && !activeCampaign && (
            <Alert severity="warning">
              Campanha não encontrada neste estabelecimento.{' '}
              <Button onClick={onBack}>Ver campanhas</Button>
            </Alert>
          )}
          {activeCampaign && (
            <>
              <Stepper
                activeStep={activeCampaign.stage === 'PLANNING' ? 2 : 1}
                alternativeLabel
              >
                {[
                  'Consolidação salva',
                  'Seleção de exposições',
                  'Planejamento da coleta',
                ].map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Stack direction="row" flexWrap="wrap" gap={6}>
                <Chip color="success" label="Consolidação concluída" />
                <Chip
                  color="warning"
                  label={
                    activeCampaign.stage === 'PLANNING'
                      ? planningStatus(activeCampaign)
                      : 'Seleção pendente'
                  }
                />
                <Chip
                  label={`${activeSelected.length} selecionadas para planejamento`}
                />
                <Chip
                  variant="outlined"
                  label={`${activeEligible.length} elegíveis no total`}
                />
                <Chip
                  variant="outlined"
                  label={`${activeExcluded.length} no âmbito qualitativo`}
                />
              </Stack>
              {activeCampaign.stage === 'PLANNING' ? (
                <Alert severity="info">
                  <Typography fontWeight={600}>
                    Etapa atual: planejamento da coleta
                  </Typography>
                  {activeCampaign.planning?.step === 'METHODS_CONFIRMED'
                    ? activeCampaign.planning.sampling
                      ? 'Jornada, estratégia e coberturas estão salvas na etapa 3.3. O plano ainda depende da definição dos parâmetros de coleta: amostrador, vazão, tempo e volume.'
                      : 'Laboratórios e métodos estão confirmados. Defina a jornada, a estratégia e as coberturas na etapa 3.3.'
                    : 'Defina os laboratórios em 3.1 e compare os métodos em 3.2. Depois serão definidos os parâmetros adotados de coleta: amostrador, vazão, tempo e volume.'}
                </Alert>
              ) : (
                <Alert severity="info">
                  Os métodos e as justificativas já estão salvos. Selecione as
                  exposições elegíveis que deseja levar para o planejamento.
                  <Button onClick={() => resume(activeCampaign)}>
                    Selecionar exposições
                  </Button>
                </Alert>
              )}
              {error && !open && <Alert severity="error">{error}</Alert>}
              <Stack direction="row" flexWrap="wrap" gap={6}>
                <Button
                  variant="outlined"
                  disabled={busy}
                  onClick={() => void download(activeCampaign)}
                >
                  {busy ? 'Gerando PDF…' : 'Baixar justificativa em PDF'}
                </Button>
                <Box id={`ho-campaign-documents-${activeCampaign.id}`} sx={{ display: 'contents' }} />
              </Stack>
              <Tabs
                value={planningTab}
                onChange={(_, value) => setPlanningTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="Planejamento e decisões da campanha"
              >
                <Tab
                  value="selected"
                  label={`Planejamento (${activeSelected.length})`}
                />
                <Tab value="decisions" label="Decisões da consolidação" />
              </Tabs>
              {planningTab === 'selected' ? (
                activeCampaign.stage === 'PLANNING' ? (
                  <HoCampaignPlanning
                    base={base}
                    campaignId={activeCampaign.id}
                    revision={activeCampaign.revision}
                    onSaved={() => records.refetch()}
                  />
                ) : (
                  <>
                    <Typography component="h3" variant="h6">
                      Exposições selecionadas para planejamento
                    </Typography>
                    {!activeSelected.length ? (
                      <Typography>
                        Nenhuma exposição encaminhada. Conclua a seleção dos
                        elegíveis.
                      </Typography>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small" sx={{ minWidth: 680 }}>
                          <TableHead>
                            <TableRow>
                              <TableCell>Agente / CAS</TableCell>
                              <TableCell>Origem da exposição</TableCell>
                              <TableCell>
                                Opções disponíveis na consolidação
                              </TableCell>
                              <TableCell>Parâmetros de coleta</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {activeSelected.map((e) => (
                              <TableRow key={e.exposureId}>
                                <TableCell>
                                  {e.name}
                                  <Typography variant="caption" display="block">
                                    CAS {e.cas || 'não informado'}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'pre-line' }}>
                                  {e.origin}
                                </TableCell>
                                <TableCell>
                                  {e.methods.map((m) => (
                                    <Typography key={m.id} variant="body2">
                                      {m.institution} {m.methodCode} -{' '}
                                      {[
                                        ...new Set(
                                          m.laboratories.map(
                                            (l) =>
                                              l.laboratoryTradeName ||
                                              l.laboratoryCorporateName ||
                                              l.laboratoryName,
                                          ),
                                        ),
                                      ].join(', ')}
                                    </Typography>
                                  ))}
                                </TableCell>
                                <TableCell>
                                  <Typography fontWeight={600}>
                                    A definir
                                  </Typography>
                                  <Typography variant="body2">
                                    Método, laboratório, amostrador, vazão,
                                    tempo e volume.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                )
              ) : (
                <Stack spacing={6}>
                  <Typography>
                    {activeEligible.length - activeSelected.length} exposições
                    elegíveis não selecionadas para planejamento ·{' '}
                    {activeExcluded.length} mantidas no âmbito qualitativo por
                    método/laboratório.
                  </Typography>
                  {activeCampaign.snapshot.entries
                    .filter(
                      (e) =>
                        !activeCampaign.selectedExposureIds.includes(
                          e.exposureId,
                        ),
                    )
                    .map((e) => (
                      <Paper
                        key={e.exposureId}
                        variant="outlined"
                        sx={{ p: 8 }}
                      >
                        <Typography fontWeight={600}>
                          {e.name} · CAS {e.cas || 'não informado'}
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-line' }}>
                          {e.origin}
                        </Typography>
                        <Typography variant="body2">
                          {e.eligible
                            ? activeCampaign.stage === 'PLANNING'
                              ? 'Elegível, não selecionada pelo usuário para esta campanha.'
                              : 'Elegível, aguardando seleção.'
                            : e.justification}
                        </Typography>
                      </Paper>
                    ))}
                </Stack>
              )}
              <Typography variant="caption" color="text.secondary">
                Salvo no sistema · Registro {activeCampaign.id} · Atualizado em{' '}
                {new Date(
                  (activeCampaign as Campaign & { updatedAt?: string })
                    .updatedAt || activeCampaign.createdAt,
                ).toLocaleString('pt-BR')}
              </Typography>
            </>
          )}
        </Stack>
      )}
      {!draft && !activeCampaignId && (
        <Stack spacing={6}>
          <Typography component="h2" variant="h6">
            Campanhas salvas no sistema
          </Typography>
          {records.isLoading && (
            <Typography role="status">Carregando campanhas…</Typography>
          )}
          {records.isSuccess && !records.data?.length && (
            <Typography color="text.secondary">
              Nenhuma campanha salva neste estabelecimento. Comece em Nova
              campanha.
            </Typography>
          )}
          {records.isError && (
            <Alert severity="error">
              Não foi possível carregar as campanhas salvas.{' '}
              <Button onClick={() => void records.refetch()}>
                Tentar novamente
              </Button>
            </Alert>
          )}
          {records.data?.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 8 }}>
              <Stack
                direction="row"
                flexWrap="wrap"
                justifyContent="space-between"
                gap={6}
              >
                <Box>
                  <Typography fontWeight={600}>{item.name}</Typography>
                  <Typography color="text.secondary">
                    {item.stage === 'PLANNING'
                      ? `${planningStatus(item)} · ${item.selectedExposureIds.length} selecionadas`
                      : 'Métodos consolidados'}{' '}
                    · {item.snapshot.entries.filter((e) => e.eligible).length}{' '}
                    elegíveis ·{' '}
                    {item.snapshot.entries.filter((e) => !e.eligible).length} no
                    âmbito qualitativo · Salva no sistema
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={4}
                  alignItems="center"
                >
                  <Button onClick={() => onOpenCampaign(item.id)}>
                    Abrir campanha
                  </Button>
                  <Button
                    color="error"
                    disabled={busy}
                    onClick={() => {
                      setError('');
                      setDeleteTarget(item);
                    }}
                    aria-label={`Excluir campanha ${item.name}`}
                  >
                    Excluir
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
      {draft && !activeCampaignId && (
        <Box>
          <Button
            variant="contained"
            disabled={!draft.name.trim() || !draft.levels.length || busy}
            onClick={begin}
          >
            Avançar: consolidar fatores elegíveis
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Revise os métodos e registre no sistema as exposições que
            permanecerão no âmbito qualitativo.
          </Typography>
        </Box>
      )}
      <HoDeleteConfirmation
        name={deleteTarget?.name ?? null}
        kind="campaign"
        busy={busy}
        error={deleteTarget ? error : ''}
        onCancel={() => {
          setDeleteTarget(null);
          setError('');
        }}
        onConfirm={() => void removeCampaign()}
      />
      <Dialog
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={() => {
          if (!busy) closeReview();
        }}
      >
        <DialogTitle>
          Consolidação da campanha{campaign ? ` — ${campaign.name}` : ''}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={8}>
            <Stepper
              activeStep={stage}
              alternativeLabel
              sx={{ overflowX: 'auto' }}
            >
              {[
                'Consolidar métodos',
                'Selecionar elegíveis',
                'Planejamento da coleta',
              ].map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {error && <Alert severity="error">{error}</Alert>}
            {busy && <Typography role="status">Processando…</Typography>}
            {snapshot && (
              <>
                <Alert severity="info">
                  {eligible.length} exposições elegíveis · {excluded.length}{' '}
                  mantidas no âmbito qualitativo. A elegibilidade considera os
                  métodos ativos e a disponibilidade registrada dos laboratórios
                  para cada agente.
                </Alert>
                {!!snapshot.pendingClassification && (
                  <Alert severity="warning">
                    {snapshot.pendingClassification} exposições sem nível de
                    risco não foram incluídas neste recorte. Revise a
                    classificação no inventário.
                  </Alert>
                )}
                {stage === 0 && (
                  <Typography>
                    Confirme a consolidação para salvar no sistema os métodos
                    disponíveis e as justificativas abaixo. Depois, selecione as
                    exposições que deseja levar para o planejamento da coleta.
                  </Typography>
                )}
                {stage === 2 && (
                  <Alert severity="success">
                    Seleção confirmada e salva no sistema. As{' '}
                    {campaign!.selectedExposureIds.length} exposições abaixo
                    foram encaminhadas ao planejamento da coleta. Vazão, volume,
                    tempo e amostrador ainda precisam ser definidos com o método
                    e laboratório escolhidos.
                  </Alert>
                )}
                <Typography component="h3" variant="h6">
                  {stage === 2
                    ? 'Exposições para planejamento'
                    : 'Exposições elegíveis'}
                </Typography>
                {stage === 1 && (
                  <Button
                    variant="outlined"
                    disabled={!eligible.length || busy}
                    sx={{ alignSelf: 'flex-start' }}
                    onClick={() =>
                      setSelection(
                        selection.length === eligible.length
                          ? []
                          : eligible.map((e) => e.exposureId),
                      )
                    }
                  >
                    {selection.length === eligible.length && eligible.length
                      ? 'Desmarcar todos'
                      : 'Selecionar todos os elegíveis'}
                  </Button>
                )}
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small" sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        {stage === 1 && <TableCell>Incluir</TableCell>}
                        <TableCell>Fator de risco / CAS</TableCell>
                        <TableCell>Origem</TableCell>
                        <TableCell>
                          Métodos e laboratórios disponíveis
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eligible
                        .filter(
                          (e) =>
                            stage !== 2 ||
                            campaign!.selectedExposureIds.includes(
                              e.exposureId,
                            ),
                        )
                        .map((e) => (
                          <TableRow key={e.exposureId}>
                            {stage === 1 && (
                              <TableCell padding="checkbox">
                                <Checkbox
                                  disabled={busy}
                                  checked={selection.includes(e.exposureId)}
                                  inputProps={{
                                    'aria-label': `Incluir ${e.name} — ${e.origin}`,
                                  }}
                                  onChange={(_, checked) =>
                                    setSelection((current) =>
                                      checked
                                        ? [...current, e.exposureId]
                                        : current.filter(
                                            (id) => id !== e.exposureId,
                                          ),
                                    )
                                  }
                                />
                              </TableCell>
                            )}
                            <TableCell>
                              {e.name}
                              <Typography variant="caption" display="block">
                                CAS {e.cas || 'não informado'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'pre-line' }}>
                              {e.origin}
                            </TableCell>
                            <TableCell>
                              {e.methods.map((m) => (
                                <Typography key={m.id} variant="body2">
                                  {m.institution} {m.methodCode} —{' '}
                                  {[
                                    ...new Set(
                                      m.laboratories.map(
                                        (l) =>
                                          l.laboratoryTradeName ||
                                          l.laboratoryCorporateName ||
                                          l.laboratoryName,
                                      ),
                                    ),
                                  ].join(', ')}
                                </Typography>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      {!eligible.length && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            Nenhuma exposição elegível neste recorte. A
                            consolidação pode ser salva para registrar as
                            justificativas.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography component="h3" variant="h6">
                  Registro de exclusões da avaliação quantitativa
                </Typography>
                <Typography variant="body2">
                  Os fatores permanecem no inventário de riscos. A justificativa
                  fica preservada para compor o programa de monitoramento.
                </Typography>
                {!excluded.length && (
                  <Typography>
                    Nenhuma exclusão por método ou laboratório.
                  </Typography>
                )}
                {excluded.map((e) => (
                  <Paper key={e.exposureId} variant="outlined" sx={{ p: 8 }}>
                    <Typography fontWeight={600}>
                      {e.name} · CAS {e.cas || 'não informado'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'pre-line', my: 3 }}
                    >
                      {e.origin}
                    </Typography>
                    <Typography color="text.primary" fontWeight={600}>
                      {e.reason === 'NO_METHOD_AND_LABORATORY'
                        ? 'Ausência de método e laboratório'
                        : 'Ausência de laboratório disponível'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 3 }}>
                      {e.justification}
                    </Typography>
                  </Paper>
                ))}
                {campaign && (
                  <Typography variant="caption" color="text.secondary">
                    Registro {campaign.id} · Consolidação em{' '}
                    {new Date(
                      campaign.snapshot.consolidatedAt || campaign.createdAt,
                    ).toLocaleString('pt-BR')}{' '}
                    · Salvo no sistema
                  </Typography>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 4, p: 8 }}>
          <Button disabled={busy} onClick={closeReview}>
            Fechar
          </Button>
          {campaign && (
            <Button disabled={busy} onClick={() => void download(campaign)}>
              Baixar justificativa em PDF
            </Button>
          )}
          {stage === 0 && (
            <Button
              variant="contained"
              disabled={!preview || busy}
              onClick={() => void consolidate()}
            >
              Confirmar e salvar consolidação
            </Button>
          )}
          {stage === 1 && (
            <Button
              variant="contained"
              disabled={!selection.length || busy}
              onClick={() => void advance()}
            >
              Avançar para planejamento ({selection.length})
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
