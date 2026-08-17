import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useFetchClosingPrecheck } from '@v2/services/forms/form-application/closing-precheck/hooks/useFetchClosingPrecheck';
import { useMutateResolveClosingDivergences } from '@v2/services/forms/form-application/closing-precheck/hooks/useMutateResolveClosingDivergences';
import {
  ClosingDivergenceResolutionAction,
  ClosingPrecheckEmployee,
} from '@v2/services/forms/form-application/closing-precheck/service/closing-precheck.types';
import { useMemo, useState } from 'react';
import {
  batchConfirmLegitimateCopy,
  batchCorrectConfirmationCopy,
  buildClosingResolutionPayloadItem,
  canContinueClosingReview,
  canSelectClosingReviewEmployee,
  closingPrecheckErrorMessage,
  closingResolutionErrorMessage,
  closingResolutionExclusionReason,
  closingReviewClassificationColor,
  closingReviewClassificationExplanation,
  closingReviewClassificationLabel,
  closingReviewCloseButtonLabel,
  closingReviewCorrectablePendingKeys,
  closingReviewEmployeeKey,
  closingReviewModalTitle,
  hasDivergenceAlert,
  isClosingDivergenceConfirmedLegitimate,
  partitionClosingResolutionSelection,
  shouldShowContinueClosingAction,
  type ClosingResolutionBatchAction,
  type ClosingReviewModalMode,
} from './closing-review-ui.rules';

type ClosingReviewModalProps = {
  open: boolean;
  companyId: string;
  applicationId: string;
  onClose: () => void;
  onContinue?: () => void;
  continuing?: boolean;
  mode?: ClosingReviewModalMode;
};

export function ClosingReviewModal({
  open,
  companyId,
  applicationId,
  onClose,
  onContinue,
  continuing,
  mode = 'closing',
}: ClosingReviewModalProps) {
  const [showComposition, setShowComposition] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<ClosingResolutionBatchAction | null>(
    null,
  );
  const [batchScope, setBatchScope] = useState<'selected' | 'allEligible' | null>(
    null,
  );
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const { precheck, isLoading, isError, error } = useFetchClosingPrecheck(
    { companyId, applicationId },
    { enabled: open },
  );
  const resolveMutation = useMutateResolveClosingDivergences();

  const blockingTotal = precheck?.summary.blockingTotal ?? 0;
  const canContinue = canContinueClosingReview(blockingTotal);
  const showContinue = shouldShowContinueClosingAction(mode);
  const canResolve = Boolean(precheck?.canResolve);
  const pendingReviewTotal =
    precheck?.summary.pendingReviewTotal ?? precheck?.summary.divergenceTotal ?? 0;
  const allCorrectableKeys = useMemo(
    () => closingReviewCorrectablePendingKeys(precheck?.employees ?? []),
    [precheck?.employees],
  );
  const selectedSet = new Set(selectedKeys);
  const selectedCorrectableCount = allCorrectableKeys.filter((key) =>
    selectedSet.has(key),
  ).length;
  const allSelected =
    allCorrectableKeys.length > 0 &&
    allCorrectableKeys.every((key) => selectedSet.has(key));

  const toggleAllEligible = () => {
    setSelectedKeys(allSelected ? [] : allCorrectableKeys);
  };

  const toggleOne = (key: string, checked: boolean) => {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (checked) next.add(key);
      else next.delete(key);
      return [...next];
    });
  };

  const submitResolution = async (
    action: ClosingResolutionBatchAction,
    employees: ClosingPrecheckEmployee[],
  ) => {
    const items = employees
      .map((employee) => buildClosingResolutionPayloadItem(employee, action))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    if (!items.length) return;
    try {
      await resolveMutation.mutateAsync({
        companyId,
        applicationId,
        action: action as ClosingDivergenceResolutionAction,
        items,
      });
      setResolutionError(null);
      setSelectedKeys([]);
      setConfirmAction(null);
      setBatchScope(null);
    } catch (error) {
      setResolutionError(closingResolutionErrorMessage(error));
    }
  };

  const keysForConfirm =
    batchScope === 'allEligible' ? allCorrectableKeys : selectedKeys;
  const partition = confirmAction
    ? partitionClosingResolutionSelection({
        employees: precheck?.employees ?? [],
        selectedKeys: keysForConfirm,
        action: confirmAction,
      })
    : null;
  const confirmLines = partition
    ? confirmAction === 'CORRECT'
      ? batchCorrectConfirmationCopy(partition)
      : batchConfirmLegitimateCopy(partition)
    : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: 'min(96vw, 1680px)',
          maxWidth: '96vw',
          m: 2,
        },
      }}
    >
      <DialogTitle>{closingReviewModalTitle(mode)}</DialogTitle>
      <DialogContent sx={{ overflowX: 'hidden' }}>
        {isLoading && <Typography>Carregando revisão…</Typography>}
        {isError && (
          <Typography color="error">{closingPrecheckErrorMessage(error)}</Typography>
        )}
        {precheck && (
          <SFlex direction="column" gap={3}>
            <Typography variant="body2" color="text.secondary">
              {canResolve
                ? 'Você pode corrigir o vínculo de setor gravado na resposta ou confirmar a divergência como legítima. Nenhuma resposta psicossocial, análise de IA ou dado de risco é alterado nesta etapa.'
                : 'Somente leitura. Nenhuma resposta, organograma ou análise é alterada nesta etapa.'}
            </Typography>
            {resolutionError && (
              <Typography color="error" role="alert">
                {resolutionError}
              </Typography>
            )}
            <SFlex gap={3} flexWrap="wrap">
              <SummaryChip label="População" value={precheck.summary.populationTotal} />
              <SummaryChip
                label="Respondentes"
                value={precheck.summary.respondentsTotal}
              />
              <SummaryChip
                label="Sem resposta"
                value={precheck.summary.withoutResponseTotal}
              />
              <SummaryChip
                label="Pendências atuais"
                value={pendingReviewTotal}
                alert={hasDivergenceAlert(pendingReviewTotal)}
              />
              <SummaryChip
                label="Correções realizadas"
                value={precheck.summary.correctedTotal ?? 0}
              />
              <SummaryChip
                label="Confirmadas como legítimas"
                value={precheck.summary.confirmedLegitimateTotal ?? 0}
              />
              <SummaryChip
                label="Bloqueantes"
                value={precheck.summary.blockingTotal}
                alert={hasDivergenceAlert(precheck.summary.blockingTotal)}
              />
            </SFlex>

            {precheck.possibleDuplicateHierarchyNames.length > 0 && (
              <Box>
                <Typography fontWeight={600}>
                  Possível duplicidade de setor
                </Typography>
                {precheck.possibleDuplicateHierarchyNames.map((item) => (
                  <Typography key={`${item.hierarchyIdA}-${item.hierarchyIdB}`}>
                    {item.nameA} × {item.nameB} (similaridade{' '}
                    {Math.round(item.similarity * 100)}%). Sem auto-merge.
                  </Typography>
                ))}
              </Box>
            )}

            <Box sx={{ overflowX: 'auto' }}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Composição por setor
              </Typography>
              <Table size="small" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Setor</TableCell>
                    <TableCell align="right">Empregados</TableCell>
                    <TableCell align="right">Respondentes</TableCell>
                    <TableCell align="right">Sem resposta</TableCell>
                    <TableCell align="right">Pendências</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {precheck.sectors.map((sector) => (
                    <TableRow key={sector.hierarchyId}>
                      <TableCell>{sector.name}</TableCell>
                      <TableCell align="right">
                        {sector.currentEmployeeCount}
                      </TableCell>
                      <TableCell align="right">{sector.respondentCount}</TableCell>
                      <TableCell align="right">
                        {sector.withoutResponseCount}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: hasDivergenceAlert(sector.divergenceCount)
                            ? 'error.main'
                            : 'inherit',
                          fontWeight: hasDivergenceAlert(sector.divergenceCount)
                            ? 700
                            : 400,
                        }}
                      >
                        {sector.divergenceCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {showComposition && (
              <Box sx={{ overflowX: 'auto', maxHeight: 480 }}>
                <SFlex
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                  flexWrap="wrap"
                  sx={{ mb: 1 }}
                >
                  <Typography fontWeight={600}>Conferência nominal</Typography>
                  {canResolve && (
                    <SFlex gap={1} flexWrap="wrap" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {selectedCorrectableCount} selecionada
                        {selectedCorrectableCount === 1 ? '' : 's'}
                      </Typography>
                      <SButton
                        text={`Corrigir vínculos selecionados (${selectedCorrectableCount})`}
                        variant="outlined"
                        onClick={() => {
                          setBatchScope('selected');
                          setConfirmAction('CORRECT');
                          setResolutionError(null);
                        }}
                        disabled={
                          selectedCorrectableCount === 0 ||
                          resolveMutation.isPending
                        }
                      />
                      <SButton
                        text={`Corrigir todas as pendências elegíveis (${allCorrectableKeys.length})`}
                        variant="outlined"
                        onClick={() => {
                          setBatchScope('allEligible');
                          setConfirmAction('CORRECT');
                          setResolutionError(null);
                        }}
                        disabled={
                          allCorrectableKeys.length === 0 ||
                          resolveMutation.isPending
                        }
                      />
                      <SButton
                        text={`Confirmar como legítima (${selectedKeys.length})`}
                        variant="outlined"
                        onClick={() => {
                          setBatchScope('selected');
                          setConfirmAction('CONFIRM_LEGITIMATE');
                          setResolutionError(null);
                        }}
                        disabled={!selectedKeys.length || resolveMutation.isPending}
                      />
                    </SFlex>
                  )}
                </SFlex>
                <Table size="small" sx={{ minWidth: 1180 }}>
                  <TableHead>
                    <TableRow>
                      {canResolve && (
                        <TableCell padding="checkbox" sx={{ width: 48, minWidth: 48 }}>
                          <Tooltip title="Selecionar todas as pendências elegíveis">
                            <span>
                              <Checkbox
                                inputProps={{
                                  'aria-label':
                                    'Selecionar todas as pendências elegíveis',
                                }}
                                checked={allSelected}
                                indeterminate={
                                  selectedCorrectableCount > 0 && !allSelected
                                }
                                onChange={toggleAllEligible}
                                disabled={!allCorrectableKeys.length}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell>Empregado</TableCell>
                      <TableCell>Setor atual</TableCell>
                      <TableCell>Cargo</TableCell>
                      <TableCell>Respondeu</TableCell>
                      <TableCell>Setor gravado</TableCell>
                      <TableCell>Setor na data da resposta</TableCell>
                      <TableCell>Classificação</TableCell>
                      {canResolve && <TableCell>Ações</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {precheck.employees.map((employee) => (
                      <EmployeeRow
                        key={closingReviewEmployeeKey(employee)}
                        employee={employee}
                        canResolve={canResolve}
                        selected={selectedSet.has(closingReviewEmployeeKey(employee))}
                        resolving={resolveMutation.isPending}
                        onToggle={toggleOne}
                        onCorrect={() =>
                          submitResolution('CORRECT', [employee])
                        }
                        onConfirm={() =>
                          submitResolution('CONFIRM_LEGITIMATE', [employee])
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </SFlex>
        )}
      </DialogContent>
      <DialogActions>
        <SButton
          text={showComposition ? 'Ocultar composição' : 'Conferir composição'}
          variant="outlined"
          onClick={() => setShowComposition((value) => !value)}
          disabled={!precheck}
        />
        <SButton
          text={closingReviewCloseButtonLabel(mode)}
          variant="outlined"
          onClick={onClose}
        />
        {showContinue && (
          <SButton
            text="Continuar conclusão"
            onClick={onContinue}
            loading={continuing}
            disabled={!precheck || !canContinue || continuing || !onContinue}
          />
        )}
      </DialogActions>

      <Dialog
        open={Boolean(confirmAction && partition)}
        onClose={() => {
          setConfirmAction(null);
          setBatchScope(null);
        }}
      >
        <DialogTitle>
          {confirmAction === 'CORRECT'
            ? 'Confirmar correção de vínculos'
            : 'Confirmar divergências como legítimas'}
        </DialogTitle>
        <DialogContent>
          {confirmLines.map((line) => (
            <Typography key={line} sx={{ mb: 0.5 }}>
              {line}
            </Typography>
          ))}
          {resolutionError && (
            <Typography color="error" role="alert" sx={{ mt: 1.5 }}>
              {resolutionError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <SButton
            text="Cancelar"
            variant="outlined"
            onClick={() => {
              setConfirmAction(null);
              setBatchScope(null);
            }}
          />
          <SButton
            text="Confirmar"
            loading={resolveMutation.isPending}
            disabled={!partition?.eligibleCount || resolveMutation.isPending}
            onClick={() => {
              if (!confirmAction || !partition) return;
              void submitResolution(confirmAction, partition.eligible as ClosingPrecheckEmployee[]);
            }}
          />
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

function SummaryChip({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        fontWeight={700}
        sx={{ color: alert ? 'error.main' : 'inherit' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function EmployeeRow({
  employee,
  canResolve,
  selected,
  resolving,
  onToggle,
  onCorrect,
  onConfirm,
}: {
  employee: ClosingPrecheckEmployee;
  canResolve: boolean;
  selected: boolean;
  resolving: boolean;
  onToggle: (key: string, checked: boolean) => void;
  onCorrect: () => void;
  onConfirm: () => void;
}) {
  const label = closingReviewClassificationLabel(
    employee.classification,
    employee.resolutionStatus,
  );
  const explanation = closingReviewClassificationExplanation(
    employee.classification,
    employee.resolutionStatus,
  );
  const color = closingReviewClassificationColor(
    employee.classification,
    employee.resolutionStatus,
  );
  const key = closingReviewEmployeeKey(employee);
  const selectable = canSelectClosingReviewEmployee(employee);
  const confirmed = isClosingDivergenceConfirmedLegitimate(
    employee.resolutionStatus,
  );
  const content = (
    <Typography component="span" sx={{ color, fontWeight: 600 }}>
      {label}
    </Typography>
  );

  return (
    <TableRow>
      {canResolve && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            disabled={!selectable || resolving}
            onChange={(_, checked) => onToggle(key, checked)}
          />
        </TableCell>
      )}
      <TableCell>{employee.name}</TableCell>
      <TableCell>{employee.currentSectorName ?? '—'}</TableCell>
      <TableCell>{employee.officeName ?? '—'}</TableCell>
      <TableCell>{employee.hasResponded ? 'Sim' : 'Não'}</TableCell>
      <TableCell>{employee.snapshotSectorName ?? '—'}</TableCell>
      <TableCell>
        {employee.coveringSectorName ?? employee.referenceSectorName ?? '—'}
      </TableCell>
      <TableCell>
        {explanation ? (
          <Tooltip title={explanation}>
            <span>{content}</span>
          </Tooltip>
        ) : (
          content
        )}
      </TableCell>
      {canResolve && (
        <TableCell>
          <SFlex
            direction="column"
            gap={0.5}
            alignItems="stretch"
            sx={{ width: 'max-content' }}
          >
            {employee.canCorrect && !confirmed && (
              <SButton
                text="Corrigir vínculo"
                variant="outlined"
                size="s"
                minWidth={188}
                onClick={onCorrect}
                disabled={resolving}
                buttonProps={{ sx: { whiteSpace: 'nowrap', flexShrink: 0 } }}
              />
            )}
            {employee.canConfirmLegitimate && !confirmed && (
              <SButton
                text="Confirmar como legítima"
                variant="outlined"
                size="s"
                minWidth={188}
                onClick={onConfirm}
                disabled={resolving}
                buttonProps={{ sx: { whiteSpace: 'nowrap', flexShrink: 0 } }}
              />
            )}
            {!employee.canCorrect &&
              !employee.canConfirmLegitimate &&
              selectable === false &&
              employee.classification === 'INCONCLUSIVE' && (
                <Typography variant="caption" color="text.secondary">
                  {closingResolutionExclusionReason(employee, 'CORRECT')}
                </Typography>
              )}
          </SFlex>
        </TableCell>
      )}
    </TableRow>
  );
}
