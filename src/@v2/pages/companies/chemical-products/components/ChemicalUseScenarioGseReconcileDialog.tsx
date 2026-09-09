import {
  applyChemicalUseScenarioGseReconcile,
  browseChemicalUseScenarios,
  previewChemicalUseScenarioGseReconcile,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalUseScenarioBoardRow,
  ChemicalUseScenarioListItem,
  ChemicalUseScenarioGseReconcilePreview,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Button,
  Checkbox,
  Collapse,
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
} from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { useEffect, useMemo, useState } from 'react';

import {
  buildUseScenarioGseReconcileApplyPayload,
  countUseScenarioGseReconcileStatuses,
  createUseScenarioGseReconcileDraft,
  formatUseScenarioGseGroupImpact,
  groupUseScenarioGseReconcilePreview,
  identifyUseScenarioForReconcile,
  isChemicalUseScenarioReconcileStaleError,
  USE_SCENARIO_GSE_MATCH_STATUS_LABEL,
  type UseScenarioGseReconcileDraft,
  type UseScenarioGseReconcileGroup,
} from './chemical-use-scenario-gse.util';

type Props = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  rows: ChemicalUseScenarioBoardRow[];
  onClose: () => void;
  onApplied: (appliedCount: number) => void;
};

export const ChemicalUseScenarioGseReconcileDialog = ({
  open,
  companyId,
  workspaceId,
  rows,
  onClose,
  onApplied,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [preview, setPreview] =
    useState<ChemicalUseScenarioGseReconcilePreview | null>(null);
  const [drafts, setDrafts] = useState<UseScenarioGseReconcileDraft[]>([]);
  const [listRows, setListRows] = useState<ChemicalUseScenarioListItem[]>([]);

  const groups = useMemo(
    () => groupUseScenarioGseReconcilePreview(preview?.items || []),
    [preview],
  );

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    setStale(false);
    setApplying(false);
    try {
      const [data, listed] = await Promise.all([
        previewChemicalUseScenarioGseReconcile({
          companyId,
          workspaceId,
        }),
        browseChemicalUseScenarios({ companyId, workspaceId }).catch(() => []),
      ]);
      setPreview(data);
      setListRows(listed);
      setDrafts(
        groupUseScenarioGseReconcilePreview(data.items).map(
          createUseScenarioGseReconcileDraft,
        ),
      );
    } catch (err: unknown) {
      setPreview(null);
      setDrafts([]);
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Não foi possível carregar o preview de reconciliação.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadPreview();
    // Preview is fetched only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, companyId, workspaceId]);

  const counts = useMemo(
    () => countUseScenarioGseReconcileStatuses(preview?.items || []),
    [preview],
  );
  const applyPayload = useMemo(() => {
    if (!preview) {
      return { ok: false as const, error: 'Carregue o preview.' };
    }
    return buildUseScenarioGseReconcileApplyPayload({
      previewFingerprint: preview.previewFingerprint,
      groups,
      drafts,
    });
  }, [preview, groups, drafts]);

  const patchDraft = (
    groupKey: string,
    patch: Partial<UseScenarioGseReconcileDraft>,
  ) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.groupKey === groupKey ? { ...draft, ...patch } : draft,
      ),
    );
  };

  const apply = async () => {
    if (!preview || !applyPayload.ok || applying || stale) return;
    setApplying(true);
    setError(null);
    try {
      const result = await applyChemicalUseScenarioGseReconcile({
        companyId,
        workspaceId,
        ...applyPayload.body,
      });
      onApplied(result.appliedCount);
      onClose();
    } catch (err: unknown) {
      if (isChemicalUseScenarioReconcileStaleError(err)) {
        setStale(true);
        setError(
          'Os dados de cenários ou GSEs mudaram desde este preview. Recarregue e confirme novamente. Nada foi gravado.',
        );
        return;
      }
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Não foi possível aplicar a reconciliação.',
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onClose={applying ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Reconciliar GSEs</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} mt={1}>
          <SText fontSize={13} color="text.secondary">
            Confirme a correspondência documental → GSE real. Uma decisão vale
            para todos os cenários daquele código. O snapshot da coleta permanece
            como evidência histórica.
          </SText>
          {loading ? <SText fontSize={13}>Carregando preview…</SText> : null}
          {preview && !loading ? (
            <SText fontSize={13}>
              {groups.length} correspondências · {counts.total} cenários ·{' '}
              {counts.matchUnique} match único · {counts.alreadyLinked} já
              vinculados · {counts.ambiguous} ambíguos · {counts.noMatch} sem
              match
            </SText>
          ) : null}
          {stale ? (
            <Alert severity="warning">
              Preview desatualizado (409 CHEMICAL_USE_SCENARIO_RECONCILE_STALE).
              Nada foi gravado. Gere um novo preview para continuar.
            </Alert>
          ) : null}
          {error && !stale ? <Alert severity="error">{error}</Alert> : null}
          {groups.map((group) => {
            const draft = drafts.find((entry) => entry.groupKey === group.key);
            if (!draft) return null;
            return (
              <ReconcileGroupCard
                key={group.key}
                group={group}
                draft={draft}
                scenarios={[...listRows, ...rows]}
                disabled={applying || stale}
                onPatch={(patch) => patchDraft(group.key, patch)}
              />
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={applying}>
          Cancelar
        </Button>
        {stale ? (
          <Button variant="contained" onClick={() => void loadPreview()}>
            Novo preview
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => void apply()}
            disabled={!applyPayload.ok || applying || loading}
          >
            {applying ? 'Aplicando…' : 'Aplicar vínculos confirmados'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

function ReconcileGroupCard({
  group,
  draft,
  scenarios,
  disabled,
  onPatch,
}: {
  group: UseScenarioGseReconcileGroup;
  draft: UseScenarioGseReconcileDraft;
  scenarios: Array<
    Pick<ChemicalUseScenarioBoardRow, 'id' | 'activityName' | 'product'>
  >;
  disabled: boolean;
  onPatch: (patch: Partial<UseScenarioGseReconcileDraft>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const canInclude =
    (group.kind === 'MATCH_UNIQUE' || group.kind === 'AMBIGUOUS') &&
    group.pendingItems.length > 0;
  const affectedCount = group.items.length;

  return (
    <Stack
      spacing={0.75}
      sx={{
        p: 1.25,
        border: '1px solid',
        borderColor: group.kind === 'CONFLICT' ? 'warning.main' : 'divider',
        borderRadius: 1,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={1}
      >
        <SText fontWeight={600} fontSize={14}>
          {group.headline}
        </SText>
        <SText fontSize={12} color="text.secondary">
          {group.kind === 'CONFLICT'
            ? 'Conflito'
            : USE_SCENARIO_GSE_MATCH_STATUS_LABEL[group.kind]}
        </SText>
      </Stack>
      <SText fontSize={13}>{formatUseScenarioGseGroupImpact(group)}</SText>
      {group.conflictReason ? (
        <Alert severity="warning">{group.conflictReason}</Alert>
      ) : null}
      {group.kind === 'AMBIGUOUS' ? (
        <FormControl size="small" disabled={disabled}>
          <InputLabel>Escolher GSE candidato</InputLabel>
          <Select
            label="Escolher GSE candidato"
            value={draft.selectedHomogeneousGroupId || ''}
            onChange={(event) =>
              onPatch({
                selectedHomogeneousGroupId: event.target.value || null,
                included: Boolean(event.target.value),
              })
            }
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            {group.candidates.map((candidate) => (
              <MenuItem key={candidate.id} value={candidate.id}>
                {candidate.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
      {canInclude ? (
        <FormControlLabel
          control={
            <Checkbox
              checked={draft.included}
              disabled={
                disabled ||
                (group.kind === 'AMBIGUOUS' && !draft.selectedHomogeneousGroupId)
              }
              onChange={(event) => onPatch({ included: event.target.checked })}
            />
          }
          label="Aplicar este vínculo"
        />
      ) : null}
      <Button
        size="small"
        onClick={() => setExpanded((current) => !current)}
        sx={{ alignSelf: 'flex-start', px: 0 }}
      >
        {expanded
          ? 'Ocultar cenários'
          : `Ver ${affectedCount} ${affectedCount === 1 ? 'cenário' : 'cenários'}`}
      </Button>
      <Collapse in={expanded}>
        <Stack spacing={0.5}>
          {group.items.map((item) => {
            const identity = identifyUseScenarioForReconcile(item, scenarios);
            const linked = item.status === 'ALREADY_LINKED';
            return (
              <SText key={item.scenarioId} fontSize={12} color="text.secondary">
                {identity.productName} · {identity.activityName}
                {linked
                  ? ` · já vinculado${
                      item.currentHomogeneousGroup?.name
                        ? ` a ${item.currentHomogeneousGroup.name}`
                        : ''
                    }`
                  : ''}
              </SText>
            );
          })}
        </Stack>
      </Collapse>
    </Stack>
  );
}
