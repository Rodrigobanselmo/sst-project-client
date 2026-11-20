import { FC, useMemo, useRef, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Collapse,
  Typography,
} from '@mui/material';
import type { UseFormGetValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';

import { AiActionButtonGroup } from '@v2/components/molecules/AiActionButtonGroup/AiActionButtonGroup';
import { buildMasterAiRequestOverrides } from '@v2/components/molecules/AiActionButtonGroup/build-master-ai-request-overrides.util';
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

import { isSameRiskSuggestionIdentity, resolveSuggestedRiskSubtype } from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/apply-suggested-risk-subtype.util';
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
  subtypeCandidates?: { id: number; name: string; type: string }[];
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
  subtypeCandidates = [],
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
    suggestedSubtype?: { id: number; name: string; type: string } | null;
    risk: string;
    symptoms: string;
    affectedRegion: string;
    absorptionRoutes: string;
    severity: number;
    severityAi?: number;
    severityAdjusted?: boolean;
    severityAdjustmentReason?: string;
  } | null>(null);
  const requestedForm = useRef<RiskFactorAiSuggestionFormSource | null>(null);
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
      suggestedSubtype?: { id: number; name: string; type: string } | null;
      risk: string;
      symptoms: string;
      affectedRegion: string;
      absorptionRoutes: string;
      severity: number | string;
      severityAi?: number;
      severityAdjusted?: boolean;
      severityAdjustmentReason?: string;
    },
    mode: RiskFactorAiSuggestionApplyMode,
  ) => {
    const current = buildCurrentFormSnapshot();
    if (!requestedForm.current || !isSameRiskSuggestionIdentity(current, requestedForm.current)) {
      setApplyWarning('O fator foi alterado após a consulta. Gere uma nova sugestão para os dados atuais.');
      return;
    }
    const suggestedSubType = resolveSuggestedRiskSubtype(current, requestedForm.current, suggestion.suggestedSubtype, subtypeCandidates);
    const previousFormSeverity = getValues('severity');
    const previousRiskDataSeverity = form.severity;

    const normalizedSuggestionSeverity = normalizeSuggestedSeverity(suggestion.severity);
    const normalizedSuggestion = {
      ...suggestion,
      affectedRegion: suggestion.affectedRegion ?? '',
      absorptionRoutes: suggestion.absorptionRoutes ?? '',
      severity: normalizedSuggestionSeverity ?? suggestion.severity,
    };

    const applied = applyRiskFactorAiSuggestionFields(
      buildCurrentFormSnapshot(),
      normalizedSuggestion,
      mode,
    );

    const severityString = String(applied.severity);
    const assignField = (name: string, next: string) => {
      if (String(getValues(name) ?? '') === next) return;
      setValue(name, next, {
        shouldDirty: true,
        shouldValidate: name === 'severity',
      });
    };

    if (suggestedSubType) assignField('subType', suggestedSubType);
    assignField('severity', severityString);
    assignField('risk', applied.risk);
    assignField('symptoms', applied.symptoms);
    assignField('affectedRegion', applied.affectedRegion);
    assignField('absorptionRoutes', applied.absorptionRoutes);

    setRiskData((current) => ({
      ...(current as RiskFactorAiSuggestionFormSource),
      ...(suggestedSubType ? { subType: suggestedSubType } : {}),
      risk: applied.risk,
      symptoms: applied.symptoms,
      affectedRegion: applied.affectedRegion,
      absorptionRoutes: applied.absorptionRoutes,
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
    requestedForm.current = currentForm;

    const masterOverrides = buildMasterAiRequestOverrides(isMaster, masterConfig);

    const payload = buildRiskFactorAiSuggestionPayload({
      form: currentForm,
      sourceContext,
      knownDataExtras,
      customPrompt: masterOverrides.customPrompt,
      model: masterOverrides.model,
    });

    try {
      const result = await generate(payload);
      if (!isSameRiskSuggestionIdentity(buildCurrentFormSnapshot(), currentForm)) {
        setApplyWarning('O fator foi alterado durante a consulta. Gere uma nova sugestão para os dados atuais.');
        return;
      }
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
        affectedRegion: result.affectedRegion ?? '',
        absorptionRoutes: result.absorptionRoutes ?? '',
        severity: normalizedSeverity ?? result.severity,
      };

      if (hasRiskFactorAiSuggestionFieldContent(currentForm)) {
        setPendingSuggestion({
          suggestedSubtype: normalizedResult.suggestedSubtype,
          risk: normalizedResult.risk,
          symptoms: normalizedResult.symptoms,
          affectedRegion: normalizedResult.affectedRegion,
          absorptionRoutes: normalizedResult.absorptionRoutes,
          severity:
            normalizedSeverity ??
            normalizeSuggestedSeverity(currentForm.severity) ??
            0,
          severityAi: result.severityAi,
          severityAdjusted: result.severityAdjusted,
          severityAdjustmentReason: result.severityAdjustmentReason,
        });
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
        'replace-all',
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
      <AiActionButtonGroup
        label={loading ? 'Analisando com IA…' : label}
        loading={loading}
        disabled={disabled || (!form.name?.trim() && !form.cas?.trim())}
        onExecute={() => void handleGenerate()}
        onConfigure={() => setConfigDialogOpen(true)}
        isMaster={isMaster}
      />

      {sourceContext?.origin === 'chemical-fispq' &&
      Boolean(knownDataExtras?.fispqExcerpt?.trim()) ? (
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
          FISPQ disponível — será considerada como fonte prioritária na sugestão.
        </Typography>
      ) : null}

      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
        A sugestão é assistida e deve ser revisada tecnicamente antes de salvar. O subtipo é preenchido apenas quando está vazio, usando o catálogo existente.
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

      {lastResult && (
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
          {lastResult.suggestedSubtype
            ? `Subtipo sugerido: ${lastResult.suggestedSubtype.name}. Uma seleção existente é preservada.`
            : 'A IA não identificou um subtipo com segurança. Selecione manualmente, se necessário.'}
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

      {lastResult && Boolean(knownDataExtras?.fispqExcerpt?.trim()) ? (
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
          Contexto fornecido à IA: FISPQ
        </Typography>
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
