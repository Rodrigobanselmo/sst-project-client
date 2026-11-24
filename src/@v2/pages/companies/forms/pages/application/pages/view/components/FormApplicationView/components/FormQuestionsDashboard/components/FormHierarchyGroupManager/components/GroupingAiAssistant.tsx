import { HierarchyLabel } from './HierarchyLabel';
import { labeledHierarchyContext } from '../helpers/formatHierarchyGroupOptionLabel';
import { ProposalInlineAdd } from './ProposalInlineAdd';
import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { AiAnalyzeGuidanceAudioField } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/AiAnalyzeGuidanceAudioField';
import { api } from 'core/services/apiClient';
import { useAccess } from 'core/hooks/useAccess';
import { AiActionButtonGroup } from '@v2/components/molecules/AiActionButtonGroup/AiActionButtonGroup';
import { SystemAiPromptConfigDialog } from '@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog';
import { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';

async function transcribeGroupingContext({
  audio,
  fileName,
}: {
  audio: Blob;
  fileName?: string;
}): Promise<{ text: string }> {
  const body = new FormData();
  body.append('audio', audio, fileName || 'recording.webm');
  return (
    await api.post<{ text: string }>('/ai-chat/transcribe', body, {
      timeout: 120000,
    })
  ).data;
}

const MODELS = [
  { label: 'GPT-6.1 Sol — padrão SimpleSST', value: 'gpt-6.1-sol' },
  { label: 'GPT-5 — alternativa explícita do MASTER', value: 'gpt-5' },
];
type Mode = 'SEPARATE' | 'INTEGRATED';
type Coverage = {
  respondents: number;
  minimumPerQuestion: number;
  questionsBelowMinimum: number;
  totalQuestions: number;
  meetsMinimum: boolean;
  zeroResponseSectorIds: string[];
};
type GroupingEdit = {
  groupIndex: number;
  name: string;
  hierarchyIds: string[];
  justification: string;
};
type Sector = {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  companyFantasy?: string;
  establishments: string[];
  participants: number;
  respondents: number;
  hierarchyPath?: { id: string; name: string; type: string }[];
  sources: { id: string; text: string }[];
};
type Group = {
  adjusted?: boolean;
  requiresContextConfirmation: boolean;
  name: string;
  rationale: string;
  hierarchyIds: string[];
  evidence: { hierarchyId: string; sourceIds: string[] }[];
  uncertainties: string[];
  category: 'MACRO' | 'LOW_RESPONSE' | 'MIXED';
  coverage: Coverage;
};
type Alternative = {
  mode: Mode;
  groups: Group[];
  ungrouped: { hierarchyId: string; reason: string }[];
  questions: string[];
};
type Result = {
  contextVersion: string;
  notes: string;
  metadata: {
    requestedModel: string;
    returnedModel?: string;
    generatedAt: string;
  };
  proposal: {
    alternatives: (Omit<Alternative, 'groups'> & {
      groups: Omit<Group, 'category' | 'coverage'>[];
    })[];
  };
  alternatives: Alternative[];
};
type Context = {
  version: string;
  companies: { id: string; name: string }[];
  availableSectors: Sector[];
  existingGroups: { id: string }[];
  unmatchedSubmissions: number;
  lastProposal?: Result | null;
};
const CATEGORY_ORDER: Group['category'][] = ['LOW_RESPONSE', 'MIXED', 'MACRO'];
const CATEGORIES = {
  MACRO: 'Visão ampliada — setores com 3 ou mais respondentes',
  LOW_RESPONSE: 'Composição de setores com zero a dois respondentes',
  MIXED: 'Composição mista — setores com e sem o mínimo de respondentes',
};
const MODE_LABELS = {
  SEPARATE: 'Separadamente por empresa',
  INTEGRATED: 'De forma integrada entre empresas',
};
const errorMessage = (e: any) => {
  const message = e?.response?.data?.message;
  return typeof message === 'string'
    ? message
    : Array.isArray(message)
      ? message.join(' · ')
      : e?.code === 'ECONNABORTED' || e?.code === 'ETIMEDOUT'
        ? 'O tempo de espera da resposta terminou. A geração pode continuar no servidor; verifique o andamento antes de iniciar outra.'
        : 'Não foi possível receber a resposta do servidor. Isso pode ser uma falha temporária de comunicação ou do serviço; tente novamente.';
};
export function GroupingAiAssistant({
  companyId,
  applicationId,
}: {
  companyId: string;
  applicationId: string;
}) {
  const { isMaster } = useAccess();
  const client = useQueryClient();
  const [open, setOpen] = useState(false),
    [reviewSession, setReviewSession] = useState(0),
    [configOpen, setConfigOpen] = useState(false),
    [config, setConfig] = useState<SystemAiMasterConfig>({});
  const [mode, setMode] = useState<Mode | 'COMPARE'>('SEPARATE'),
    [notes, setNotes] = useState(''),
    [result, setResult] = useState<Result | null>(null),
    [alternative, setAlternative] = useState(0),
    [selected, setSelected] = useState<number[]>([]),
    [confirmed, setConfirmed] = useState<number[]>([]),
    [busy, setBusy] = useState(false),
    [applying, setApplying] = useState(false),
    [audioBusy, setAudioBusy] = useState(false),
    [error, setError] = useState(''),
    [confirm, setConfirm] = useState(false),
    [success, setSuccess] = useState('');
  const [edits, setEdits] = useState<Partial<Record<Mode, GroupingEdit[]>>>({});
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editError, setEditError] = useState('');
  const [refining, setRefining] = useState(false);
  const generationFence = useRef(0);
  const generationSeen = useRef(false);
  const [generationNotice, setGenerationNotice] = useState('');
  const base = `v2/companies/${companyId}/forms/applications/${applicationId}/hierarchy-groups/ai`;
  const query = useQuery<Context>({
    queryKey: ['grouping-ai-context', companyId, applicationId],
    queryFn: async () => (await api.get(`${base}/context`)).data,
    enabled: open,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const generationQuery = useQuery<{
    status: 'ABSENT' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
    startedAt?: string;
    elapsedSeconds?: number;
    result?: Result;
    message?: string;
  }>({
    queryKey: ['grouping-ai-generation', companyId, applicationId],
    queryFn: async () =>
      (await api.get(`${base}/generation`, { timeout: 15000 })).data,
    enabled: open && !result,
    retry: 1,
    refetchInterval: (q) =>
      busy || q.state.data?.status === 'RUNNING' ? 3000 : false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });
  useEffect(() => {
    const job = generationQuery.data;
    if (
      !open ||
      !job ||
      (job.startedAt && Date.parse(job.startedAt) < generationFence.current)
    )
      return;
    if (job.status === 'RUNNING') {
      generationSeen.current = true;
      setBusy(true);
      setGenerationNotice(
        `Gerando propostas no servidor… ${job.elapsedSeconds ?? 0}s. Você pode fechar e reabrir esta janela para acompanhar.`,
      );
    }
    if (
      job.status === 'SUCCEEDED' &&
      job.result &&
      query.data?.version === job.result.contextVersion
    ) {
      setResult(job.result);
      setAlternative(0);
      setBusy(false);
      setError('');
      setGenerationNotice('');
    }
    if (
      job.status === 'SUCCEEDED' &&
      job.result &&
      query.data?.version &&
      query.data.version !== job.result.contextVersion &&
      generationSeen.current
    ) {
      setBusy(false);
      setGenerationNotice('');
      generationSeen.current = false;
      setError(
        'A campanha mudou durante a geração. Atualize o contexto antes de gerar novamente.',
      );
    }
    if (job.status === 'ABSENT' && generationSeen.current) {
      setBusy(false);
      setGenerationNotice('');
      generationSeen.current = false;
      setError(
        'O acompanhamento não está mais disponível no servidor. Atualize o contexto antes de tentar novamente.',
      );
    }
    if (job.status === 'FAILED') {
      setBusy(false);
      setError(job.message || 'A geração não foi concluída no servidor.');
      setGenerationNotice('');
    }
  }, [generationQuery.data, open, query.data?.version]);
  useEffect(() => {
    setResult(null);
    setEdits({});
    setEditIndex(null);
    setSelected([]);
    setConfirmed([]);
    setNotes('');
    setMode('SEPARATE');
    setConfig({});
    generationFence.current = 0;
    generationSeen.current = false;
    setGenerationNotice('');
    setOpen(false);
  }, [companyId, applicationId]);
  const ctx = query.data;
  const current = result?.alternatives[alternative];
  const sector = (id: string) => ctx?.availableSectors.find((s) => s.id === id);
  const label = (id: string) => {
    const s = sector(id);
    return s
      ? [
          ...labeledHierarchyContext({
            ...s,
            establishment: s.establishments.join(', ') || 'Não informado',
          }),
          `Setor: ${s.name}`,
        ].join(' → ')
      : id;
  };
  async function generate() {
    if (!ctx) return;
    generationFence.current = Date.now() - 1000;
    setBusy(true);
    setGenerationNotice('Iniciando geração no servidor…');
    setError('');
    setSuccess('');
    setResult(null);
    setEdits({});
    setEditIndex(null);
    setSelected([]);
    setConfirmed([]);
    try {
      const r = await api.post(
        `${base}/generation`,
        {
          mode,
          notes,
          contextVersion: ctx.version,
          ...(isMaster ? config : {}),
        },
        { timeout: 15000 },
      );
      client.setQueryData(
        ['grouping-ai-generation', companyId, applicationId],
        r.data,
      );
      void generationQuery.refetch();
    } catch (e) {
      // A lost start response does not mean that the server failed to start.
      const recovered = await generationQuery.refetch();
      if (
        !recovered.data ||
        recovered.data.status === 'ABSENT' ||
        (recovered.data.startedAt &&
          Date.parse(recovered.data.startedAt) < generationFence.current)
      ) {
        setError(errorMessage(e));
        setBusy(false);
        setGenerationNotice('');
      }
    }
  }
  async function saveRefinement(
    value: {
      name: string;
      hierarchyIds: string[];
      justification: string;
    },
    targetIndex: number | null = editIndex,
  ) {
    if (!result || !current || targetIndex == null || busy) return false;
    const next = new Map(
      (edits[current.mode] ?? []).map((e) => [e.groupIndex, e]),
    );
    next.set(targetIndex, { groupIndex: targetIndex, ...value });
    current.groups.forEach((g, index) => {
      if (index === targetIndex) return;
      const ids = g.hierarchyIds.filter(
        (id) => !value.hierarchyIds.includes(id),
      );
      if (ids.length !== g.hierarchyIds.length)
        next.set(index, {
          groupIndex: index,
          name: g.name,
          hierarchyIds: ids,
          justification:
            `Transferência manual de setor(es) para a proposta ${value.name}. A composição restante deve ter sua similaridade conferida novamente.`.slice(
              0,
              450,
            ),
        });
    });
    setBusy(true);
    setRefining(true);
    setEditIndex(targetIndex);
    setSelected([]);
    setConfirmed([]);
    setEditError('');
    try {
      const response = await api.post<Alternative>(
        `${base}/preview`,
        {
          mode: current.mode,
          contextVersion: result.contextVersion,
          notes: result.notes,
          proposal: result.proposal,
          edits: [...next.values()],
          selectedIndexes: [targetIndex],
        },
        { timeout: 30000 },
      );
      setResult({
        ...result,
        alternatives: result.alternatives.map((a, i) =>
          i === alternative ? response.data : a,
        ),
      });
      setEdits((old) => ({ ...old, [current.mode]: [...next.values()] }));
      setSelected([]);
      setConfirmed([]);
      setConfirm(false);
      setEditIndex(null);
      setError('');
      return true;
    } catch (e) {
      setEditError(errorMessage(e));
      setError(errorMessage(e));
      return false;
    } finally {
      setBusy(false);
      setRefining(false);
    }
  }
  async function apply() {
    if (!result || !current || busy || editError) return;
    setConfirm(false);
    setApplying(true);
    setBusy(true);
    setError('');
    try {
      await api.post(
        `${base}/apply`,
        {
          mode: current.mode,
          contextVersion: result.contextVersion,
          notes: result.notes,
          proposal: result.proposal,
          selectedIndexes: selected,
          confirmedIndexes: confirmed,
          edits: edits[current.mode] ?? [],
        },
        { timeout: 90000 },
      );
      await Promise.all([
        client.invalidateQueries({
          queryKey: [
            QueryKeyFormEnum.FORM_HIERARCHY_GROUPS,
            companyId,
            applicationId,
          ],
        }),
        client.invalidateQueries({
          queryKey: [QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_RISKS, companyId],
        }),
      ]);
      setSuccess(
        `${selected.length} agrupamento(s) criado(s). Os agrupamentos anteriores foram preservados.`,
      );
      setResult(null);
      setSelected([]);
      setConfirmed([]);
      await query.refetch();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
      setApplying(false);
      setConfirm(false);
    }
  }
  return (
    <>
      <AiActionButtonGroup
        label="Sugerir agrupamentos com IA"
        onExecute={() => {
          setReviewSession((value) => value + 1);
          setConfirm(false);
          setOpen(true);
          setError('');
        }}
        isMaster={isMaster}
        onConfigure={() => setConfigOpen(true)}
        configureIconOnly
        disabled={(busy && !generationNotice) || audioBusy}
      />
      {isMaster && (
        <SystemAiPromptConfigDialog
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          onApply={setConfig}
          initialConfig={config}
          defaultModelValue="gpt-6.1-sol"
          modelOptions={MODELS}
          factoryDefaultPrompt=""
          title="Configurar IA de agrupamentos"
          description="Configuração desta sessão, exclusiva do MASTER. O padrão é GPT-6.1 Sol. Não há troca automática de modelo após erros. As regras de escopo, contrato e divulgação são mantidas pelo sistema."
          promptLabel="Orientações adicionais para a IA"
          showSaveDefault={false}
          showRestoreDefault={false}
        />
      )}
      <Dialog
        open={open}
        onClose={() => {
          if ((!busy || !!generationNotice) && !audioBusy) setOpen(false);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Assistente de agrupamentos de setores</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={8}>
            <Typography>
              Propostas por similaridade do trabalho, com atenção ao anonimato e
              à suficiência das respostas. Nada é salvo antes da sua revisão.
            </Typography>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            {query.isPending ? (
              <CircularProgress aria-label="Carregando contexto" />
            ) : query.isError ? (
              <Alert severity="error">
                {errorMessage(query.error)}{' '}
                <Button onClick={() => void query.refetch()}>
                  Tentar novamente
                </Button>
              </Alert>
            ) : (
              ctx && (
                <>
                  <Alert severity="info">
                    {ctx.companies.length > 1
                      ? `Campanha com ${ctx.companies.length} empresas. Escolha como os setores entre empresas devem ser tratados.`
                      : 'Campanha de uma empresa. A identificação por estabelecimento será preservada.'}{' '}
                    {ctx.existingGroups.length} agrupamento(s) existente(s)
                    será(ão) preservado(s); {ctx.availableSectors.length}{' '}
                    setor(es) disponível(is) para novas propostas.
                  </Alert>
                  {ctx.unmatchedSubmissions > 0 && (
                    <Alert severity="warning">
                      {ctx.unmatchedSubmissions} envio(s) não puderam ser
                      associados a um setor elegível e não entram nas contagens
                      desta proposta.
                    </Alert>
                  )}
                  {!result && (
                    <>
                      {ctx.lastProposal && (
                        <Alert severity="success">
                          Há um rascunho recente desta conta, com os mesmos
                          dados da campanha. Ele pode ser retomado por até 30
                          minutos neste servidor, sem nova chamada de IA.{' '}
                          <Button
                            disabled={busy || audioBusy}
                            onClick={() => {
                              setResult(ctx.lastProposal!);
                              setEdits({});
                              setAlternative(0);
                              setSelected([]);
                              setConfirmed([]);
                              setError('');
                            }}
                          >
                            Retomar proposta recente
                          </Button>
                        </Alert>
                      )}
                      <Button
                        disabled={busy || audioBusy}
                        onClick={() => void query.refetch()}
                      >
                        Atualizar contexto e verificar rascunho
                      </Button>
                      <FormControl fullWidth>
                        <InputLabel id="grouping-ai-mode">
                          Tratamento das empresas
                        </InputLabel>
                        <Select
                          labelId="grouping-ai-mode"
                          label="Tratamento das empresas"
                          value={mode}
                          disabled={busy || ctx.companies.length === 1}
                          onChange={(e) =>
                            setMode(e.target.value as Mode | 'COMPARE')
                          }
                        >
                          <MenuItem value="SEPARATE">
                            Separadamente por empresa
                          </MenuItem>
                          <MenuItem value="INTEGRATED">
                            De forma integrada entre empresas
                          </MenuItem>
                          <MenuItem value="COMPARE">
                            Comparar as duas alternativas
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <AiAnalyzeGuidanceAudioField
                        label="Contexto de trabalho e esclarecimentos (opcional)"
                        shrinkLabel
                        placeholder="Exemplo: Os setores A e B realizam atividades semelhantes, mas têm gestores e turnos diferentes. O setor C tem o mesmo gestor do setor A, porém realiza atividades distintas. Considere essas diferenças ao sugerir os agrupamentos."
                        companyId={companyId}
                        workspaceId=""
                        transcribe={transcribeGroupingContext}
                        value={notes}
                        disabled={busy || audioBusy}
                        maxLength={2500}
                        onChange={(value) => setNotes(value.slice(0, 2500))}
                        onBusyChange={setAudioBusy}
                        onTranscription={(text) =>
                          setNotes((value) =>
                            [value, text]
                              .filter(Boolean)
                              .join('\n')
                              .slice(0, 2500),
                          )
                        }
                        helperText="Descreva atividades, gestão, turnos e diferenças relevantes entre os setores. Você pode escrever ou gravar um áudio e revisar a transcrição. Evite nomes ou dados pessoais de empregados. As informações serão tratadas como contexto declarado."
                      />
                      <Typography variant="body2">
                        A IA recebe a estrutura, descrições de cargos,
                        caracterizações disponíveis e contagens agregadas. Não
                        recebe respostas individuais nem scores. O mínimo de
                        três é verificado por pergunta; não garante, por si só,
                        representatividade ou diagnóstico.
                      </Typography>
                      <Button
                        variant="contained"
                        disabled={
                          busy || audioBusy || !ctx.availableSectors.length
                        }
                        onClick={() => void generate()}
                      >
                        {busy
                          ? 'Gerando proposta…'
                          : 'Gerar propostas para revisão'}
                      </Button>
                    </>
                  )}
                  {busy && (
                    <Alert severity="info">
                      {applying
                        ? 'Gravando os agrupamentos selecionados e atualizando os indicadores.'
                        : refining
                          ? 'Validando a composição ajustada…'
                          : 'Processando. A análise pode levar alguns minutos; aguarde a conclusão.'}
                    </Alert>
                  )}
                  {result && current && (
                    <>
                      <Typography variant="caption">
                        Modelo solicitado: {result.metadata.requestedModel}
                        {result.metadata.returnedModel
                          ? ` · Retornado: ${result.metadata.returnedModel}`
                          : ''}{' '}
                        ·{' '}
                        {new Date(result.metadata.generatedAt).toLocaleString(
                          'pt-BR',
                        )}
                      </Typography>
                      <Box
                        sx={{
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          width: '100%',
                        }}
                      >
                        <Tabs
                          value={alternative}
                          onChange={(_, v) => {
                            setAlternative(v);
                            setSelected([]);
                            setConfirmed([]);
                            setConfirm(false);
                          }}
                          variant="fullWidth"
                          centered
                          aria-label="Alternativas de agrupamento"
                          sx={{
                            maxWidth: 960,
                            mx: 'auto',
                            overflow: 'visible',
                            '& .MuiTabs-indicator': { display: 'none' },
                            '& .MuiTabs-flexContainer': {
                              gap: { xs: 2, sm: 6 },
                            },
                            '& .MuiTab-root': {
                              textTransform: 'none',
                              fontSize: { xs: '0.95rem', sm: '1.15rem' },
                              lineHeight: 1.4,
                              fontWeight: 500,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: '12px 12px 0 0',
                              minHeight: 64,
                              px: 6,
                              backgroundColor: 'action.hover',
                            },
                            '& .MuiTab-root.Mui-selected': {
                              fontWeight: 800,
                              color: 'text.primary',
                              backgroundColor: 'background.paper',
                              borderColor: 'primary.main',
                              borderBottom: '3px solid',
                              borderBottomColor: 'primary.main',
                            },
                          }}
                        >
                          {result.alternatives.map((a) => (
                            <Tab key={a.mode} label={MODE_LABELS[a.mode]} />
                          ))}
                        </Tabs>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Revise as propostas e selecione as que deseja criar. Os
                        setores não selecionados permanecem como estão. Setores
                        sem respostas próprias continuam sem evidência direta
                        coletada.
                      </Typography>
                      {CATEGORY_ORDER.map((category) => {
                        const items = current.groups
                          .map((group, index) => ({ group, index }))
                          .filter((item) => item.group.category === category);
                        const orderedIndexes = CATEGORY_ORDER.flatMap((c) =>
                          current.groups.flatMap((g, index) =>
                            g.category === c ? [index] : [],
                          ),
                        );
                        return (
                          <Box
                            component="details"
                            key={`${reviewSession}-${current.mode}-${category}`}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                              p: { xs: 6, sm: 8 },
                              backgroundColor: 'background.default',
                              '& > summary::marker': { color: 'primary.main' },
                            }}
                          >
                            <Typography
                              component="summary"
                              sx={{
                                cursor: 'pointer',
                                fontSize: { xs: '1.15rem', sm: '1.4rem' },
                                fontWeight: 800,
                                lineHeight: 1.5,
                                ml: 8,
                                pr: 4,
                              }}
                            >
                              {CATEGORIES[category]}{' '}
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: '0.9rem',
                                  fontWeight: 500,
                                  color: 'text.secondary',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                ({items.length} propostas)
                              </Typography>
                            </Typography>
                            <Stack spacing={6} mt={8}>
                              {!items.length && (
                                <Typography color="text.secondary">
                                  Nenhuma proposta nesta categoria.
                                </Typography>
                              )}
                              {items.map(({ group: g, index }) => (
                                <Box
                                  component="details"
                                  key={`${reviewSession}-${current.mode}-${index}`}
                                  sx={{
                                    border: '1px solid',
                                    borderColor: selected.includes(index)
                                      ? 'primary.main'
                                      : 'divider',
                                    borderRadius: 2,
                                    backgroundColor: 'background.paper',
                                    overflow: 'hidden',
                                    '& > summary::marker': {
                                      color: 'text.secondary',
                                    },
                                  }}
                                >
                                  <Typography
                                    component="summary"
                                    sx={{
                                      cursor: 'pointer',
                                      fontSize: {
                                        xs: '1.05rem',
                                        sm: '1.15rem',
                                      },
                                      fontWeight: 750,
                                      lineHeight: 1.5,
                                      py: 7,
                                      pr: 8,
                                      ml: 14,
                                    }}
                                  >
                                    Proposta {orderedIndexes.indexOf(index) + 1}{' '}
                                    · {g.name}
                                    {selected.includes(index) && (
                                      <Chip
                                        size="small"
                                        label="Selecionada"
                                        color="primary"
                                        sx={{ ml: 4 }}
                                      />
                                    )}
                                  </Typography>
                                  <Box sx={{ px: { xs: 6, sm: 8 }, pb: 8 }}>
                                    <Stack
                                      direction="row"
                                      spacing={4}
                                      sx={{ mb: 6 }}
                                    >
                                      <ProposalInlineAdd
                                        index={index}
                                        groups={current.groups}
                                        sectors={ctx?.availableSectors ?? []}
                                        mode={current.mode}
                                        busy={busy}
                                        onAdd={(s) =>
                                          saveRefinement(
                                            {
                                              name: g.name,
                                              hierarchyIds: [
                                                ...g.hierarchyIds,
                                                s.id,
                                              ],
                                              justification:
                                                `Inclusão manual do setor ${s.name}. A similaridade do contexto de trabalho deve ser conferida na composição ajustada.`.slice(
                                                  0,
                                                  450,
                                                ),
                                            },
                                            index,
                                          )
                                        }
                                      />
                                      {editIndex === index && editError && (
                                        <Alert
                                          severity="error"
                                          sx={{ width: '100%' }}
                                        >
                                          O ajuste não foi aplicado: {editError}
                                          <Button
                                            onClick={() => {
                                              setEditError('');
                                              setError('');
                                              setEditIndex(null);
                                              setSelected([]);
                                              setConfirmed([]);
                                            }}
                                          >
                                            Manter composição anterior
                                          </Button>
                                        </Alert>
                                      )}
                                      {g.adjusted && (
                                        <Chip
                                          label="Ajustado pelo usuário"
                                          color="info"
                                        />
                                      )}
                                    </Stack>
                                    <Stack
                                      direction="row"
                                      flexWrap="wrap"
                                      gap={4}
                                      mb={8}
                                    >
                                      <Chip
                                        size="small"
                                        label={`${g.hierarchyIds.length} setores · ${g.coverage.respondents} respondente(s)`}
                                      />
                                      <Chip
                                        size="small"
                                        color={
                                          g.coverage.meetsMinimum
                                            ? 'success'
                                            : 'warning'
                                        }
                                        variant="outlined"
                                        label={
                                          g.coverage.meetsMinimum
                                            ? 'Mínimo atendido por pergunta'
                                            : 'Mínimo ainda não atendido'
                                        }
                                      />
                                      <Chip
                                        size="small"
                                        variant="outlined"
                                        label={`${g.coverage.questionsBelowMinimum}/${g.coverage.totalQuestions} perguntas abaixo de 3`}
                                      />
                                    </Stack>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={700}
                                      mb={4}
                                    >
                                      Setores da proposta
                                    </Typography>
                                    <Stack spacing={4}>
                                      {g.hierarchyIds.map((id) => (
                                        <Box
                                          component="details"
                                          key={id}
                                          sx={{
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            pb: 4,
                                            '& > summary::marker': {
                                              color: 'text.secondary',
                                            },
                                          }}
                                        >
                                          <Typography
                                            component="summary"
                                            sx={{
                                              cursor: 'pointer',
                                              ml: 8,
                                              fontSize: '1rem',
                                              fontWeight: 650,
                                            }}
                                          >
                                            <HierarchyLabel
                                              text={`Setor: ${sector(id)?.name ?? id}`}
                                            />
                                            <Button
                                              size="small"
                                              disabled={
                                                busy ||
                                                g.hierarchyIds.length <= 2
                                              }
                                              title={
                                                g.hierarchyIds.length <= 2
                                                  ? 'A proposta precisa manter ao menos dois setores.'
                                                  : 'Retirar setor desta proposta'
                                              }
                                              sx={{
                                                ml: 4,
                                                fontWeight: 400,
                                                textTransform: 'none',
                                              }}
                                              onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                void saveRefinement(
                                                  {
                                                    name: g.name,
                                                    hierarchyIds:
                                                      g.hierarchyIds.filter(
                                                        (member) =>
                                                          member !== id,
                                                      ),
                                                    justification:
                                                      `Retirada manual do setor ${sector(id)?.name ?? id}. A similaridade do contexto de trabalho deve ser conferida na composição ajustada.`.slice(
                                                        0,
                                                        450,
                                                      ),
                                                  },
                                                  index,
                                                );
                                              }}
                                            >
                                              Retirar setor
                                            </Button>
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ ml: 8, mt: 2 }}
                                          >
                                            <HierarchyLabel text={label(id)} />
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{ ml: 8, mt: 2 }}
                                          >
                                            {sector(id)?.respondents ?? 0}{' '}
                                            respondente(s) ·{' '}
                                            {sector(id)?.participants ?? 0}{' '}
                                            participante(s) no cadastro
                                            {sector(id)?.respondents === 0
                                              ? ' · Sem respostas próprias; inclusão por similaridade.'
                                              : ''}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Stack>
                                    <Box
                                      component="details"
                                      sx={{
                                        my: 8,
                                        '& > summary::marker': {
                                          color: 'text.secondary',
                                        },
                                      }}
                                    >
                                      <Typography
                                        component="summary"
                                        variant="subtitle2"
                                        sx={{
                                          cursor: 'pointer',
                                          fontWeight: 650,
                                          ml: 8,
                                        }}
                                      >
                                        Evidências usadas
                                      </Typography>
                                      {g.evidence.map((e) => (
                                        <Box
                                          key={e.hierarchyId}
                                          sx={{ my: 4, ml: 8 }}
                                        >
                                          <Typography
                                            variant="caption"
                                            fontWeight={700}
                                          >
                                            <HierarchyLabel
                                              text={label(e.hierarchyId)}
                                            />
                                          </Typography>
                                          {e.sourceIds.map((id) => (
                                            <Typography
                                              key={id}
                                              variant="body2"
                                              sx={{
                                                whiteSpace: 'pre-wrap',
                                                overflowWrap: 'anywhere',
                                              }}
                                            >
                                              {id === 'user-context'
                                                ? `Contexto declarado pelo usuário: ${result.notes}`
                                                : (sector(
                                                    e.hierarchyId,
                                                  )?.sources.find(
                                                    (source) =>
                                                      source.id === id,
                                                  )?.text ?? id)}
                                            </Typography>
                                          ))}
                                        </Box>
                                      ))}
                                    </Box>
                                    <Alert
                                      severity={
                                        g.requiresContextConfirmation
                                          ? 'warning'
                                          : 'info'
                                      }
                                      sx={{
                                        mt: 8,
                                        '& .MuiAlert-message': {
                                          minWidth: 0,
                                          width: '100%',
                                        },
                                      }}
                                    >
                                      <Typography variant="body2">
                                        <Box
                                          component="strong"
                                          sx={{ fontWeight: 800 }}
                                        >
                                          {g.adjusted
                                            ? 'Justificativa do ajuste: '
                                            : 'Hipótese de agrupamento: '}
                                        </Box>
                                        {g.rationale}
                                        {editIndex === index && editError && (
                                          <Alert
                                            severity="error"
                                            sx={{ width: '100%' }}
                                          >
                                            O ajuste não foi aplicado:{' '}
                                            {editError}
                                            <Button
                                              onClick={() => {
                                                setEditError('');
                                                setError('');
                                                setEditIndex(null);
                                                setSelected([]);
                                                setConfirmed([]);
                                              }}
                                            >
                                              Manter composição anterior
                                            </Button>
                                          </Alert>
                                        )}
                                        {g.adjusted && (
                                          <Typography
                                            component="span"
                                            variant="body2"
                                            sx={{ mt: 4, display: 'block' }}
                                          >
                                            <strong>
                                              Sugestão original da IA (anterior
                                              ao ajuste):{' '}
                                            </strong>
                                            {
                                              result.proposal.alternatives.find(
                                                (a) => a.mode === current.mode,
                                              )?.groups[index]?.rationale
                                            }
                                          </Typography>
                                        )}
                                      </Typography>
                                      {g.requiresContextConfirmation && (
                                        <Typography variant="body2" mt={4}>
                                          A evidência disponível é parcial.
                                          Confira atividades efetivas, gestão,
                                          jornada e condições de trabalho antes
                                          de aplicar.
                                        </Typography>
                                      )}
                                      {g.uncertainties.length > 0 && (
                                        <Typography variant="body2" mt={4}>
                                          <Box
                                            component="strong"
                                            sx={{ fontWeight: 700 }}
                                          >
                                            Pontos a conferir:{' '}
                                          </Box>
                                          {g.uncertainties.join(' ')}
                                        </Typography>
                                      )}
                                      {g.requiresContextConfirmation && (
                                        <FormControlLabel
                                          sx={{
                                            mt: 6,
                                            mr: 0,
                                            alignItems: 'flex-start',
                                            '& .MuiCheckbox-root': { pt: 0 },
                                            '& .MuiFormControlLabel-label': {
                                              fontSize: '0.9rem',
                                              fontWeight: 600,
                                            },
                                          }}
                                          control={
                                            <Checkbox
                                              checked={confirmed.includes(
                                                index,
                                              )}
                                              disabled={busy || audioBusy}
                                              onChange={(_, checked) => {
                                                setConfirmed((old) =>
                                                  checked
                                                    ? [...old, index]
                                                    : old.filter(
                                                        (i) => i !== index,
                                                      ),
                                                );
                                                if (!checked)
                                                  setSelected((old) =>
                                                    old.filter(
                                                      (i) => i !== index,
                                                    ),
                                                  );
                                              }}
                                            />
                                          }
                                          label="Li a hipótese e os pontos a conferir. Conferi o contexto de trabalho e confirmo a similaridade dos setores deste grupo."
                                        />
                                      )}
                                    </Alert>
                                    <Box
                                      sx={{
                                        mt: 6,
                                        pt: 4,
                                        borderTop: '1px solid',
                                        borderColor: 'divider',
                                      }}
                                    >
                                      <FormControlLabel
                                        sx={{
                                          mr: 0,
                                          '& .MuiFormControlLabel-label': {
                                            fontWeight: 700,
                                          },
                                        }}
                                        control={
                                          <Checkbox
                                            checked={selected.includes(index)}
                                            disabled={
                                              busy ||
                                              (g.requiresContextConfirmation &&
                                                !confirmed.includes(index))
                                            }
                                            onChange={(_, checked) =>
                                              setSelected((old) =>
                                                checked
                                                  ? [...old, index]
                                                  : old.filter(
                                                      (i) => i !== index,
                                                    ),
                                              )
                                            }
                                          />
                                        }
                                        label="Selecionar esta proposta para criar o agrupamento"
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        );
                      })}
                      <Box
                        component="details"
                        key={`${current.mode}-ungrouped`}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 8,
                          '& > summary::marker': { color: 'text.secondary' },
                        }}
                      >
                        <Typography
                          component="summary"
                          sx={{
                            cursor: 'pointer',
                            fontSize: { xs: '1.15rem', sm: '1.4rem' },
                            fontWeight: 800,
                            lineHeight: 1.5,
                            ml: 8,
                          }}
                        >
                          Sem agrupamento sustentado pelos dados disponíveis
                        </Typography>
                        <Box mt={8}>
                          {!current.ungrouped.length && (
                            <Typography>
                              Nenhum setor nesta condição.
                            </Typography>
                          )}
                          {current.ungrouped.map((u) => (
                            <Box
                              component="details"
                              key={u.hierarchyId}
                              sx={{ mb: 6 }}
                            >
                              <Typography
                                component="summary"
                                sx={{
                                  cursor: 'pointer',
                                  fontWeight: 650,
                                  ml: 8,
                                }}
                              >
                                {sector(u.hierarchyId)?.name ?? u.hierarchyId}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 8 }}
                              >
                                <HierarchyLabel text={label(u.hierarchyId)} />
                              </Typography>
                              <Typography sx={{ ml: 8, mt: 2 }}>
                                {u.reason}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      {current.questions.length > 0 && (
                        <Box
                          component="details"
                          sx={{
                            p: 8,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            component="summary"
                            fontWeight={700}
                            sx={{ cursor: 'pointer', ml: 8 }}
                          >
                            Esclarecimentos necessários (
                            {current.questions.length})
                          </Typography>
                          {current.questions.map((q, i) => (
                            <Typography key={i}>
                              {i + 1}. {q}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </>
                  )}
                </>
              )
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 8, flexWrap: 'wrap', gap: 4 }}>
          {busy && (
            <Stack
              direction="row"
              spacing={4}
              alignItems="center"
              role="status"
              aria-live="polite"
              sx={{ width: '100%' }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2">
                {applying
                  ? 'Criando agrupamentos e atualizando os indicadores… Aguarde.'
                  : refining
                    ? 'Validando ajustes e recalculando contagens…'
                    : generationNotice || 'Gerando propostas com IA… Aguarde.'}
              </Typography>
            </Stack>
          )}
          {generationQuery.isError && generationNotice && (
            <Alert severity="warning" sx={{ width: '100%' }}>
              A consulta de andamento não respondeu. A geração pode continuar no
              servidor; o sistema tentará consultar novamente.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          <Button
            disabled={(busy && !generationNotice) || audioBusy}
            onClick={() => {
              setConfirm(false);
              setOpen(false);
            }}
          >
            Fechar
          </Button>
          {result && (
            <Button
              disabled={busy || audioBusy}
              onClick={() => {
                setResult(null);
                setSelected([]);
                setConfirmed([]);
                setConfirm(false);
                void query.refetch();
              }}
            >
              Rever contexto e gerar novamente
            </Button>
          )}
          {result && (
            <Button
              variant="contained"
              disabled={busy || !!editError || !selected.length || confirm}
              onClick={() => setConfirm(true)}
            >
              {applying
                ? 'Criando agrupamentos…'
                : `Criar ${selected.length} agrupamento(s) selecionado(s)`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog
        open={open && confirm && !!current}
        onClose={() => setConfirm(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="grouping-confirm-title"
      >
        <DialogTitle id="grouping-confirm-title">
          Confirmar criação dos agrupamentos
        </DialogTitle>
        <DialogContent dividers>
          <Typography>
            Você selecionou {selected.length} agrupamento(s) em “
            {current ? MODE_LABELS[current.mode] : ''}”.
          </Typography>
          <Typography sx={{ mt: 6 }}>
            Isso combinará dados nos indicadores e poderá alterar a
            probabilidade usada na análise dos setores. Os agrupamentos
            existentes serão preservados.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 8, gap: 4, flexWrap: 'wrap' }}>
          <Button onClick={() => setConfirm(false)}>Voltar à revisão</Button>
          <Button
            variant="contained"
            disabled={busy || !!editError || !selected.length}
            onClick={() => void apply()}
          >
            Confirmar criação dos selecionados
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
