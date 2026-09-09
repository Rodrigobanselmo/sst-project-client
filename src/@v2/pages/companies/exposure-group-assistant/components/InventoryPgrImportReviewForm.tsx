import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useMutApplyInventoryPgrImport } from '@v2/services/security/inventory-pgr-import/hooks/useMutApplyInventoryPgrImport';
import { useMutReviewInventoryPgrImport } from '@v2/services/security/inventory-pgr-import/hooks/useMutReviewInventoryPgrImport';
import type {
  InventoryEvidence,
  InventoryMatchStatus,
  InventoryParentCatalogItem,
  InventoryPgrImportApply,
  InventoryPgrImportPreview,
  InventoryPgrImportReview,
  InventoryReviewDecisions,
  InventoryReviewExtractionInput,
  InventoryReviewedGroup,
  InventoryReviewedRole,
  InventoryReviewedStructure,
  InventoryReviewStructureSplitPart,
} from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';
import {
  canApplyInventoryImportPlan,
  inventoryImportApplyErrorMessage,
  inventoryImportApplyHint,
  isInventoryPgrImportStaleError,
  scrollInventoryImportFlowIntoView,
} from './inventory-apply-ui';
import {
  buildInventoryParentPath,
  buildInventoryParentPathSegments,
  filterParentsByMaxLevel,
  indexParentsById,
  parentTypeLabel,
  parentTypeMark,
  type InventoryEligibleParentType,
} from './inventory-parent-path';
import { toInventoryLinkRows } from './inventory-link-rows';
import {
  formatGseSuggestionLine,
  promotedGseSuggestions,
  unpromotedGseOrigins,
} from './inventory-structural-evidence';
import {
  countPendingPlanActions,
  groupHeadline,
  linkIgnoreReason,
  linkOperationalStatus,
  linkStatusLabel,
  roleBlockedReason,
  roleHeadline,
  roleResolvedByProposedStructure,
  stepToneLabel,
  stepVisitState,
  suggestedSplitNames,
  structureDecisionMode,
  structureHeadline,
  type StepTone,
  type StepVisitState,
  type StructureDecisionMode,
} from './inventory-review-presentation';
import {
  formatInventoryGseDocumentLabel,
  formatInventoryGsePersistedName,
  isHumanInventoryGseNameOverride,
  resolveInventoryGsePersistedName,
} from './inventory-gse-name';

const SOFT_ISSUE_TYPES = [
  'HEADCOUNT_MISMATCH',
  'POSSIBLE_TEXT_TRUNCATION',
  'IGNORED_INDEX_ENTRY',
] as const;

const STEP_LABELS = [
  'Diagnóstico do documento',
  'Estruturas organizacionais',
  'Cargos',
  'GSEs',
  'Vínculos',
  'Conferir e importar',
] as const;

const STATUS_LABEL: Record<InventoryMatchStatus, string> = {
  NEW: 'Novo',
  EXACT_MATCH: 'Correspondência exata',
  AMBIGUOUS: 'Ambíguo',
  PARENT_REQUIRED: 'Precisa definir estrutura',
  CONFLICT: 'Conflito',
  EXACT_MATCH_OTHER_WORKSPACE: 'Existe em outro estabelecimento',
  WORKSPACE_LINK_REQUIRED: 'Vincular estabelecimento',
  ALREADY_LINKED: 'Já vinculado',
  BLOCKED_BY_ROLE: 'Bloqueado pelo cargo',
  BLOCKED_BY_GSE: 'Bloqueado pelo GSE',
};

function statusColor(
  status: InventoryMatchStatus,
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (status === 'EXACT_MATCH' || status === 'ALREADY_LINKED') return 'success';
  if (status === 'NEW') return 'info';
  if (status === 'AMBIGUOUS' || status === 'PARENT_REQUIRED') return 'warning';
  return 'error';
}

function formatEvidence(items: InventoryEvidence[]): string {
  return items
    .slice(0, 2)
    .map((item) =>
      [item.page ? `p. ${item.page}` : null, item.section, item.excerpt]
        .filter(Boolean)
        .join(' · '),
    )
    .join(' | ');
}

function parentPathLabel(
  parent: InventoryParentCatalogItem,
  byId: Map<string, InventoryParentCatalogItem>,
) {
  return buildInventoryParentPath(parent, byId);
}

function completenessLabel(value?: string) {
  if (value === 'COMPLETE') return 'Completa';
  if (value === 'PARTIAL') return 'Parcial';
  if (value === 'LOW') return 'Baixa';
  return 'Não reconhecida';
}

export function toReviewExtraction(
  preview: InventoryPgrImportPreview,
): InventoryReviewExtractionInput {
  return {
    source: preview.source,
    extractionMode: preview.extractionMode,
    extractionQuality: preview.extractionQuality,
    roles: preview.roles.map((role) => ({
      key: role.key,
      sourceName: role.sourceName,
      normalizedName: role.normalizedName,
      parentHints: role.parentHints,
      evidence: role.evidence,
    })),
    groups: preview.groups.map((group) => ({
      key: group.key,
      sourceName: group.sourceName,
      sourceCode: group.sourceCode,
      sourceLabel: group.sourceLabel,
      noRolesFound: group.noRolesFound,
      semanticNameMissing: group.semanticNameMissing,
      structuralContext: group.structuralContext,
      parentHints: group.parentHints,
      evidence: group.evidence,
    })),
    links: preview.links.map((link) => ({
      roleKey: link.roleKey,
      groupKey: link.groupKey,
      evidence: link.evidence,
    })),
    issues: preview.issues,
  };
}

export function defaultReviewDecisions(
  preview: InventoryPgrImportPreview,
): InventoryReviewDecisions {
  return {
    roles: preview.roles.map((role) => ({
      key: role.key,
      included: true,
      appliedName: '',
      parentHierarchyId: role.suggestedParentHierarchyId,
      proposedStructureKey: role.structuralParent?.proposedStructureKey || null,
      resolvedMatchId:
        role.matchStatus === 'EXACT_MATCH' ? role.matchedHierarchyId : null,
    })),
    groups: preview.groups.map((group) => ({
      key: group.key,
      included: true,
      appliedName: '',
      resolvedMatchId:
        group.matchStatus === 'EXACT_MATCH'
          ? group.matchedHomogeneousGroupId
          : null,
      confirmWorkspaceLink: false,
    })),
    links: preview.links.map((link) => ({
      roleKey: link.roleKey,
      groupKey: link.groupKey,
      included: true,
    })),
    structures: (preview.structureProposals || []).map((proposal) => ({
      key: proposal.key,
      included: true,
      appliedName: '',
      appliedType: proposal.proposedType,
      reuseParentHierarchyId: proposal.reusedParentHierarchyId,
    })),
    acknowledgedIssueTypes: [],
  };
}

type Props = {
  companyId: string;
  workspaceId: string;
  preview: InventoryPgrImportPreview;
};

export function InventoryPgrImportReviewForm({
  companyId,
  workspaceId,
  preview,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const mutation = useMutReviewInventoryPgrImport();
  const applyMutation = useMutApplyInventoryPgrImport();
  const mutateRef = useRef(mutation.mutateAsync);
  mutateRef.current = mutation.mutateAsync;
  const flowStartRef = useRef<HTMLDivElement>(null);
  const applyingRef = useRef(false);
  const [decisions, setDecisions] = useState(() => defaultReviewDecisions(preview));
  const [reviewedDecisionsKey, setReviewedDecisionsKey] = useState<string | null>(
    null,
  );
  const [applyResult, setApplyResult] = useState<InventoryPgrImportApply | null>(
    null,
  );
  const [review, setReview] = useState<InventoryPgrImportReview | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(() => new Set([0]));
  const [selectedRoleKeys, setSelectedRoleKeys] = useState<string[]>([]);
  const [batchParent, setBatchParent] = useState<InventoryParentCatalogItem | null>(
    null,
  );
  const [maxParentLevel, setMaxParentLevel] =
    useState<InventoryEligibleParentType>('SUB_SECTOR');
  const [structureModeDraft, setStructureModeDraft] = useState<
    Record<string, StructureDecisionMode>
  >({});
  const [roleParentOverride, setRoleParentOverride] = useState<Record<string, boolean>>(
    {},
  );
  const previewRef = useRef(preview);
  previewRef.current = preview;

  useEffect(() => {
    setDecisions(defaultReviewDecisions(preview));
    setReview(null);
    setReviewedDecisionsKey(null);
    setApplyResult(null);
    setSelectedRoleKeys([]);
    setBatchParent(null);
    setStructureModeDraft({});
    setRoleParentOverride({});
    setActiveStep(0);
    setVisitedSteps(new Set([0]));
  }, [preview.fingerprint, preview.extractionFingerprint]);

  useEffect(() => {
    const snapshot = decisions;
    const handle = window.setTimeout(() => {
      void mutateRef.current({
        companyId,
        workspaceId,
        extraction: toReviewExtraction(previewRef.current),
        decisions: snapshot,
      })
        .then((result) => {
          setReview(result);
          setReviewedDecisionsKey(JSON.stringify(snapshot));
        })
        .catch(() => undefined);
    }, 450);
    return () => window.clearTimeout(handle);
  }, [companyId, workspaceId, decisions]);

  const parents = review?.eligibleParents || preview.eligibleParents || [];
  const parentById = useMemo(() => indexParentsById(parents), [parents]);
  const visibleParents = useMemo(
    () => filterParentsByMaxLevel(parents, maxParentLevel),
    [parents, maxParentLevel],
  );
  const roles = review?.roles || preview.roles.map((role) => ({
    ...role,
    included: true,
    appliedName: '',
    appliedNormalizedName: '',
    nameCorrected: false,
    selectedParentHierarchyId: role.suggestedParentHierarchyId,
    selectedParentName: role.suggestedParentName,
    selectedProposedStructureKey: role.structuralParent?.proposedStructureKey || null,
    planAction:
      role.matchStatus === 'EXACT_MATCH'
        ? ('reuse' as const)
        : role.matchStatus === 'NEW' &&
            (role.suggestedParentHierarchyId ||
              role.structuralParent?.proposedStructureKey)
          ? ('create' as const)
          : ('blocked' as const),
  }));
  const groups = review?.groups || preview.groups.map((group) => ({
    ...group,
    included: true,
    appliedName: '',
    appliedNormalizedName: '',
    persistedName: formatInventoryGsePersistedName({
      sourceCode: group.sourceCode,
      sourceName: group.sourceName,
    }),
    nameCorrected: false,
    confirmWorkspaceLink: false,
    planAction:
      group.matchStatus === 'EXACT_MATCH'
        ? ('reuse' as const)
        : group.matchStatus === 'WORKSPACE_LINK_REQUIRED'
          ? ('blocked' as const)
          : group.matchStatus === 'NEW'
            ? ('create' as const)
            : ('blocked' as const),
  }));
  const structures: InventoryReviewedStructure[] =
    review?.structures ||
    (preview.structureProposals || []).map((proposal) => ({
      ...proposal,
      included: true,
      appliedName: '',
      appliedNormalizedName: '',
      appliedType: proposal.proposedType,
      nameCorrected: false,
      selectedReuseParentHierarchyId: proposal.reusedParentHierarchyId,
      planAction:
        proposal.action === 'REUSE_EXISTING' ? ('reuse' as const) : ('create' as const),
    }));

  const patchRole = (
    key: string,
    patch: Partial<InventoryReviewDecisions['roles'][number]>,
  ) => {
    setDecisions((current) => ({
      ...current,
      roles: current.roles.map((role) =>
        role.key === key ? { ...role, ...patch } : role,
      ),
    }));
  };

  const patchGroup = (
    key: string,
    patch: Partial<InventoryReviewDecisions['groups'][number]>,
  ) => {
    setDecisions((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.key === key ? { ...group, ...patch } : group,
      ),
    }));
  };

  const patchStructure = (
    key: string,
    patch: Partial<NonNullable<InventoryReviewDecisions['structures']>[number]>,
  ) => {
    setDecisions((current) => ({
      ...current,
      structures: (current.structures || []).map((structure) =>
        structure.key === key ? { ...structure, ...patch } : structure,
      ),
    }));
  };

  const patchLink = (roleKey: string, groupKey: string, included: boolean) => {
    setDecisions((current) => ({
      ...current,
      links: current.links.map((link) =>
        link.roleKey === roleKey && link.groupKey === groupKey
          ? { ...link, included }
          : link,
      ),
    }));
  };

  const applyBatchParent = () => {
    if (!batchParent) return;
    const allowed = new Set(
      roles
        .filter(
          (role) =>
            selectedRoleKeys.includes(role.key) &&
            role.included &&
            (role.matchStatus === 'PARENT_REQUIRED' ||
              role.planAction === 'blocked' ||
              role.matchStatus === 'NEW'),
        )
        .map((role) => role.key),
    );
    setDecisions((current) => ({
      ...current,
      roles: current.roles.map((role) =>
        allowed.has(role.key)
          ? {
              ...role,
              parentHierarchyId: batchParent.id,
              proposedStructureKey: null,
            }
          : role,
      ),
    }));
  };

  const acknowledgeable = useMemo(
    () =>
      (preview.issues || []).filter((issue) =>
        SOFT_ISSUE_TYPES.includes(
          issue.type as (typeof SOFT_ISSUE_TYPES)[number],
        ),
      ),
    [preview.issues],
  );
  const softAcknowledged =
    acknowledgeable.length === 0 ||
    acknowledgeable.every((issue) =>
      decisions.acknowledgedIssueTypes.includes(issue.type),
    );

  const goToStep = (step: number) => {
    setActiveStep(step);
    setVisitedSteps((current) => new Set(current).add(step));
    window.requestAnimationFrame(() => {
      scrollInventoryImportFlowIntoView(flowStartRef.current);
    });
  };

  const goToItem = (step: number, elementId: string) => {
    goToStep(step);
    window.setTimeout(() => {
      document.getElementById(elementId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  const stepTones: Array<{ tone: StepTone; count: number }> = useMemo(() => {
    if (!review) {
      return [
        { tone: 'informative', count: 0 },
        { tone: 'updating', count: 0 },
        { tone: 'updating', count: 0 },
        { tone: 'updating', count: 0 },
        { tone: 'updating', count: 0 },
        { tone: 'updating', count: 0 },
      ];
    }
    const rolePending = review.blockers.filter((item) => item.itemType === 'role').length
      || countPendingPlanActions(review.roles);
    const groupPending =
      review.blockers.filter((item) => item.itemType === 'group').length ||
      countPendingPlanActions(review.groups);
    const linkPending =
      review.blockers.filter((item) => item.itemType === 'link').length ||
      countPendingPlanActions(review.links);
    const structurePending = countPendingPlanActions(review.structures);
    const confirmPending = review.summary.pendingBlockers;
    return [
      { tone: 'informative', count: 0 },
      {
        tone: structurePending ? 'pending' : 'resolved',
        count: structurePending,
      },
      { tone: rolePending ? 'pending' : 'resolved', count: rolePending },
      { tone: groupPending ? 'pending' : 'resolved', count: groupPending },
      { tone: linkPending ? 'pending' : 'resolved', count: linkPending },
      {
        tone: confirmPending ? 'pending' : 'resolved',
        count: confirmPending,
      },
    ];
  }, [review]);

  const reviewSynced =
    Boolean(review) &&
    reviewedDecisionsKey === JSON.stringify(decisions) &&
    !mutation.isPending;
  const canApply = canApplyInventoryImportPlan({
    review,
    reviewSynced,
    reviewPending: mutation.isPending,
    applyPending: applyMutation.isPending,
    softAcknowledged,
  });
  const importHint = inventoryImportApplyHint({
    review,
    reviewSynced,
    reviewPending: mutation.isPending,
    applyPending: applyMutation.isPending,
    canApply,
  });

  const onApply = async () => {
    if (!canApply || !review || applyingRef.current) return;
    applyingRef.current = true;
    setApplyResult(null);
    try {
      const result = await applyMutation.mutateAsync({
        companyId,
        workspaceId,
        extraction: toReviewExtraction(preview),
        decisions,
        extractionFingerprint: review.extractionFingerprint,
        catalogFingerprint: review.catalogFingerprint,
        reviewFingerprint: review.reviewFingerprint,
      });
      setApplyResult(result);
    } catch {
      setApplyResult(null);
    } finally {
      applyingRef.current = false;
    }
  };

  return (
    <Stack ref={flowStartRef} spacing={3}>
      {mutation.isPending ? (
        <Typography variant="caption" color="text.secondary">
          Atualizando o plano a partir da revisão…
        </Typography>
      ) : null}

      <Stepper
        nonLinear
        activeStep={activeStep}
        alternativeLabel={isMdUp}
        orientation={isMdUp ? 'horizontal' : 'vertical'}
        sx={{
          '& .MuiStepConnector-line': { borderColor: 'grey.400' },
        }}
      >
        {STEP_LABELS.map((label, index) => {
          const visit = stepVisitState({
            isActive: activeStep === index,
            visited: visitedSteps.has(index),
            pendingCount: stepTones[index]?.count || 0,
            hasReview: Boolean(review) || index === 0,
          });
          return (
            <Step key={label} completed={false}>
              <StepButton onClick={() => goToStep(index)}>
                <StepLabel
                  StepIconComponent={() => (
                    <ReviewStepIcon
                      index={index}
                      visit={visit}
                    />
                  )}
                  optional={
                    <Stack spacing={0.25} alignItems={isMdUp ? 'center' : 'flex-start'}>
                      <Typography variant="caption" color="text.secondary">
                        {stepToneLabel(
                          stepTones[index]?.tone || 'informative',
                          stepTones[index]?.count,
                        )}
                      </Typography>
                      {visit === 'pending' ? (
                        <Typography variant="caption" color="warning.main" fontWeight={700}>
                          {stepTones[index]?.count} pendência
                          {(stepTones[index]?.count || 0) === 1 ? '' : 's'} no plano
                        </Typography>
                      ) : null}
                      {visit === 'resolved' && index > 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          Revisada no plano
                        </Typography>
                      ) : null}
                    </Stack>
                  }
                >
                  {label}
                </StepLabel>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>

      {activeStep === 0 ? (
        <DiagnosisStep preview={preview} />
      ) : null}

      {activeStep === 1 ? (
        <Stack spacing={3}>
          <Alert severity="info">
            O sistema já preencheu a decisão default. Você só precisa intervir
            para alterar nome, tipo, usar uma estrutura existente, dividir ou ignorar.
          </Alert>
          {structures.filter((item) => !item.splitFromKey).length ? (
            structures
              .filter((item) => !item.splitFromKey)
              .map((structure) => {
              const decision = (decisions.structures || []).find(
                (item) => item.key === structure.key,
              );
              const included = decision?.included !== false;
              const reuseParentHierarchyId =
                decision?.reuseParentHierarchyId ||
                structure.selectedReuseParentHierarchyId;
              return (
                  <StructureProposalCard
                    key={structure.key}
                    structure={structure}
                    appliedName={decision?.appliedName || ''}
                    appliedType={decision?.appliedType || structure.proposedType}
                  reuseParentHierarchyId={reuseParentHierarchyId}
                  mode={
                    structureModeDraft[structure.key] ||
                    structureDecisionMode({
                      included,
                      reuseParentHierarchyId,
                    })
                  }
                  parents={visibleParents}
                  parentById={parentById}
                  relatedRoles={preview.roles
                    .filter((role) => structure.roleKeys.includes(role.key))
                    .map((role) => ({
                      key: role.key,
                      name: role.sourceName,
                      assignedKey:
                        decisions.roles.find((item) => item.key === role.key)
                          ?.proposedStructureKey || null,
                    }))}
                  relatedGroups={preview.groups
                    .filter((group) => structure.groupKeys.includes(group.key))
                    .map(
                      (group) =>
                        [group.sourceLabel, group.sourceName]
                          .filter(Boolean)
                          .join(' — ') || group.key,
                    )}
                  splitParts={decision?.splitParts || []}
                  splitChildren={structures.filter(
                    (item) => item.splitFromKey === structure.key,
                  )}
                  onAssignRole={(roleKey, proposedStructureKey) =>
                    patchRole(roleKey, {
                      proposedStructureKey,
                      parentHierarchyId: null,
                    })
                  }
                  onModeChange={(mode) => {
                    setStructureModeDraft((current) => ({
                      ...current,
                      [structure.key]: mode,
                    }));
                    if (mode === 'ignore') {
                      patchStructure(structure.key, { included: false });
                      return;
                    }
                    if (mode === 'create') {
                      patchStructure(structure.key, {
                        included: true,
                        reuseParentHierarchyId: null,
                      });
                      return;
                    }
                    patchStructure(structure.key, {
                      included: true,
                      reuseParentHierarchyId:
                        reuseParentHierarchyId ||
                        structure.reusedParentHierarchyId,
                    });
                  }}
                  onChange={(patch) => patchStructure(structure.key, patch)}
                />
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhuma estrutura foi proposta a partir de Unidade de Trabalho.
            </Typography>
          )}
        </Stack>
      ) : null}

      {activeStep === 2 ? (
        <Stack spacing={3}>
          <Alert severity="info">
            Se o cargo aponta para uma estrutura que será criada neste plano,
            isso já é um pai válido. Só escolha Hierarchy existente quando
            quiser trocar ou quando o plano pedir decisão.
          </Alert>
          <Stack spacing={1.5}>
            <FormControl size="small" sx={{ minWidth: 220, maxWidth: 320 }}>
              <InputLabel id="inventory-parent-max-level">
                Exibir estrutura até
              </InputLabel>
              <Select
                labelId="inventory-parent-max-level"
                label="Exibir estrutura até"
                value={maxParentLevel}
                onChange={(event) =>
                  setMaxParentLevel(
                    event.target.value as InventoryEligibleParentType,
                  )
                }
              >
                <MenuItem value="DIRECTORY">Diretoria</MenuItem>
                <MenuItem value="MANAGEMENT">Gerência</MenuItem>
                <MenuItem value="SECTOR">Setor</MenuItem>
                <MenuItem value="SUB_SECTOR">Subsetor</MenuItem>
              </Select>
            </FormControl>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ md: 'center' }}
            >
              <ParentOrganogramSelect
                sx={{ minWidth: 280, flex: 1 }}
                options={visibleParents}
                value={batchParent}
                parentById={parentById}
                onChange={setBatchParent}
                label="Estrutura existente para cargos selecionados"
              />
              <Button
                variant="outlined"
                disabled={!batchParent || !selectedRoleKeys.length}
                onClick={applyBatchParent}
              >
                Aplicar aos cargos selecionados
              </Button>
            </Stack>
          </Stack>
          {roles.map((role) => {
            const decision = decisions.roles.find((item) => item.key === role.key);
            return (
              <RoleReviewCard
                key={role.key}
                role={role as InventoryReviewedRole}
                appliedName={decision?.appliedName || ''}
                included={decision?.included !== false}
                parentHierarchyId={decision?.parentHierarchyId || null}
                proposedStructureKey={decision?.proposedStructureKey || null}
                resolvedMatchId={decision?.resolvedMatchId || null}
                structures={structures}
                parents={visibleParents}
                allParents={parents}
                parentById={parentById}
                selected={selectedRoleKeys.includes(role.key)}
                forceParentSelect={Boolean(roleParentOverride[role.key])}
                onToggleParentSelect={(open) =>
                  setRoleParentOverride((current) => ({
                    ...current,
                    [role.key]: open,
                  }))
                }
                onToggleSelect={(checked) =>
                  setSelectedRoleKeys((current) =>
                    checked
                      ? [...current, role.key]
                      : current.filter((key) => key !== role.key),
                  )
                }
                onChange={(patch) => patchRole(role.key, patch)}
              />
            );
          })}
        </Stack>
      ) : null}

      {activeStep === 3 ? (
        <Stack spacing={3}>
          <Alert severity="info">
            GSE é domínio separado da estrutura organizacional. A decisão de
            Setor não se repete aqui.
          </Alert>
          {groups.map((group) => {
            const decision = decisions.groups.find((item) => item.key === group.key);
            return (
              <GroupReviewCard
                key={group.key}
                group={group as InventoryReviewedGroup}
                appliedName={decision?.appliedName || ''}
                included={decision?.included !== false}
                confirmWorkspaceLink={Boolean(decision?.confirmWorkspaceLink)}
                resolvedMatchId={decision?.resolvedMatchId || null}
                cargos={preview.roles
                  .filter((role) =>
                    preview.links.some(
                      (link) =>
                        link.groupKey === group.key && link.roleKey === role.key,
                    ),
                  )
                  .map((role) => role.sourceName)}
                onChange={(patch) => patchGroup(group.key, patch)}
              />
            );
          })}
        </Stack>
      ) : null}

      {activeStep === 4 ? (
        <LinksStep
          preview={preview}
          review={review}
          decisions={decisions}
          onPatchLink={patchLink}
          onResolveRole={(roleKey) => goToItem(2, `inventory-role-${roleKey}`)}
          onResolveGroup={(groupKey) => goToItem(3, `inventory-group-${groupKey}`)}
        />
      ) : null}

      {activeStep === 5 ? (
        <SummaryStep
          review={review}
          acknowledgeable={acknowledgeable}
          softAcknowledged={softAcknowledged}
          importHint={importHint}
          canApply={canApply}
          applyPending={applyMutation.isPending}
          applyResult={applyResult}
          applyError={applyMutation.error}
          onApply={() => void onApply()}
          onToggleSoft={(checked) =>
            setDecisions((current) => ({
              ...current,
              acknowledgedIssueTypes: checked
                ? acknowledgeable.map((issue) => issue.type)
                : [],
            }))
          }
          mutationError={mutation.isError}
        />
      ) : null}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
      >
        <Button
          disabled={activeStep === 0}
          onClick={() => goToStep(Math.max(0, activeStep - 1))}
        >
          Etapa anterior
        </Button>
        <Button
          variant="outlined"
          disabled={activeStep === STEP_LABELS.length - 1}
          onClick={() =>
            goToStep(Math.min(STEP_LABELS.length - 1, activeStep + 1))
          }
        >
          Próxima etapa
        </Button>
      </Stack>
    </Stack>
  );
}

function ReviewStepIcon({
  index,
  visit,
}: {
  index: number;
  visit: StepVisitState;
}) {
  const active = visit === 'current';
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: active ? '3px solid' : '2px solid',
        borderColor:
          visit === 'pending'
            ? 'warning.main'
            : active
              ? 'primary.main'
              : visit === 'resolved'
                ? 'grey.600'
                : 'grey.400',
        bgcolor: active ? 'primary.main' : 'background.paper',
        color: active ? 'primary.contrastText' : 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 14,
        boxShadow: active ? 3 : 0,
      }}
    >
      {index + 1}
    </Box>
  );
}

function DiagnosisStep({ preview }: { preview: InventoryPgrImportPreview }) {
  return (
    <Stack spacing={2}>
      <Alert
        severity={
          preview.extractionQuality?.completeness === 'COMPLETE' ? 'info' : 'warning'
        }
      >
        <AlertTitle>Somente informativa</AlertTitle>
        Esta etapa não cria nem altera dados. Ela mostra o que o documento
        entregou e o que ficou pendente na extração.
      </Alert>
      <Typography variant="body2">
        Arquivo: {preview.source.fileName}
        {preview.source.pageCount ? ` · ${preview.source.pageCount} páginas` : ''}
        {preview.source.truncated ? ' · texto truncado' : ''}
      </Typography>
      <Typography variant="body2">
        Qualidade: {completenessLabel(preview.extractionQuality?.completeness)}
        {' · '}
        Cargos: {preview.roles.length}
        {' · '}
        GSEs: {preview.groups.length}
        {' · '}
        Vínculos: {preview.links.length}
        {' · '}
        Estruturas propostas: {(preview.structureProposals || []).length}
      </Typography>
      {preview.issues.length ? (
        preview.issues.map((issue, index) => (
          <Alert
            key={`${issue.type}-${index}`}
            severity={
              issue.severity === 'error'
                ? 'error'
                : issue.severity === 'info'
                  ? 'info'
                  : 'warning'
            }
          >
            {issue.message}
          </Alert>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          Nenhuma pendência adicional registrada na extração.
        </Typography>
      )}
    </Stack>
  );
}

function DecisionCard({
  id,
  ignored,
  header,
  status,
  children,
}: {
  id?: string;
  ignored?: boolean;
  header: ReactNode;
  status: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      id={id}
      sx={{
        border: '2px solid',
        borderColor: ignored ? 'grey.400' : 'grey.600',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: ignored ? 'action.hover' : 'background.paper',
        opacity: ignored ? 0.78 : 1,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ sm: 'flex-start' }}
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: ignored ? 'grey.200' : 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'grey.300',
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>{header}</Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {status}
        </Stack>
      </Stack>
      <Box sx={{ px: 2.5, py: 2.5 }}>{children}</Box>
    </Box>
  );
}

function parentTypeChipColor(
  type: string,
): 'primary' | 'secondary' | 'success' | 'warning' | 'default' {
  if (type === 'DIRECTORY') return 'primary';
  if (type === 'MANAGEMENT') return 'secondary';
  if (type === 'SECTOR') return 'success';
  if (type === 'SUB_SECTOR') return 'warning';
  return 'default';
}

function ParentTypeMark({ type }: { type: string }) {
  return (
    <Tooltip title={parentTypeLabel(type)}>
      <Chip
        size="small"
        variant="outlined"
        color={parentTypeChipColor(type)}
        label={parentTypeMark(type)}
        sx={{
          height: 20,
          minWidth: 28,
          '& .MuiChip-label': { px: 0.5, fontSize: 11, fontWeight: 700 },
        }}
      />
    </Tooltip>
  );
}

function ParentOrganogramSelect({
  options,
  value,
  parentById,
  onChange,
  label,
  required,
  error,
  helperText,
  sx,
}: {
  options: InventoryParentCatalogItem[];
  value: InventoryParentCatalogItem | null;
  parentById: Map<string, InventoryParentCatalogItem>;
  onChange: (value: InventoryParentCatalogItem | null) => void;
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  sx?: object;
}) {
  return (
    <Autocomplete
      sx={sx}
      options={
        value && !options.some((option) => option.id === value.id)
          ? [value, ...options]
          : options
      }
      value={value}
      getOptionLabel={(option) => parentPathLabel(option, parentById)}
      isOptionEqualToValue={(option, item) => option.id === item.id}
      onChange={(_, next) => onChange(next)}
      renderOption={(props, option) => {
        const segments = buildInventoryParentPathSegments(option, parentById);
        return (
          <li {...props}>
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
              {segments.map((segment, index) => {
                const isLeaf = index === segments.length - 1;
                return (
                  <Stack
                    key={`${option.id}-${index}`}
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                  >
                    {index > 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        ›
                      </Typography>
                    ) : null}
                    <ParentTypeMark type={segment.type} />
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontWeight: isLeaf ? 700 : 400 }}
                    >
                      {segment.name}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          required={required}
          error={error}
          label={label}
          helperText={helperText}
        />
      )}
    />
  );
}

function StructureProposalCard({
  structure,
  appliedName,
  appliedType,
  reuseParentHierarchyId,
  mode,
  parents,
  parentById,
  relatedRoles,
  relatedGroups,
  splitParts,
  splitChildren,
  onAssignRole,
  onModeChange,
  onChange,
}: {
  structure: InventoryReviewedStructure;
  appliedName: string;
  appliedType: InventoryEligibleParentType;
  reuseParentHierarchyId: string | null | undefined;
  mode: StructureDecisionMode;
  parents: InventoryParentCatalogItem[];
  parentById: Map<string, InventoryParentCatalogItem>;
  relatedRoles: Array<{ key: string; name: string; assignedKey: string | null }>;
  relatedGroups: string[];
  splitParts: InventoryReviewStructureSplitPart[];
  splitChildren: InventoryReviewedStructure[];
  onAssignRole: (roleKey: string, proposedStructureKey: string | null) => void;
  onModeChange: (mode: StructureDecisionMode) => void;
  onChange: (
    patch: Partial<NonNullable<InventoryReviewDecisions['structures']>[number]>,
  ) => void;
}) {
  const reusedParent =
    parents.find((parent) => parent.id === reuseParentHierarchyId) ||
    (reuseParentHierarchyId
      ? parentById.get(reuseParentHierarchyId) || null
      : null);
  const displayName = appliedName.trim() || structure.proposedName;

  return (
    <DecisionCard
      id={`inventory-structure-${structure.key}`}
      ignored={mode === 'ignore'}
      header={
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary">
            Estrutura organizacional
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {structureHeadline(structure)}
          </Typography>
        </Stack>
      }
      status={
        <Chip
          size="small"
          label={
            splitParts.length >= 2
              ? 'Dividida no plano'
              : mode === 'ignore'
                ? 'Fora do plano'
                : mode === 'reuse'
                  ? 'Usar existente'
                  : 'Criar'
          }
          color={
            splitParts.length >= 2
              ? 'warning'
              : mode === 'ignore'
                ? 'default'
                : mode === 'reuse'
                  ? 'success'
                  : 'info'
          }
        />
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Origem: {relatedGroups.join(' · ') || 'Unidade de Trabalho'}
          {structure.context === 'WORK_UNIT_GSE'
            ? ' · Unidade de Trabalho encontrada no PDF'
            : ''}
        </Typography>
        {relatedRoles.length ? (
          <Typography variant="body2" color="text.secondary">
            Cargos relacionados: {relatedRoles.map((role) => role.name).join(', ')}
          </Typography>
        ) : (
          <Alert severity="warning">
            GSE sem cargos encontrados. A proposta estrutural é independente —
            você pode ignorar a criação.
          </Alert>
        )}
        <FormControl>
          <FormLabel>Decisão</FormLabel>
          <RadioGroup
            value={mode}
            onChange={(_, value) => onModeChange(value as StructureDecisionMode)}
          >
            <FormControlLabel
              value="create"
              control={<Radio />}
              label={`Criar novo — ${parentTypeLabel(appliedType)} “${displayName}”`}
            />
            <FormControlLabel
              value="reuse"
              control={<Radio />}
              label="Usar estrutura existente — substitui a criação"
            />
            <FormControlLabel
              value="ignore"
              control={<Radio />}
              label="Ignorar — não entra no plano"
            />
          </RadioGroup>
        </FormControl>
        {mode === 'create' && splitParts.length < 2 ? (
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Nome proposto"
              value={appliedName}
              onChange={(event) => onChange({ appliedName: event.target.value })}
              helperText={`Default documental: ${structure.proposedName}`}
            />
            <FormControl size="small">
              <InputLabel id={`structure-type-${structure.key}`}>Tipo</InputLabel>
              <Select
                labelId={`structure-type-${structure.key}`}
                label="Tipo"
                value={appliedType}
                onChange={(event) =>
                  onChange({
                    appliedType: event.target.value as InventoryEligibleParentType,
                  })
                }
              >
                <MenuItem value="DIRECTORY">Diretoria</MenuItem>
                <MenuItem value="MANAGEMENT">Gerência</MenuItem>
                <MenuItem value="SECTOR">Setor</MenuItem>
                <MenuItem value="SUB_SECTOR">Subsetor</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        ) : null}
        {mode === 'reuse' && splitParts.length < 2 ? (
          <ParentOrganogramSelect
            options={parents}
            value={reusedParent}
            parentById={parentById}
            onChange={(value) =>
              onChange({
                included: true,
                reuseParentHierarchyId: value?.id || null,
              })
            }
            required
            error={!reusedParent}
            label="Estrutura já cadastrada a reutilizar"
            helperText="Este campo substitui a criação. Não é o destino de uma estrutura nova."
          />
        ) : null}
        {mode !== 'ignore' ? (
          <Stack spacing={1.5}>
            {splitParts.length >= 2 ? (
              <>
                <Alert severity="info">
                  A proposta “{structure.proposedName}” não será criada. As
                  estruturas abaixo entram no plano. O GSE de origem permanece
                  único: {relatedGroups.join(' · ') || '—'}.
                </Alert>
                {splitParts.map((part, index) => (
                  <Stack
                    key={part.key}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      label={`Estrutura ${index + 1}`}
                      value={part.appliedName}
                      onChange={(event) =>
                        onChange({
                          splitParts: splitParts.map((item) =>
                            item.key === part.key
                              ? { ...item, appliedName: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel id={`split-type-${part.key}`}>Tipo</InputLabel>
                      <Select
                        labelId={`split-type-${part.key}`}
                        label="Tipo"
                        value={part.appliedType || appliedType}
                        onChange={(event) =>
                          onChange({
                            splitParts: splitParts.map((item) =>
                              item.key === part.key
                                ? {
                                    ...item,
                                    appliedType:
                                      event.target.value as InventoryEligibleParentType,
                                  }
                                : item,
                            ),
                          })
                        }
                      >
                        <MenuItem value="DIRECTORY">Diretoria</MenuItem>
                        <MenuItem value="MANAGEMENT">Gerência</MenuItem>
                        <MenuItem value="SECTOR">Setor</MenuItem>
                        <MenuItem value="SUB_SECTOR">Subsetor</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                ))}
                {relatedRoles.length ? (
                  <Stack spacing={1}>
                    <Typography variant="body2" fontWeight={600}>
                      Distribuir cargos — o documento não atribui sozinho
                    </Typography>
                    {relatedRoles.map((role) => (
                      <FormControl key={role.key} size="small" fullWidth>
                        <InputLabel id={`assign-${role.key}`}>
                          {role.name}
                        </InputLabel>
                        <Select
                          labelId={`assign-${role.key}`}
                          label={role.name}
                          value={
                            splitParts.some((part) => part.key === role.assignedKey)
                              ? role.assignedKey || ''
                              : ''
                          }
                          onChange={(event) =>
                            onAssignRole(role.key, event.target.value || null)
                          }
                        >
                          <MenuItem value="">
                            Decisão necessária — escolher estrutura
                          </MenuItem>
                          {splitParts.map((part) => (
                            <MenuItem key={part.key} value={part.key}>
                              {part.appliedName || 'Sem nome'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum cargo para distribuir. As estruturas entram no plano;
                    o GSE permanece único.
                  </Typography>
                )}
                <Button
                  size="small"
                  onClick={() =>
                    onChange({
                      included: true,
                      splitParts: [],
                    })
                  }
                >
                  Manter uma estrutura
                </Button>
                {splitChildren.length ? (
                  <Typography variant="caption" color="text.secondary">
                    No plano: {splitChildren.map((item) => item.appliedName).join(' · ')}
                  </Typography>
                ) : null}
              </>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const names = suggestedSplitNames(
                    appliedName.trim() || structure.proposedName,
                  );
                  onChange({
                    included: true,
                    reuseParentHierarchyId: null,
                    splitParts: names.map((name, index) => ({
                      key: `${structure.key}::split:${index}`,
                      appliedName: name,
                      appliedType,
                    })),
                  });
                }}
              >
                Dividir em estruturas
              </Button>
            )}
          </Stack>
        ) : null}
      </Stack>
    </DecisionCard>
  );
}

function RoleReviewCard({
  role,
  appliedName,
  included,
  parentHierarchyId,
  proposedStructureKey,
  resolvedMatchId,
  structures,
  parents,
  allParents,
  parentById,
  selected,
  forceParentSelect,
  onToggleParentSelect,
  onToggleSelect,
  onChange,
}: {
  role: InventoryReviewedRole;
  appliedName: string;
  included: boolean;
  parentHierarchyId: string | null;
  proposedStructureKey: string | null;
  resolvedMatchId: string | null;
  structures: InventoryReviewedStructure[];
  parents: InventoryParentCatalogItem[];
  allParents: InventoryParentCatalogItem[];
  parentById: Map<string, InventoryParentCatalogItem>;
  selected: boolean;
  forceParentSelect: boolean;
  onToggleParentSelect: (open: boolean) => void;
  onToggleSelect: (checked: boolean) => void;
  onChange: (patch: Partial<InventoryReviewDecisions['roles'][number]>) => void;
}) {
  const selectedParent =
    allParents.find((parent) => parent.id === parentHierarchyId) ||
    parents.find((parent) => parent.id === parentHierarchyId) ||
    null;
  const resolvedByProposal = roleResolvedByProposedStructure(role, structures);
  const blockedReason = roleBlockedReason(role, structures);
  const needsManualParent =
    included &&
    !resolvedByProposal &&
    (forceParentSelect ||
      role.planAction === 'blocked' ||
      role.matchStatus === 'PARENT_REQUIRED');
  const promoted = promotedGseSuggestions(role.structuralParent);
  const unpromoted = unpromotedGseOrigins(role.structuralParent);

  return (
    <DecisionCard
      id={`inventory-role-${role.key}`}
      ignored={!included}
      header={
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary">
            Cargo
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {roleHeadline(role, structures)}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {role.sourceName}
          </Typography>
        </Stack>
      }
      status={
        <>
          <Chip
            size="small"
            label={included ? STATUS_LABEL[role.matchStatus] : 'Ignorado'}
            color={included ? statusColor(role.matchStatus) : 'default'}
          />
        </>
      }
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Checkbox
            checked={selected}
            onChange={(event) => onToggleSelect(event.target.checked)}
          />
          <Typography variant="body2" color="text.secondary">
            Selecionar para ação em lote
          </Typography>
        </Stack>
        <FormControl>
          <FormLabel>Decisão</FormLabel>
          <RadioGroup
            value={!included ? 'ignore' : role.planAction === 'reuse' ? 'reuse' : 'create'}
            onChange={(_, value) => {
              if (value === 'ignore') {
                onChange({ included: false });
                return;
              }
              if (value === 'reuse') {
                onChange({
                  included: true,
                  resolvedMatchId: resolvedMatchId || role.matchedHierarchyId,
                });
                return;
              }
              onChange({ included: true, resolvedMatchId: null });
            }}
          >
            <FormControlLabel
              value="create"
              control={<Radio />}
              label="Criar este cargo no plano"
            />
            {role.candidates.length ? (
              <FormControlLabel
                value="reuse"
                control={<Radio />}
                label="Usar cargo existente"
              />
            ) : null}
            <FormControlLabel
              value="ignore"
              control={<Radio />}
              label="Ignorar — vínculos deste cargo saem do plano"
            />
          </RadioGroup>
        </FormControl>
        {blockedReason ? <Alert severity="warning">{blockedReason}</Alert> : null}
        {promoted.length || unpromoted.length ? (
          <Typography variant="body2" color="text.secondary">
            GSE(s) de origem:{' '}
            {[...promoted, ...unpromoted]
              .map((item) =>
                [item.groupLabel, item.rawName].filter(Boolean).join(' — '),
              )
              .join(' · ')}
          </Typography>
        ) : null}
        {role.structuralParent?.context === 'WORK_UNIT_GSE' ? (
          <Typography variant="body2" color="text.secondary">
            Evidência: Unidade de Trabalho encontrada no PDF
          </Typography>
        ) : null}
        {promoted.map((item) => (
          <Typography key={item.groupKey} variant="body2" color="text.secondary">
            {formatGseSuggestionLine(item)}
          </Typography>
        ))}
        {included && resolvedByProposal && !forceParentSelect ? (
          <Button size="small" onClick={() => onToggleParentSelect(true)}>
            Usar uma estrutura já cadastrada
          </Button>
        ) : null}
        {needsManualParent ? (
          <ParentOrganogramSelect
            options={parents}
            value={selectedParent}
            parentById={parentById}
            onChange={(value) => {
              onChange({
                parentHierarchyId: value?.id || null,
                proposedStructureKey: value ? null : proposedStructureKey,
              });
              if (!value) onToggleParentSelect(false);
            }}
            required={role.planAction === 'blocked'}
            error={role.planAction === 'blocked' && !selectedParent}
            label="Estrutura já cadastrada"
            helperText="Substitui a proposta do plano por um item já existente."
          />
        ) : null}
        {included && role.planAction === 'reuse' && role.candidates.length > 1 ? (
          <Autocomplete
            options={role.candidates}
            getOptionLabel={(option) =>
              `${option.name}${option.detail ? ` · ${option.detail}` : ''}`
            }
            value={
              role.candidates.find((item) => item.id === resolvedMatchId) || null
            }
            onChange={(_, value) => onChange({ resolvedMatchId: value?.id || null })}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Escolher cargo existente" />
            )}
          />
        ) : null}
        <TextField
          size="small"
          label="Correção opcional do nome do cargo"
          value={appliedName}
          onChange={(event) => onChange({ appliedName: event.target.value })}
          helperText="Não substitui o texto extraído. Use só para correção consciente."
        />
      </Stack>
    </DecisionCard>
  );
}

function GroupReviewCard({
  group,
  appliedName,
  included,
  confirmWorkspaceLink,
  resolvedMatchId,
  cargos,
  onChange,
}: {
  group: InventoryReviewedGroup;
  appliedName: string;
  included: boolean;
  confirmWorkspaceLink: boolean;
  resolvedMatchId: string | null;
  cargos: string[];
  onChange: (patch: Partial<InventoryReviewDecisions['groups'][number]>) => void;
}) {
  const persistedDefault = formatInventoryGsePersistedName({
    sourceCode: group.sourceCode,
    sourceName: group.sourceName,
  });
  const persistedName =
    group.persistedName ||
    resolveInventoryGsePersistedName({
      sourceCode: group.sourceCode,
      sourceName: group.sourceName,
      appliedName,
    });
  const humanCorrected = isHumanInventoryGseNameOverride(
    appliedName,
    persistedDefault,
  );
  const needsName =
    included &&
    (group.semanticNameMissing || !group.sourceName.trim()) &&
    !persistedName.trim();
  const mode = !included
    ? 'ignore'
    : group.planAction === 'link-workspace' || confirmWorkspaceLink
      ? 'link'
      : group.planAction === 'reuse'
        ? 'reuse'
        : 'create';

  return (
    <DecisionCard
      id={`inventory-group-${group.key}`}
      ignored={!included}
      header={
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary">
            GSE
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {groupHeadline(group)}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {group.sourceName.trim() || 'Nome do GSE não informado'}
          </Typography>
        </Stack>
      }
      status={
        <Chip
          size="small"
          label={included ? STATUS_LABEL[group.matchStatus] : 'Ignorado'}
          color={included ? statusColor(group.matchStatus) : 'default'}
        />
      }
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            Documento:{' '}
            {formatInventoryGseDocumentLabel({
              sourceLabel: group.sourceLabel,
              sourceCode: group.sourceCode,
              sourceName: group.sourceName,
            })}
          </Typography>
          <Typography variant="body2">
            No SimpleSST: {persistedName || '—'}
          </Typography>
        </Stack>
        {cargos.length ? (
          <Typography variant="body2" color="text.secondary">
            Cargos: {cargos.join(', ')}
          </Typography>
        ) : group.noRolesFound ? (
          <Alert severity="warning">GSE sem cargos encontrados no documento.</Alert>
        ) : null}
        {group.evidence.length ? (
          <Typography variant="caption" color="text.secondary">
            Trecho: {formatEvidence(group.evidence)}
          </Typography>
        ) : null}
        <FormControl>
          <FormLabel>Decisão</FormLabel>
          <RadioGroup
            value={mode}
            onChange={(_, value) => {
              if (value === 'ignore') {
                onChange({ included: false, confirmWorkspaceLink: false });
                return;
              }
              if (value === 'link') {
                onChange({ included: true, confirmWorkspaceLink: true });
                return;
              }
              if (value === 'reuse') {
                onChange({
                  included: true,
                  confirmWorkspaceLink: false,
                  resolvedMatchId: resolvedMatchId || group.matchedHomogeneousGroupId,
                });
                return;
              }
              onChange({
                included: true,
                confirmWorkspaceLink: false,
                resolvedMatchId: null,
              });
            }}
          >
            <FormControlLabel
              value="create"
              control={<Radio />}
              label="Criar este GSE no plano"
            />
            {group.candidates.length ? (
              <FormControlLabel
                value="reuse"
                control={<Radio />}
                label="Usar GSE existente"
              />
            ) : null}
            {group.matchStatus === 'WORKSPACE_LINK_REQUIRED' ? (
              <FormControlLabel
                value="link"
                control={<Radio />}
                label="Vincular GSE existente a este estabelecimento"
              />
            ) : null}
            <FormControlLabel
              value="ignore"
              control={<Radio />}
              label="Ignorar — vínculos deste GSE saem do plano"
            />
          </RadioGroup>
        </FormControl>
        {included && mode === 'create' ? (
          <TextField
            size="small"
            required={needsName}
            error={needsName}
            label={
              humanCorrected
                ? 'Correção consciente do nome no SimpleSST'
                : 'Nome do GSE no SimpleSST'
            }
            value={appliedName || persistedDefault}
            onChange={(event) => {
              const next = event.target.value;
              onChange({
                appliedName: isHumanInventoryGseNameOverride(
                  next,
                  persistedDefault,
                )
                  ? next
                  : '',
              });
            }}
            helperText={
              needsName
                ? 'Obrigatório. Não use o código, o setor, o local nem o cargo como nome.'
                : humanCorrected
                  ? 'Correção consciente. O documento permanece inalterado.'
                  : 'Default calculado. Edite só se quiser um nome diferente no SimpleSST.'
            }
          />
        ) : null}
        {included && mode === 'reuse' && group.candidates.length > 1 ? (
          <Autocomplete
            options={group.candidates}
            getOptionLabel={(option) => option.name}
            value={
              group.candidates.find((item) => item.id === resolvedMatchId) || null
            }
            onChange={(_, value) => onChange({ resolvedMatchId: value?.id || null })}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Escolher GSE existente" />
            )}
          />
        ) : null}
      </Stack>
    </DecisionCard>
  );
}

function LinksStep({
  preview,
  review,
  decisions,
  onPatchLink,
  onResolveRole,
  onResolveGroup,
}: {
  preview: InventoryPgrImportPreview;
  review: InventoryPgrImportReview | null;
  decisions: InventoryReviewDecisions;
  onPatchLink: (roleKey: string, groupKey: string, included: boolean) => void;
  onResolveRole: (roleKey: string) => void;
  onResolveGroup: (groupKey: string) => void;
}) {
  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Esta tabela é consequência das etapas anteriores. Nada é gravado aqui.
      </Alert>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Incluir</TableCell>
            <TableCell>Cargo</TableCell>
            <TableCell>GSE</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {toInventoryLinkRows(preview, review).map(({ link, reviewed }) => {
            const status = linkOperationalStatus({
              reviewed,
              fallbackStatus: link.matchStatus,
            });
            const included =
              reviewed?.included ??
              decisions.links.find(
                (item) =>
                  item.roleKey === link.roleKey && item.groupKey === link.groupKey,
              )?.included !== false;
            const ignoreReason = linkIgnoreReason(reviewed);
            return (
              <TableRow key={`${link.roleKey}:${link.groupKey}`}>
                <TableCell>
                  <Checkbox
                    checked={included && status !== 'ignored'}
                    disabled={Boolean(reviewed?.excludedBecause)}
                    onChange={(event) =>
                      onPatchLink(link.roleKey, link.groupKey, event.target.checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {reviewed?.appliedRoleName || link.roleName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {reviewed?.appliedGroupName ||
                      link.groupName?.trim() ||
                      'Nome do GSE precisa ser definido'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Chip
                      size="small"
                      label={linkStatusLabel(status)}
                      color={
                        status === 'ready' || status === 'exists'
                          ? 'success'
                          : status === 'ignored'
                            ? 'default'
                            : 'warning'
                      }
                    />
                    {ignoreReason ? (
                      <Typography variant="caption" color="text.secondary">
                        {ignoreReason}
                      </Typography>
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell>
                  {status === 'blocked-role' ? (
                    <Button size="small" onClick={() => onResolveRole(link.roleKey)}>
                      Resolver cargo
                    </Button>
                  ) : null}
                  {status === 'blocked-gse' ? (
                    <Button size="small" onClick={() => onResolveGroup(link.groupKey)}>
                      Resolver GSE
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Stack>
  );
}

function SummaryStep({
  review,
  acknowledgeable,
  softAcknowledged,
  importHint,
  canApply,
  applyPending,
  applyResult,
  applyError,
  onApply,
  onToggleSoft,
  mutationError,
}: {
  review: InventoryPgrImportReview | null;
  acknowledgeable: InventoryPgrImportPreview['issues'];
  softAcknowledged: boolean;
  importHint: string;
  canApply: boolean;
  applyPending: boolean;
  applyResult: InventoryPgrImportApply | null;
  applyError: unknown;
  onApply: () => void;
  onToggleSoft: (checked: boolean) => void;
  mutationError: boolean;
}) {
  const summary = review?.summary;
  const ignored =
    (summary?.structures.skip || 0) +
    (summary?.roles.skip || 0) +
    (summary?.groups.skip || 0) +
    (summary?.links.skip || 0);

  return (
    <Stack spacing={2}>
      {acknowledgeable.length ? (
        <Alert severity="warning">
          <AlertTitle>Avisos do documento</AlertTitle>
          <Stack spacing={0.75} sx={{ mb: 1 }}>
            {acknowledgeable.map((issue) => (
              <Typography key={issue.type} variant="body2">
                {issue.message}
              </Typography>
            ))}
          </Stack>
          <FormControlLabel
            control={
              <Checkbox
                checked={softAcknowledged}
                onChange={(event) => onToggleSoft(event.target.checked)}
              />
            }
            label="Estou ciente. A futura importação gravará somente o que está neste plano; o que o PDF não entregou não será inventado."
          />
        </Alert>
      ) : null}
      {mutationError ? (
        <Alert severity="error">
          Não foi possível recalcular o plano revisado. Nenhuma alteração foi
          gravada.
        </Alert>
      ) : null}
      {review ? (
        <>
          <Alert severity={review.readyForFutureApply ? 'success' : 'warning'}>
            <AlertTitle>Resumo operacional do plano</AlertTitle>
            <Typography variant="body2">
              Estruturas: {review.summary.structures?.create || 0} a criar ·{' '}
              {review.summary.structures?.reuse || 0} existentes serão utilizadas
            </Typography>
            <Typography variant="body2">
              Cargos: {review.summary.roles.create} a criar ·{' '}
              {review.summary.roles.reuse} existentes serão utilizados
            </Typography>
            <Typography variant="body2">
              GSEs: {review.summary.groups.create} a criar ·{' '}
              {review.summary.groups.reuse} existentes serão utilizados ·{' '}
              {review.summary.groups.linkWorkspace} a vincular ao estabelecimento
            </Typography>
            <Typography variant="body2">
              Vínculos: {review.summary.links.create} a criar ·{' '}
              {review.summary.links.alreadyLinked} já existem
            </Typography>
            <Typography variant="body2">Itens ignorados: {ignored}</Typography>
            <Typography variant="body2">
              Pendências: {review.summary.pendingBlockers}
            </Typography>
          </Alert>
          {review.blockers.map((blocker, index) => (
            <Alert
              key={`${blocker.code}-${blocker.itemKey}-${index}`}
              severity={blocker.hard ? 'error' : 'warning'}
            >
              {blocker.message}
            </Alert>
          ))}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Recalculando o plano revisado…
        </Typography>
      )}
      {applyResult ? (
        <Alert severity="success">
          <AlertTitle>Importação concluída</AlertTitle>
          <Typography variant="body2">
            Estruturas: {applyResult.counts.structures.created} criadas ·{' '}
            {applyResult.counts.structures.reused} reutilizadas
          </Typography>
          <Typography variant="body2">
            Cargos: {applyResult.counts.roles.created} criados ·{' '}
            {applyResult.counts.roles.reused} reutilizados
          </Typography>
          <Typography variant="body2">
            GSEs: {applyResult.counts.groups.created} criados ·{' '}
            {applyResult.counts.groups.reused} reutilizados ·{' '}
            {applyResult.counts.groups.workspaceLinked} vinculados ao
            estabelecimento
          </Typography>
          <Typography variant="body2">
            Vínculos: {applyResult.counts.links.created} criados ·{' '}
            {applyResult.counts.links.alreadyLinked} já existiam
          </Typography>
          <Typography variant="body2">
            Ignorados: {applyResult.counts.structures.skipped} estruturas ·{' '}
            {applyResult.counts.roles.skipped} cargos ·{' '}
            {applyResult.counts.groups.skipped} GSEs ·{' '}
            {applyResult.counts.links.skipped} vínculos
          </Typography>
        </Alert>
      ) : null}
      {applyError ? (
        <Alert severity="error">
          <AlertTitle>
            {isInventoryPgrImportStaleError(applyError)
              ? 'O plano ficou desatualizado'
              : 'A importação não foi concluída'}
          </AlertTitle>
          {inventoryImportApplyErrorMessage(applyError)}
        </Alert>
      ) : null}
      <Stack spacing={1}>
        <Button
          variant="contained"
          disabled={!canApply || applyPending}
          onClick={onApply}
        >
          {applyPending
            ? 'Importando…'
            : 'Importar estrutura, cargos e GSEs'}
        </Button>
        <Typography variant="body2" color="text.secondary">
          {importHint}
        </Typography>
      </Stack>
    </Stack>
  );
}
