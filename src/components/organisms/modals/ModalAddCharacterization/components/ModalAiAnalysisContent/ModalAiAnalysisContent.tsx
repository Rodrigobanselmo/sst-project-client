import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';

import {
  Alert,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RecommendIcon from '@mui/icons-material/Recommend';
import SourceIcon from '@mui/icons-material/Source';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { AiActionButtonGroup } from '@v2/components/molecules/AiActionButtonGroup/AiActionButtonGroup';
import { buildMasterAiRequestOverrides } from '@v2/components/molecules/AiActionButtonGroup/build-master-ai-request-overrides.util';
import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { SystemAiPromptConfigDialog } from '@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog';

import { useMutateAiAnalyzeCharacterization } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useMutateAiAnalyzeCharacterization';
import {
  DetailedRisk,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { IUseEditCharacterization } from '../../hooks/useEditCharacterization';
import { getCurrentRiskGroupId } from '../../utils/get-current-risk-group-id.util';
import { sortExistingRiskData } from '../../utils/sort-existing-risk-data.util';
import {
  CHARACTERIZATION_AI_ANALYSIS_USES_SAVED_DATA_MESSAGE,
  CHARACTERIZATION_TEXT_INSUFFICIENT_MESSAGE,
  CHARACTERIZATION_UNSAVED_CHANGES_BEFORE_AI_ANALYSIS_MESSAGE,
  isCharacterizationTextInsufficient,
} from './characterization-text-insufficient.util';
import { filterNewAiRiskSuggestions } from './filter-new-ai-risk-suggestions.util';
import { useRiskToolCopyGhoImportFlow } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/hooks/useRiskToolCopyGhoImportFlow';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { useMutUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { useMutCopyHomo } from 'core/services/hooks/mutations/manager/useMutCopyHomo';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { queryClient } from 'core/services/queryClient';

import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { useAccess } from 'core/hooks/useAccess';

const summarizeRiskDataLabels = (
  items: Array<{ name?: string; medName?: string; recName?: string }> | undefined,
  limit = 3,
): string => {
  if (!items?.length) return '';
  const labels = items
    .map((item) => item.name || item.medName || item.recName || '')
    .map((label) => label.trim())
    .filter(Boolean);
  if (!labels.length) return '';
  if (labels.length <= limit) return labels.join(', ');
  return `${labels.slice(0, limit).join(', ')} +${labels.length - limit}`;
};

// Removable Tag Component
interface RemovableTagProps {
  label: string;
  onRemove: () => void;
  onEdit?: (newValue: string) => void;
  editable?: boolean;
}

interface SectionHeaderProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  children,
  variant = 'primary',
  icon,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <Box
      sx={{
        backgroundColor: isPrimary ? 'grey.50' : 'transparent',
        border: isPrimary ? '1px solid' : undefined,
        borderColor: isPrimary ? 'grey.200' : 'transparent',
        px: isPrimary ? 4 : 0,
        mt: isPrimary ? 8 : 0,
        borderRadius: 1,
        mb: isPrimary ? 4 : 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          backgroundColor: isPrimary ? 'grey.50' : 'transparent',
          py: 2,
        }}
      >
        {icon && (
          <Box sx={{ color: isPrimary ? 'grey.600' : 'grey.600' }}>{icon}</Box>
        )}

        <SText
          variant="body2"
          sx={{
            color: isPrimary ? 'grey.700' : 'grey.700',
            fontSize: isPrimary ? '13px' : '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {children}
        </SText>
      </Box>
    </Box>
  );
};

const RemovableTag: React.FC<RemovableTagProps> = ({
  label,
  onRemove,
  onEdit,
  editable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const input = inputRef.current.querySelector('input');
      if (input) {
        input.focus();
        setTimeout(() => {
          input.select();
        }, 0);
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    if (onEdit && editValue.trim() !== label) {
      onEdit(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleClick = () => {
    if (editable && onEdit) {
      setIsEditing(true);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1,
        borderRadius: 1,
        // backgroundColor: isEditing ? 'primary.50' : 'grey.50',
        border: '1px solid',
        borderColor: isEditing ? 'primary.200' : 'grey.200',
        width: '100%',
        mb: 1,
        cursor: editable && onEdit ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: isEditing ? 'primary.50' : 'grey.100',
          borderColor: isEditing ? 'primary.200' : 'grey.300',
        },
      }}
    >
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          p: 0.5,
          minWidth: 'auto',
          width: 24,
          height: 24,
          color: 'grey.500',
          '&:hover': {
            backgroundColor: 'grey.200',
            color: 'grey.700',
          },
        }}
      >
        <CancelOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>

      {isEditing ? (
        <TextField
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          variant="standard"
          size="small"
          sx={{
            flex: 1,
            '& .MuiInput-root': {
              fontSize: '0.875rem',
              '&:before': {
                borderBottom: 'none',
              },
              '&:after': {
                borderBottom: '2px solid',
                borderColor: 'primary.main',
              },
              '&:hover:not(.Mui-disabled):before': {
                borderBottom: 'none',
              },
            },
            '& .MuiInput-input': {
              padding: 0,
              color: 'text.primary',
              lineHeight: 1.4,
            },
          }}
        />
      ) : (
        <SText
          variant="body2"
          onClick={handleClick}
          sx={{
            color: 'text.primary',
            fontSize: '0.875rem',
            flex: 1,
            wordBreak: 'break-word',
            lineHeight: 1.4,
            cursor: editable && onEdit ? 'pointer' : 'default',
            '&:hover':
              editable && onEdit
                ? {
                    color: 'primary.main',
                  }
                : {},
          }}
        >
          {label}
        </SText>
      )}
    </Box>
  );
};

export const ModalAiAnalysisContent = (props: IUseEditCharacterization) => {
  const { data: characterizationData, hasUnsavedChanges, aiRiskAnalysis } =
    props;
  const {
    visibleSuggestions,
    addedRiskIdsSet,
    modifiedRisks,
    setModifiedRisks,
    userGuidance,
    setUserGuidance,
    hasVisibleSuggestions,
    mergeIncomingSuggestions,
    markRiskAdded,
    dismissSuggestion,
    expandedSuggestionIdsSet,
    setSuggestionExpanded,
    expandAllSuggestions,
    collapseAllSuggestions,
  } = aiRiskAnalysis;
  const { isMaster } = useAccess();
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});

  const hasInsufficientCharacterizationText = useMemo(
    () => isCharacterizationTextInsufficient(characterizationData),
    [characterizationData],
  );

  const aiAnalyzeMutation = useMutateAiAnalyzeCharacterization();
  const upsertRiskDataMutation = useMutUpsertRiskData();
  const copyHomoMutation = useMutCopyHomo();
  const { companyId: contextCompanyId } = useGetCompanyId();
  const { data: riskGroupData } = useQueryRiskGroupData(
    characterizationData.companyId || undefined,
  );
  const riskGroupId = useMemo(
    () => getCurrentRiskGroupId(riskGroupData),
    [riskGroupData],
  );
  const {
    data: existingRiskData = [],
    refetch: refetchExistingRiskData,
  } = useQueryRiskDataByGho(riskGroupId || '', characterizationData.id || '');

  const refreshExistingRisksAfterImport = useCallback(async () => {
    const companyIdForQuery =
      characterizationData.companyId || contextCompanyId;

    await queryClient.invalidateQueries([
      QueryEnum.RISK_DATA,
      companyIdForQuery,
    ]);

    if (riskGroupId && characterizationData.id) {
      await queryClient.invalidateQueries([
        QueryEnum.RISK_DATA,
        companyIdForQuery,
        riskGroupId,
        characterizationData.id,
      ]);
    }

    await refetchExistingRiskData();
  }, [
    characterizationData.companyId,
    characterizationData.id,
    contextCompanyId,
    refetchExistingRiskData,
    riskGroupId,
  ]);

  const importCopyHomoMutationRef = useRef(copyHomoMutation);
  importCopyHomoMutationRef.current = copyHomoMutation;

  const importCopyHomoMutation = useMemo(
    () =>
      ({
        get isLoading() {
          return importCopyHomoMutationRef.current.isLoading;
        },
        mutateAsync: async (
          variables: Parameters<typeof copyHomoMutation.mutateAsync>[0],
        ) => {
          const result =
            await importCopyHomoMutationRef.current.mutateAsync(variables);
          await refreshExistingRisksAfterImport();
          return result;
        },
      }) as typeof copyHomoMutation,
    [refreshExistingRisksAfterImport],
  );

  const { handleCopyGHO, loadingCopy } = useRiskToolCopyGhoImportFlow(
    riskGroupId || '',
    importCopyHomoMutation,
    {
      defaultWorkspaceId: characterizationData.workspaceId || undefined,
    },
  );

  const canImportRisks = Boolean(characterizationData.id && riskGroupId);

  const handleImportRisks = () => {
    if (!canImportRisks) return;

    handleCopyGHO({
      id: characterizationData.id,
      name: characterizationData.name || 'Caracterização atual',
    } as IGho);
  };

  const sortedExistingRiskData = useMemo(
    () => sortExistingRiskData(existingRiskData),
    [existingRiskData],
  );

  const existingRiskIds = useMemo(
    () =>
      new Set(
        sortedExistingRiskData.map((risk) => risk.riskId).filter(Boolean),
      ),
    [sortedExistingRiskData],
  );

  const suggestedExistingRiskIds = useMemo(
    () =>
      new Set(
        visibleSuggestions
          .map((risk) => risk.id)
          .filter((riskId) => existingRiskIds.has(riskId)),
      ),
    [existingRiskIds, visibleSuggestions],
  );

  const newRiskSuggestions = useMemo(
    () =>
      filterNewAiRiskSuggestions({
        suggestions: visibleSuggestions,
        existingRiskIds,
        addedRiskIds: addedRiskIdsSet,
      }),
    [addedRiskIdsSet, existingRiskIds, visibleSuggestions],
  );

  const sessionAddedNotYetInGse = useMemo(
    () =>
      visibleSuggestions.filter(
        (risk) =>
          addedRiskIdsSet.has(risk.id) && !existingRiskIds.has(risk.id),
      ),
    [addedRiskIdsSet, existingRiskIds, visibleSuggestions],
  );

  const newRiskSuggestionIds = useMemo(
    () => newRiskSuggestions.map((risk) => risk.id),
    [newRiskSuggestions],
  );

  const handleAnalyze = async () => {
    if (
      !characterizationData.id ||
      !characterizationData.companyId ||
      !characterizationData.workspaceId
    ) {
      return;
    }

    const masterOverrides = buildMasterAiRequestOverrides(isMaster, aiMasterConfig);

    const result = await aiAnalyzeMutation.mutateAsync({
      companyId: characterizationData.companyId,
      workspaceId: characterizationData.workspaceId,
      characterizationId: characterizationData.id,
      userGuidance: userGuidance.trim() || undefined,
      customPrompt: masterOverrides.customPrompt,
      model: masterOverrides.model,
    });

    mergeIncomingSuggestions(result.detailedRisks);
  };

  // Helper functions for removing items from risk measures
  const removeExistingEngineeringMeasure = (
    riskId: string,
    measureIndex: number,
  ) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      const updatedMeasures = [...currentRisk.existingEngineeringMeasures];
      updatedMeasures.splice(measureIndex, 1);

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          existingEngineeringMeasures: updatedMeasures,
        },
      };
    });
  };

  const removeExistingAdministrativeMeasure = (
    riskId: string,
    measureIndex: number,
  ) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      const updatedMeasures = [...currentRisk.existingAdministrativeMeasures];
      updatedMeasures.splice(measureIndex, 1);

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          existingAdministrativeMeasures: updatedMeasures,
        },
      };
    });
  };

  const removeRecommendedEngineeringMeasure = (
    riskId: string,
    measureIndex: number,
  ) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      const updatedMeasures = [...currentRisk.recommendedEngineeringMeasures];
      updatedMeasures.splice(measureIndex, 1);

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          recommendedEngineeringMeasures: updatedMeasures,
        },
      };
    });
  };

  const removeRecommendedAdministrativeMeasure = (
    riskId: string,
    measureIndex: number,
  ) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      const updatedMeasures = [
        ...currentRisk.recommendedAdministrativeMeasures,
      ];
      updatedMeasures.splice(measureIndex, 1);

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          recommendedAdministrativeMeasures: updatedMeasures,
        },
      };
    });
  };

  const removeGenerateSource = (riskId: string) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          generateSource: '',
        },
      };
    });
  };

  // Helper functions for editing items
  const editGenerateSource = (riskId: string, newValue: string) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          generateSource: newValue,
        },
      };
    });
  };

  const editExistingEngineeringMeasure = (
    riskId: string,
    measureIndex: number,
    newValue: string,
  ) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      const updatedMeasures = [...currentRisk.existingEngineeringMeasures];
      updatedMeasures[measureIndex] = newValue;

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          existingEngineeringMeasures: updatedMeasures,
        },
      };
    });
  };

  const editExistingAdministrativeMeasure = (
    riskId: string,
    measureIndex: number,
    newValue: string,
  ) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      const updatedMeasures = [...currentRisk.existingAdministrativeMeasures];
      updatedMeasures[measureIndex] = newValue;

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          existingAdministrativeMeasures: updatedMeasures,
        },
      };
    });
  };

  const editRecommendedEngineeringMeasure = (
    riskId: string,
    measureIndex: number,
    newValue: string,
  ) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      const updatedMeasures = [...currentRisk.recommendedEngineeringMeasures];
      updatedMeasures[measureIndex] = newValue;

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          recommendedEngineeringMeasures: updatedMeasures,
        },
      };
    });
  };

  const editRecommendedAdministrativeMeasure = (
    riskId: string,
    measureIndex: number,
    newValue: string,
  ) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      const updatedMeasures = [
        ...currentRisk.recommendedAdministrativeMeasures,
      ];
      updatedMeasures[measureIndex] = newValue;

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          recommendedAdministrativeMeasures: updatedMeasures,
        },
      };
    });
  };

  const editProbability = (riskId: string, newProbability: number) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        visibleSuggestions.find((r) => r.id === riskId);
      if (!currentRisk) return prev;

      return {
        ...prev,
        [riskId]: {
          ...currentRisk,
          probability: newProbability,
        },
      };
    });
  };

  // Get the current risk data (modified or original)
  const getCurrentRisk = (riskId: string): DetailedRisk | undefined => {
    return (
      modifiedRisks[riskId] ||
      visibleSuggestions.find((r) => r.id === riskId)
    );
  };

  // Handle accordion expansion/collapse for AI suggestions
  const handleAccordionChange =
    (riskId: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setSuggestionExpanded(riskId, isExpanded);
    };

  // Convert risk type string to RiskTypeEnum
  const mapRiskTypeToEnum = (type: string): RiskTypeEnum => {
    const typeUpper = type.toUpperCase();
    if (Object.values(RiskTypeEnum).includes(typeUpper as RiskTypeEnum)) {
      return typeUpper as RiskTypeEnum;
    }
    return RiskTypeEnum.OUTROS;
  };

  // Get probability color based on scale
  const getProbabilityColor = (probability: number): string => {
    const scale = {
      low: '#3cbe7d',
      mediumLow: '#8fa728',
      medium: '#d9d10b',
      mediumHigh: '#d96c2f',
      high: '#F44336',
    };

    if (probability <= 1) return scale.low;
    if (probability <= 2) return scale.mediumLow;
    if (probability <= 3) return scale.medium;
    if (probability <= 4) return scale.mediumHigh;
    return scale.high;
  };

  const handleAddRiskAsRiskData = async (originalRisk: DetailedRisk) => {
    try {
      // Use the current (possibly modified) risk data
      const risk = getCurrentRisk(originalRisk.id) || originalRisk;

      if (!riskGroupId) {
        console.error('No risk group found');
        return;
      }

      if (existingRiskIds.has(risk.id)) {
        console.warn('Risk already linked to GSE; skipping create as new');
        markRiskAdded(risk.id);
        return;
      }

      // Use the AI risk data directly since risks are assumed to exist

      // Create the risk data with all the information using AI risk
      await upsertRiskDataMutation.mutateAsync({
        riskFactorGroupDataId: riskGroupId,
        riskId: risk.id,
        homogeneousGroupId: characterizationData.id,
        companyId: characterizationData.companyId,
        workspaceId: characterizationData.workspaceId,
        probability: risk.probability,
        generateSourcesAddOnly: risk.generateSource
          ? [
              {
                name: risk.generateSource,
                companyId: characterizationData.companyId,
              },
            ]
          : [],
        engsAddOnly: risk.existingEngineeringMeasures.map((rec) => ({
          medName: rec,
          medType: MedTypeEnum.ENG,
          companyId: characterizationData.companyId,
        })),
        admsAddOnly: risk.existingAdministrativeMeasures.map((adm) => ({
          medName: adm,
          medType: MedTypeEnum.ADM,
          companyId: characterizationData.companyId,
        })),
        recAddOnly: [
          ...risk.recommendedAdministrativeMeasures
            .map((adm) => adm?.trim())
            .filter((adm): adm is string => !!adm)
            .map((adm) => ({
              recName: adm,
              companyId: characterizationData.companyId,
              recType: RecTypeEnum.ADM,
            })),
          ...risk.recommendedEngineeringMeasures
            .map((rec) => rec?.trim())
            .filter((rec): rec is string => !!rec)
            .map((rec) => ({
              recName: rec,
              recType: RecTypeEnum.ENG,
              companyId: characterizationData.companyId,
            })),
        ],
      });

      // Mark risk as added
      markRiskAdded(risk.id);
      setSuggestionExpanded(risk.id, false);
      console.log('Risk data created successfully with risk:', risk.name);
    } catch (error) {
      console.error('Error creating risk data:', error);
    }
  };

  const isDisabled = !characterizationData.id;

  return (
    <Box sx={{ px: 5, pb: 10 }}>
        <SFlex direction="column" gap={4}>
          <SText variant="h6" color="text.primary">
            Análise IA de Riscos
          </SText>
          <SText variant="body2" color="text.secondary">
            Sugere fatores de risco, fontes geradoras, controles existentes e
            recomendações com base na caracterização já preenchida. Para gerar
            descrição, processos e considerações, use o Assistente IA na aba
            Dados.
          </SText>

          {isDisabled ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 8,
              }}
            >
              <SText variant="body1" textAlign="center" color="text.secondary">
                Salve a caracterização primeiro para utilizar a análise de IA
              </SText>
            </Box>
          ) : (
            <>
              <Alert severity="info">
                {CHARACTERIZATION_AI_ANALYSIS_USES_SAVED_DATA_MESSAGE}
              </Alert>

              {hasUnsavedChanges && (
                <Alert severity="warning">
                  {CHARACTERIZATION_UNSAVED_CHANGES_BEFORE_AI_ANALYSIS_MESSAGE}
                </Alert>
              )}

              {hasInsufficientCharacterizationText && (
                <Alert severity="warning">
                  {CHARACTERIZATION_TEXT_INSUFFICIENT_MESSAGE}
                </Alert>
              )}

              <TextField
                label="Orientações adicionais para análise de riscos"
                placeholder="Ex.: avaliar queda ao mar, ruído, movimentação de cargas, trabalho em altura, intempéries..."
                value={userGuidance}
                onChange={(event) => setUserGuidance(event.target.value)}
                multiline
                minRows={3}
                fullWidth
                size="small"
              />

              <Box>
                <AiActionButtonGroup
                  variant="s-button-contained"
                  label={
                    hasVisibleSuggestions
                      ? 'Adicionar mais sugestões com IA'
                      : 'Analisar riscos com IA'
                  }
                  loading={aiAnalyzeMutation.isPending}
                  disabled={aiAnalyzeMutation.isPending}
                  onExecute={() => void handleAnalyze()}
                  onConfigure={() => setAiConfigDialogOpen(true)}
                  isMaster={isMaster}
                  sButtonProps={{
                    color: 'primary',
                    buttonProps: { sx: { alignSelf: 'flex-start' } },
                  }}
                />
              </Box>

              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 3,
                  backgroundColor: 'background.paper',
                  mt: 1,
                }}
              >
                <SFlex direction="column" gap={2}>
                  <SFlex
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={2}
                    sx={{ flexWrap: 'wrap' }}
                  >
                    <SText variant="subtitle2" color="text.primary">
                      Riscos já caracterizados no GSE
                    </SText>
                    <SButton
                      text="Importar riscos"
                      variant="outlined"
                      color="primary"
                      size="s"
                      loading={loadingCopy}
                      disabled={!canImportRisks || loadingCopy}
                      onClick={handleImportRisks}
                      buttonProps={{
                        sx: { alignSelf: 'flex-start', minWidth: 'auto' },
                      }}
                    />
                  </SFlex>
                  <SText variant="body2" color="text.secondary">
                    A lista abaixo mostra riscos já vinculados ao GSE. A IA não
                    os adicionará novamente como novos riscos. Use “Importar
                    riscos” para trazer riscos de outra origem antes de rodar a
                    IA.
                  </SText>

                  {!riskGroupId ? (
                    <SText variant="body2" color="text.secondary">
                      Nenhum inventário/grupo de risco disponível para carregar
                      os riscos cadastrados.
                    </SText>
                  ) : sortedExistingRiskData.length === 0 &&
                    sessionAddedNotYetInGse.length === 0 ? (
                    <SText variant="body2" color="text.secondary">
                      Nenhum risco vinculado a este GSE neste inventário.
                    </SText>
                  ) : (
                    <SFlex direction="column" gap={1}>
                      {sessionAddedNotYetInGse.map((risk) => (
                        <Accordion
                          key={`session-added-${risk.id}`}
                          disableGutters
                          sx={{
                            border: '1px solid',
                            borderColor: 'success.main',
                            borderRadius: 1,
                            '&:before': { display: 'none' },
                            boxShadow: 'none',
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <SFlex
                              direction="row"
                              alignItems="center"
                              gap={2}
                              sx={{ width: '100%', pr: 1 }}
                            >
                              <SFlex
                                direction="row"
                                alignItems="center"
                                gap={1}
                                sx={{ flex: 1, minWidth: 0 }}
                              >
                                {risk.type && (
                                  <SRiskChip
                                    type={risk.type as unknown as RiskTypeEnum}
                                  />
                                )}
                                <SText variant="body2" color="text.primary">
                                  {risk.name}
                                </SText>
                              </SFlex>
                              <Chip
                                size="small"
                                label="Já caracterizado"
                                color="default"
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label="Adicionado nesta sessão"
                                color="success"
                                variant="outlined"
                              />
                            </SFlex>
                          </AccordionSummary>
                          <AccordionDetails>
                            <SText variant="caption" color="text.secondary">
                              Risco adicionado nesta sessão. A lista do GSE será
                              atualizada após a sincronização.
                            </SText>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                      {sortedExistingRiskData.map((riskData: IRiskData) => {
                        const riskName =
                          riskData.riskFactor?.name || 'Risco sem nome';
                        const riskType = riskData.riskFactor?.type;
                        const generateSourcesLabel = summarizeRiskDataLabels(
                          riskData.generateSources,
                        );
                        const controlsLabel = summarizeRiskDataLabels([
                          ...(riskData.engs || []),
                          ...(riskData.adms || []),
                        ]);
                        const recommendationsLabel = summarizeRiskDataLabels(
                          riskData.recs,
                        );
                        const alsoSuggestedByAi = suggestedExistingRiskIds.has(
                          riskData.riskId,
                        );
                        const addedInSession = addedRiskIdsSet.has(
                          riskData.riskId,
                        );

                        return (
                          <Accordion
                            key={riskData.id}
                            disableGutters
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              '&:before': { display: 'none' },
                              boxShadow: 'none',
                            }}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <SFlex
                                direction="row"
                                alignItems="center"
                                gap={2}
                                sx={{ width: '100%', pr: 1 }}
                              >
                                <SFlex
                                  direction="row"
                                  alignItems="center"
                                  gap={1}
                                  sx={{ flex: 1, minWidth: 0 }}
                                >
                                  {riskType && (
                                    <SRiskChip
                                      type={riskType as unknown as RiskTypeEnum}
                                    />
                                  )}
                                  <SText
                                    variant="body2"
                                    color="text.primary"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {riskName}
                                  </SText>
                                </SFlex>
                                <Chip
                                  size="small"
                                  label="Já caracterizado"
                                  color="default"
                                  variant="outlined"
                                />
                                {addedInSession && (
                                  <Chip
                                    size="small"
                                    label="Adicionado nesta sessão"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                              </SFlex>
                            </AccordionSummary>
                            <AccordionDetails>
                              <SFlex direction="column" gap={1}>
                                {alsoSuggestedByAi && (
                                  <Alert severity="info" sx={{ py: 0.5 }}>
                                    A IA também sugeriu este risco, mas ele já
                                    está cadastrado.
                                  </Alert>
                                )}
                                {typeof riskData.probability === 'number' && (
                                  <SText variant="caption" color="text.secondary">
                                    <strong>Probabilidade:</strong>{' '}
                                    {riskData.probability}
                                  </SText>
                                )}
                                {generateSourcesLabel && (
                                  <SText variant="caption" color="text.secondary">
                                    <strong>Fonte geradora:</strong>{' '}
                                    {generateSourcesLabel}
                                  </SText>
                                )}
                                {controlsLabel && (
                                  <SText variant="caption" color="text.secondary">
                                    <strong>Controles existentes:</strong>{' '}
                                    {controlsLabel}
                                  </SText>
                                )}
                                {recommendationsLabel && (
                                  <SText variant="caption" color="text.secondary">
                                    <strong>Recomendações:</strong>{' '}
                                    {recommendationsLabel}
                                  </SText>
                                )}
                                {!generateSourcesLabel &&
                                  !controlsLabel &&
                                  !recommendationsLabel &&
                                  typeof riskData.probability !== 'number' && (
                                    <SText
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Sem detalhes adicionais disponíveis neste
                                      resumo.
                                    </SText>
                                  )}
                              </SFlex>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </SFlex>
                  )}
                </SFlex>
              </Box>

              {newRiskSuggestions.length > 0 && (
                <Box
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 3,
                    backgroundColor: 'background.paper',
                    mt: 3,
                  }}
                >
                  <SFlex direction="column" gap={3}>
                    <SFlex
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={2}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      <SText variant="subtitle2" color="text.primary">
                        Novos riscos sugeridos pela IA
                      </SText>
                      <SFlex direction="row" gap={1}>
                        <SButton
                          text="Expandir todos"
                          variant="outlined"
                          color="primary"
                          size="s"
                          onClick={() =>
                            expandAllSuggestions(newRiskSuggestionIds)
                          }
                          buttonProps={{ sx: { minWidth: 'auto' } }}
                        />
                        <SButton
                          text="Recolher todos"
                          variant="outlined"
                          color="primary"
                          size="s"
                          onClick={() =>
                            collapseAllSuggestions(newRiskSuggestionIds)
                          }
                          buttonProps={{ sx: { minWidth: 'auto' } }}
                        />
                      </SFlex>
                    </SFlex>

                    {hasInsufficientCharacterizationText && (
                      <Alert severity="warning">
                        {CHARACTERIZATION_TEXT_INSUFFICIENT_MESSAGE}
                      </Alert>
                    )}

                    {/* Detailed Risks */}
                    {newRiskSuggestions.length > 0 && (
                      <Box>
                        <SText variant="body1" color="text.primary" mb={2}>
                          <strong>Detalhes dos Riscos:</strong>
                        </SText>
                        <SFlex direction="column" gap={2}>
                          {newRiskSuggestions.map((originalRisk) => {
                            const isAdded = addedRiskIdsSet.has(originalRisk.id);
                            const risk =
                              getCurrentRisk(originalRisk.id) || originalRisk;
                            return (
                              <Accordion
                                key={risk.id}
                                expanded={expandedSuggestionIdsSet.has(risk.id)}
                                onChange={handleAccordionChange(risk.id)}
                                sx={{
                                  border: '1px solid',
                                  borderColor: isAdded
                                    ? 'success.main'
                                    : 'divider',
                                  borderRadius: 1,
                                  mb: 2,
                                  '&:before': { display: 'none' },
                                  boxShadow: isAdded
                                    ? '0 2px 8px rgba(76, 175, 80, 0.2)'
                                    : 1,
                                }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  sx={{
                                    backgroundColor: 'background.paper',
                                    '&.Mui-expanded': {
                                      minHeight: 48,
                                    },
                                    '& .MuiAccordionSummary-content': {
                                      margin: '12px 0',
                                    },
                                  }}
                                >
                                  <SFlex
                                    direction="row"
                                    alignItems="center"
                                    gap={2}
                                    sx={{ width: '100%' }}
                                  >
                                    <SFlex
                                      direction="row"
                                      alignItems="flex-start"
                                      gap={2}
                                      sx={{ flex: 1 }}
                                    >
                                      {isAdded && (
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            backgroundColor: 'success.main',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                          }}
                                        >
                                          ✓
                                        </Box>
                                      )}
                                      <SRiskChip
                                        type={mapRiskTypeToEnum(risk.type)}
                                        size="lg"
                                      />
                                      <SText
                                        variant="subtitle2"
                                        sx={{ fontWeight: isAdded ? 600 : 500 }}
                                      >
                                        {risk.name}
                                      </SText>
                                    </SFlex>
                                    <SButton
                                      text="Remover da lista"
                                      variant="shade"
                                      color="danger"
                                      size="s"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dismissSuggestion(originalRisk.id);
                                      }}
                                      buttonProps={{
                                        sx: {
                                          minWidth: 'auto',
                                          px: 2,
                                          py: 0.5,
                                          mr: 1,
                                          fontSize: '0.75rem',
                                        },
                                      }}
                                    />
                                    <SButton
                                      text={
                                        isAdded
                                          ? '✓ Adicionado'
                                          : 'Adicionar Risco'
                                      }
                                      variant={isAdded ? 'contained' : 'shade'}
                                      color={isAdded ? 'success' : 'success'}
                                      size="s"
                                      disabled={isAdded}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddRiskAsRiskData(originalRisk);
                                      }}
                                      buttonProps={{
                                        sx: {
                                          minWidth: 'auto',
                                          px: 2,
                                          py: 0.5,
                                          mr: 5,
                                          fontSize: '0.75rem',
                                        },
                                      }}
                                    />
                                  </SFlex>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <SFlex direction="column" gap={2}>
                                    <Box>
                                      <SText
                                        variant="body2"
                                        color="text.primary"
                                      >
                                        <strong>Explicação:</strong>
                                      </SText>
                                      <SText
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {risk.explanation}
                                      </SText>
                                      <SText
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                          fontStyle: 'italic',
                                          fontSize: '0.8rem',
                                          mt: 1,
                                          opacity: 0.8,
                                        }}
                                      >
                                        *A IA tem{' '}
                                        {Math.round(risk.confidence * 100)}% de
                                        confiança nesta análise.
                                      </SText>
                                    </Box>

                                    {/* Probability Section */}
                                    <Box>
                                      <SectionHeader
                                        variant="primary"
                                        icon={
                                          <AssessmentIcon
                                            sx={{ fontSize: 18 }}
                                          />
                                        }
                                      >
                                        Probabilidade
                                      </SectionHeader>
                                      <SFlex
                                        direction="row"
                                        alignItems="center"
                                        gap={2}
                                        sx={{ mt: 1 }}
                                      >
                                        {/* Probability Scale Circles */}
                                        <SFlex direction="row" gap={0.5}>
                                          {[1, 2, 3, 4, 5].map((level) => (
                                            <Box
                                              key={level}
                                              onClick={() =>
                                                editProbability(risk.id, level)
                                              }
                                              sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                backgroundColor:
                                                  risk.probability == level
                                                    ? getProbabilityColor(level)
                                                    : 'grey.200',
                                                border: '2px solid',
                                                borderColor:
                                                  risk.probability == level
                                                    ? getProbabilityColor(level)
                                                    : 'grey.300',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color:
                                                  risk.probability == level
                                                    ? 'white'
                                                    : 'grey.500',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                  transform: 'scale(1.1)',
                                                  boxShadow: 2,
                                                },
                                              }}
                                            >
                                              {level}
                                            </Box>
                                          ))}
                                        </SFlex>
                                      </SFlex>
                                    </Box>
                                    {risk.generateSource && (
                                      <Box>
                                        <SectionHeader
                                          variant="primary"
                                          icon={
                                            <SourceIcon sx={{ fontSize: 15 }} />
                                          }
                                        >
                                          Fonte Geradora
                                        </SectionHeader>
                                        <RemovableTag
                                          label={risk.generateSource}
                                          onRemove={() =>
                                            removeGenerateSource(risk.id)
                                          }
                                          onEdit={(newValue) =>
                                            editGenerateSource(
                                              risk.id,
                                              newValue,
                                            )
                                          }
                                        />
                                      </Box>
                                    )}

                                    {(risk.existingEngineeringMeasures.length >
                                      0 ||
                                      risk.existingAdministrativeMeasures
                                        .length > 0) && (
                                      <>
                                        <Box>
                                          <SectionHeader
                                            variant="primary"
                                            icon={
                                              <AdminPanelSettingsIcon
                                                sx={{ fontSize: 15 }}
                                              />
                                            }
                                          >
                                            Controles Existentes
                                          </SectionHeader>
                                          {risk.existingEngineeringMeasures
                                            .length > 0 && (
                                            <Box mb={4}>
                                              <SectionHeader variant="secondary">
                                                Medidas de Engenharia
                                              </SectionHeader>
                                              <SFlex direction="column" gap={2}>
                                                {risk.existingEngineeringMeasures.map(
                                                  (
                                                    measure: string,
                                                    idx: number,
                                                  ) => (
                                                    <RemovableTag
                                                      key={idx}
                                                      label={measure}
                                                      onRemove={() =>
                                                        removeExistingEngineeringMeasure(
                                                          risk.id,
                                                          idx,
                                                        )
                                                      }
                                                      onEdit={(newValue) =>
                                                        editExistingEngineeringMeasure(
                                                          risk.id,
                                                          idx,
                                                          newValue,
                                                        )
                                                      }
                                                    />
                                                  ),
                                                )}
                                              </SFlex>
                                            </Box>
                                          )}
                                          {risk.existingAdministrativeMeasures
                                            .length > 0 && (
                                            <Box mb={4}>
                                              <SectionHeader variant="secondary">
                                                Medidas Administrativas
                                              </SectionHeader>
                                              <SFlex direction="column" gap={2}>
                                                {risk.existingAdministrativeMeasures.map(
                                                  (
                                                    measure: string,
                                                    idx: number,
                                                  ) => (
                                                    <RemovableTag
                                                      key={idx}
                                                      label={measure}
                                                      onRemove={() =>
                                                        removeExistingAdministrativeMeasure(
                                                          risk.id,
                                                          idx,
                                                        )
                                                      }
                                                      onEdit={(newValue) =>
                                                        editExistingAdministrativeMeasure(
                                                          risk.id,
                                                          idx,
                                                          newValue,
                                                        )
                                                      }
                                                    />
                                                  ),
                                                )}
                                              </SFlex>
                                            </Box>
                                          )}
                                        </Box>
                                      </>
                                    )}

                                    {(risk.recommendedEngineeringMeasures
                                      .length > 0 ||
                                      risk.recommendedAdministrativeMeasures
                                        .length > 0) && (
                                      <>
                                        <Box>
                                          <SectionHeader
                                            variant="primary"
                                            icon={
                                              <RecommendIcon
                                                sx={{ fontSize: 15 }}
                                              />
                                            }
                                          >
                                            Medidas Recomendadas
                                          </SectionHeader>

                                          {risk.recommendedEngineeringMeasures
                                            .length > 0 && (
                                            <Box mb={2}>
                                              <SectionHeader variant="secondary">
                                                Medidas de Engenharia
                                              </SectionHeader>
                                              <SFlex direction="column" gap={2}>
                                                {risk.recommendedEngineeringMeasures.map(
                                                  (
                                                    measure: string,
                                                    idx: number,
                                                  ) => (
                                                    <RemovableTag
                                                      key={idx}
                                                      label={measure}
                                                      onRemove={() =>
                                                        removeRecommendedEngineeringMeasure(
                                                          risk.id,
                                                          idx,
                                                        )
                                                      }
                                                      onEdit={(newValue) =>
                                                        editRecommendedEngineeringMeasure(
                                                          risk.id,
                                                          idx,
                                                          newValue,
                                                        )
                                                      }
                                                    />
                                                  ),
                                                )}
                                              </SFlex>
                                            </Box>
                                          )}
                                          {risk
                                            .recommendedAdministrativeMeasures
                                            .length > 0 && (
                                            <Box mb={2}>
                                              <SectionHeader variant="secondary">
                                                Medidas Administrativas
                                              </SectionHeader>
                                              <SFlex direction="column" gap={2}>
                                                {risk.recommendedAdministrativeMeasures.map(
                                                  (
                                                    measure: string,
                                                    idx: number,
                                                  ) => (
                                                    <RemovableTag
                                                      key={idx}
                                                      label={measure}
                                                      onRemove={() =>
                                                        removeRecommendedAdministrativeMeasure(
                                                          risk.id,
                                                          idx,
                                                        )
                                                      }
                                                      onEdit={(newValue) =>
                                                        editRecommendedAdministrativeMeasure(
                                                          risk.id,
                                                          idx,
                                                          newValue,
                                                        )
                                                      }
                                                    />
                                                  ),
                                                )}
                                              </SFlex>
                                            </Box>
                                          )}
                                        </Box>
                                      </>
                                    )}
                                  </SFlex>
                                </AccordionDetails>
                              </Accordion>
                            );
                          })}
                        </SFlex>
                      </Box>
                    )}

                    {/* Characterization Info */}
                    <Box
                      sx={{
                        border: '1px solid #f0f0f0',
                        borderRadius: 1,
                        p: 2,
                        backgroundColor: 'grey.50',
                      }}
                    >
                      <SText variant="caption" color="text.secondary">
                        <strong>Caracterização Analisada:</strong>{' '}
                        {characterizationData.name}
                      </SText>
                      <SText
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.5}
                      >
                        <strong>Tipo:</strong>{' '}
                        {characterizationData.type}
                      </SText>
                    </Box>
                  </SFlex>
                </Box>
              )}

              {characterizationData.name && (
                <Box
                  sx={{
                    border: '1px solid #f0f0f0',
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: 'grey.50',
                  }}
                >
                  <SText variant="caption" color="text.secondary">
                    <strong>Caracterização:</strong> {characterizationData.name}
                  </SText>
                  {characterizationData.description && (
                    <SText
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mt={1}
                    >
                      <strong>Descrição:</strong>{' '}
                      {characterizationData.description}
                    </SText>
                  )}
                </Box>
              )}
            </>
          )}
        </SFlex>

        {isMaster && (
          <SystemAiPromptConfigDialog
            open={aiConfigDialogOpen}
            onClose={() => setAiConfigDialogOpen(false)}
            onApply={setAiMasterConfig}
            title="Configurar Análise IA de Riscos"
            description="Configuração válida apenas para esta sessão. Esta análise usa a caracterização textual já preenchida e sugere apenas riscos."
            promptLabel="Prompt personalizado (opcional)"
            showSaveDefault={false}
            showRestoreDefault={false}
            promptMinRows={4}
            promptMaxRows={8}
          />
        )}
      </Box>
  );
};
