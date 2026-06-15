import { FC, useMemo, useState } from 'react';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Typography,
} from '@mui/material';
import type { UseFormGetValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';

import { useAccess } from 'core/hooks/useAccess';
import { useRiskFactorAiSuggestion } from '@v2/services/security/risk/risk-factor-ai-suggestions/hooks/useRiskFactorAiSuggestion';
import type { RiskFactorAiSuggestionKnownDataPayload } from '@v2/services/security/risk/risk-factor-ai-suggestions/service/risk-factor-ai-suggestions.types';
import type { RiskFactorAiSuggestionSourceContextPayload } from '@v2/services/security/risk/risk-factor-ai-suggestions/service/risk-factor-ai-suggestions.types';
import {
  applyRiskFactorAiSuggestionFields,
  normalizeSuggestedSeverity,
} from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/apply-risk-factor-ai-suggestion-fields.util';
import { logRiskFactorAiSuggestionApply, formatRiskFactorAiSuggestionDebugLine } from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/risk-factor-ai-suggestion-debug.util';
import {
  buildRiskFactorAiSuggestionPayload,
  hasRiskFactorAiSuggestionFieldContent,
  type RiskFactorAiSuggestionFormSource,
} from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/build-risk-factor-ai-suggestion-payload.util';
import {
  normalizeRiskFactorType,
  resolveRiskFactorAiSuggestionPromptKey,
} from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/risk-factor-ai-suggestions-type.util';

import { RiskFactorAiSuggestionApplyDialog } from './RiskFactorAiSuggestionApplyDialog';
import type { RiskFactorAiSuggestionApplyMode } from './RiskFactorAiSuggestionApplyDialog';
import {
  RiskFactorAiSuggestionMasterConfigDialog,
  type RiskFactorAiSuggestionMasterConfig,
} from './RiskFactorAiSuggestionMasterConfigDialog';

type RiskFactorAiSuggestionButtonProps = {
  form: RiskFactorAiSuggestionFormSource;
  setRiskData: (updater: (current: RiskFactorAiSuggestionFormSource) => RiskFactorAiSuggestionFormSource) => void;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  watch: UseFormWatch<any>;
  sourceContext?: RiskFactorAiSuggestionSourceContextPayload;
  knownDataExtras?: Partial<RiskFactorAiSuggestionKnownDataPayload>;
  disabled?: boolean;
  label?: string;
};

export const RiskFactorAiSuggestionButton: FC<RiskFactorAiSuggestionButtonProps> = ({
  form,
  setRiskData,
  setValue,
  getValues,
  watch,
  sourceContext,
  knownDataExtras,
  disabled,
  label = 'Gerar sugestão com IA',
}) => {
  const { isMaster } = useAccess();
  const { generate, loading, error, lastResult, reset } = useRiskFactorAiSuggestion();
  const riskType = normalizeRiskFactorType(form.type);
  const promptKey = useMemo(
    () => resolveRiskFactorAiSuggestionPromptKey(riskType),
    [riskType],
  );
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [masterConfigByType, setMasterConfigByType] = useState<
    Record<string, RiskFactorAiSuggestionMasterConfig>
  >({});
  const masterConfig = masterConfigByType[riskType] ?? {};
  const [pendingSuggestion, setPendingSuggestion] = useState<{
    risk: string;
    symptoms: string;
    severity: number;
    severityAi?: number;
    severityAdjusted?: boolean;
    severityAdjustmentReason?: string;
  } | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [applyWarning, setApplyWarning] = useState<string | null>(null);

  const buildCurrentFormSnapshot = (): RiskFactorAiSuggestionFormSource => {
    const values = getValues();
    const watchedSeverity = normalizeSuggestedSeverity(values.severity);

    return {
      ...form,
      ...values,
      type: values.type ?? form.type,
      severity: watchedSeverity ?? normalizeSuggestedSeverity(form.severity) ?? 0,
    };
  };

  const applySuggestion = (
    suggestion: {
      risk: string;
      symptoms: string;
      severity: number | string;
      severityAi?: number;
      severityAdjusted?: boolean;
      severityAdjustmentReason?: string;
    },
    mode: RiskFactorAiSuggestionApplyMode,
  ) => {
    const previousFormSeverity = getValues('severity');
    const previousRiskDataSeverity = form.severity;

    const normalizedSuggestionSeverity = normalizeSuggestedSeverity(suggestion.severity);
    const normalizedSuggestion = {
      ...suggestion,
      severity: normalizedSuggestionSeverity ?? suggestion.severity,
    };

    const applied = applyRiskFactorAiSuggestionFields(
      buildCurrentFormSnapshot(),
      normalizedSuggestion,
      mode,
    );

    const severityString = String(applied.severity);

    setValue('severity', severityString, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('risk', applied.risk, { shouldDirty: true });
    setValue('symptoms', applied.symptoms, { shouldDirty: true });

    setRiskData((current) => ({
      ...(current as RiskFactorAiSuggestionFormSource),
      risk: applied.risk,
      symptoms: applied.symptoms,
      severity: applied.severity,
    }));

    setApplyWarning(applied.severityWarning ?? null);

    if (isMaster) {
      requestAnimationFrame(() => {
        logRiskFactorAiSuggestionApply({
          severityAi: suggestion.severityAi ?? suggestion.severity,
          severityFinal: applied.severity,
          severityAdjusted: suggestion.severityAdjusted,
          severityAdjustmentReason: suggestion.severityAdjustmentReason,
          previousFormSeverity,
          previousRiskDataSeverity,
          mode,
          appliedFormSeverity: severityString,
          appliedRiskDataSeverity: applied.severity,
          finalWatchedSeverity: watch('severity'),
          severityWarning: applied.severityWarning,
        });
      });
    }
  };

  const handleGenerate = async () => {
    reset();
    setApplyWarning(null);

    const currentForm = buildCurrentFormSnapshot();

    const payload = buildRiskFactorAiSuggestionPayload({
      form: currentForm,
      sourceContext,
      knownDataExtras,
      customPrompt: isMaster ? masterConfig.customPrompt : undefined,
      model: isMaster ? masterConfig.model : undefined,
    });

    try {
      const result = await generate(payload);
      const normalizedSeverity = normalizeSuggestedSeverity(result.severity);

      if (isMaster) {
        // eslint-disable-next-line no-console
        console.log(
          '[RiskFactorAiSuggestion] API response',
          formatRiskFactorAiSuggestionDebugLine({
            severityAi: result.severityAi ?? result.severity,
            severityFinal: result.severity,
            severityAdjusted: result.severityAdjusted,
          }),
        );
      }

      if (normalizedSeverity == null) {
        setApplyWarning('Severidade sugerida inválida na resposta da IA.');
      }

      const normalizedResult = {
        ...result,
        severity: normalizedSeverity ?? result.severity,
      };

      if (hasRiskFactorAiSuggestionFieldContent(currentForm)) {
        if (normalizedSeverity != null) {
          setPendingSuggestion({
            risk: normalizedResult.risk,
            symptoms: normalizedResult.symptoms,
            severity: normalizedSeverity,
            severityAi: result.severityAi,
            severityAdjusted: result.severityAdjusted,
            severityAdjustmentReason: result.severityAdjustmentReason,
          });
        } else {
          setPendingSuggestion({
            risk: normalizedResult.risk,
            symptoms: normalizedResult.symptoms,
            severity: normalizeSuggestedSeverity(currentForm.severity) ?? 0,
          });
        }
        setApplyDialogOpen(true);
        return;
      }

      applySuggestion(
        {
          ...normalizedResult,
          severityAi: result.severityAi,
          severityAdjusted: result.severityAdjusted,
          severityAdjustmentReason: result.severityAdjustmentReason,
        },
        'replace',
      );
    } catch {
      // error state handled by hook
    }
  };

  const handleApplyConfirm = (mode: RiskFactorAiSuggestionApplyMode) => {
    if (!pendingSuggestion) return;

    applySuggestion(pendingSuggestion, mode);
    setPendingSuggestion(null);
    setApplyDialogOpen(false);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AutoFixHighOutlinedIcon />}
          onClick={handleGenerate}
          disabled={disabled || loading || (!form.name?.trim() && !form.cas?.trim())}
        >
          {loading ? 'Analisando com IA…' : label}
        </Button>

        {isMaster && (
          <Button
            size="small"
            variant="text"
            startIcon={<SettingsOutlinedIcon />}
            onClick={() => setConfigDialogOpen(true)}
            disabled={loading}
          >
            Configurar prompt/modelo
          </Button>
        )}
      </Box>

      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
        A sugestão é assistida e deve ser revisada tecnicamente antes de salvar.
      </Typography>

      {isMaster && lastResult && (
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
          {formatRiskFactorAiSuggestionDebugLine({
            severityAi: lastResult.severityAi ?? lastResult.severity,
            severityFinal: lastResult.severity,
            severityAdjusted: lastResult.severityAdjusted,
            formSeverity: watch('severity'),
            riskDataSeverity: form.severity,
          })}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {applyWarning && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {applyWarning}
        </Alert>
      )}

      {lastResult?.warnings?.length ? (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {lastResult.warnings.join(' ')}
        </Alert>
      ) : null}

      {lastResult?.sourceTrace?.length ? (
        <Box sx={{ mt: 1 }}>
          <Button size="small" onClick={() => setShowTrace((value) => !value)}>
            {showTrace ? 'Ocultar rastreabilidade' : 'Ver rastreabilidade'}
          </Button>
          <Collapse in={showTrace}>
            <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
              {lastResult.sourceTrace.map((item, index) => (
                <Typography key={`${item.source}-${index}`} variant="caption" display="block">
                  {item.source}
                  {item.usedFor?.length ? ` (${item.usedFor.join(', ')})` : ''}
                  {item.note ? ` — ${item.note}` : ''}
                </Typography>
              ))}
            </Box>
          </Collapse>
        </Box>
      ) : null}

      <RiskFactorAiSuggestionApplyDialog
        open={applyDialogOpen}
        onClose={() => {
          setApplyDialogOpen(false);
          setPendingSuggestion(null);
        }}
        onConfirm={handleApplyConfirm}
      />

      {isMaster && (
        <RiskFactorAiSuggestionMasterConfigDialog
          open={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          riskType={riskType}
          promptKey={promptKey}
          onApply={(config) =>
            setMasterConfigByType((current) => ({
              ...current,
              [riskType]: config,
            }))
          }
        />
      )}
    </Box>
  );
};
