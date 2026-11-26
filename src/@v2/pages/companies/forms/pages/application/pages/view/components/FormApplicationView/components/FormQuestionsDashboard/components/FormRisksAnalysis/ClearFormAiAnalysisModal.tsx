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
import { useMutateClearFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/clear-form-questions-answers-analysis';
import {
  ClearFormAiAnalysisScopeEnum,
  ClearFormQuestionsAnswersAnalysisParams,
} from '@v2/services/forms/form-questions-answers-analysis/clear-form-questions-answers-analysis/service/clear-form-questions-answers-analysis.types';
import { clearFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/clear-form-questions-answers-analysis/service/clear-form-questions-answers-analysis.service';
import { useCallback, useEffect, useMemo, useState } from 'react';

const CONFIRMATION_TOKEN = 'LIMPAR';

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

type ClearFormAiAnalysisModalProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  applicationId: string;
  riskOptions: SelectOption[];
  hierarchyOptions: SelectOption[];
  hierarchyGroupOptions: SelectOption[];
  hasProcessingAnalyses?: boolean;
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

function buildClearPayload(params: {
  companyId: string;
  applicationId: string;
  scope: ClearFormAiAnalysisScopeEnum;
  riskId: string;
  hierarchyId: string;
  hierarchyGroupId: string;
  dryRun: boolean;
  failuresOnly: boolean;
}): ClearFormQuestionsAnswersAnalysisParams {
  const payload: ClearFormQuestionsAnswersAnalysisParams = {
    companyId: params.companyId,
    applicationId: params.applicationId,
    scope: params.scope,
    dryRun: params.dryRun,
    failuresOnly: params.failuresOnly,
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
      return 'Todas as análises de IA desta aplicação de formulário.';
    case ClearFormAiAnalysisScopeEnum.RISK:
      return `Todas as análises de IA do fator de risco "${riskLabel}" em todos os setores.`;
    case ClearFormAiAnalysisScopeEnum.HIERARCHY:
      return `Todas as análises de IA do setor "${hierarchyLabel}".`;
    case ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP:
      return `Todas as análises de IA dos setores do agrupamento "${groupLabel}" (${memberCount} setor(es)).`;
    case ClearFormAiAnalysisScopeEnum.HIERARCHY_GROUP_RISK:
      return `Análises de IA do fator "${riskLabel}" nos ${memberCount} setor(es) do agrupamento "${groupLabel}".`;
    default:
      return '';
  }
}

export function ClearFormAiAnalysisModal({
  open,
  onClose,
  companyId,
  applicationId,
  riskOptions,
  hierarchyOptions,
  hierarchyGroupOptions,
  hasProcessingAnalyses = false,
}: ClearFormAiAnalysisModalProps) {
  const { mutateAsync: clearAnalyses, isPending: isClearing } =
    useMutateClearFormQuestionsAnswersAnalysis();

  const [scope, setScope] = useState<ClearFormAiAnalysisScopeEnum>(
    ClearFormAiAnalysisScopeEnum.APPLICATION,
  );
  const [failuresOnly, setFailuresOnly] = useState(true);
  const [riskId, setRiskId] = useState('');
  const [hierarchyId, setHierarchyId] = useState('');
  const [hierarchyGroupId, setHierarchyGroupId] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [matchedCount, setMatchedCount] = useState<number | null>(null);
  const [expandedHierarchyIds, setExpandedHierarchyIds] = useState<string[]>(
    [],
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setFailuresOnly(true);
    setScope(ClearFormAiAnalysisScopeEnum.APPLICATION);
    setRiskId('');
    setHierarchyId('');
    setHierarchyGroupId('');
    setUnderstood(false);
    setConfirmationText('');
    setMatchedCount(null);
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
      setMatchedCount(null);
      setExpandedHierarchyIds([]);
      setPreviewError(null);
      return;
    }

    let cancelled = false;

    const runPreview = async () => {
      setIsPreviewLoading(true);
      setPreviewError(null);

      try {
        const response = await clearFormQuestionsAnswersAnalysis(
          buildClearPayload({
            companyId,
            applicationId,
            scope,
            riskId,
            hierarchyId,
            hierarchyGroupId,
            dryRun: true,
            failuresOnly,
          }),
        );

        if (cancelled) return;

        setMatchedCount(response.matchedCount);
        setExpandedHierarchyIds(response.filters.expandedHierarchyIds ?? []);
      } catch {
        if (cancelled) return;
        setMatchedCount(null);
        setExpandedHierarchyIds([]);
        setPreviewError('Não foi possível calcular o escopo da limpeza.');
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
    failuresOnly,
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
    !previewError &&
    matchedCount !== null &&
    matchedCount > 0 &&
    !isPreviewLoading &&
    !isClearing;

  const handleConfirm = async () => {
    if (!canConfirm) return;

    await clearAnalyses(
      buildClearPayload({
        companyId,
        applicationId,
        scope,
        riskId,
        hierarchyId,
        hierarchyGroupId,
        dryRun: false,
        failuresOnly,
      }),
    );

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { backgroundColor: 'background.paper', color: 'text.primary', border: '1px solid', borderColor: 'divider', borderRadius: 3 } }}>

      <DialogTitle sx={{ color: 'text.primary', fontWeight: 700, px: 10, pt: 10, pb: 6 }}>Limpar análises de IA</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 6, px: 10, py: 4, '& .MuiFormControlLabel-label': { color: 'text.primary' }, '& .MuiInputBase-root': { color: 'text.primary' } }}>
        <Typography variant="body2" color="text.secondary">
          {failuresOnly ? 'Remove somente registros com falha ou travados há mais de 60 minutos, sem conteúdo. Análises concluídas, fontes geradoras, recomendações, revisões e edições serão preservadas. Registros recentes em processamento serão preservados. Não é necessário recuperar os registros travados antes de limpar.' : <>Esta ação remove permanentemente as análises de IA salvas para o escopo
          selecionado, incluindo fontes geradoras, recomendações sugeridas e
          edições feitas nelas.</>}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Não remove riscos do inventário, fontes/recomendações já aplicadas ao
          PGR, respostas do formulário, probabilidades, indicadores, gráficos ou
          agrupamentos de setores.
        </Typography>

        <FormControlLabel
          control={<Checkbox checked={failuresOnly} onChange={(event) => {
            setFailuresOnly(event.target.checked);
            setMatchedCount(null);
            setUnderstood(false);
            setConfirmationText('');
          }} />}
          label="Somente falhas e travamentos sem conteúdo (preservar análises e edições)"
        />
        <FormControl fullWidth size="small">
          <InputLabel id="clear-ai-scope-label">Escopo da limpeza</InputLabel>
          <Select
            MenuProps={{ PaperProps: { sx: { backgroundColor: 'background.paper', color: 'text.primary', '& .MuiMenuItem-root': { color: 'text.primary' } } } }}
            labelId="clear-ai-scope-label"
            label="Escopo da limpeza"
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
            <InputLabel id="clear-ai-risk-label">Fator de risco</InputLabel>
            <Select
            MenuProps={{ PaperProps: { sx: { backgroundColor: 'background.paper', color: 'text.primary', '& .MuiMenuItem-root': { color: 'text.primary' } } } }}
              labelId="clear-ai-risk-label"
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
            <InputLabel id="clear-ai-hierarchy-label">Setor</InputLabel>
            <Select
            MenuProps={{ PaperProps: { sx: { backgroundColor: 'background.paper', color: 'text.primary', '& .MuiMenuItem-root': { color: 'text.primary' } } } }}
              labelId="clear-ai-hierarchy-label"
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
            <InputLabel id="clear-ai-group-label">Agrupamento</InputLabel>
            <Select
            MenuProps={{ PaperProps: { sx: { backgroundColor: 'background.paper', color: 'text.primary', '& .MuiMenuItem-root': { color: 'text.primary' } } } }}
              labelId="clear-ai-group-label"
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
              p: 6,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'action.hover',
              color: 'text.primary',
            }}
          >
            <Typography variant="subtitle2" color="text.primary" fontWeight={600} gutterBottom>
              Resumo do escopo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {scopeSummary}
            </Typography>
            <Typography variant="body2" color={previewError ? "error.main" : "text.primary"} sx={{ mt: 3 }}>
              {isPreviewLoading
                ? 'Calculando quantidade de análises...'
                : previewError
                  ? previewError
                  : matchedCount === null
                    ? ''
                    : matchedCount === 0
                      ? failuresOnly ? 'Nenhuma falha ou travamento sem conteúdo encontrada neste escopo.' : 'Nenhuma análise de IA encontrada para este escopo.'
                      : matchedCount === 1
                        ? failuresOnly ? 'Será removido 1 registro de falha ou travamento sem conteúdo.' : 'Será removida 1 análise de IA.'
                        : failuresOnly ? `Serão removidos ${matchedCount} registros de falha ou travamento sem conteúdo.` : `Serão removidas ${matchedCount} análises de IA.`}
            </Typography>
            {hasProcessingAnalyses && !failuresOnly && (
              <Typography
                variant="body2"
                color="warning.main"
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                Existem análises em processamento. A limpeza irá cancelá-las na
                interface.
              </Typography>
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
          label={failuresOnly ? "Entendo que serão removidos somente registros com falha ou travados há mais de 60 minutos, sem conteúdo." : "Entendo que isso apaga análises geradas pela IA e edições feitas nelas."}
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
      <DialogActions sx={{ px: 10, py: 8, gap: 4, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
        <SButton variant="outlined" text="Cancelar" onClick={handleClose}
          schema={{ color: 'text.primary', borderColor: 'divider', backgroundColor: 'transparent' }}
          textProps={{ color: 'inherit', fontSize: 14 }} />
        <SButton
          variant="contained"
          color="danger"
          text={failuresOnly ? "Limpar falhas e travamentos sem conteúdo" : "Limpar análises"}
          loading={isClearing}
          textProps={{ color: 'inherit' }}
          buttonProps={{ sx: { '&&.Mui-disabled': { color: 'text.disabled', backgroundColor: 'action.disabledBackground', borderColor: 'divider' } } }}
          disabled={!canConfirm || matchedCount === 0}
          onClick={() => void handleConfirm()}
        />
      </DialogActions>
    </Dialog>
  );
}
