import React, { useCallback, useMemo, useState } from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { useSnackbar } from 'notistack';

import { CharacterizationAiRiskAnalysisState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';
import { filterNewAiRiskSuggestions } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/filter-new-ai-risk-suggestions.util';
import { mapAiRiskTypeToEnum } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/map-ai-risk-type-to-enum.util';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { useMutUpsertManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertManyRiskData';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';

import { buildCatalogOnlyRiskLinkPayload } from '../suggest-catalog-risks-ai/build-catalog-only-risk-link-payload.util';
import { buildExistingRiskReviewFromDetailedRisk } from './build-existing-risk-review-from-detailed-risk.util';

type Props = {
  analysis: CharacterizationAiRiskAnalysisState;
  companyId: string;
  workspaceId?: string;
  entityId: string;
  riskGroupId?: string;
};

function summarizeCandidateSuggestions(risk: DetailedRisk): string {
  const parts: string[] = [];
  if (risk.generateSource?.trim()) parts.push('fonte geradora');
  if ((risk.existingEngineeringMeasures || []).some((v) => v?.trim())) {
    parts.push('controles ENG');
  }
  if ((risk.existingAdministrativeMeasures || []).some((v) => v?.trim())) {
    parts.push('controles ADM');
  }
  if ((risk.recommendedEngineeringMeasures || []).some((v) => v?.trim())) {
    parts.push('recomendações ENG');
  }
  if ((risk.recommendedAdministrativeMeasures || []).some((v) => v?.trim())) {
    parts.push('recomendações ADM');
  }
  if (
    typeof risk.probability === 'number' &&
    risk.probability >= 1 &&
    risk.probability <= 5
  ) {
    parts.push(`probabilidade ${risk.probability}`);
  }
  if (!parts.length) return 'Sem campos sugeridos além da identificação.';
  return `Sugestões associadas: ${parts.join(', ')}.`;
}

/**
 * Candidatos de riscos novos da Análise geral — inclusão mínima (keepEmpty).
 * Não dispara OpenAI; reutiliza sessão + colunas pendentes existentes.
 */
export function RiskFactorAiNewRiskCandidates({
  analysis,
  companyId: _companyId,
  workspaceId,
  entityId,
  riskGroupId,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const upsertMany = useMutUpsertManyRiskData();
  const { data: existingRiskData = [], refetch } = useQueryRiskDataByGho(
    riskGroupId || '',
    entityId,
  );
  const [busyRiskId, setBusyRiskId] = useState<string | null>(null);

  const {
    visibleSuggestions,
    addedRiskIdsSet,
    dismissSuggestion,
    markRiskAdded,
    mergeIncomingExistingRiskReviews,
  } = analysis;

  const existingRiskIds = useMemo(
    () =>
      new Set(
        (existingRiskData || []).map((row) => row.riskId).filter(Boolean) as string[],
      ),
    [existingRiskData],
  );

  const candidates = useMemo(
    () =>
      filterNewAiRiskSuggestions({
        suggestions: visibleSuggestions,
        existingRiskIds,
        addedRiskIds: addedRiskIdsSet,
      }),
    [addedRiskIdsSet, existingRiskIds, visibleSuggestions],
  );

  const handleAdd = useCallback(
    async (risk: DetailedRisk) => {
      if (!riskGroupId || !entityId || busyRiskId) return;
      if (existingRiskIds.has(risk.id)) {
        markRiskAdded(risk.id);
        enqueueSnackbar('Este fator já está vinculado à tabela.', {
          variant: 'info',
        });
        return;
      }

      const payload = buildCatalogOnlyRiskLinkPayload({
        riskGroupId,
        entityId,
        selectedRiskIds: [risk.id],
        workspaceId,
      });
      if (!payload) return;

      setBusyRiskId(risk.id);
      try {
        await upsertMany.mutateAsync(payload);
        const refreshed = await refetch();
        const rows = refreshed.data || [];
        const saved =
          rows.find((row) => row.riskId === risk.id) ||
          rows.find((row) => row.riskFactor?.id === risk.id);

        mergeIncomingExistingRiskReviews([
          buildExistingRiskReviewFromDetailedRisk({
            risk,
            riskFactorDataId: saved?.id,
          }),
        ]);
        markRiskAdded(risk.id);
        enqueueSnackbar(
          `"${risk.name}" vinculado. As sugestões da IA ficaram pendentes nas colunas — confirme item a item.`,
          { variant: 'success' },
        );
      } catch {
        // snackbar do mutation
      } finally {
        setBusyRiskId(null);
      }
    },
    [
      busyRiskId,
      enqueueSnackbar,
      entityId,
      existingRiskIds,
      markRiskAdded,
      mergeIncomingExistingRiskReviews,
      refetch,
      riskGroupId,
      upsertMany,
      workspaceId,
    ],
  );

  if (!riskGroupId || !candidates.length) return null;

  const count = candidates.length;
  const countLabel =
    count === 1 ? '1 candidato pendente' : `${count} candidatos pendentes`;

  return (
    <Accordion
      defaultExpanded={false}
      disableGutters
      elevation={0}
      sx={{
        mb: 1.5,
        border: '1px solid',
        borderColor: 'info.light',
        borderRadius: 1,
        '&:before': { display: 'none' },
        backgroundColor: 'action.hover',
      }}
      data-testid="risk-factor-ai-new-risk-candidates"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: 'info.main' }} />
          <Box sx={{ minWidth: 0 }}>
            <SText variant="subtitle2">
              Novos fatores sugeridos pela IA
            </SText>
            <SText variant="body2" color="text.secondary">
              {countLabel} · vínculo mínimo; sugestões ficam pendentes nas colunas
            </SText>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
      <SText variant="body2" color="text.secondary" mb={1}>
        Candidatos ainda não caracterizados. Incluir cria só o vínculo do fator;
        probabilidade, fontes, controles e recomendações permanecem pendentes
        nas colunas até confirmação explícita.
      </SText>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {candidates.map((risk) => {
          const busy = busyRiskId === risk.id;
          const riskType = mapAiRiskTypeToEnum(risk.type);
          return (
            <Accordion
              key={risk.id}
              disableGutters
              elevation={0}
              sx={{
                border: '1px dashed',
                borderColor: 'info.main',
                borderRadius: 1,
                '&:before': { display: 'none' },
                backgroundColor: 'transparent',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                    width: '100%',
                    pr: 1,
                  }}
                >
                  <SRiskChip type={riskType as unknown as RiskTypeEnum} />
                  <SText
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {risk.name}
                  </SText>
                  <SText fontSize={11} color="info.main">
                    Candidato · não caracterizado
                  </SText>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <SText variant="body2" mb={0.75}>
                  {risk.explanation || 'Sem explicação adicional da IA.'}
                </SText>
                <SText variant="body2" color="text.secondary" mb={1}>
                  {summarizeCandidateSuggestions(risk)}
                </SText>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  <SButton
                    text="Adicionar risco"
                    variant="contained"
                    color="primary"
                    size="s"
                    loading={busy}
                    disabled={!!busyRiskId}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleAdd(risk);
                    }}
                    buttonProps={{ sx: { minWidth: 'auto' } }}
                  />
                  <SButton
                    text="Descartar sugestão"
                    variant="text"
                    color="normal"
                    size="s"
                    disabled={busy}
                    onClick={(event) => {
                      event.stopPropagation();
                      dismissSuggestion(risk.id);
                    }}
                    buttonProps={{ sx: { minWidth: 'auto' } }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
      </AccordionDetails>
    </Accordion>
  );
}
