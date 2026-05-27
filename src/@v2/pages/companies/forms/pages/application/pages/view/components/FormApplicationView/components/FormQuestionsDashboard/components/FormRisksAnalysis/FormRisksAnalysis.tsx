import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Menu, MenuItem, Skeleton, Typography } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import type { ParticipantGroupForIndicators } from '../../helpers/buildParticipantGroupsForIndicators';
import {
  buildRiskAnalysisViewContext,
  groupEntityIdsByEstablishment,
  shouldGroupEntitiesByEstablishment,
  sortRiskIdsForAnalysis,
} from '../../helpers/buildRiskAnalysisViewContext';
import { buildRiskNarrativeDiagnosticScope } from '../../helpers/buildRiskNarrativeDiagnosticScope';
import { RiskNarrativeDiagnosticSection } from './RiskNarrativeDiagnosticSection';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { useMutateAiAnalyzeFormQuestionsRisks } from '@v2/services/forms/ai-analyze-risks/hooks/useMutateAiAnalyzeFormQuestionsRisks';
import { useMutateApplyAiAnalysisAsRiskData } from '@v2/services/forms/form-application/apply-ai-analysis-as-risk-data/hooks/useMutateApplyAiAnalysisAsRiskData';
import { useMutateAssignRisksFormApplication } from '@v2/services/forms/form-application/assign-risks-form-application/hooks/useMutateAssignRisksFormApplication';
import { useFetchBrowseFormApplicationRiskLog } from '@v2/services/forms/form-application/form-application-risk-log/hooks/useFetchBrowseFormApplicationRiskLog';
import {
  useFetchBrowseFormQuestionsAnswersAnalysis,
  hasRecentProcessingAnalyses,
} from '@v2/services/forms/form-questions-answers-analysis/browse-form-questions-answers-analysis/hooks/useFetchBrowseFormQuestionsAnswersAnalysis';

import { useMutateEditFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/edit-form-questions-answers-analysis/hooks/useMutateEditFormQuestionsAnswersAnalysis';
import { useFetchBrowseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/hooks/useFetchBrowseFormQuestionsAnswersRisks';
import { useSnackbar } from 'notistack';
import { SIconDelete } from '@v2/assets/icons/SIconDelete/SIconDelete';
import { TextField } from '@mui/material';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccess } from 'core/hooks/useAccess';
import { useForm, FormProvider } from 'react-hook-form';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import { useFetchSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useFetchSystemAiPrompt';
import { useMutateUpsertSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useMutateUpsertSystemAiPrompt';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import {
  getFormAiAnalysisErrorMessage,
  getRecentFormAiAnalysisBatchSummary,
} from './form-ai-analysis.utils';

import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { getMatrizRisk } from 'core/utils/helpers/matriz';
import {
  entityMatchesMassAddFilter,
  MassAddOccupationalRiskFilter,
  resolveOccupationalRiskLevel,
} from 'core/utils/helpers/occupational-risk-level.util';
import { AI_MODEL_OPTIONS } from './ai-model-options';

interface FormRisksAnalysisProps {
  formApplication: FormApplicationReadModel;
  accessCompanyId: string;
  formQuestionsAnswers?: FormQuestionsAnswersBrowseModel | null;
  visibleParticipantGroups?: ParticipantGroupForIndicators[];
  selectedGroupingQuestionId?: string | null;
  selectedGroupingLabel?: string | null;
}

interface AiAnalysisFormData {
  customPrompt?: string;
  model?: { label: string; value: string };
}

export const probabilityMap: Record<number, { label: string; color: string }> =
  {
    1: { label: 'Desprezível', color: '#3cbe7d' },
    2: { label: 'Pequena', color: '#8fa728' },
    3: { label: 'Moderada', color: '#d9d10b' },
    4: { label: 'Significativa', color: '#d96c2f' },
    5: { label: 'Excessiva', color: '#F44336' },
    0: { label: 'não contabilizar', color: '#eeeeee' },
  };

const severityMap: Record<number, { label: string; color: string }> = {
  1: { label: 'Desprezível', color: '#3cbe7d' },
  2: { label: 'Pequena', color: '#8fa728' },
  3: { label: 'Moderada', color: '#d9d10b' },
  4: { label: 'Significante', color: '#d96c2f' },
  5: { label: 'Excessiva', color: '#F44336' },
  0: { label: 'Não informado', color: '#eeeeee' },
};

const occupationalRiskColorMap: Record<string, string> = {
  'Muito Baixo': '#3cbe7d',
  Baixo: '#8fa728',
  Moderado: '#d9d10b',
  Alto: '#d96c2f',
  'Muito Alto': '#F44336',
  'Não informado': '#eeeeee',
};

const formatTwoDigits = (n: number) => String(n).padStart(2, '0');

const isValidMatrixValue = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 5;

const badgeSx = (bg: string) => ({
  backgroundColor: bg,
  padding: '4px 8px',
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'grey.200',
  minWidth: 180,
});

export const FormRisksAnalysis = ({
  formApplication,
  accessCompanyId,
  formQuestionsAnswers = null,
  visibleParticipantGroups = [],
  selectedGroupingQuestionId = null,
  selectedGroupingLabel = null,
}: FormRisksAnalysisProps) => {
  const { isMaster } = useAccess();
  const { showConfirmation } = useConfirmationModal();
  const [expandedRisks, setExpandedRisks] = useState<Record<string, boolean>>(
    {},
  );

  const [expandedAnalysis, setExpandedAnalysis] = useState<
    Record<string, boolean>
  >({});

  const [addedRisks, setAddedRisks] = useState<Set<string>>(new Set());
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [addRiskMenu, setAddRiskMenu] = useState<{
    anchorEl: HTMLElement;
    riskId: string;
  } | null>(null);

  // Form for AI analysis configuration
  const methods = useForm<AiAnalysisFormData>({
    defaultValues: {
      customPrompt: '',
    },
  });
  const { handleSubmit, reset, getValues } = methods;

  const { data: systemAiPrompt, isLoading: isLoadingSystemAiPrompt } =
    useFetchSystemAiPrompt(
      SystemAiPromptKeyEnum.RISK_SOURCES_RECOMMENDATIONS,
      isMaster && showAiDialog,
    );

  const { mutate: mutateUpsertSystemAiPrompt, isPending: isSavingDefaultPrompt } =
    useMutateUpsertSystemAiPrompt();

  useEffect(() => {
    if (!isMaster || !showAiDialog || !systemAiPrompt) return;

    reset({
      customPrompt: systemAiPrompt.content,
      model: getValues('model'),
    });
  }, [getValues, isMaster, reset, showAiDialog, systemAiPrompt]);

  const { mutate: mutateAssignRisksFormApplication } =
    useMutateAssignRisksFormApplication();

  const { mutate: mutateAiAnalyzeFormQuestionsRisks, isPending: isAnalyzing } =
    useMutateAiAnalyzeFormQuestionsRisks();

  const { enqueueSnackbar } = useSnackbar();

  const editAnalysisMutation = useMutateEditFormQuestionsAnswersAnalysis();
  const applyAiAnalysisAsRiskDataMutation =
    useMutateApplyAiAnalysisAsRiskData();

  const { riskLogs } = useFetchBrowseFormApplicationRiskLog({
    companyId: accessCompanyId,
    applicationId: formApplication.id,
  });

  const { formQuestionsAnswersRisks, isLoading } =
    useFetchBrowseFormQuestionsAnswersRisks({
      companyId: accessCompanyId,
      applicationId: formApplication.id,
    });

  const {
    formQuestionsAnswersAnalysis,

    refetch,
  } = useFetchBrowseFormQuestionsAnswersAnalysis({
    companyId: accessCompanyId,
    applicationId: formApplication.id,
  });

  // Check if there are any analyses being processed (created within last 10 minutes)
  const hasProcessingAnalyses = useMemo(() => {
    return hasRecentProcessingAnalyses(formQuestionsAnswersAnalysis?.results);
  }, [formQuestionsAnswersAnalysis]);

  const wasProcessingAnalysesRef = useRef(false);
  const batchFailureNotifiedRef = useRef(false);

  useEffect(() => {
    if (hasProcessingAnalyses) {
      wasProcessingAnalysesRef.current = true;
      batchFailureNotifiedRef.current = false;
      return;
    }

    if (!wasProcessingAnalysesRef.current || batchFailureNotifiedRef.current) return;

    wasProcessingAnalysesRef.current = false;

    const { done, failed, processing } = getRecentFormAiAnalysisBatchSummary(
      formQuestionsAnswersAnalysis?.results,
    );

    if (processing.length > 0) return;

    if (failed.length > 0 && done.length === 0) {
      batchFailureNotifiedRef.current = true;
      const firstError = getFormAiAnalysisErrorMessage(
        failed[0]?.metadata as Record<string, unknown> | undefined,
      );
      enqueueSnackbar(
        `Nenhuma análise foi concluída (${failed.length} falha(s)). ${firstError}`,
        { variant: 'error', autoHideDuration: 12000 },
      );
    }
  }, [enqueueSnackbar, formQuestionsAnswersAnalysis?.results, hasProcessingAnalyses]);

  // Create a map to check if risk has been added to entity
  const riskLogMap = useMemo(() => {
    const map = new Map<string, boolean>();
    riskLogs.forEach((log) => {
      const key = `${log.riskId}-${log.entityId}-${log.probability}`;
      map.set(key, true);
    });
    return map;
  }, [riskLogs]);

  // Helper function to check if risk is added to entity
  const isRiskAddedToEntity = (
    riskId: string,
    entityId: string,
    probability: number,
  ) => {
    return riskLogMap.has(`${riskId}-${entityId}-${probability}`);
  };

  const handleAccordionChange = (riskId: string) => {
    setExpandedRisks((prev) => ({
      ...prev,
      [riskId]: !prev[riskId],
    }));
  };

  const handleAnalysisToggle = (analysisKey: string) => {
    setExpandedAnalysis((prev) => ({
      ...prev,
      [analysisKey]: !prev[analysisKey],
    }));
  };

  // Helper function to check if analysis was already added as risk data
  const isAnalysisAddedAsRiskData = (analysis: any) => {
    return analysis.analysis?.isAddedAsRiskData === true;
  };

  // Helper function to handle editing analysis items
  const handleEditAnalysisItem = async (
    analysisId: string,
    itemType:
      | 'fontesGeradoras'
      | 'medidasEngenhariaRecomendadas'
      | 'medidasAdministrativasRecomendadas',
    itemIndex: number,
    newName: string,
    analysis: any,
  ) => {
    try {
      const updatedAnalysis = { ...analysis.analysis };
      updatedAnalysis[itemType][itemIndex].nome = newName;

      await editAnalysisMutation.mutateAsync({
        companyId: accessCompanyId,
        applicationId: formApplication.id,
        analysisId,
        analysis: updatedAnalysis,
      });
    } catch (error) {
      console.error('Error updating analysis item:', error);
    }
  };

  // Helper function to handle removing analysis items
  const handleRemoveAnalysisItem = async (
    analysisId: string,
    itemType:
      | 'fontesGeradoras'
      | 'medidasEngenhariaRecomendadas'
      | 'medidasAdministrativasRecomendadas',
    itemIndex: number,
    analysis: any,
  ) => {
    try {
      const updatedAnalysis = { ...analysis.analysis };
      updatedAnalysis[itemType].splice(itemIndex, 1);

      await editAnalysisMutation.mutateAsync({
        companyId: accessCompanyId,
        applicationId: formApplication.id,
        analysisId,
        analysis: updatedAnalysis,
      });
    } catch (error) {
      console.error('Error removing analysis item:', error);
    }
  };

  // Component for editable analysis items
  const EditableAnalysisItem = ({
    item,
    itemIndex,
    analysisId,
    itemType,
    analysis,
    backgroundColor,
    borderColor,
  }: {
    item: any;
    itemIndex: number;
    analysisId: string;
    itemType:
      | 'fontesGeradoras'
      | 'medidasEngenhariaRecomendadas'
      | 'medidasAdministrativasRecomendadas';
    analysis: any;
    backgroundColor: string;
    borderColor: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(item.nome);

    const handleSave = async () => {
      if (editValue.trim() && editValue !== item.nome) {
        await handleEditAnalysisItem(
          analysisId,
          itemType,
          itemIndex,
          editValue.trim(),
          analysis,
        );
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(item.nome);
      setIsEditing(false);
    };

    return (
      <Box
        sx={{
          p: 2,
          backgroundColor,
          borderRadius: 1,
          border: '1px solid',
          borderColor,
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '.edit-actions': {
              opacity: 1,
            },
          },
          '.edit-actions': {
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
          },
        }}
      >
        <SFlex alignItems="center" gap={1}>
          {isEditing ? (
            <SFlex flex={1} gap={1} alignItems="center">
              <TextField
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
                multiline
                minRows={1}
                maxRows={4}
                size="small"
                variant="outlined"
                placeholder="Digite o nome do item..."
                autoFocus
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    fontSize: 12,
                    fontWeight: 'medium',
                  },
                }}
              />
              <SIconButton
                size="small"
                onClick={handleSave}
                iconButtonProps={{ sx: { color: 'success.main' } }}
              >
                <CheckIcon />
              </SIconButton>
              <SIconButton
                size="small"
                onClick={handleCancel}
                iconButtonProps={{ sx: { color: 'error.main' } }}
              >
                <SIconDelete fontSize="16px" />
              </SIconButton>
            </SFlex>
          ) : (
            <SFlex direction="column" gap={1} width="100%">
              <SFlex alignItems="flex-start" justifyContent="space-between">
                <Box
                  flex={1}
                  onClick={() => setIsEditing(true)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      '& .item-name': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <SText
                    className="item-name"
                    variant="body2"
                    fontWeight="medium"
                    fontSize={13}
                    sx={{
                      mb: 0.5,
                      transition: 'color 0.2s ease-in-out',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.nome}
                  </SText>
                </Box>
                <SFlex className="edit-actions" gap={0.5}>
                  <SIconButton
                    iconButtonProps={{
                      sx: {
                        p: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                        },
                      },
                    }}
                    onClick={() => setIsEditing(true)}
                  >
                    <EditIcon fontSize="small" />
                  </SIconButton>
                  <SIconButton
                    iconButtonProps={{
                      sx: {
                        p: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'error.contrastText',
                        },
                      },
                    }}
                    onClick={() =>
                      handleRemoveAnalysisItem(
                        analysisId,
                        itemType,
                        itemIndex,
                        analysis,
                      )
                    }
                  >
                    <SIconDelete fontSize="16px" />
                  </SIconButton>
                </SFlex>
              </SFlex>
              {item.justificativa && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 0.5,
                    borderLeft: '3px solid',
                    borderLeftColor: borderColor,
                  }}
                >
                  <SText
                    variant="body2"
                    color="text.secondary"
                    fontSize={11}
                    sx={{ lineHeight: 1.4 }}
                  >
                    {item.justificativa}
                  </SText>
                </Box>
              )}
            </SFlex>
          )}
        </SFlex>
      </Box>
    );
  };

  const handleAddAnalysisAsRiskData = async (analysis: any) => {
    if (!analysis.hierarchyId || !analysis.riskId) {
      enqueueSnackbar('Dados da análise incompletos', { variant: 'error' });
      return;
    }

    try {
      await applyAiAnalysisAsRiskDataMutation.mutateAsync({
        companyId: accessCompanyId,
        applicationId: formApplication.id,
        hierarchyId: analysis.hierarchyId,
        riskId: analysis.riskId,
        probability: analysis.probability,
        generateSourcesAddOnly: analysis.analysis?.fontesGeradoras?.map(
          (fonte: any) => ({ name: fonte.nome }),
        ),
        engsAddOnly: analysis.analysis?.medidasEngenhariaRecomendadas?.map(
          (medida: any) => ({
            medName: medida.nome,
            medType: MedTypeEnum.ENG,
          }),
        ),
        recAddOnly: [
          ...(analysis.analysis?.medidasAdministrativasRecomendadas?.map(
            (medida: any) => ({
              recName: medida.nome,
              recType: RecTypeEnum.ADM,
            }),
          ) ?? []),
          ...(analysis.analysis?.medidasEngenhariaRecomendadas?.map(
            (medida: any) => ({
              recName: medida.nome,
              recType: RecTypeEnum.ENG,
            }),
          ) ?? []),
        ],
      });

      await editAnalysisMutation.mutateAsync({
        companyId: accessCompanyId,
        applicationId: formApplication.id,
        analysisId: analysis.id,
        analysis: {
          ...analysis.analysis,
          isAddedAsRiskData: true,
        },
      });

      setAddedRisks((prev) => new Set(prev).add(analysis.id));
    } catch {
      // Erros exibidos pelos hooks de mutação
    }
  };

  const entityMap = formQuestionsAnswersRisks?.entityMap ?? {};
  const riskMap = formQuestionsAnswersRisks?.riskMap ?? {};
  const entityRiskMap = formQuestionsAnswersRisks?.entityRiskMap ?? {};
  const groupedEntityRiskMap =
    formQuestionsAnswersRisks?.groupedEntityRiskMap ?? {};
  const hierarchyGroups = formQuestionsAnswersRisks?.hierarchyGroups ?? [];

  const { allowedEntityIds, entityEstablishmentMap } = useMemo(
    () =>
      buildRiskAnalysisViewContext({
        formQuestionsAnswers,
        visibleParticipantGroups,
        selectedGroupingQuestionId,
        entityMap,
        entityEstablishmentMapFromApi:
          formQuestionsAnswersRisks?.entityEstablishmentMap,
      }),
    [
      formQuestionsAnswers,
      visibleParticipantGroups,
      selectedGroupingQuestionId,
      entityMap,
      formQuestionsAnswersRisks?.entityEstablishmentMap,
    ],
  );

  const isEntityVisible = useCallback(
    (entityId: string) =>
      allowedEntityIds === null || allowedEntityIds.has(entityId),
    [allowedEntityIds],
  );

  const riskNarrativeDiagnosticScope = useMemo(
    () =>
      buildRiskNarrativeDiagnosticScope({
        selectedGroupingQuestionId,
        visibleParticipantGroups,
        allowedEntityIds,
        groupingLabel: selectedGroupingLabel,
      }),
    [
      selectedGroupingQuestionId,
      visibleParticipantGroups,
      allowedEntityIds,
      selectedGroupingLabel,
    ],
  );

  const getEffectiveProbability = useCallback(
    (entityId: string, riskId: string): number => {
      if (hierarchyGroups.length > 0) {
        const group = hierarchyGroups.find((g) =>
          g.hierarchyIds.includes(entityId),
        );
        if (group && groupedEntityRiskMap[group.id]?.[riskId]) {
          return groupedEntityRiskMap[group.id][riskId].probability;
        }
      }
      return entityRiskMap[entityId]?.[riskId]?.probability ?? 0;
    },
    [hierarchyGroups, groupedEntityRiskMap, entityRiskMap],
  );

  const getEntitiesWithRisk = useCallback(
    (riskId: string) =>
      Object.keys(entityRiskMap).filter(
        (entityId) =>
          entityRiskMap[entityId]?.[riskId] && isEntityVisible(entityId),
      ),
    [entityRiskMap, isEntityVisible],
  );

  const risksWithData = useMemo(
    () =>
      sortRiskIdsForAnalysis(
        Object.keys(riskMap).filter(
          (riskId) => getEntitiesWithRisk(riskId).length > 0,
        ),
        riskMap,
      ),
    [riskMap, getEntitiesWithRisk],
  );

  const getEntityOccupationalLevel = useCallback(
    (entityId: string, riskId: string) => {
      const risk = riskMap[riskId];
      if (!risk) return null;
      return resolveOccupationalRiskLevel(
        risk.severity,
        getEffectiveProbability(entityId, riskId),
      );
    },
    [riskMap, getEffectiveProbability],
  );

  const getEntityIdsToAdd = useCallback(
    (riskId: string, filter: MassAddOccupationalRiskFilter) =>
      getEntitiesWithRisk(riskId).filter((entityId) => {
        const probability = getEffectiveProbability(entityId, riskId);
        if (riskLogMap.has(`${riskId}-${entityId}-${probability}`)) {
          return false;
        }
        return entityMatchesMassAddFilter(
          getEntityOccupationalLevel(entityId, riskId),
          filter,
        );
      }),
    [
      getEntitiesWithRisk,
      getEntityOccupationalLevel,
      getEffectiveProbability,
      riskLogMap,
    ],
  );

  const addRiskMenuOptions: {
    filter: MassAddOccupationalRiskFilter;
    label: string;
  }[] = [
    { filter: 'all', label: 'Adicionar a todos os setores' },
    {
      filter: 'moderateAndAbove',
      label: 'Adicionar Moderado, Alto e Muito Alto',
    },
    { filter: 'highAndAbove', label: 'Adicionar Alto e Muito Alto' },
  ];

  if (isLoading || !formQuestionsAnswersRisks) {
    return (
      <SPaper sx={{ p: 4 }}>
        <Skeleton height={400} />
      </SPaper>
    );
  }

  if (risksWithData.length === 0) {
    return (
      <SPaper sx={{ p: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={400}
        >
          <Typography variant="h5" color="primary.main" mb={2}>
            Análise de Riscos
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Nenhum risco foi identificado para este formulário.
          </Typography>
        </Box>
      </SPaper>
    );
  }

  const handleAddRiskToAllEntities = (riskId: string, entityIds: string[]) => {
    mutateAssignRisksFormApplication({
      companyId: accessCompanyId,
      applicationId: formApplication.id,
      risks: entityIds.map((entityId) => ({
        riskId,
        probability: getEffectiveProbability(entityId, riskId),
        hierarchyId: entityId,
      })),
    });
  };

  const handleAddRiskToEntity = (riskId: string, entityId: string) => {
    mutateAssignRisksFormApplication({
      companyId: accessCompanyId,
      applicationId: formApplication.id,
      risks: [
        {
          riskId,
          probability: getEffectiveProbability(entityId, riskId),
          hierarchyId: entityId,
        },
      ],
    });
  };

  const handleAddAllRisk = () => {
    const risks = Object.entries(entityRiskMap)
      .filter(([entityId]) => isEntityVisible(entityId))
      .map(([entityId, entityRisks]) => {
        return Object.entries(entityRisks).map(([riskId]) => {
          return {
            hierarchyId: entityId,
            riskId,
            probability: getEffectiveProbability(entityId, riskId),
          };
        });
      })
      .flat();

    mutateAssignRisksFormApplication({
      companyId: accessCompanyId,
      applicationId: formApplication.id,
      risks,
    });
  };

  const handleAnalyzeRisks = (data?: AiAnalysisFormData) => {
    batchFailureNotifiedRef.current = false;

    mutateAiAnalyzeFormQuestionsRisks(
      {
        companyId: accessCompanyId,
        formApplicationId: formApplication.id,
        ...(isMaster && data?.customPrompt?.trim()
          ? { customPrompt: data.customPrompt.trim() }
          : {}),
        ...(isMaster && data?.model?.value ? { model: data.model.value } : {}),
      },
      {
        onSuccess: () => {
          void refetch();
          setTimeout(() => void refetch(), 3000);
        },
      },
    );

    setShowAiDialog(false);
  };

  const handleAnalyzeButtonClick = () => {
    if (isMaster) {
      setShowAiDialog(true);
      return;
    }

    handleAnalyzeRisks();
  };

  const handleSaveDefaultPrompt = async () => {
    const content = getValues('customPrompt')?.trim();
    if (!content) {
      enqueueSnackbar('O prompt não pode estar vazio.', { variant: 'warning' });
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Definir como prompt padrão',
      message:
        'O conteúdo atual do prompt será salvo como padrão do sistema para análises de Fontes Geradoras e Recomendações. Deseja continuar?',
      confirmText: 'Salvar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!confirmed) return;

    mutateUpsertSystemAiPrompt({
      key: SystemAiPromptKeyEnum.RISK_SOURCES_RECOMMENDATIONS,
      content,
    });
  };

  return (
    <SPaper sx={{ p: 4 }}>
      <SFlex justifyContent="space-between" my={4} mx={8} mb={16}>
        <SText fontSize={18} fontWeight="bold">
          Análise de Riscos
        </SText>
        <SFlex gap={2}>
          <SButton
            variant="shade"
            text={
              hasProcessingAnalyses
                ? 'Processando análise...'
                : 'Analisar com IA'
            }
            color="primary"
            loading={isAnalyzing || hasProcessingAnalyses}
            onClick={handleAnalyzeButtonClick}
            disabled={hasProcessingAnalyses}
          />
          <SButton
            variant="shade"
            text="Adicionar todos os riscos a todos os setores"
            color="success"
            onClick={() => {
              handleAddAllRisk();
            }}
          />
        </SFlex>
      </SFlex>

      <RiskNarrativeDiagnosticSection
        companyId={accessCompanyId}
        formApplicationId={formApplication.id}
        scope={riskNarrativeDiagnosticScope}
        isMaster={isMaster}
      />

      <SFlex direction="column" gap={2}>
        {risksWithData.map((riskId) => {
          const risk = riskMap[riskId];
          const isExpanded = expandedRisks[riskId] || false;

          const entitiesWithRisk = getEntitiesWithRisk(riskId);
          const groupByEstablishment = shouldGroupEntitiesByEstablishment(
            entitiesWithRisk,
            entityMap,
            entityEstablishmentMap,
          );
          const entityDisplayGroups = groupByEstablishment
            ? groupEntityIdsByEstablishment(
                entitiesWithRisk,
                entityMap,
                entityEstablishmentMap,
              )
            : [{ establishment: '', entityIds: entitiesWithRisk }];

          return (
            <SAccordion
              key={riskId}
              expanded={isExpanded}
              onChange={() => handleAccordionChange(riskId)}
              endComponent={
                <>
                  {entitiesWithRisk.every((entityId) =>
                    isRiskAddedToEntity(
                      riskId,
                      entityId,
                      getEffectiveProbability(entityId, riskId),
                    ),
                  ) && (
                    <SText color="success.main" fontSize={12} ml="auto" mr={5}>
                      Risco adicionado a todos os setores
                    </SText>
                  )}
                </>
              }
              title={
                <SFlex alignItems="center" gap={2} flex={1}>
                  <SRiskChip
                    size="lg"
                    type={risk.type}
                    subTypes={risk.subTypes.map((subType) => ({
                      id: subType.sub_type.id,
                      name: subType.sub_type.name,
                    }))}
                  />
                  <Typography fontWeight="500" fontSize={18} color="text.main">
                    {risk.name}
                  </Typography>
                </SFlex>
              }
            >
              <SAccordionBody>
                <SFlex direction="column" gap={3} mt={8}>
                  <SFlex
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Typography color="text.secondary">
                      Setores Identificados:
                    </Typography>
                    {entitiesWithRisk.length > 0 && (
                      <SButton
                        variant="shade"
                        color="success"
                        size="s"
                        text="Adicionar risco a todos os setores"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddRiskMenu({
                            anchorEl: e.currentTarget,
                            riskId,
                          });
                        }}
                        buttonProps={{
                          sx: { width: 'fit-content' },
                        }}
                      />
                    )}
                  </SFlex>

                  <SFlex direction="column" gap={4}>
                    {entityDisplayGroups.map(
                      ({ establishment, entityIds: groupEntityIds }) => (
                        <Box key={establishment || 'all'}>
                          {groupByEstablishment && establishment && (
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              color="text.secondary"
                              sx={{ mb: 2, mt: groupEntityIds.length ? 0 : 0 }}
                            >
                              {establishment}
                            </Typography>
                          )}
                          <SFlex direction="column" gap={4}>
                            {groupEntityIds.map((entityId) => {
                      const entity = entityMap[entityId];
                      const riskData = entityRiskMap[entityId][riskId];
                      const severity = risk?.severity;
                      const probability = getEffectiveProbability(entityId, riskId);

                      const hasValidSeverity = isValidMatrixValue(severity);
                      const hasValidProbability = isValidMatrixValue(probability);

                      const matriz =
                        hasValidSeverity && hasValidProbability
                          ? getMatrizRisk(severity, probability)
                          : null;

                      // UX: a matriz tem nível 6 ("Interromper"), mas a padronização desta tela
                      // exige no máximo "Muito Alto".
                      const occupationalRiskLabel =
                        !matriz || matriz.level === 0
                          ? 'Não informado'
                          : matriz.level >= 5
                            ? 'Muito Alto'
                            : matriz.label;

                      return (
                        <Box
                          key={entityId}
                          sx={{
                            p: 4,
                            backgroundColor: 'grey.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                          }}
                        >
                          <SFlex alignItems="center" gap={4} mb={2}>
                            <Box
                              sx={{
                                backgroundColor: 'grey.100',
                                padding: '2px 4px',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200',
                              }}
                            >
                              <Typography fontSize={12} color="text.secondary">
                                {hierarchyTypeTranslation[entity.type]}
                              </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="medium">
                              {entity.name}
                            </Typography>
                            {isRiskAddedToEntity(
                              riskId,
                              entityId,
                              probability,
                            ) ? (
                              <SFlex
                                color="success.main"
                                fontSize={12}
                                gap={3}
                                width="180px"
                                textAlign="center"
                                ml="auto"
                              >
                                <CheckIcon sx={{ fontSize: 16 }} />
                                <SText color="success.main" fontSize={12}>
                                  Risco adicionado
                                </SText>
                              </SFlex>
                            ) : (
                              <SButton
                                variant="shade"
                                color="paper"
                                buttonProps={{
                                  sx: { ml: 'auto', width: '180px' },
                                }}
                                text="Adicionar risco a este setor"
                                onClick={() =>
                                  handleAddRiskToEntity(riskId, entityId)
                                }
                              />
                            )}
                            <SFlex
                              center
                              sx={{
                                ml: 'auto',
                                gap: 2,
                                flexWrap: 'wrap',
                              }}
                            >
                              <Box sx={badgeSx(probabilityMap[probability || 0].color)}>
                                <Typography variant="body2" color="text.main">
                                  Probabilidade:{' '}
                                  {hasValidProbability
                                    ? `${formatTwoDigits(probability)} ${probabilityMap[probability].label}`
                                    : 'Não informado'}
                                </Typography>
                              </Box>

                              <Box
                                sx={badgeSx(
                                  hasValidSeverity
                                    ? severityMap[severity].color
                                    : severityMap[0].color,
                                )}
                              >
                                <Typography variant="body2" color="text.main">
                                  Severidade:{' '}
                                  {hasValidSeverity
                                    ? `${formatTwoDigits(severity)} ${severityMap[severity].label}`
                                    : 'Não informado'}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  ...badgeSx(
                                    occupationalRiskColorMap[
                                      occupationalRiskLabel
                                    ] ?? occupationalRiskColorMap['Não informado'],
                                  ),
                                  borderColor: 'grey.400',
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.main"
                                  fontWeight={600}
                                >
                                  Risco Ocupacional: {occupationalRiskLabel}
                                </Typography>
                              </Box>
                            </SFlex>
                          </SFlex>
                          {/* AI Analysis Results for this specific risk-entity combination */}
                          {formQuestionsAnswersAnalysis?.results &&
                            (() => {
                              const resultsForPair =
                                formQuestionsAnswersAnalysis.results.filter(
                                  (analysis) =>
                                    analysis.riskId === riskId &&
                                    analysis.hierarchyId === entityId,
                                );

                              const relevantAnalysis = resultsForPair.filter(
                                (analysis) =>
                                  analysis.analysis &&
                                  analysis.status ===
                                    FormAiAnalysisStatusEnum.DONE,
                              );

                              const failedAnalysis = resultsForPair.find(
                                (analysis) =>
                                  analysis.status ===
                                  FormAiAnalysisStatusEnum.FAILED,
                              );

                              if (
                                relevantAnalysis.length === 0 &&
                                !failedAnalysis
                              ) {
                                return null;
                              }

                              if (
                                relevantAnalysis.length === 0 &&
                                failedAnalysis
                              ) {
                                return (
                                  <Box mt={3}>
                                    <Typography
                                      variant="body2"
                                      color="error.main"
                                      sx={{ fontStyle: 'italic' }}
                                    >
                                      Análise de IA falhou:{' '}
                                      {getFormAiAnalysisErrorMessage(
                                        failedAnalysis.metadata as
                                          | Record<string, unknown>
                                          | undefined,
                                      )}
                                    </Typography>
                                  </Box>
                                );
                              }

                              const analysisKey = `${riskId}-${entityId}`;
                              const isAnalysisExpanded =
                                expandedAnalysis[analysisKey];

                              return (
                                <Box mt={3}>
                                  <SButton
                                    variant="text"
                                    text={
                                      isAnalysisExpanded
                                        ? 'Ocultar Análise de IA'
                                        : 'Mostrar Análise de IA'
                                    }
                                    onClick={() =>
                                      handleAnalysisToggle(analysisKey)
                                    }
                                    buttonProps={{
                                      sx: {
                                        mb: 2,
                                        textDecoration: 'underline',
                                        '&:hover': {
                                          textDecoration: 'underline',
                                        },
                                      },
                                    }}
                                  />
                                  {isAnalysisExpanded && (
                                    <SFlex direction="column" gap={2}>
                                      {relevantAnalysis.map((analysis) => (
                                        <Box
                                          key={analysis.id}
                                          sx={{
                                            p: 3,
                                            backgroundColor: 'primary.50',
                                          }}
                                        >
                                          <SFlex
                                            alignItems="center"
                                            gap={2}
                                            mb={2}
                                          >
                                            <SText
                                              variant="body2"
                                              color="text.main"
                                            >
                                              Análise de IA para este
                                              risco/setor:{' '}
                                              {analysis.analysis?.frps}
                                            </SText>
                                            <SText
                                              variant="body2"
                                              color="text.secondary"
                                              fontSize={12}
                                              sx={{ fontStyle: 'italic' }}
                                            >
                                              Confiança:{' '}
                                              {Math.round(
                                                (analysis?.confidence ?? 0) *
                                                  100,
                                              )}
                                              %
                                            </SText>
                                            <SButton
                                              variant={
                                                isAnalysisAddedAsRiskData(
                                                  analysis,
                                                ) || addedRisks.has(analysis.id)
                                                  ? 'shade'
                                                  : 'shade'
                                              }
                                              color={
                                                isAnalysisAddedAsRiskData(
                                                  analysis,
                                                ) || addedRisks.has(analysis.id)
                                                  ? 'paper'
                                                  : 'success'
                                              }
                                              size="s"
                                              text={
                                                isAnalysisAddedAsRiskData(
                                                  analysis,
                                                ) || addedRisks.has(analysis.id)
                                                  ? 'Adicionar novamente'
                                                  : 'Adicionar'
                                              }
                                              onClick={() =>
                                                handleAddAnalysisAsRiskData(
                                                  analysis,
                                                )
                                              }
                                              buttonProps={{
                                                sx: {
                                                  ml: 'auto',
                                                  minWidth: 'auto',
                                                  px: 2,
                                                  py: 0.5,
                                                  fontSize: '0.75rem',
                                                },
                                              }}
                                            />
                                          </SFlex>

                                          {/* Fontes Geradoras */}
                                          {analysis.analysis?.fontesGeradoras &&
                                            analysis.analysis.fontesGeradoras
                                              .length > 0 && (
                                              <Box mb={2} mt={4}>
                                                <SFlex
                                                  alignItems="center"
                                                  gap={4}
                                                  mb={4}
                                                >
                                                  <SText
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                    fontSize={14}
                                                  >
                                                    Fontes Geradoras
                                                  </SText>
                                                </SFlex>
                                                <SFlex
                                                  direction="column"
                                                  gap={4}
                                                >
                                                  {analysis.analysis.fontesGeradoras.map(
                                                    (fonte, index) => (
                                                      <EditableAnalysisItem
                                                        key={index}
                                                        item={fonte}
                                                        itemIndex={index}
                                                        analysisId={analysis.id}
                                                        itemType="fontesGeradoras"
                                                        analysis={analysis}
                                                        backgroundColor="grey.50"
                                                        borderColor="grey.200"
                                                      />
                                                    ),
                                                  )}
                                                </SFlex>
                                              </Box>
                                            )}

                                          {/* Medidas de Engenharia */}
                                          {analysis.analysis
                                            ?.medidasEngenhariaRecomendadas &&
                                            analysis.analysis
                                              .medidasEngenhariaRecomendadas
                                              .length > 0 && (
                                              <Box mb={2} mt={8}>
                                                <SFlex
                                                  alignItems="center"
                                                  gap={1}
                                                  mb={2}
                                                >
                                                  <Box
                                                    sx={{
                                                      width: 4,
                                                      height: 20,
                                                      backgroundColor:
                                                        'blue.400',
                                                      borderRadius: 2,
                                                    }}
                                                  />
                                                  <SText
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                    fontSize={14}
                                                  >
                                                    Recomendações (Medidas de
                                                    Engenharia)
                                                  </SText>
                                                </SFlex>
                                                <SFlex
                                                  direction="column"
                                                  gap={1}
                                                >
                                                  {analysis.analysis.medidasEngenhariaRecomendadas.map(
                                                    (medida, index) => (
                                                      <EditableAnalysisItem
                                                        key={index}
                                                        item={medida}
                                                        itemIndex={index}
                                                        analysisId={analysis.id}
                                                        itemType="medidasEngenhariaRecomendadas"
                                                        analysis={analysis}
                                                        backgroundColor="grey.50"
                                                        borderColor="grey.200"
                                                      />
                                                    ),
                                                  )}
                                                </SFlex>
                                              </Box>
                                            )}

                                          {/* Medidas Administrativas */}
                                          {analysis.analysis
                                            ?.medidasAdministrativasRecomendadas &&
                                            analysis.analysis
                                              .medidasAdministrativasRecomendadas
                                              .length > 0 && (
                                              <Box>
                                                <SFlex
                                                  alignItems="center"
                                                  gap={1}
                                                  mb={2}
                                                  mt={8}
                                                >
                                                  <Box
                                                    sx={{
                                                      width: 4,
                                                      height: 20,
                                                      backgroundColor:
                                                        'green.400',
                                                      borderRadius: 2,
                                                    }}
                                                  />
                                                  <SText
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                    fontSize={14}
                                                  >
                                                    Recomendações (Medidas
                                                    Administrativas)
                                                  </SText>
                                                </SFlex>
                                                <SFlex
                                                  direction="column"
                                                  gap={1}
                                                >
                                                  {analysis.analysis.medidasAdministrativasRecomendadas.map(
                                                    (medida, index) => (
                                                      <EditableAnalysisItem
                                                        key={index}
                                                        item={medida}
                                                        itemIndex={index}
                                                        analysisId={analysis.id}
                                                        itemType="medidasAdministrativasRecomendadas"
                                                        analysis={analysis}
                                                        backgroundColor="grey.50"
                                                        borderColor="grey.200"
                                                      />
                                                    ),
                                                  )}
                                                </SFlex>
                                              </Box>
                                            )}
                                        </Box>
                                      ))}
                                    </SFlex>
                                  )}
                                </Box>
                              );
                            })()}
                        </Box>
                      );
                            })}
                          </SFlex>
                        </Box>
                      ),
                    )}
                  </SFlex>
                </SFlex>
              </SAccordionBody>
            </SAccordion>
          );
        })}
      </SFlex>

      <Menu
        anchorEl={addRiskMenu?.anchorEl ?? null}
        open={Boolean(addRiskMenu)}
        onClose={() => setAddRiskMenu(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {addRiskMenu &&
          addRiskMenuOptions.map((option) => {
            const count = getEntityIdsToAdd(addRiskMenu.riskId, option.filter)
              .length;
            return (
              <MenuItem
                key={option.filter}
                disabled={count === 0}
                onClick={() => {
                  const riskId = addRiskMenu.riskId;
                  const entityIds = getEntityIdsToAdd(riskId, option.filter);
                  setAddRiskMenu(null);
                  handleAddRiskToAllEntities(riskId, entityIds);
                }}
              >
                {option.label} ({count})
              </MenuItem>
            );
          })}
      </Menu>

      {isMaster && (
      <Dialog
        open={showAiDialog}
        onClose={() => setShowAiDialog(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            width: '95vw',
            maxWidth: '95vw',
          },
        }}
      >
        <DialogTitle>Configurar Análise de IA</DialogTitle>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleAnalyzeRisks)}>
            <DialogContent>
              <SSearchSelectForm
                name="model"
                label="Modelo de IA"
                placeholder="Selecione o modelo de IA"
                options={AI_MODEL_OPTIONS}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                boxProps={{ sx: { mb: 8 } }}
              />
              {isLoadingSystemAiPrompt ? (
                <Skeleton variant="rectangular" height={320} />
              ) : (
                <SInputMultilineForm
                  name="customPrompt"
                  label="Prompt da análise"
                  placeholder="Carregando prompt padrão do sistema..."
                  fullWidth
                  inputProps={{ minRows: 4, maxRows: 30 }}
                />
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
              <SButton
                variant="outlined"
                color="primary"
                text="Definir como prompt padrão"
                loading={isSavingDefaultPrompt}
                disabled={isLoadingSystemAiPrompt || isAnalyzing}
                onClick={handleSaveDefaultPrompt}
              />
              <SFlex gap={2}>
                <SButton
                  variant="outlined"
                  text="Cancelar"
                  onClick={() => setShowAiDialog(false)}
                />
                <SButton
                  variant="contained"
                  text="Iniciar Análise"
                  loading={isAnalyzing || isLoadingSystemAiPrompt}
                  disabled={isLoadingSystemAiPrompt}
                  onClick={handleSubmit(handleAnalyzeRisks)}
                />
              </SFlex>
            </DialogActions>
          </form>
        </FormProvider>
      </Dialog>
      )}
    </SPaper>
  );
};
