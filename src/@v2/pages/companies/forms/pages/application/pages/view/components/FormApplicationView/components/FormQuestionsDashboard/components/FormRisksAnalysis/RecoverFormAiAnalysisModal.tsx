import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import {
  ClearFormAiAnalysisScopeEnum,
} from '@v2/services/forms/form-questions-answers-analysis/clear-form-questions-answers-analysis/service/clear-form-questions-answers-analysis.types';
import { useMutateRecoverStuckFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/recover-stuck-form-questions-answers-analysis';
import {
  RecoverStuckFormQuestionsAnswersAnalysisParams,
  RecoverStuckFormQuestionsAnswersAnalysisResponse,
} from '@v2/services/forms/form-questions-answers-analysis/recover-stuck-form-questions-answers-analysis/service/recover-stuck-form-questions-answers-analysis.types';
import { recoverStuckFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/recover-stuck-form-questions-answers-analysis/service/recover-stuck-form-questions-answers-analysis.service';
import { DEFAULT_STUCK_AI_ANALYSIS_OLDER_THAN_MINUTES } from '@v2/services/forms/form-questions-answers-analysis/shared/form-ai-analysis-processing.utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

const CONFIRMATION_TOKEN = 'RECUPERAR';

const SCOPE_OPTIONS: Array<{
  value: ClearFormAiAnalysisScopeEnum;
  label: string;
}> = [
  { value: ClearFormAiAnalysisScopeEnum.APPLICATION, label: 'Toda a aplicação' },
  { value: ClearFormAiAnalysisScopeEnum.RISK, label: 'Um fator de risco' },
  { value: ClearFormAiAnalysisScopeEnum.HIERARCHY, label: 'Um setor' },
  {
    value: ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP,
    label: 'Um agrupamento de setores',
  },
  {
    value: ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP_RISK,
    label: 'Um fator de risco em um agrupamento',
  },
];

type SelectOption = {
  id: string;
  label: string;
};

type RecoverFormAiAnalysisModalProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  applicationId: string;
  riskOptions: SelectOption[];
  hierarchyOptions: SelectOption[];
  hierarchyGroupOptions: SelectOption[];
};

function isScopeSelectionComplete(
  scope: ClearFormAiAnalysisScopeEnum,
  riskId: string,
  hierarchyId: string,
  hierarchyGroupId: string,
): boolean {
  switch (scope) {
    case ClearFormAiAnalysisScopeEnum.APPLICATION:
      return true;
    case ClearFormAiAnalysisScopeEnum.RISK:
      return Boolean(riskId);
    case ClearFormAiAnalysisScopeEnum.HIERARCHY:
      return Boolean(hierarchyId);
    case ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP:
      return Boolean(hierarchyGroupId);
    case ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP_RISK:
      return Boolean(hierarchyGroupId && riskId);
    default:
      return false;
  }
}

function buildRecoverPayload(params: {
  companyId: string;
  applicationId: string;
  scope: ClearFormAiAnalysisScopeEnum;
  riskId: string;
  hierarchyId: string;
  hierarchyGroupId: string;
  dryRun: boolean;
}): RecoverStuckFormQuestionsAnswersAnalysisParams {
  const payload: RecoverStuckFormQuestionsAnswersAnalysisParams = {
    companyId: params.companyId,
    applicationId: params.applicationId,
    scope: params.scope,
    dryRun: params.dryRun,
    olderThanMinutes: DEFAULT_STUCK_AI_ANALYSIS_OLDER_THAN_MINUTES,
  };

  if (params.scope === ClearFormAiAnalysisScopeEnum.RISK) {
    payload.riskId = params.riskId;
  }

  if (params.scope === ClearFormAiAnalysisScopeEnum.HIERARCHY) {
    payload.hierarchyId = params.hierarchyId;
  }

  if (
    params.scope === ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP ||
    params.scope === ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP_RISK
  ) {
    payload.hierarchyGroupId = params.hierarchyGroupId;
  }

  if (params.scope === ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP_RISK) {
    payload.riskId = params.riskId;
  }

  return payload;
}

function buildScopeSummary(params: {
  scope: ClearFormAiAnalysisScopeEnum;
  riskOptions: SelectOption[];
  hierarchyOptions: SelectOption[];
  hierarchyGroupOptions: SelectOption[];
  riskId: string;
  hierarchyId: string;
  hierarchyGroupId: string;
  expandedHierarchyIds?: string[];
}): string {
  const riskLabel =
    params.riskOptions.find((item) => item.id === params.riskId)?.label ??
    params.riskId;
  const hierarchyLabel =
    params.hierarchyOptions.find((item) => item.id === params.hierarchyId)
      ?.label ?? params.hierarchyId;
  const groupLabel =
    params.hierarchyGroupOptions.find(
      (item) => item.id === params.hierarchyGroupId,
    )?.label ?? params.hierarchyGroupId;
  const memberCount = params.expandedHierarchyIds?.length ?? 0;

  switch (params.scope) {
    case ClearFormAiAnalysisScopeEnum.APPLICATION:
      return 'Todas as análises de IA travadas desta aplicação de formulário.';
    case ClearFormAiAnalysisScopeEnum.RISK:
      return `Análises travadas do fator de risco "${riskLabel}" em todos os setores.`;
    case ClearFormAiAnalysisScopeEnum.HIERARCHY:
      return `Análises travadas do setor "${hierarchyLabel}".`;
    case ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP:
      return `Análises travadas dos setores do agrupamento "${groupLabel}" (${memberCount} setor(es)).`;
    case ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP_RISK:
      return `Análises travadas do fator "${riskLabel}" nos ${memberCount} setor(es) do agrupamento "${groupLabel}".`;
    default:
      return '';
  }
}

function buildPreviewSummary(
  preview: RecoverStuckFormQuestionsAnswersAnalysisResponse | null,
): string {
  if (!preview) return '';

  if (preview.totalStuckCount === 0) {
    return 'Nenhuma análise travada encontrada para este escopo.';
  }

  const parts = [
    preview.totalStuckCount === 1
      ? '1 análise travada encontrada.'
      : `${preview.totalStuckCount} análises travadas encontradas.`,
    preview.promoteToDoneCount === 1
      ? '1 será recuperada como concluída.'
      : `${preview.promoteToDoneCount} serão recuperadas como concluídas.`,
    preview.markAsFailedCount === 1
      ? '1 será marcada como falha para permitir reprocessamento.'
      : `${preview.markAsFailedCount} serão marcadas como falha para permitir reprocessamento.`,
  ];

  return parts.join(' ');
}

export function RecoverFormAiAnalysisModal({
  open,
  onClose,
  companyId,
  applicationId,
  riskOptions,
  hierarchyOptions,
  hierarchyGroupOptions,
}: RecoverFormAiAnalysisModalProps) {
  const { mutateAsync: recoverAnalyses, isPending: isRecovering } =
    useMutateRecoverStuckFormQuestionsAnswersAnalysis();

  const [scope, setScope] = useState<ClearFormAiAnalysisScopeEnum>(
    ClearFormAiAnalysisScopeEnum.APPLICATION,
  );
  const [riskId, setRiskId] = useState('');
  const [hierarchyId, setHierarchyId] = useState('');
  const [hierarchyGroupId, setHierarchyGroupId] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [preview, setPreview] =
    useState<RecoverStuckFormQuestionsAnswersAnalysisResponse | null>(null);
  const [expandedHierarchyIds, setExpandedHierarchyIds] = useState<string[]>(
    [],
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setScope(ClearFormAiAnalysisScopeEnum.APPLICATION);
    setRiskId('');
    setHierarchyId('');
    setHierarchyGroupId('');
    setUnderstood(false);
    setConfirmationText('');
    setPreview(null);
    setExpandedHierarchyIds([]);
    setPreviewError(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const selectionComplete = useMemo(
    () => isScopeSelectionComplete(scope, riskId, hierarchyId, hierarchyGroupId),
    [scope, riskId, hierarchyId, hierarchyGroupId],
  );

  const scopeSummary = useMemo(
    () =>
      buildScopeSummary({
        scope,
        riskOptions,
        hierarchyOptions,
        hierarchyGroupOptions,
        riskId,
        hierarchyId,
        hierarchyGroupId,
        expandedHierarchyIds,
      }),
    [
      scope,
      riskOptions,
      hierarchyOptions,
      hierarchyGroupOptions,
      riskId,
      hierarchyId,
      hierarchyGroupId,
      expandedHierarchyIds,
    ],
  );

  useEffect(() => {
    if (!open || !selectionComplete) {
      setPreview(null);
      setExpandedHierarchyIds([]);
      setPreviewError(null);
      return;
    }

    let cancelled = false;

    const runPreview = async () => {
      setIsPreviewLoading(true);
      setPreviewError(null);

      try {
        const response = await recoverStuckFormQuestionsAnswersAnalysis(
          buildRecoverPayload({
            companyId,
            applicationId,
            scope,
            riskId,
            hierarchyId,
            hierarchyGroupId,
            dryRun: true,
          }),
        );

        if (cancelled) return;

        setPreview(response);
        setExpandedHierarchyIds(response.filters.expandedHierarchyIds ?? []);
      } catch {
        if (cancelled) return;
        setPreview(null);
        setExpandedHierarchyIds([]);
        setPreviewError('Não foi possível calcular o escopo da recuperação.');
      } finally {
        if (!cancelled) {
          setIsPreviewLoading(false);
        }
      }
    };

    void runPreview();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    selectionComplete,
    companyId,
    applicationId,
    scope,
    riskId,
    hierarchyId,
    hierarchyGroupId,
  ]);

  const canConfirm =
    selectionComplete &&
    understood &&
    confirmationText.trim().toUpperCase() === CONFIRMATION_TOKEN &&
    !isPreviewLoading &&
    !isRecovering &&
    (preview?.totalStuckCount ?? 0) > 0;

  const handleConfirm = async () => {
    if (!canConfirm) return;

    await recoverAnalyses(
      buildRecoverPayload({
        companyId,
        applicationId,
        scope,
        riskId,
        hierarchyId,
        hierarchyGroupId,
        dryRun: false,
      }),
    );

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Recuperar análises travadas</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          Esta ação recupera análises de IA presas em processamento há mais de{' '}
          {DEFAULT_STUCK_AI_ANALYSIS_OLDER_THAN_MINUTES} minutos. Análises com
          conteúdo completo serão marcadas como concluídas; análises vazias ou
          incompletas serão marcadas como falha para permitir reprocessamento.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Não remove respostas do formulário, riscos do inventário, agrupamentos,
          plano de ação ou probabilidade/severidade da matriz.
        </Typography>

        <FormControl fullWidth size="small">
          <InputLabel id="recover-ai-scope-label">Escopo da recuperação</InputLabel>
          <Select
            labelId="recover-ai-scope-label"
            label="Escopo da recuperação"
            value={scope}
            onChange={(event) => {
              setScope(event.target.value as ClearFormAiAnalysisScopeEnum);
              setRiskId('');
              setHierarchyId('');
              setHierarchyGroupId('');
              setUnderstood(false);
              setConfirmationText('');
            }}
          >
            {SCOPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(scope === ClearFormAiAnalysisScopeEnum.RISK ||
          scope === ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP_RISK) && (
          <FormControl fullWidth size="small">
            <InputLabel id="recover-ai-risk-label">Fator de risco</InputLabel>
            <Select
              labelId="recover-ai-risk-label"
              label="Fator de risco"
              value={riskId}
              onChange={(event) => setRiskId(event.target.value)}
            >
              {riskOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {scope === ClearFormAiAnalysisScopeEnum.HIERARCHY && (
          <FormControl fullWidth size="small">
            <InputLabel id="recover-ai-hierarchy-label">Setor</InputLabel>
            <Select
              labelId="recover-ai-hierarchy-label"
              label="Setor"
              value={hierarchyId}
              onChange={(event) => setHierarchyId(event.target.value)}
            >
              {hierarchyOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {(scope === ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP ||
          scope === ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP_RISK) && (
          <FormControl fullWidth size="small">
            <InputLabel id="recover-ai-group-label">Agrupamento</InputLabel>
            <Select
              labelId="recover-ai-group-label"
              label="Agrupamento"
              value={hierarchyGroupId}
              onChange={(event) => setHierarchyGroupId(event.target.value)}
            >
              {hierarchyGroupOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectionComplete && (
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200',
              backgroundColor: 'grey.50',
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Resumo do escopo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {scopeSummary}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {isPreviewLoading
                ? 'Calculando análises travadas...'
                : previewError
                  ? previewError
                  : buildPreviewSummary(preview)}
            </Typography>
            {preview && preview.items.length > 0 && (
              <Box sx={{ mt: 1.5, maxHeight: 160, overflowY: 'auto' }}>
                {preview.items.slice(0, 8).map((item) => (
                  <Typography
                    key={item.id}
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {item.riskName} — {item.hierarchyName} (
                    {item.recoveryAction === 'DONE'
                      ? 'recuperar como concluída'
                      : 'marcar como falha'}
                    )
                  </Typography>
                ))}
                {preview.items.length > 8 && (
                  <Typography variant="caption" color="text.secondary">
                    + {preview.items.length - 8} outra(s)
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={understood}
              onChange={(event) => setUnderstood(event.target.checked)}
            />
          }
          label="Entendo que isso altera apenas o status de análises travadas em processamento."
        />

        <TextField
          label={`Digite ${CONFIRMATION_TOKEN} para confirmar`}
          value={confirmationText}
          onChange={(event) => setConfirmationText(event.target.value)}
          fullWidth
          size="small"
          autoComplete="off"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <SButton variant="outlined" text="Cancelar" onClick={handleClose} />
        <SButton
          variant="contained"
          color="primary"
          text="Recuperar análises travadas"
          loading={isRecovering}
          disabled={!canConfirm}
          onClick={() => void handleConfirm()}
        />
      </DialogActions>
    </Dialog>
  );
}
