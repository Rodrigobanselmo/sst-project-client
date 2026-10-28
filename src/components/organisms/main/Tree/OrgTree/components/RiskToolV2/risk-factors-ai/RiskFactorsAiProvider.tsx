import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { useMutateAiAnalyzeCharacterization } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useMutateAiAnalyzeCharacterization';
import { isAiAnalyzeRequestCanceled } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/is-ai-analyze-request-canceled.util';
import { useMutateAiAnalyzeGse } from '@v2/services/security/homogeneous-group/ai-analyze-gse/hooks/useMutateAiAnalyzeGse';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';

import { CharacterizationAiRiskAnalysisState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';
import { GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE } from 'components/organisms/modals/ModalAddGHO/gse-ai-analyze.constants';
import { getGseLinkedWorkspaceIds } from 'components/organisms/modals/ModalAddGHO/get-gse-linked-workspace-ids.util';
import { initialAddGhoState } from 'components/organisms/modals/ModalAddGHO/hooks/useAddGho';

import {
  columnForAiField,
  RiskFactorAiColumn,
} from './risk-factor-ai-pending.util';
import {
  buildAiAnalyzeScopePayload,
  existingControlEmptyMessage,
  filterReviewsForRiskFactorAi,
  scopedAiEmptyMessage,
  RiskFactorAiField,
  RiskFactorAiScopeRequest,
} from './risk-factors-ai-scope.util';
import {
  RiskFactorAiSuggestionActions,
  useRiskFactorAiSuggestionActions,
} from './useRiskFactorAiSuggestionActions';
import { RiskFactorAiConfigurationDialog } from './RiskFactorAiConfigurationDialog';
import { runCancelableRiskAnalysis } from './run-cancelable-risk-analysis.util';
import { RiskFactorAiNewRiskCandidates } from './RiskFactorAiNewRiskCandidates';

type OpenFieldParams = {
  riskId: string;
  riskName?: string;
  field: RiskFactorAiField;
};

type OpenRiskParams = {
  riskId: string;
  riskName?: string;
};

type RiskFactorsAiContextValue = {
  openField: (params: OpenFieldParams) => void;
  openRisk: (params: OpenRiskParams) => void;
  suggestions: RiskFactorAiSuggestionActions;
};

const RiskFactorsAiContext = createContext<RiskFactorsAiContextValue | null>(
  null,
);

export function useRiskFactorsAiOptional(): RiskFactorsAiContextValue | null {
  return useContext(RiskFactorsAiContext);
}

export type { RiskFactorAiField };

type ScopedPanel = RiskFactorAiScopeRequest & {
  riskName?: string;
  requestId: number;
};

type CharacterizationTarget = {
  kind: 'characterization';
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  riskGroupId?: string;
  analysis: CharacterizationAiRiskAnalysisState;
};

type GseTarget = {
  kind: 'gse';
  companyId: string;
  gseId: string;
  ghoData: typeof initialAddGhoState;
  ghoQuery: IGho;
  riskGroupId?: string;
  analysis: CharacterizationAiRiskAnalysisState;
};

type RiskFactorsAiProviderProps = {
  children: React.ReactNode;
  target: CharacterizationTarget | GseTarget;
  /** Recebe onClose para o painel fechar o diálogo após o resumo. */
  renderGeneral: (helpers: { onClose: () => void }) => React.ReactNode;
};

const FIELD_TITLE: Record<RiskFactorAiField, string> = {
  generateSource: 'Fonte geradora',
  existingEngineeringMeasures: 'EPC/ENG existente',
  existingAdministrativeMeasures: 'Medida administrativa existente',
  recommendedEngineeringMeasures: 'Recomendação de engenharia',
  recommendedAdministrativeMeasures: 'Recomendação administrativa',
};

const ALL_COLUMNS: RiskFactorAiColumn[] = ['source', 'eng', 'adm', 'rec'];

type ScopedRuntimeTarget = {
  kind: 'characterization' | 'gse';
  companyId: string;
  workspaceId: string;
  entityId: string;
  riskGroupId?: string;
  missingWorkspace?: boolean;
};

export function RiskFactorsAiProvider({
  children,
  target,
  renderGeneral,
}: RiskFactorsAiProviderProps) {
  const requestSeq = useRef(0);
  const [configureRisk, setConfigureRisk] = useState<OpenRiskParams | null>(
    null,
  );
  const [generalOpen, setGeneralOpen] = useState(false);
  const [scoped, setScoped] = useState<ScopedPanel | null>(null);
  const { workspaceId: pageWorkspaceId } = useGetCompanyId();

  const runtimeTarget: ScopedRuntimeTarget = useMemo(() => {
    if (target.kind === 'characterization') {
      return {
        kind: 'characterization',
        companyId: target.companyId,
        workspaceId: target.workspaceId,
        entityId: target.characterizationId,
        riskGroupId: target.riskGroupId,
      };
    }
    const workspaceIds = getGseLinkedWorkspaceIds(
      target.ghoData,
      target.ghoQuery,
    );
    const apiWorkspaceId = pageWorkspaceId || workspaceIds[0];
    return {
      kind: 'gse',
      companyId: target.companyId,
      workspaceId: apiWorkspaceId || '',
      entityId: target.gseId,
      riskGroupId: target.riskGroupId,
      missingWorkspace: !apiWorkspaceId || workspaceIds.length === 0,
    };
  }, [pageWorkspaceId, target]);

  const suggestions = useRiskFactorAiSuggestionActions({
    analysis: target.analysis,
    companyId: runtimeTarget.companyId,
    apiWorkspaceId: runtimeTarget.workspaceId || undefined,
    riskGroupId: runtimeTarget.riskGroupId,
    entityId: runtimeTarget.entityId,
  });

  const openField = useCallback((params: OpenFieldParams) => {
    requestSeq.current += 1;
    setGeneralOpen(false);
    setScoped({
      scope: 'field',
      riskId: params.riskId,
      field: params.field,
      riskName: params.riskName,
      requestId: requestSeq.current,
    });
  }, []);

  const openRisk = useCallback((params: OpenRiskParams) => {
    setGeneralOpen(false);
    setScoped(null);
    setConfigureRisk(params);
  }, []);

  const value = useMemo(
    () => ({ openField, openRisk, suggestions }),
    [openField, openRisk, suggestions],
  );

  return (
    <RiskFactorsAiContext.Provider value={value}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 1,
          }}
        >
          <SButton
            text="Análise geral com IA"
            variant="outlined"
            color="primary"
            size="s"
            onClick={() => {
              setScoped(null);
              setGeneralOpen(true);
            }}
            buttonProps={{ sx: { minWidth: 'auto' } }}
          />
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          <RiskFactorAiNewRiskCandidates
            analysis={target.analysis}
            companyId={runtimeTarget.companyId}
            workspaceId={runtimeTarget.workspaceId || undefined}
            entityId={runtimeTarget.entityId}
            riskGroupId={runtimeTarget.riskGroupId}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            '& > *': {
              flex: 1,
              minHeight: 0,
            },
          }}
        >
          {children}
        </Box>
      </Box>
      {configureRisk && (
        <RiskFactorAiConfigurationDialog
          riskName={configureRisk.riskName || configureRisk.riskId}
          target={runtimeTarget}
          onClose={() => setConfigureRisk(null)}
          onGenerate={({ selectedFields, userGuidance }) => {
            requestSeq.current += 1;
            setScoped({
              scope: 'risk',
              ...configureRisk,
              selectedFields,
              userGuidance,
              requestId: requestSeq.current,
            });
            setConfigureRisk(null);
          }}
        />
      )}
      <Dialog
        open={generalOpen}
        onClose={() => setGeneralOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Análise geral com IA</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh' }}>
          {generalOpen
            ? renderGeneral({ onClose: () => setGeneralOpen(false) })
            : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!scoped}
        onClose={() => setScoped(null)}
        fullWidth
        maxWidth="sm"
      >
        {scoped && (
          <ScopedAiDialog
            key={scoped.requestId}
            target={runtimeTarget}
            analysis={target.analysis}
            suggestions={suggestions}
            request={scoped}
            onClose={() => setScoped(null)}
          />
        )}
      </Dialog>
    </RiskFactorsAiContext.Provider>
  );
}

function ScopedAiDialog({
  target,
  analysis,
  suggestions,
  request,
  onClose,
}: {
  target: ScopedRuntimeTarget;
  analysis: CharacterizationAiRiskAnalysisState;
  suggestions: RiskFactorAiSuggestionActions;
  request: ScopedPanel;
  onClose: () => void;
}) {
  const characterizationAnalyze = useMutateAiAnalyzeCharacterization();
  const gseAnalyze = useMutateAiAnalyzeGse();
  const { data: existingRiskData = [] } = useQueryRiskDataByGho(
    target.riskGroupId || '',
    target.entityId,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emptyReason, setEmptyReason] = useState<
    'missing_generate_source' | 'insufficient_context' | 'exhausted' | null
  >(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (target.missingWorkspace || !target.workspaceId) {
      setFinished(true);
      return;
    }
    const abortController = new AbortController();
    const payload = buildAiAnalyzeScopePayload(request);

    const run = async () => {
      try {
        setErrorMessage(null);
        setEmptyReason(null);
        await runCancelableRiskAnalysis(
          abortController.signal,
          () =>
            target.kind === 'characterization'
              ? characterizationAnalyze.mutateAsync({
                  companyId: target.companyId,
                  workspaceId: target.workspaceId,
                  characterizationId: target.entityId,
                  ...payload,
                  signal: abortController.signal,
                })
              : gseAnalyze.mutateAsync({
                  companyId: target.companyId,
                  workspaceId: target.workspaceId,
                  gseId: target.entityId,
                  ...payload,
                  signal: abortController.signal,
                }),
          (result) => {
            setEmptyReason(result.emptyReason || null);
            analysis.mergeIncomingExistingRiskReviews(
              filterReviewsForRiskFactorAi(
                result.existingRiskReviews || [],
                request,
              ),
            );
          },
        );
      } catch (error) {
        if (isAiAnalyzeRequestCanceled(error) || abortController.signal.aborted)
          return;
        setErrorMessage('Não foi possível concluir a análise deste recorte.');
      } finally {
        if (!abortController.signal.aborted) setFinished(true);
      }
    };

    void run();
    return () => abortController.abort();
    // A abertura do diálogo dispara uma análise. Nova abertura remonta pelo requestId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const riskData = existingRiskData.find(
    (item) => item.riskId === request.riskId,
  );
  const columns =
    request.scope === 'field'
      ? [columnForAiField(request.field)].filter(
          (column): column is RiskFactorAiColumn => !!column,
        )
      : request.selectedFields
        ? Array.from(
            new Set(request.selectedFields.map(columnForAiField)),
          ).filter((column): column is RiskFactorAiColumn => !!column)
        : ALL_COLUMNS;
  const pendingCount = columns.reduce(
    (total, column) =>
      total +
      suggestions
        .pendingFor({ riskId: request.riskId, column, riskData })
        .filter(
          (item) => request.scope !== 'field' || item.field === request.field,
        ).length,
    0,
  );
  const title =
    request.scope === 'field'
      ? `IA — ${FIELD_TITLE[request.field]}`
      : 'IA — sugestões deste risco';

  return (
    <>
      <DialogTitle>
        {title}
        {request.riskName ? ` — ${request.riskName}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {target.missingWorkspace && (
          <Alert severity="info">{GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE}</Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {errorMessage}
          </Alert>
        )}
        {!finished && !target.missingWorkspace && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              py: 3,
            }}
          >
            <CircularProgress size={22} />
            <SText variant="body2" color="text.secondary">
              Analisando com IA…
            </SText>
          </Box>
        )}
        {finished &&
          !target.missingWorkspace &&
          !errorMessage &&
          pendingCount > 0 && (
            <Alert severity="success">
              {pendingCount === 1
                ? '1 sugestão está disponível na coluna correspondente, com borda tracejada.'
                : `${pendingCount} sugestões estão disponíveis nas colunas correspondentes, com borda tracejada.`}{' '}
              Nada foi gravado: confirme, aceite ou descarte cada item na
              própria coluna.
            </Alert>
          )}
        {finished &&
          !target.missingWorkspace &&
          !errorMessage &&
          pendingCount === 0 && (
            <SText variant="body2" color="text.secondary">
              {request.scope === 'field' &&
              (request.field === 'existingAdministrativeMeasures' ||
                request.field === 'existingEngineeringMeasures')
                ? existingControlEmptyMessage(emptyReason)
                : scopedAiEmptyMessage(request.scope)}
            </SText>
          )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <SButton
            text={finished && pendingCount > 0 ? 'Ver nas colunas' : 'Fechar'}
            variant="shade"
            size="s"
            onClick={onClose}
          />
        </Box>
      </DialogContent>
    </>
  );
}
