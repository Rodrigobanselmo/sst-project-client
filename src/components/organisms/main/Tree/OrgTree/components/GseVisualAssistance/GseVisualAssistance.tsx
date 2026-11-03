import { preliminaryGseDistribution } from './gse-ai-preliminary';
import { GseConsultativeInfo } from './GseConsultativeInfo';
import { useQuery } from 'react-query';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';
import { invalidateGhoAndHierarchyFamilies } from 'core/services/hooks/mutations/checklist/gho/invalidate-gho-queries.util';
import { reconcileSavedReview } from './gse-additive-save';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { GseAiRegistryBridge } from './GseAiRegistryBridge';
import { GseOccupationalAnalysis } from './GseOccupationalAnalysis';
import { GseLinkSymbol } from './GseLinkSymbol';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
  Popover,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { api } from 'core/services/apiClient';
import type { IGho } from 'core/interfaces/api/IGho';
import {
  selectAllHierarchyTreeNodes,
  selectWorkplaceId,
} from 'store/reducers/hierarchy/hierarchySlice';
import { AiAnalyzeGuidanceAudioField } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/AiAnalyzeGuidanceAudioField';
import { TreeTypeEnum } from '../../enums/tree-type.enums';
import {
  GseVisualAssistanceContext,
  useGseVisualAssistance,
} from './GseVisualAssistance.context';
import { visualScopeSignature } from './gse-visual-assistance.model';
import type { ReviewState } from './gse-visual-assistance.model';
import {
  emptyIntegratedReview,
  editProposedGse,
  scopedExistingGroups,
  generateIntegratedReview,
  addReviewChange,
  decideReviewChange,
  decideCreation,
  REVIEW_COLORS,
  effectiveReviewChanges,
} from './gse-integrated-review.model';
import type { IntegratedReview } from './gse-integrated-review.model';

/** Existing audio transcription. Occupational writes require the separate explicit confirmation flow. */
export async function transcribeVisualGuidance({
  audio,
  fileName,
}: {
  audio: Blob;
  fileName?: string;
}): Promise<{ text: string }> {
  const body = new FormData();
  body.append('audio', audio, fileName || 'recording.webm');
  return (await api.post<{ text: string }>('/ai-chat/transcribe', body)).data;
}
type Session = {
  scope: string;
  signature: string;
  guidance: string;
  review: IntegratedReview;
};
export function GseVisualAssistanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [persistenceBusy, setPersistenceBusy] = useState(false);
  const [aiAnalysisActive, setAiAnalysisActive] = useState(false);
  const nodes = useAppSelector(selectAllHierarchyTreeNodes),
    selectedWorkspace = useAppSelector(selectWorkplaceId);
  const { query } = useRouter();
  const { data: company } = useQueryCompany();
  const companyId = company?.id || '';
  const [active, setActive] = useState(false),
    [choice, setChoice] = useState<string | null>(null),
    [guidance, setGuidance] = useState('');
  const [session, setSession] = useState<Session | null>(null),
    [selected, setSelected] = useState<string | null>(null),
    [error, setError] = useState('');
  const workspaces = useMemo(
    () =>
      Object.values(nodes)
        .filter((n) => n.type === TreeTypeEnum.WORKSPACE)
        .map((n) => ({ id: String(n.id), name: n.label }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [nodes],
  );
  const desired =
    choice ??
    ((typeof query.tabWorkspaceId === 'string'
      ? query.tabWorkspaceId
      : selectedWorkspace) ||
      '');
  const workspaceId = workspaces.some((w) => w.id === desired)
    ? desired
    : choice === null && workspaces.length === 1
      ? workspaces[0].id
      : '';
  const {
    data: loaded,
    isLoading,
    isError,
  } = useQueryGHOAll(companyId, undefined, { enabled: active && !!companyId });
  const identityQuery = useQuery(
    [QueryEnum.GHO, companyId, 'visual-identities', workspaceId],
    async () => {
      const { data } = await api.get<{
        companyId: string;
        workspaceId: string;
        entries: { temporaryId: string; groupId: string }[];
      }>(
        `/v2/companies/${companyId}/workspaces/${workspaceId}/gse-changes/additive/identities`,
      );
      if (
        data.companyId !== companyId ||
        data.workspaceId !== workspaceId ||
        !Array.isArray(data.entries)
      )
        throw new Error(
          'Resposta de identificação de GSEs incompatível com o escopo.',
        );
      return data;
    },
    {
      enabled: active && !!companyId && !!workspaceId,
      staleTime: 0,
      cacheTime: 0,
    },
  );
  const identityUnavailable =
    identityQuery.isLoading ||
    identityQuery.isFetching ||
    identityQuery.isError ||
    !identityQuery.data;
  const groups = useMemo(
    () => scopedExistingGroups(loaded, companyId, workspaceId),
    [loaded, companyId, workspaceId],
  );
  const scope = JSON.stringify([companyId, workspaceId]);
  const signature = JSON.stringify([
    visualScopeSignature(nodes, companyId, workspaceId),
    identityQuery.data?.entries,
    groups
      .map((g) => [g.id, g.name, g.workspaceIds])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  ]);
  const latest = useRef({ scope, signature, guidance });
  latest.current = { scope, signature, guidance };
  const current = session?.scope === scope ? session : null;
  const review = current?.review || emptyIntegratedReview();
  const stale =
    !!current &&
    (current.signature !== signature || current.guidance !== guidance);
  // Presentation adapter only: temporary rows never enter manual mutation callbacks.
  const rows = useMemo(
    () => [
      ...groups,
      ...review.newGroups.map(
        (g) =>
          ({
            id: g.id,
            name: g.name,
            type: 0,
            companyId,
            status: 'ACTIVE',
            description: g.description ?? '',
            workspaceIds: [workspaceId],
            hierarchies: [],
          }) as unknown as IGho,
      ),
    ],
    [groups, review, companyId, workspaceId],
  );
  const selectedGroupId = rows.some((g) => g.id === selected) ? selected : null;
  useEffect(() => {
    setSession(null);
    setSelected(null);
    setGuidance('');
    setError('');
  }, [scope]);
  const toggle = () => {
    if (persistenceBusy) return;
    setActive((value) => !value);
    setSession(null);
    setSelected(null);
    setGuidance('');
    setError('');
  };
  const update = (fn: (review: IntegratedReview) => IntegratedReview) => {
    if (
      persistenceBusy ||
      stale ||
      !companyId ||
      !workspaceId ||
      isLoading ||
      isError
    )
      return;
    try {
      fn(review);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível revisar.');
      return;
    }
    setSession((previous) => {
      try {
        const value =
          previous?.scope === scope ? previous.review : emptyIntegratedReview();
        const result = fn(value);
        return { scope, signature, guidance, review: result };
      } catch (e) {
        return previous;
      }
    });
  };
  const analyze = () => {
    if (
      persistenceBusy ||
      !companyId ||
      !workspaceId ||
      isLoading ||
      isError ||
      identityUnavailable
    )
      return;
    try {
      const value = generateIntegratedReview(
        nodes,
        groups,
        companyId,
        workspaceId,
        guidance,
        identityQuery.data,
        {
          companyName: company.name || company.fantasy,
          workspaceName: workspaces.find((w) => w.id === workspaceId)?.name,
          previous: review,
        },
      );
      setSession({ scope, signature, guidance, review: value });
      setSelected(value.changes[0]?.groupId || groups[0]?.id || null);
      setError('');
    } catch (e) {
      setSession(null);
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível identificar os GSEs existentes.',
      );
    }
  };
  const propose = (groupId: string, nodeId: string, kind: 'ADD' | 'REMOVE') =>
    update((r) =>
      addReviewChange(r, nodes, groups, workspaceId, groupId, nodeId, kind),
    );
  const decide = (id: string, value: ReviewState) =>
    update((r) => decideReviewChange(r, id, value));
  const decideGroup = (id: string, value: ReviewState) => {
    try {
      decideCreation(review, id, value);
      setError('');
      update((r) => decideCreation(r, id, value));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível revisar.');
    }
  };
  const renameGroup = (id: string, name: string) =>
    update((r) => editProposedGse(r, id, { name }));
  const describeGroup = (id: string, description: string) =>
    update((r) => editProposedGse(r, id, { description }));
  const [navigationRequest, setNavigationRequest] = useState<{
    groupId: string;
    sequence: number;
  }>();
  return (
    <GseVisualAssistanceContext.Provider
      value={{
        persistenceBusy,
        setPersistenceBusy,
        persisted: async (request, result) => {
          const savedScope = scope;
          setSession((previous) =>
            previous?.scope === savedScope
              ? {
                  ...previous,
                  review: reconcileSavedReview(
                    previous.review,
                    request,
                    result,
                  ),
                }
              : previous,
          );
          if (latest.current.scope === savedScope)
            setSelected(
              (id) =>
                result.createdGroups.find((g) => g.temporaryId === id)?.id ||
                id,
            );
          await invalidateGhoAndHierarchyFamilies(companyId);
          await queryClient.refetchQueries(
            {
              active: true,
              predicate: (q) =>
                Array.isArray(q.queryKey) &&
                [QueryEnum.GHO, QueryEnum.HIERARCHY].includes(
                  q.queryKey[0] as QueryEnum,
                ) &&
                q.queryKey[1] === companyId,
            },
            { throwOnError: true },
          );
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve()),
          );
          setSession((previous) =>
            previous?.scope === savedScope &&
            latest.current.scope === savedScope
              ? {
                  ...previous,
                  signature: latest.current.signature,
                  guidance: latest.current.guidance,
                }
              : previous,
          );
        },
        active,
        aiAnalysisActive,
        setAiAnalysisActive,
        toggle,
        companyId,
        workspaceId,
        setWorkspaceId: (id) => {
          if (!persistenceBusy) setChoice(id);
        },
        workspaces,
        nodes,
        groups,
        rows,
        guidance,
        setGuidance: (text) => {
          if (!persistenceBusy) setGuidance(text);
        },
        review,
        hasAnalysis: !!current,
        selectedGroupId,
        navigationRequest,
        selectGroup: (id) => {
          setSelected(id);
          if (id)
            setNavigationRequest((r) => ({
              groupId: id,
              sequence: (r?.sequence || 0) + 1,
            }));
        },
        stale,
        loading: persistenceBusy || isLoading || isError || identityUnavailable,
        error:
          isError || identityQuery.isError
            ? 'Não foi possível consultar os GSEs existentes.'
            : error,
        analyze,
        propose,
        decide,
        decideGroup,
        renameGroup,
        describeGroup,
      }}
    >
      {children}
    </GseVisualAssistanceContext.Provider>
  );
}
export function GseAssistanceLegend() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      gap={1}
      aria-label="Legenda da assistência de GSEs"
      sx={{ fontSize: 11, ml: 'auto', flexWrap: 'nowrap' }}
    >
      <Box component="span" sx={{ whiteSpace: 'nowrap', mr: 0.5 }}>
        Vínculos
      </Box>
      {(
        [
          ['existing', 'Vínculo existente'],
          ['add', 'Inclusão sugerida'],
          ['remove', 'Retirada sugerida'],
        ] as const
      ).map(([kind, label]) => (
        <Tooltip key={kind} title={label} arrow>
          <Box
            component="span"
            tabIndex={0}
            aria-label={label}
            sx={{ display: 'inline-flex' }}
          >
            <GseLinkSymbol kind={kind} />
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
}
export function GseGroupLegend() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      aria-label="Estados dos GSEs"
      sx={{ fontSize: 11 }}
    >
      <span>GSEs</span>
      {(['neutral', 'changedGroup', 'newGroup'] as const).map((key, i) => (
        <Tooltip
          key={key}
          arrow
          title={
            [
              'GSE existente sem alterações',
              'GSE existente com alterações propostas',
              'Novo GSE sugerido',
            ][i]
          }
        >
          <Box
            component="span"
            tabIndex={0}
            aria-label={
              [
                'GSE existente sem alterações',
                'GSE existente com alterações propostas',
                'Novo GSE sugerido',
              ][i]
            }
            sx={{
              display: 'inline-block',
              width: 28,
              height: 16,
              borderRadius: 0.5,
              border: `2px solid ${REVIEW_COLORS[key].color}`,
              bgcolor: REVIEW_COLORS[key].background,
            }}
          />
        </Tooltip>
      ))}
    </Stack>
  );
}
/** Single activation control, mounted only inside the original panel header. */
export function GseAssistanceToolbar() {
  const ctx = useGseVisualAssistance();
  if (!ctx) return null;
  return (
    <Tooltip title="Assistência de GSEs — prévia visual" arrow>
      <IconButton
        size="small"
        aria-label="Assistência de GSEs — prévia visual"
        aria-pressed={ctx.active}
        onClick={ctx.toggle}
        disabled={ctx.persistenceBusy}
        sx={
          ctx.active
            ? {
                color: '#7C3DB5',
                bgcolor: '#F0E6FA',
                border: '1px solid #7C3DB5',
              }
            : undefined
        }
      >
        <AutoAwesomeOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
export function GseAssistanceInfo() {
  const ctx = useGseVisualAssistance();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!ctx?.active) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <Typography variant="caption" color="text.primary">
        Prévia — alterações ainda não aplicadas
      </Typography>
      <Tooltip title="Informações da revisão">
        <IconButton
          size="small"
          aria-label="Informações da revisão"
          aria-expanded={!!anchor}
          aria-controls={anchor ? 'gse-review-info' : undefined}
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <Box component="span" sx={{ fontSize: 16 }}>
            ⓘ
          </Box>
        </IconButton>
      </Tooltip>
      <Popover
        id="gse-review-info"
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <GseReviewDetails />
      </Popover>
    </Box>
  );
}
export function GseReviewDetails() {
  const ctx = useGseVisualAssistance();
  if (!ctx?.active) return null;
  const changes = effectiveReviewChanges(ctx.review);
  return (
    <Box sx={{ p: 2, maxWidth: 330 }}>
      <Typography variant="body2" color="text.primary">
        Análise estrutural determinística · sem modelo de IA.
      </Typography>
      <Typography variant="body2" color="text.primary">
        Decisões temporárias. Nenhuma gravação ocupacional. Exposição homogênea
        não confirmada; revisão humana necessária.
      </Typography>
      <Typography variant="body2" color="text.primary">
        {ctx.review.newGroups.length} GSE(s) sugerido(s). Vínculos:{' '}
        {changes.filter((c) => c.decision === 'accepted').length} aceito(s),{' '}
        {changes.filter((c) => c.decision === 'pending').length} pendente(s),{' '}
        {ctx.review.changes.filter((c) => c.decision === 'rejected').length}{' '}
        rejeitado(s).
      </Typography>
      <Typography variant="body2" color="text.primary">
        Criações:{' '}
        {ctx.review.newGroups.filter((g) => g.decision === 'accepted').length}{' '}
        aprovada(s),{' '}
        {ctx.review.newGroups.filter((g) => g.decision === 'rejected').length}{' '}
        rejeitada(s),{' '}
        {ctx.review.newGroups.filter((g) => g.decision === 'pending').length}{' '}
        pendente(s).
      </Typography>
      <Typography variant="body2" color="text.primary">
        GSE selecionado: +
        {
          changes.filter(
            (c) => c.groupId === ctx.selectedGroupId && c.kind === 'ADD',
          ).length
        }{' '}
        / −
        {
          changes.filter(
            (c) => c.groupId === ctx.selectedGroupId && c.kind === 'REMOVE',
          ).length
        }
        .
      </Typography>
    </Box>
  );
}
/** Controls in the EXISTING GSE panel; no independent proposal/composition list. */
export function GseAssistanceControls() {
  const ctx = useGseVisualAssistance();
  const [open, setOpen] = useState(false),
    [audioBusy, setAudioBusy] = useState(false);
  if (!ctx?.active) return null;
  return (
    <Box sx={{ mb: 1 }}>
      <TextField
        select
        fullWidth
        size="small"
        label="Estabelecimento"
        disabled={ctx.persistenceBusy}
        value={ctx.workspaceId}
        onChange={(e) => ctx.setWorkspaceId(e.target.value)}
        sx={{ my: 1 }}
      >
        <MenuItem value="">Selecione</MenuItem>
        {ctx.workspaces.map((w) => (
          <MenuItem key={w.id} value={w.id}>
            {w.name}
          </MenuItem>
        ))}
      </TextField>
      <Typography variant="body2" fontWeight={600}>
        Análise e revisão de GSEs
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        <GseConsultativeInfo label="Sobre a análise estrutural">
          Examina a organização e os vínculos hierárquicos. Para interpretar
          atividades e revisar a compatibilidade ocupacional, utilize Analisar
          com IA.
        </GseConsultativeInfo>
        <Button size="small" onClick={() => setOpen((v) => !v)}>
          Orientações / voz
        </Button>
        <Button
          size="small"
          disabled={!ctx.workspaceId || ctx.loading || audioBusy}
          onClick={ctx.analyze}
        >
          Analisar estrutura
        </Button>
      </Stack>
      <GseAiRegistryBridge
        key={`ai/${ctx.companyId}/${ctx.workspaceId}`}
        companyId={ctx.companyId}
        workspaceId={ctx.workspaceId}
        preliminaryDistribution={preliminaryGseDistribution(ctx.review, ctx.nodes, ctx.groups)}
        onAnalysisPresence={ctx.setAiAnalysisActive}
        guidance={ctx.guidance}
        disabled={!!ctx.persistenceBusy || ctx.loading || audioBusy}
        onLocate={ctx.selectGroup}
      />
      <GseOccupationalAnalysis
        key={`${ctx.companyId}/${ctx.workspaceId}`}
        companyId={ctx.companyId}
        workspaceId={ctx.workspaceId}
        disabled={!!ctx.persistenceBusy || ctx.loading || audioBusy}
        onLocate={ctx.selectGroup}
      />
      <Collapse in={open} unmountOnExit>
        <Box key={`${ctx.companyId}/${ctx.workspaceId}`} sx={{ my: 1 }}>
          <AiAnalyzeGuidanceAudioField
            label="Orientações opcionais para revisão"
            companyId={ctx.companyId}
            workspaceId={ctx.workspaceId}
            value={ctx.guidance}
            onChange={ctx.setGuidance}
            onTranscription={(text) =>
              ctx.setGuidance([ctx.guidance, text].filter(Boolean).join('\n'))
            }
            transcribe={transcribeVisualGuidance}
            disabled={!ctx.workspaceId || ctx.persistenceBusy}
            onBusyChange={setAudioBusy}
          />
          <Typography variant="caption" color="text.primary">
            Revise a transcrição. O texto orienta a revisão estrutural humana
            e é enviado à IA somente ao acionar Analisar com IA.
          </Typography>
        </Box>
      </Collapse>
      {ctx.stale && (
        <Alert severity="warning" sx={{ my: 1 }}>
          Contexto alterado. Analise novamente; decisões anteriores estão
          suspensas.
        </Alert>
      )}
      {ctx.error && <Alert severity="error">{ctx.error}</Alert>}
    </Box>
  );
}
