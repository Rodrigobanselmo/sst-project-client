import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { useMutCreateGseFromProposal } from '@v2/services/security/exposure-group-assistant/hooks/useMutCreateGseFromProposal';
import { useMutPreviewCreateGse } from '@v2/services/security/exposure-group-assistant/hooks/useMutPreviewCreateGse';
import { useMutRefineGseDraft } from '@v2/services/security/exposure-group-assistant/hooks/useMutRefineGseDraft';
import { useFetchSimilarityProposals } from '@v2/services/security/exposure-group-assistant/hooks/useFetchSimilarityProposals';
import type {
  CreateGseFromProposalResult,
  CreateGsePreviewResult,
  GseDraftClassification,
  GseDraftProposal,
  GseDraftTextFields,
  GseDraftWarning,
  GseMaterializationStatus,
  GseProposalMaterialization,
  RefineGseDraftResult,
  SimilarityCandidate,
  SimilarityConfidence,
  SimilarityProposalMode,
  SimilarityProposalsResponse,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';
import { useSnackbar } from 'notistack';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { queryGho } from 'core/services/hooks/queries/useQueryGho/useQueryGho';
import { CHARACTERIZATION_TYPE_FILTER_OPTIONS } from './characterization-type-label';
import { SimilarityRiskOriginBadge } from './SimilarityRiskOriginBadge';
import {
  buildGseCreateBody,
  buildGseSharedBody,
  extractGseDraftTextFields,
} from './build-gse-proposal-body';
import { resolveGseAssistantErrorMessage, resolveGseRefineUserMessage } from './gse-assistant-error.utils';
import {
  buildOpenGseModalPayload,
  resolveImplementedProposalCopy,
} from './open-gse-from-assistant';
import { resolveDiscardedPairUserNarrative } from './discarded-pair-narrative';
import {
  candidateListKey,
  formatRiskDisplayName,
  GSE_DRAFT_CLASSIFICATION_LABEL,
  inferProposalMode,
  PROPOSAL_MODE_LABEL,
  resolveProposalDisplayName,
  resolveProposalJustificationPreview,
  resolveProposalRoleLabels,
} from './similarity-proposal-presentation';
import { useSimilarityRiskLabels } from './useSimilarityRiskLabels';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

const ROWS_PER_PAGE = 10;
const DISPLAY_LIMIT = 80;

const CONFIDENCE_LABEL: Record<SimilarityConfidence, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
  NONE: 'Nenhuma',
};

type Props = {
  companyId: string;
  workspaceId: string;
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

function RiskNameList({
  riskIds,
  labels,
}: {
  riskIds: string[];
  labels: Map<string, { name: string; code?: string | null }>;
}) {
  if (!riskIds.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nenhum
      </Typography>
    );
  }
  return (
    <Stack spacing={0.35} component="ul" sx={{ m: 0, pl: 2 }}>
      {riskIds.map((id) => (
        <Typography key={id} component="li" variant="body2">
          {formatRiskDisplayName(id, labels)}
        </Typography>
      ))}
    </Stack>
  );
}

function SectionBody({
  children,
  empty = false,
}: {
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <Typography
      variant="body2"
      sx={{ mt: 0.5 }}
      color={empty ? 'text.secondary' : 'text.primary'}
    >
      {children}
    </Typography>
  );
}

function DraftClassificationChip({
  classification,
}: {
  classification: GseDraftClassification;
}) {
  return (
    <Chip
      size="small"
      label={GSE_DRAFT_CLASSIFICATION_LABEL[classification]}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
}

function DraftWarningAlert({ warning }: { warning: GseDraftWarning }) {
  const severity =
    warning.severity === 'CRITICAL'
      ? 'error'
      : warning.severity === 'ATTENTION'
        ? 'warning'
        : 'info';
  return (
    <Alert severity={severity} sx={{ py: 0.25 }}>
      {warning.message}
    </Alert>
  );
}

function ProposalModeChip({ mode }: { mode: SimilarityProposalMode }) {
  return (
    <Chip
      size="small"
      label={PROPOSAL_MODE_LABEL[mode]}
      color={mode === 'CONSOLIDATED' ? 'primary' : 'default'}
      variant={mode === 'CONSOLIDATED' ? 'filled' : 'outlined'}
      sx={{ fontWeight: 600 }}
    />
  );
}

const MATERIALIZATION_LABEL: Record<GseMaterializationStatus, string> = {
  NOT_MATERIALIZED: 'Disponível',
  EXACT_CREATED_PROPOSAL: 'GSE criado',
  EXACT_EXISTING_GSE: 'Atendida por GSE existente',
  PARTIAL_OVERLAP: 'Sobreposição com GSE existente',
};

function MaterializationChip({
  materialization,
}: {
  materialization?: GseProposalMaterialization;
}) {
  if (!materialization || materialization.status === 'NOT_MATERIALIZED') return null;
  const color =
    materialization.status === 'PARTIAL_OVERLAP'
      ? 'warning'
      : materialization.status === 'EXACT_CREATED_PROPOSAL'
        ? 'success'
        : 'info';
  const label =
    materialization.status === 'EXACT_CREATED_PROPOSAL' ||
    materialization.status === 'EXACT_EXISTING_GSE'
      ? resolveImplementedProposalCopy(materialization.status).badge
      : MATERIALIZATION_LABEL[materialization.status];
  return (
    <Chip
      size="small"
      color={color}
      variant="filled"
      label={label}
      sx={{ fontWeight: 700 }}
    />
  );
}

function isCreationBlockedByMaterialization(
  materialization?: GseProposalMaterialization,
): boolean {
  return (
    materialization?.status === 'EXACT_CREATED_PROPOSAL' ||
    materialization?.status === 'EXACT_EXISTING_GSE'
  );
}

function ProposalCompactRow({
  candidate,
  onView,
  onOpenGse,
}: {
  candidate: SimilarityCandidate;
  onView: (c: SimilarityCandidate) => void;
  onOpenGse: (gseId: string) => void;
}) {
  const mode = inferProposalMode(candidate);
  const displayName = resolveProposalDisplayName(candidate);
  const roles = resolveProposalRoleLabels(candidate);
  const justification = resolveProposalJustificationPreview(candidate);
  const riskCount =
    candidate.draft?.includedRisks.count ?? candidate.commonRiskIds.length;
  const classification = candidate.draft?.classification;
  const materialization = candidate.materialization;
  const blocked = isCreationBlockedByMaterialization(materialization);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: blocked ? 'success.light' : 'divider',
        borderRadius: 1,
        px: 1.25,
        py: 1,
        bgcolor: blocked
          ? (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(46, 125, 50, 0.08)'
                : 'rgba(232, 245, 233, 0.6)'
          : undefined,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <MaterializationChip materialization={materialization} />
            <ProposalModeChip mode={mode} />
            {classification ? (
              <DraftClassificationChip classification={classification} />
            ) : null}
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ minWidth: 0 }}
              noWrap
            >
              {displayName}
            </Typography>
          </Stack>

          {blocked ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {resolveImplementedProposalCopy(materialization?.status ?? '').explanation}
              {materialization?.homogeneousGroupName ? (
                <>
                  {' '}
                  GSE atual: <strong>{materialization.homogeneousGroupName}</strong>
                </>
              ) : null}
              {materialization?.createdAt
                ? ` · ${new Date(materialization.createdAt).toLocaleString('pt-BR')}`
                : ''}
              {materialization?.createdByName ? ` · ${materialization.createdByName}` : ''}
            </Typography>
          ) : null}

          {materialization?.status === 'PARTIAL_OVERLAP' ? (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}
            >
              Sobreposição parcial com “{materialization.homogeneousGroupName}” — revisão técnica.
            </Typography>
          ) : null}

          <Stack
            direction="row"
            spacing={0.75}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 0.75 }}
          >
            <Chip
              size="small"
              variant="outlined"
              label={`${candidate.elementCount} elemento${
                candidate.elementCount === 1 ? '' : 's'
              }`}
            />
            <Chip
              size="small"
              variant="outlined"
              label={
                candidate.employeeCoverage?.summaryLabel ??
                `${candidate.coveredEmployeeCountUnion} empregado${
                  candidate.coveredEmployeeCountUnion === 1 ? '' : 's'
                }`
              }
            />
            {roles.length > 0 ? (
              <Chip
                size="small"
                variant="outlined"
                label={
                  roles.length === 1
                    ? roles[0]
                    : `${roles.length} cargos`
                }
                sx={{ maxWidth: 280 }}
              />
            ) : null}
            <Chip
              size="small"
              variant="outlined"
              label={`${riskCount} risco${riskCount === 1 ? '' : 's'}`}
            />
          </Stack>

          {justification && !blocked ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.75, display: 'block' }}
            >
              {justification}
            </Typography>
          ) : null}

          {candidate.broadCohortReviewRequired ? (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}
            >
              Cohort amplo — revisão obrigatória
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          {blocked && materialization?.homogeneousGroupId ? (
            <Button
              size="small"
              variant="contained"
              onClick={() => onOpenGse(materialization.homogeneousGroupId!)}
            >
              Abrir GSE
            </Button>
          ) : null}
          <Button
            size="small"
            variant="outlined"
            onClick={() => onView(candidate)}
            sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
          >
            {blocked ? 'Ver detalhes da proposta' : 'Ver proposta'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function ProposalSection({
  title,
  candidates,
  visibleCount,
  onShowMore,
  onView,
  onOpenGse,
}: {
  title: string;
  candidates: SimilarityCandidate[];
  visibleCount: number;
  onShowMore: () => void;
  onView: (c: SimilarityCandidate) => void;
  onOpenGse: (gseId: string) => void;
}) {
  if (!candidates.length) return null;

  const visible = candidates.slice(0, visibleCount);
  const hasMore = candidates.length > visibleCount;

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title} ({candidates.length})
      </Typography>
      <Stack spacing={0.75}>
        {visible.map((c) => (
          <ProposalCompactRow
            key={candidateListKey(c)}
            candidate={c}
            onView={onView}
            onOpenGse={onOpenGse}
          />
        ))}
      </Stack>
      {hasMore ? (
        <Button size="small" variant="text" onClick={onShowMore} sx={{ alignSelf: 'flex-start' }}>
          Mostrar mais ({candidates.length - visibleCount} restante
          {candidates.length - visibleCount === 1 ? '' : 's'})
        </Button>
      ) : null}
    </Stack>
  );
}

const ALERT_SEVERITY_MAP = {
  BLOCKING: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

function GseCreationAlertRow({
  alert,
}: {
  alert: { code: string; message: string; severity: 'INFO' | 'WARNING' | 'BLOCKING' };
}) {
  return (
    <Alert severity={ALERT_SEVERITY_MAP[alert.severity]} sx={{ py: 0.25 }}>
      [{alert.code}] {alert.message}
    </Alert>
  );
}

/** Editable string list — one item per line. Blank lines are ignored on submit. */
function MultilineListEditor({
  label,
  helperText,
  value,
  onChange,
  disabled,
}: {
  label: string;
  helperText?: string;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  return (
    <TextField
      label={label}
      helperText={helperText}
      fullWidth
      multiline
      minRows={2}
      value={value.join('\n')}
      onChange={(e) => onChange(e.target.value.split('\n'))}
      disabled={disabled}
    />
  );
}

const EDITABLE_TEXT_AREA_FIELDS: Array<{
  key: keyof GseDraftTextFields;
  label: string;
  minRows?: number;
}> = [
  { key: 'description', label: 'Descrição', minRows: 3 },
  { key: 'technicalJustification', label: 'Justificativa técnica', minRows: 4 },
  { key: 'formationReason', label: 'Motivo da formação', minRows: 2 },
  { key: 'populationDescription', label: 'População abrangida', minRows: 2 },
  { key: 'operationalContext', label: 'Contexto operacional', minRows: 2 },
  { key: 'occupationalContext', label: 'Contexto ocupacional', minRows: 3 },
];

const EDITABLE_LIST_FIELDS: Array<{
  key: keyof GseDraftTextFields;
  label: string;
  helperText: string;
}> = [
  {
    key: 'inclusionCriteria',
    label: 'Critérios de inclusão',
    helperText: 'Um critério por linha.',
  },
  {
    key: 'exclusionCriteria',
    label: 'Critérios de exclusão',
    helperText: 'Um critério por linha.',
  },
  {
    key: 'reviewNotes',
    label: 'Observações',
    helperText: 'Uma observação por linha.',
  },
];

function sanitizeGseDraftTextFields(texts: GseDraftTextFields): GseDraftTextFields {
  return {
    ...texts,
    inclusionCriteria: texts.inclusionCriteria.map((s) => s.trim()).filter(Boolean),
    exclusionCriteria: texts.exclusionCriteria.map((s) => s.trim()).filter(Boolean),
    reviewNotes: texts.reviewNotes.map((s) => s.trim()).filter(Boolean),
  };
}

function DeterministicVsRefinedComparison({
  deterministic,
  refined,
}: {
  deterministic: GseDraftTextFields;
  refined: GseDraftTextFields;
}) {
  const rows: Array<{ label: string; key: keyof GseDraftTextFields }> = [
    { label: 'Nome', key: 'name' },
    { label: 'Descrição', key: 'description' },
    { label: 'Justificativa técnica', key: 'technicalJustification' },
    { label: 'Motivo de formação', key: 'formationReason' },
    { label: 'População abrangida', key: 'populationDescription' },
    { label: 'Contexto operacional', key: 'operationalContext' },
    { label: 'Contexto ocupacional', key: 'occupationalContext' },
  ];

  const renderValue = (value: string | string[]) =>
    Array.isArray(value) ? (value.length ? value.join(' • ') : '—') : value || '—';

  return (
    <Stack spacing={1.5}>
      {rows.map((row) => (
        <Box key={row.key}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {row.label}
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mt: 0.25 }}>
            <Box
              sx={{
                flex: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Determinístico (original)
              </Typography>
              <Typography variant="body2">{renderValue(deterministic[row.key])}</Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(25, 118, 210, 0.16)'
                    : 'rgba(227, 242, 253, 1)',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Sugestão da IA
              </Typography>
              <Typography variant="body2">{renderValue(refined[row.key])}</Typography>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

type CreateFlowState = {
  editedTexts: GseDraftTextFields;
  deterministicTexts: GseDraftTextFields;
  aiRefined: boolean;
  aiModel?: string;
  aiPromptRevision?: number;
};

function initCreateFlowState(draft: GseDraftProposal): CreateFlowState {
  const texts = extractGseDraftTextFields(draft);
  return {
    editedTexts: texts,
    deterministicTexts: texts,
    aiRefined: false,
    aiModel: undefined,
    aiPromptRevision: undefined,
  };
}

function ProposalCreateConfirmDialog({
  open,
  onClose,
  preview,
  previewLoading,
  createLoading,
  createError,
  createSuccess,
  confirmChecked,
  onConfirmCheckedChange,
  confirmWarningsChecked,
  onConfirmWarningsCheckedChange,
  onConfirmCreate,
  onRetryPreview,
  onFinish,
  onOpenCreatedGse,
}: {
  open: boolean;
  onClose: () => void;
  preview: CreateGsePreviewResult | null;
  previewLoading: boolean;
  createLoading: boolean;
  createError: string | null;
  createSuccess: CreateGseFromProposalResult | null;
  confirmChecked: boolean;
  onConfirmCheckedChange: (checked: boolean) => void;
  confirmWarningsChecked: boolean;
  onConfirmWarningsCheckedChange: (checked: boolean) => void;
  onConfirmCreate: () => void;
  onRetryPreview: () => void;
  onFinish: () => void;
  onOpenCreatedGse: (gseId: string) => void;
}) {
  const canConfirmCreate =
    Boolean(preview) &&
    !preview?.hasBlockingAlerts &&
    confirmChecked &&
    (!preview?.hasWarningAlerts || confirmWarningsChecked) &&
    !createLoading;

  return (
    <Dialog open={open} onClose={createLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar criação do GSE</DialogTitle>
      <DialogContent dividers>
        {createSuccess ? (
          <Stack spacing={1.5}>
            <Alert severity="success">
              <AlertTitle>
                {createSuccess.alreadyExisted
                  ? 'GSE já existente reconhecido'
                  : 'GSE criado com sucesso'}
              </AlertTitle>
              <Typography variant="body2">
                <strong>{createSuccess.name}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {createSuccess.alreadyExisted
                  ? 'Nenhum registro duplicado foi criado.'
                  : 'A proposta foi marcada como implementada.'}
              </Typography>
            </Alert>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {previewLoading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2">Calculando pré-visualização…</Typography>
              </Stack>
            ) : null}

            {preview ? (
              <>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {preview.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preview.description}
                  </Typography>
                </Box>

                <Alert severity="info">
                  Esta ação criará o Grupo Similar de Exposição. Os riscos permanecerão
                  cadastrados nos elementos caracterizáveis de origem — nenhum fator de
                  risco será copiado para o novo GSE.
                </Alert>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={`Elementos de origem: ${preview.impact.originElementsCount}`}
                  />
                  <Chip
                    size="small"
                    label={`Vínculos hierárquicos/cargos: ${preview.impact.hierarchyLinksCount}`}
                  />
                  {preview.impact.employeeUnionCount != null ? (
                    <Chip
                      size="small"
                      label={`Empregados abrangidos: ${preview.impact.employeeUnionCount}`}
                    />
                  ) : null}
                  {preview.impact.riskIdsCount != null ? (
                    <Chip
                      size="small"
                      label={`Riscos considerados: ${preview.impact.riskIdsCount}`}
                    />
                  ) : null}
                  <Chip
                    size="small"
                    variant="outlined"
                    color="success"
                    label="Riscos permanecem nos elementos de origem"
                    title="Nenhum RiskFactorData é copiado para o GSE nesta versão."
                  />
                </Stack>

                {preview.snapshotChangedSincePreview ? (
                  <Alert severity="warning">
                    Os dados do estabelecimento mudaram desde o cálculo da
                    proposta original. Revise antes de confirmar.
                  </Alert>
                ) : null}

                {preview.conflicts.nameAlreadyUsed ||
                preview.conflicts.proposalAlreadyCreated ||
                preview.conflicts.existingEquivalentGse ||
                preview.conflicts.elementsAlreadyLinked.length ? (
                  <Alert severity="warning">
                    <AlertTitle>Conflitos identificados</AlertTitle>
                    {preview.conflicts.nameAlreadyUsed ? (
                      <Typography variant="body2">
                        Já existe um GSE com este nome no estabelecimento.
                      </Typography>
                    ) : null}
                    {preview.conflicts.proposalAlreadyCreated ? (
                      <Typography variant="body2">
                        Esta proposta já foi implementada
                        {preview.conflicts.proposalAlreadyCreated.homogeneousGroupName
                          ? ` como “${preview.conflicts.proposalAlreadyCreated.homogeneousGroupName}”`
                          : ''}
                        .
                      </Typography>
                    ) : null}
                    {preview.conflicts.existingEquivalentGse ? (
                      <Typography variant="body2">
                        Já existe um GSE com composição equivalente:{' '}
                        “{preview.conflicts.existingEquivalentGse.homogeneousGroupName}”.
                      </Typography>
                    ) : null}
                    {preview.conflicts.elementsAlreadyLinked.length ? (
                      <Typography variant="body2">
                        {preview.conflicts.elementsAlreadyLinked.length} elemento(s) já
                        vinculado(s) como origem de outro GSE.
                      </Typography>
                    ) : null}
                  </Alert>
                ) : null}

                {preview.alerts.length ? (
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Alertas
                    </Typography>
                    {preview.alerts.map((a) => (
                      <GseCreationAlertRow key={`${a.code}-${a.message}`} alert={a} />
                    ))}
                  </Stack>
                ) : null}

                <Divider />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={confirmChecked}
                      disabled={preview.hasBlockingAlerts || createLoading}
                      onChange={(e) => onConfirmCheckedChange(e.target.checked)}
                    />
                  }
                  label="Confirmo a criação do Grupo Similar de Exposição"
                />

                {preview.hasWarningAlerts ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={confirmWarningsChecked}
                        disabled={preview.hasBlockingAlerts || createLoading}
                        onChange={(e) => onConfirmWarningsCheckedChange(e.target.checked)}
                      />
                    }
                    label="Revisei os avisos acima e desejo continuar"
                  />
                ) : null}

                {preview.hasBlockingAlerts ? (
                  <Alert severity="error">
                    Existem alertas bloqueantes. Ajuste a proposta antes de
                    criar o GSE.
                  </Alert>
                ) : null}
              </>
            ) : null}

            {createError ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={onRetryPreview}>
                    Recalcular
                  </Button>
                }
              >
                {createError}
              </Alert>
            ) : null}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {createSuccess ? (
          <>
            <Button
              variant="contained"
              onClick={() => onOpenCreatedGse(createSuccess.gseId)}
            >
              Abrir GSE criado
            </Button>
            <Button onClick={onFinish}>Fechar</Button>
          </>
        ) : (
          <>
            <Button disabled={createLoading} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={!canConfirmCreate}
              onClick={onConfirmCreate}
            >
              {createLoading ? 'Criando…' : 'Confirmar criação do GSE'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

function ProposalReviewDialog({
  candidate,
  companyId,
  workspaceId,
  data,
  riskLabels,
  onClose,
  onCreated,
  onOpenGse,
}: {
  candidate: SimilarityCandidate | null;
  companyId: string;
  workspaceId: string;
  data: SimilarityProposalsResponse | undefined;
  riskLabels: Map<string, { name: string; code?: string | null }>;
  onClose: () => void;
  onCreated: () => void;
  onOpenGse: (gseId: string) => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const draft = candidate?.draft ?? null;
  const selectedMode = candidate ? inferProposalMode(candidate) : null;
  const selectedRoles = candidate ? resolveProposalRoleLabels(candidate) : [];
  const materialization = candidate?.materialization;
  const creationBlocked = isCreationBlockedByMaterialization(materialization);

  const [flow, setFlow] = useState<CreateFlowState | null>(null);
  const [refineResult, setRefineResult] = useState<RefineGseDraftResult | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<CreateGsePreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmWarningsChecked, setConfirmWarningsChecked] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<CreateGseFromProposalResult | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const refineMutation = useMutRefineGseDraft();
  const previewMutation = useMutPreviewCreateGse();
  const createMutation = useMutCreateGseFromProposal();

  useEffect(() => {
    if (draft) {
      setFlow(initCreateFlowState(draft));
    } else {
      setFlow(null);
    }
    setRefineResult(null);
    setRefineError(null);
    setPreviewResult(null);
    setPreviewError(null);
    setConfirmDialogOpen(false);
    setConfirmChecked(false);
    setConfirmWarningsChecked(false);
    setCreateSuccess(null);
    setCreateError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate ? candidateListKey(candidate) : null]);

  const riskNameById = useMemo(() => {
    if (!draft) return undefined;
    const map: Record<string, string> = {};
    for (const id of draft.includedRisks.riskIds) {
      const hit = riskLabels.get(id);
      if (hit?.name) map[id] = hit.name;
    }
    return Object.keys(map).length ? map : undefined;
  }, [draft, riskLabels]);

  const updateText = <K extends keyof GseDraftTextFields>(
    key: K,
    value: GseDraftTextFields[K],
  ) => {
    setFlow((prev) =>
      prev
        ? { ...prev, editedTexts: { ...prev.editedTexts, [key]: value }, aiRefined: false }
        : prev,
    );
  };

  const handleRefine = async () => {
    if (!draft) return;
    setRefineError(null);
    try {
      const result = await refineMutation.mutateAsync({
        companyId,
        workspaceId,
        draft,
        riskNameById,
      });
      setRefineResult(result);
      if (!result.refined) {
        enqueueSnackbar(resolveGseRefineUserMessage(result.fallbackReason), {
          variant: 'info',
        });
      } else {
        enqueueSnackbar('Sugestão de redação pronta. Revise e aceite se fizer sentido.', {
          variant: 'success',
        });
      }
    } catch (err) {
      setRefineError(resolveGseAssistantErrorMessage(err));
    }
  };

  const acceptRefine = () => {
    if (!refineResult?.refined) return;
    const { draft: refinedDraft } = refineResult;
    setFlow((prev) =>
      prev
        ? {
            ...prev,
            editedTexts: {
              name: refinedDraft.name,
              description: refinedDraft.description,
              technicalJustification: refinedDraft.technicalJustification,
              formationReason: refinedDraft.formationReason,
              populationDescription: refinedDraft.populationDescription,
              operationalContext: refinedDraft.operationalContext,
              occupationalContext: refinedDraft.occupationalContext,
              inclusionCriteria: refinedDraft.inclusionCriteria,
              exclusionCriteria: refinedDraft.exclusionCriteria,
              reviewNotes: refinedDraft.reviewNotes,
            },
            aiRefined: true,
            aiModel: refineResult.aiModel,
            aiPromptRevision: refineResult.aiPromptRevision ?? undefined,
          }
        : prev,
    );
    setRefineResult(null);
  };

  const discardRefine = () => setRefineResult(null);

  const closeConfirmDialog = () => {
    if (createMutation.isPending) return;
    setConfirmDialogOpen(false);
    setPreviewResult(null);
    setPreviewError(null);
    setCreateError(null);
    setConfirmChecked(false);
    setConfirmWarningsChecked(false);
  };

  const runPreview = async () => {
    if (!draft || !flow || !candidate || !data) return;
    const sanitized = sanitizeGseDraftTextFields(flow.editedTexts);
    if (
      !sanitized.name.trim() ||
      !sanitized.description.trim() ||
      !sanitized.technicalJustification.trim()
    ) {
      enqueueSnackbar(
        'Preencha nome, descrição e justificativa técnica antes de continuar.',
        { variant: 'warning' },
      );
      return;
    }
    setCreateError(null);
    setPreviewError(null);
    try {
      const body = buildGseSharedBody({
        candidate,
        draft,
        editedTexts: sanitized,
        deterministicTexts: flow.deterministicTexts,
        snapshotHash: data.snapshotContentHash,
        algorithmVersion: data.similarityAlgorithmVersion,
        aiRefined: flow.aiRefined,
        aiModel: flow.aiModel,
        aiPromptRevision: flow.aiPromptRevision,
      });
      const result = await previewMutation.mutateAsync({ companyId, workspaceId, body });
      setPreviewResult(result);
    } catch (err) {
      setPreviewError(resolveGseAssistantErrorMessage(err));
    }
  };

  const handleOpenCreateFlow = async () => {
    setConfirmDialogOpen(true);
    setConfirmChecked(false);
    setConfirmWarningsChecked(false);
    setCreateSuccess(null);
    setCreateError(null);
    await runPreview();
  };

  const handleConfirmCreate = async () => {
    if (!draft || !flow || !candidate || !data || !previewResult) return;
    setCreateError(null);
    try {
      const sanitized = sanitizeGseDraftTextFields(flow.editedTexts);
      const body = buildGseCreateBody({
        candidate,
        draft,
        editedTexts: sanitized,
        deterministicTexts: flow.deterministicTexts,
        snapshotHash: data.snapshotContentHash,
        algorithmVersion: data.similarityAlgorithmVersion,
        aiRefined: flow.aiRefined,
        aiModel: flow.aiModel,
        aiPromptRevision: flow.aiPromptRevision,
        proposalFingerprint: previewResult.proposalFingerprint,
        confirmBlockingWarnings: confirmWarningsChecked || undefined,
      });
      const result = await createMutation.mutateAsync({ companyId, workspaceId, body });
      setCreateSuccess(result);
      enqueueSnackbar(
        result.alreadyExisted
          ? `GSE já existente reconhecido: ${result.name}`
          : 'GSE criado com sucesso. A proposta foi marcada como implementada.',
        { variant: 'success' },
      );
      onCreated();
    } catch (err) {
      setCreateError(resolveGseAssistantErrorMessage(err));
    }
  };

  const handleFinishAfterCreate = () => {
    setConfirmDialogOpen(false);
    onCreated();
    onClose();
  };

  const handleOpenCreatedGse = (gseId: string) => {
    setConfirmDialogOpen(false);
    onCreated();
    onClose();
    onOpenGse(gseId);
  };

  const busy = refineMutation.isPending || previewMutation.isPending || createMutation.isPending;

  return (
    <>
      <Dialog open={Boolean(candidate)} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>
          {candidate
            ? `Criar GSE — ${resolveProposalDisplayName(candidate)}`
            : 'Criar GSE a partir da proposta'}
        </DialogTitle>
        <DialogContent dividers>
          {candidate && selectedMode ? (
            <Stack spacing={2.5}>
              {!draft ? (
                <Alert severity="warning">
                  Diagnóstico técnico completo não disponível para esta proposta —
                  a criação assistida de GSE fica indisponível nesta etapa.
                </Alert>
              ) : creationBlocked ? (
                <Alert severity="success">
                  <AlertTitle>
                    {resolveImplementedProposalCopy(materialization?.status ?? '').badge}
                  </AlertTitle>
                  {resolveImplementedProposalCopy(materialization?.status ?? '').explanation}
                  {materialization?.homogeneousGroupName
                    ? ` GSE: ${materialization.homogeneousGroupName}.`
                    : ''}
                  {materialization?.matchReason ? (
                    <Typography variant="body2" sx={{ mt: 0.75 }}>
                      {materialization.matchReason}
                    </Typography>
                  ) : null}
                </Alert>
              ) : (
                <Alert severity="info">
                  Revise o diagnóstico do algoritmo e, em seguida, o documento do GSE
                  (textos editáveis). A composição — elementos, empregados, cargos e
                  riscos — não é alterada nesta etapa; a IA apenas aprimora a redação.
                </Alert>
              )}

              {/* Área 1 — Diagnóstico técnico (somente leitura) */}
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  p: 1.75,
                  bgcolor: (t) =>
                    t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
                }}
              >
                <Stack spacing={1.75}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      Diagnóstico técnico
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Resultado da análise do algoritmo — somente leitura.
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <ProposalModeChip mode={draft?.proposalMode ?? selectedMode} />
                    {draft?.classification ? (
                      <DraftClassificationChip classification={draft.classification} />
                    ) : null}
                    <Chip size="small" label={`Score: ${draft?.score ?? candidate.globalScore}`} />
                    <Chip
                      size="small"
                      label={`Confiança: ${CONFIDENCE_LABEL[draft?.confidence ?? candidate.confidence]}`}
                    />
                  </Stack>

                  {(draft?.formationReason || candidate.justificationSummary) && (
                    <Box>
                      <SectionTitle>Resumo executivo</SectionTitle>
                      <SectionBody>
                        {draft?.formationReason?.trim() ||
                          candidate.justificationSummary?.trim() ||
                          candidate.technicalJustification?.trim() ||
                          'Não informado nesta proposta.'}
                      </SectionBody>
                    </Box>
                  )}

                  <Box>
                    <SectionTitle>Elementos integrantes</SectionTitle>
                    <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                      {draft
                        ? draft.includedElements.map((el) => (
                            <Stack key={el.elementId} spacing={0.25}>
                              <Typography variant="body2" fontWeight={600}>
                                {el.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {el.type} · {el.riskCount} risco(s) · {el.coveredEmployeeCount}{' '}
                                empregado(s)
                                {el.inclusionReason?.trim()
                                  ? ` · ${el.inclusionReason}`
                                  : ''}
                              </Typography>
                            </Stack>
                          ))
                        : candidate.participants.map((p) => (
                            <Stack key={p.elementId} spacing={0.25}>
                              <SimilarityRiskOriginBadge
                                elementName={p.name}
                                elementType={p.type}
                                origin={p.riskSourceType ?? 'UNAVAILABLE'}
                                representativeSourceName={p.representativeSourceName}
                                representativeDistance={p.representativeDistance}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {p.riskCount} risco(s) · {p.coveredEmployeeCount} empregado(s)
                              </Typography>
                            </Stack>
                          ))}
                    </Stack>
                    {draft?.excludedElements.length ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Critérios / elementos fora do escopo
                        </Typography>
                        <Stack spacing={0.35} sx={{ mt: 0.35 }}>
                          {draft.excludedElements.map((ex, index) => (
                            <Typography
                              key={`${ex.elementId ?? ex.name ?? index}-${ex.reason}`}
                              variant="body2"
                              color="text.secondary"
                            >
                              {ex.name ?? ex.elementId
                                ? `${ex.name ?? ex.elementId}: ${ex.reason}`
                                : ex.reason}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    ) : null}
                  </Box>

                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems="flex-start"
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <SectionTitle>Empregados</SectionTitle>
                      <SectionBody empty={!draft?.includedEmployees.summaryLabel}>
                        {draft?.includedEmployees.summaryLabel ??
                          candidate.employeeCoverage?.summaryLabel ??
                          'Não informado nesta proposta.'}
                      </SectionBody>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <SectionTitle>
                        {selectedRoles.length === 1 ? 'Cargo' : 'Cargos'}
                      </SectionTitle>
                      {(draft?.includedJobs.length ? draft.includedJobs : selectedRoles).length ? (
                        <Stack spacing={0.35} component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                          {(draft?.includedJobs.length ? draft.includedJobs : selectedRoles).map(
                            (role) => (
                              <Typography key={role} component="li" variant="body2">
                                {role}
                              </Typography>
                            ),
                          )}
                        </Stack>
                      ) : (
                        <SectionBody empty>Não identificado nesta etapa.</SectionBody>
                      )}
                    </Box>
                  </Stack>

                  <Box>
                    <SectionTitle>Riscos comuns</SectionTitle>
                    <Box sx={{ mt: 0.5 }}>
                      <RiskNameList
                        riskIds={draft?.includedRisks.riskIds ?? candidate.commonRiskIds}
                        labels={riskLabels}
                      />
                    </Box>
                  </Box>

                  {draft?.warnings.length ? (
                    <Box>
                      <SectionTitle>Alertas</SectionTitle>
                      <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                        {draft.warnings.map((w) => (
                          <DraftWarningAlert key={`${w.code}-${w.message}`} warning={w} />
                        ))}
                      </Stack>
                    </Box>
                  ) : null}

                  {!draft && candidate.favorableReasons.length ? (
                    <Box>
                      <SectionTitle>Fundamentos favoráveis</SectionTitle>
                      <Stack spacing={0.35} component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                        {candidate.favorableReasons.map((criterion) => (
                          <Typography key={criterion} component="li" variant="body2">
                            {criterion}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  ) : null}

                  {!draft && candidate.divergences.length ? (
                    <Box>
                      <SectionTitle>Divergências</SectionTitle>
                      <Stack spacing={0.35} component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                        {candidate.divergences.map((r) => (
                          <Typography
                            key={r}
                            component="li"
                            variant="body2"
                            color="text.secondary"
                          >
                            {r}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  ) : null}

                  {!draft && candidate.blocks.length ? (
                    <Box>
                      <SectionTitle>Bloqueios</SectionTitle>
                      <Stack spacing={0.35} component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                        {candidate.blocks.map((b) => (
                          <Typography
                            key={`${b.code}-${b.message}`}
                            component="li"
                            variant="body2"
                            color="error"
                          >
                            {b.message}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  ) : null}
                </Stack>
              </Box>

              {/* Área 2 — Documento do GSE (editável) */}
              {draft && flow && !creationBlocked ? (
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'primary.light',
                    borderRadius: 1.5,
                    p: 1.75,
                  }}
                >
                  <Stack spacing={1.75}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      flexWrap="wrap"
                      useFlexGap
                      spacing={1}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800}>
                          Documento do GSE
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Conteúdo que será gravado no Grupo Similar de Exposição — editável.
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          refineMutation.isPending ? (
                            <CircularProgress size={14} />
                          ) : (
                            <AutoAwesomeIcon fontSize="small" />
                          )
                        }
                        disabled={refineMutation.isPending || busy}
                        onClick={() => void handleRefine()}
                      >
                        Aprimorar redação com IA
                      </Button>
                    </Stack>

                    {flow.aiRefined ? (
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={`Redação aprimorada por IA${flow.aiModel ? ` · ${flow.aiModel}` : ''}`}
                      />
                    ) : null}

                    {refineError ? <Alert severity="error">{refineError}</Alert> : null}

                    {refineResult ? (
                      <Box
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          p: 1.5,
                        }}
                      >
                        {refineResult.refined ? (
                          <>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                              Comparação — original vs. sugestão da IA
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                              A IA apenas aprimora a redação; a composição permanece a mesma.
                            </Typography>
                            <DeterministicVsRefinedComparison
                              deterministic={flow.deterministicTexts}
                              refined={refineResult.draft}
                            />
                            {refineResult.draft.editorialWarnings.length ? (
                              <Box sx={{ mt: 1.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Observações redacionais da IA
                                </Typography>
                                {refineResult.draft.editorialWarnings.map((w) => (
                                  <Typography key={w} variant="body2" color="text.secondary">
                                    • {w}
                                  </Typography>
                                ))}
                              </Box>
                            ) : null}
                            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                              <Button size="small" variant="contained" onClick={acceptRefine}>
                                Aceitar sugestão da IA
                              </Button>
                              <Button size="small" variant="text" onClick={discardRefine}>
                                Descartar
                              </Button>
                            </Stack>
                          </>
                        ) : (
                          <Alert severity="info">
                            {resolveGseRefineUserMessage(refineResult.fallbackReason)}
                          </Alert>
                        )}
                      </Box>
                    ) : null}

                    <TextField
                      label="Nome do GSE"
                      fullWidth
                      required
                      value={flow.editedTexts.name}
                      onChange={(e) => updateText('name', e.target.value)}
                    />

                    {EDITABLE_TEXT_AREA_FIELDS.map((field) => (
                      <TextField
                        key={field.key}
                        label={field.label}
                        fullWidth
                        required={
                          field.key === 'description' || field.key === 'technicalJustification'
                        }
                        multiline
                        minRows={field.minRows ?? 2}
                        value={flow.editedTexts[field.key] as string}
                        onChange={(e) => updateText(field.key, e.target.value)}
                      />
                    ))}

                    {EDITABLE_LIST_FIELDS.map((field) => (
                      <MultilineListEditor
                        key={field.key}
                        label={field.label}
                        helperText={field.helperText}
                        value={flow.editedTexts[field.key] as string[]}
                        onChange={(next) => updateText(field.key, next)}
                      />
                    ))}

                    {previewError ? <Alert severity="error">{previewError}</Alert> : null}
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          {creationBlocked && materialization?.homogeneousGroupId ? (
            <Button
              variant="contained"
              onClick={() => onOpenGse(materialization.homogeneousGroupId!)}
            >
              Abrir GSE
            </Button>
          ) : null}
          {draft && flow && !creationBlocked ? (
            <Button
              variant="contained"
              disabled={busy}
              onClick={() => void handleOpenCreateFlow()}
            >
              Criar Grupo Similar de Exposição
            </Button>
          ) : null}
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <ProposalCreateConfirmDialog
        open={confirmDialogOpen}
        onClose={closeConfirmDialog}
        preview={previewResult}
        previewLoading={previewMutation.isPending}
        createLoading={createMutation.isPending}
        createError={createError}
        createSuccess={createSuccess}
        confirmChecked={confirmChecked}
        onConfirmCheckedChange={setConfirmChecked}
        confirmWarningsChecked={confirmWarningsChecked}
        onConfirmWarningsCheckedChange={setConfirmWarningsChecked}
        onConfirmCreate={() => void handleConfirmCreate()}
        onRetryPreview={() => void runPreview()}
        onFinish={handleFinishAfterCreate}
        onOpenCreatedGse={handleOpenCreatedGse}
      />
    </>
  );
}

export function SimilarityProposalsPanel({ companyId, workspaceId }: Props) {
  const { onOpenModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const [confidence, setConfidence] = useState<SimilarityConfidence | 'ALL'>(
    'ALL',
  );
  const [elementType, setElementType] = useState<string>('ALL');
  const [proposalMode, setProposalMode] = useState<
    SimilarityProposalMode | 'ALL'
  >('ALL');
  const [nameQuery, setNameQuery] = useState('');
  const [withoutBlocksOnly, setWithoutBlocksOnly] = useState(true);
  const [appliedNameQuery, setAppliedNameQuery] = useState('');
  const [selected, setSelected] = useState<SimilarityCandidate | null>(null);
  const [consolidatedVisible, setConsolidatedVisible] = useState(ROWS_PER_PAGE);
  const [singletonVisible, setSingletonVisible] = useState(ROWS_PER_PAGE);
  const [openingGse, setOpeningGse] = useState(false);

  const filters = useMemo(
    () => ({
      companyId,
      workspaceId,
      confidence: confidence === 'ALL' ? undefined : [confidence],
      elementTypes: elementType === 'ALL' ? undefined : [elementType],
      nameQuery: appliedNameQuery || undefined,
      withoutBlocksOnly,
      proposalMode: proposalMode === 'ALL' ? undefined : proposalMode,
      displayLimit: DISPLAY_LIMIT,
    }),
    [
      companyId,
      workspaceId,
      confidence,
      elementType,
      appliedNameQuery,
      withoutBlocksOnly,
      proposalMode,
    ],
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useFetchSimilarityProposals(filters, Boolean(workspaceId));

  const { labels: riskLabels } = useSimilarityRiskLabels(
    companyId,
    Boolean(workspaceId),
  );

  const openGse = async (gseId: string) => {
    // Close review dialog first so the canonical GHO modal is not obscured.
    setSelected(null);
    if (!gseId || openingGse) return;
    setOpeningGse(true);
    try {
      const gho = await queryGho(gseId, companyId);
      if (!gho?.id) {
        enqueueSnackbar(
          'Este GSE não foi encontrado ou foi removido.',
          { variant: 'warning' },
        );
        return;
      }
      // Same ModalEnum + payload family used by /grupos-homogenios (GhosTable.onEditGHO).
      onOpenModal(ModalEnum.GHO_ADD, buildOpenGseModalPayload({ gho, companyId }));
    } catch {
      enqueueSnackbar(
        'Não foi possível abrir o GSE. Verifique se o registro ainda existe.',
        { variant: 'error' },
      );
    } finally {
      setOpeningGse(false);
    }
  };

  const {
    pendingConsolidated,
    pendingSingletons,
    materializedCandidates,
  } = useMemo(() => {
    const pendingConsolidated: SimilarityCandidate[] = [];
    const pendingSingletons: SimilarityCandidate[] = [];
    const materializedCandidates: SimilarityCandidate[] = [];
    for (const c of data?.candidates ?? []) {
      if (isCreationBlockedByMaterialization(c.materialization)) {
        materializedCandidates.push(c);
        continue;
      }
      if (inferProposalMode(c) === 'CONSOLIDATED') {
        pendingConsolidated.push(c);
      } else {
        pendingSingletons.push(c);
      }
    }
    return { pendingConsolidated, pendingSingletons, materializedCandidates };
  }, [data?.candidates]);

  return (
    <Stack spacing={2}>
      <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Propostas de similaridade — revisão e criação assistida
        </Typography>
        <Typography variant="body2">
          Propostas disponíveis podem ser revisadas e criadas como GSE. Propostas
          já implementadas (criadas pelo Assistente ou atendidas por um GSE
          equivalente) aparecem em “Propostas já implementadas”, sem permitir
          nova criação — use Abrir GSE para editar o registro existente.
        </Typography>
      </Alert>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ md: 'center' }}
        flexWrap="wrap"
        useFlexGap
      >
        <TextField
          size="small"
          label="Buscar por nome"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setAppliedNameQuery(nameQuery.trim());
          }}
          sx={{ minWidth: 220 }}
        />
        <Button
          size="small"
          variant="outlined"
          onClick={() => setAppliedNameQuery(nameQuery.trim())}
        >
          Buscar
        </Button>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tipo de proposta</InputLabel>
          <Select
            label="Tipo de proposta"
            value={proposalMode}
            onChange={(e) => {
              setProposalMode(e.target.value as SimilarityProposalMode | 'ALL');
              setConsolidatedVisible(ROWS_PER_PAGE);
              setSingletonVisible(ROWS_PER_PAGE);
            }}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="SINGLETON">Unitário</MenuItem>
            <MenuItem value="CONSOLIDATED">Consolidado</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Confiança</InputLabel>
          <Select
            label="Confiança"
            value={confidence}
            onChange={(e) =>
              setConfidence(e.target.value as SimilarityConfidence | 'ALL')
            }
          >
            <MenuItem value="ALL">Todas</MenuItem>
            <MenuItem value="HIGH">Alta</MenuItem>
            <MenuItem value="MEDIUM">Média</MenuItem>
            <MenuItem value="LOW">Baixa</MenuItem>
            <MenuItem value="NONE">Nenhuma</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Tipo de elemento</InputLabel>
          <Select
            label="Tipo de elemento"
            value={elementType}
            onChange={(e) => setElementType(e.target.value)}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            {CHARACTERIZATION_TYPE_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={withoutBlocksOnly}
              onChange={(e) => setWithoutBlocksOnly(e.target.checked)}
            />
          }
          label="Somente sem bloqueio"
        />
        <Button
          size="small"
          variant="outlined"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Recalcular
        </Button>
      </Stack>

      {isLoading || isFetching ? (
        <SFlex gap={2} direction="column">
          <SSkeleton height={72} />
          <SSkeleton height={120} />
        </SFlex>
      ) : null}

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar as propostas de similaridade
          {error instanceof Error ? `: ${error.message}` : '.'}
        </Alert>
      ) : null}

      {data ? (
        <>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Algoritmo: ${data.similarityAlgorithmVersion}`}
              color="primary"
              variant="outlined"
            />
            <Chip label={`Elementos: ${data.totals.elementsEvaluated}`} />
            <Chip label={`Propostas: ${data.totals.candidates}`} />
            <Chip
              label={`OWN: ${data.totals.riskContextOwn ?? '—'}`}
              variant="outlined"
              sx={{
                borderColor: 'success.dark',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(46, 125, 50, 0.22)'
                    : 'rgba(232, 245, 233, 1)',
                color: (t) =>
                  t.palette.mode === 'dark' ? 'success.light' : 'success.dark',
                fontWeight: 600,
              }}
            />
            <Chip
              label={`Ancestral: ${data.totals.riskContextRepresentativeAncestor ?? '—'}`}
              variant="outlined"
              sx={{
                borderColor: 'warning.dark',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(237, 108, 2, 0.18)'
                    : 'rgba(255, 243, 224, 1)',
                color: (t) =>
                  t.palette.mode === 'dark' ? 'common.white' : 'primary.dark',
                fontWeight: 600,
              }}
            />
            <Chip
              label={`Indisponível: ${data.totals.riskContextUnavailable ?? '—'}`}
              variant="outlined"
              sx={{
                borderColor: 'grey.500',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(158, 158, 158, 0.16)'
                    : 'grey.100',
                color: (t) =>
                  t.palette.mode === 'dark' ? 'grey.100' : 'grey.800',
                fontWeight: 600,
              }}
            />
            <Chip
              label={`Processamento: ${data.processingTimeMs} ms`}
              variant="outlined"
            />
          </Stack>

          {data.coverage ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                variant="outlined"
                color="primary"
                label={`Elegíveis: ${data.coverage.eligibleElementTotal}`}
              />
              <Chip
                variant="outlined"
                label={`Consolidadas: ${data.coverage.consolidatedProposalTotal}`}
              />
              <Chip
                variant="outlined"
                label={`Unitárias: ${data.coverage.singletonProposalTotal}`}
              />
              <Chip
                variant="outlined"
                color="warning"
                label={`Sem proposta: ${data.coverage.eligibleElementsWithoutProposal}`}
              />
              <Chip
                variant="outlined"
                color="error"
                label={`Revisão obrigatória: ${data.coverage.reviewRequiredTotal}`}
              />
            </Stack>
          ) : null}

          {(data.totals.elementsDocumentaryContext ?? 0) > 0 ? (
            <Alert severity="info">
              {data.totals.elementsDocumentaryContext} elementos documentais não
              foram incluídos em propostas porque não possuem riscos próprios. A
              cobertura ocupacional está consolidada em estruturas superiores.
            </Alert>
          ) : null}

          {data.truncation.displayTruncated ? (
            <Alert severity="warning">
              Lista truncada para exibição ({data.candidates.length} de{' '}
              {data.truncation.technicalCandidatesTotal}). Totais técnicos acima
              não são distorcidos pelo limite visual.
            </Alert>
          ) : null}

          <Accordion disableGutters elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                Fórmula, pesos e limitações do score
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" gutterBottom>
                Riscos {(data.formula.weights.risks * 100).toFixed(0)}% ·
                População {(data.formula.weights.employees * 100).toFixed(0)}% ·
                Estrutura {(data.formula.weights.structural * 100).toFixed(0)}%
                · Auxiliar {(data.formula.weights.auxiliary * 100).toFixed(0)}%
              </Typography>
              {data.formula.notes.map((n) => (
                <Typography key={n} variant="body2" color="text.secondary">
                  • {n}
                </Typography>
              ))}
              <Box sx={{ mt: 1 }}>
                {Object.values(data.formula.bands).map((b) => (
                  <Typography key={b} variant="body2" color="text.secondary">
                    • {b}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ mt: 1 }}>
                {data.limitations.map((l) => (
                  <Typography key={l.code} variant="body2" color="text.secondary">
                    • [{l.code}] {l.message}
                  </Typography>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {!data.candidates.length ? (
            <Alert severity="success">
              Nenhuma proposta exibida com os filtros atuais.
            </Alert>
          ) : (
            <Stack spacing={2.5}>
              <ProposalSection
                title="Propostas consolidadas"
                candidates={pendingConsolidated}
                visibleCount={consolidatedVisible}
                onShowMore={() =>
                  setConsolidatedVisible((n) => n + ROWS_PER_PAGE)
                }
                onView={setSelected}
                onOpenGse={openGse}
              />
              <ProposalSection
                title="Propostas unitárias"
                candidates={pendingSingletons}
                visibleCount={singletonVisible}
                onShowMore={() => setSingletonVisible((n) => n + ROWS_PER_PAGE)}
                onView={setSelected}
                onOpenGse={openGse}
              />
              <ProposalSection
                title="Propostas já implementadas"
                candidates={materializedCandidates}
                visibleCount={Math.max(materializedCandidates.length, ROWS_PER_PAGE)}
                onShowMore={() => undefined}
                onView={setSelected}
                onOpenGse={openGse}
              />
            </Stack>
          )}

          {data.discardedSummary.length ? (
            <Accordion disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Pares não consolidados automaticamente (
                  {data.discardedSummary.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1.5}>
                  {data.discardedSummary.map((d) => {
                    const narrative = resolveDiscardedPairUserNarrative({
                      blockCodes: d.blockCodes,
                      reason: d.reason,
                      globalScore: d.globalScore,
                    });
                    return (
                      <Box key={`${d.elementIdA}-${d.elementIdB}`}>
                        <Typography variant="body2" fontWeight={600}>
                          {narrative.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {narrative.body}
                        </Typography>
                        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, px: 0 }}>
                            <Typography variant="caption" color="text.secondary">
                              Detalhes técnicos do algoritmo
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ px: 0, pt: 0 }}>
                            <Typography variant="caption" color="text.secondary" component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
                              {narrative.technicalDetail}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ) : null}
        </>
      ) : null}

      <ProposalReviewDialog
        candidate={selected}
        companyId={companyId}
        workspaceId={workspaceId}
        data={data}
        riskLabels={riskLabels}
        onClose={() => setSelected(null)}
        onCreated={() => void refetch()}
        onOpenGse={openGse}
      />
    </Stack>
  );
}
