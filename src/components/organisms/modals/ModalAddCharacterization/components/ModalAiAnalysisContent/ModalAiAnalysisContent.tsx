import React, { useState, useRef, useEffect } from 'react';

import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RecommendIcon from '@mui/icons-material/Recommend';
import SourceIcon from '@mui/icons-material/Source';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';

import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSelectForm } from '@v2/components/forms/controlled/SSelectForm/SSelectForm';
import { useForm, FormProvider } from 'react-hook-form';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { TypeInputModal } from 'components/organisms/modals/ModalSingleInput';
import { ParagraphSelect } from 'components/organisms/tagSelects/ParagraphSelect';
import { ParagraphEnum } from 'project/enum/paragraph.enum';

import { useMutateAiAnalyzeCharacterization } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useMutateAiAnalyzeCharacterization';
import {
  Result,
  DetailedRisk,
  WorkProcessItem,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { IUseEditCharacterization } from '../../hooks/useEditCharacterization';
import { useMutUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { useAccess } from 'core/hooks/useAccess';
import { IdsEnum } from 'core/enums/ids.enums';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';

interface AiAnalysisFormData {
  customPrompt?: string;
  model?: {
    label: string;
    value: string;
  };
}

const AI_MODEL_OPTIONS = [
  { label: 'GPT-5 (Premium) - $0.625/$5.00', value: 'gpt-5' },
  { label: 'GPT-5 Mini (Balanceado) - $0.125/$1.00', value: 'gpt-5-mini' },
  { label: 'GPT-5 Nano (Ultra Rápido) - $0.025/$0.20', value: 'gpt-5-nano' },
  { label: 'GPT-4.1 (Avançado) - $1.00/$4.00', value: 'gpt-4.1' },
  { label: 'GPT-4.1 Mini (Eficiente) - $0.20/$0.80', value: 'gpt-4.1-mini' },
  { label: 'GPT-4.1 Nano (Econômico) - $0.05/$0.20', value: 'gpt-4.1-nano' },
  { label: 'GPT-4o (Padrão) - $1.25/$5.00', value: 'gpt-4o' },
  {
    label: 'GPT-4o 2024-05-13 (Versão Específica) - $2.50/$7.50',
    value: 'gpt-4o-2024-05-13',
  },
  { label: 'GPT-4o Mini (Rápido) - $0.075/$0.30', value: 'gpt-4o-mini' },
  { label: 'O1 Mini (Raciocínio Rápido) - $0.55/$2.20', value: 'o1-mini' },
  { label: 'O3 Mini (Análise Rápida) - $0.55/$2.20', value: 'o3-mini' },
  { label: 'O4 Mini (Nova Geração) - $0.55/$2.20', value: 'o4-mini' },
  {
    label: 'O4 Mini Deep Research (Pesquisa Nova Geração) - $1.00/$4.00',
    value: 'o4-mini-deep-research',
  },

  // { label: 'O3 Pro (Pesquisa Avançada) - $10.00/$40.00', value: 'o3-pro' },
  // { label: 'O3 (Análise Profunda) - $1.00/$4.00', value: 'o3' },
  // { label: 'O3 Deep Research (Pesquisa Especializada) - $5.00/$20.00', value: 'o3-deep-research', },
  // { label: 'GPT-5 Pro (Máxima Performance) - $7.50/$60.00', value: 'gpt-5-pro' },
  // { label: 'O1 (Raciocínio Avançado) - $7.50/$30.00', value: 'o1' },
  // { label: 'O1 Pro (Raciocínio Premium) - $75.00/$300.00', value: 'o1-pro' },
];

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
  const { data: characterizationData, onAddArray, onClose } = props;
  const methods = useForm<AiAnalysisFormData>();
  const { handleSubmit } = methods;
  const { isMaster } = useAccess();

  const [analysisResult, setAnalysisResult] = useState<Result | null>(null);
  const [addedRisks, setAddedRisks] = useState<Set<string>>(new Set());
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(
    new Set(),
  );

  // State to track modified risks (for removable tags)
  const [modifiedRisks, setModifiedRisks] = useState<
    Record<string, DetailedRisk>
  >({});

  // State to track modified work process items
  const [workProcessItems, setWorkProcessItems] = useState<WorkProcessItem[]>(
    [],
  );

  // State to track saved items
  const [savedDescription, setSavedDescription] = useState(false);
  const [savedWorkProcess, setSavedWorkProcess] = useState(false);

  // State to track description editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  // Initialize work process items when analysis result changes
  useEffect(() => {
    if (analysisResult?.workProcess) {
      setWorkProcessItems(analysisResult.workProcess);
    }
    if (analysisResult?.description) {
      setEditedDescription(analysisResult.description);
    }
    // Initialize all accordions as expanded when new analysis result comes in
    if (analysisResult?.detailedRisks) {
      setExpandedAccordions(
        new Set(analysisResult.detailedRisks.map((risk) => risk.id)),
      );
    }
    // Reset saved states when new analysis result comes in
    setSavedDescription(false);
    setSavedWorkProcess(false);
    setIsEditingDescription(false);
  }, [analysisResult]);

  // Local handlers for work process items
  const onAddWorkProcess = (value: string, _: any, index?: number) => {
    const newItem: WorkProcessItem = {
      desc: value,
      type: 'BULLET_0',
    };

    if (index !== undefined) {
      const newItems = [...workProcessItems];
      newItems.splice(index + 1, 0, newItem);
      setWorkProcessItems(newItems);
    } else {
      setWorkProcessItems([...workProcessItems, newItem]);
    }
  };

  const onDeleteWorkProcess = (_: string, __: any, index?: number) => {
    if (index !== undefined) {
      const newItems = workProcessItems.filter((_, i) => i !== index);
      setWorkProcessItems(newItems);
    }
  };

  const onEditWorkProcess = (
    _: string,
    paragraphType: ParagraphEnum,
    __: any,
    index: number,
  ) => {
    const newItems = [...workProcessItems];
    if (newItems[index]) {
      newItems[index] = {
        ...newItems[index],
        type: paragraphType as WorkProcessItem['type'],
      };
      setWorkProcessItems(newItems);
    }
  };

  const onEditWorkProcessContent = (
    values: { name: string; type: ParagraphEnum }[],
  ) => {
    const newItems: WorkProcessItem[] = values.map(({ name, type }) => ({
      desc: name,
      type: type as WorkProcessItem['type'],
    }));
    setWorkProcessItems(newItems);
  };

  // Handle description editing
  const handleEditDescription = () => {
    setIsEditingDescription(true);
  };

  const handleSaveDescriptionEdit = () => {
    setIsEditingDescription(false);
    // Update the analysis result with the edited description
    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        description: editedDescription,
      });
    }
  };

  const handleCancelDescriptionEdit = () => {
    setEditedDescription(analysisResult?.description || '');
    setIsEditingDescription(false);
  };

  // Save description to characterization and trigger main form save
  const handleSaveDescription = () => {
    const descriptionToSave = editedDescription || analysisResult?.description;
    if (!descriptionToSave) return;

    // Add description to local state
    onAddArray(descriptionToSave, 'paragraphs');
    setSavedDescription(true);

    // Trigger main form save using the specific ID
    setTimeout(() => {
      const saveButton = document.getElementById(
        IdsEnum.ADD_CHARACTERIZATION_ID,
      );
      if (saveButton) {
        (saveButton as HTMLButtonElement).click();
      }
    }, 100);
  };

  // Convert AI type to ParagraphEnum
  const convertAiTypeToParagraphEnum = (aiType: string): ParagraphEnum => {
    switch (aiType) {
      case 'PARAGRAPH':
        return ParagraphEnum.PARAGRAPH;
      case 'BULLET_0':
      case 'BULLET-0':
        return ParagraphEnum.BULLET_0;
      case 'BULLET_1':
      case 'BULLET-1':
        return ParagraphEnum.BULLET_1;
      case 'BULLET_2':
      case 'BULLET-2':
        return ParagraphEnum.BULLET_2;
      default:
        return ParagraphEnum.BULLET_0; // Default fallback
    }
  };

  // Save work process to characterization activities and trigger main form save
  const handleSaveWorkProcess = () => {
    if (workProcessItems.length === 0) return;

    // Convert work process items to the format expected by activities
    // Add markdown-style prefixes based on type so onAddArray can process them correctly
    const workProcessStrings = workProcessItems.map((item) => {
      const paragraphType = convertAiTypeToParagraphEnum(item.type);
      let prefix = '';

      switch (paragraphType) {
        case ParagraphEnum.BULLET_0:
          prefix = '- ';
          break;
        case ParagraphEnum.BULLET_1:
          prefix = '    - ';
          break;
        case ParagraphEnum.BULLET_2:
          prefix = '        - ';
          break;
        case ParagraphEnum.PARAGRAPH:
        default:
          prefix = '';
          break;
      }

      return `${prefix}${item.desc}`;
    });

    // Add to local state - combine all strings with newlines to add them all at once
    const combinedWorkProcessText = workProcessStrings.join('\n\n');
    onAddArray(combinedWorkProcessText, 'activities');
    setSavedWorkProcess(true);

    // Trigger main form save using the specific ID
    setTimeout(() => {
      const saveButton = document.getElementById(
        IdsEnum.ADD_CHARACTERIZATION_ID,
      );
      if (saveButton) {
        (saveButton as HTMLButtonElement).click();
      }
    }, 100);
  };

  const aiAnalyzeMutation = useMutateAiAnalyzeCharacterization();
  const upsertRiskDataMutation = useMutUpsertRiskData();
  const { data: riskGroupData } = useQueryRiskGroupData();

  const onSubmit = async (formData: AiAnalysisFormData) => {
    if (
      !characterizationData.id ||
      !characterizationData.companyId ||
      !characterizationData.workspaceId
    ) {
      return;
    }

    const result = await aiAnalyzeMutation.mutateAsync({
      companyId: characterizationData.companyId,
      workspaceId: characterizationData.workspaceId,
      characterizationId: characterizationData.id,
      customPrompt: formData.customPrompt,
      model: formData.model?.value,
    });

    setAnalysisResult(result);
    setModifiedRisks({});
  };

  // Helper functions for removing items from risk measures
  const removeExistingEngineeringMeasure = (
    riskId: string,
    measureIndex: number,
  ) => {
    setModifiedRisks((prev) => {
      const currentRisk =
        prev[riskId] ||
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
        analysisResult?.detailedRisks.find((r) => r.id === riskId);
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
      analysisResult?.detailedRisks.find((r) => r.id === riskId)
    );
  };

  // Handle accordion expansion/collapse
  const handleAccordionChange =
    (riskId: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordions((prev) => {
        const newSet = new Set(prev);
        if (isExpanded) {
          newSet.add(riskId);
        } else {
          newSet.delete(riskId);
        }
        return newSet;
      });
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

      // Get the first available risk group
      const riskGroupId = riskGroupData?.[0]?.id;

      if (!riskGroupId) {
        console.error('No risk group found');
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
          ...risk.recommendedAdministrativeMeasures.map((adm) => ({
            recName: adm,
            companyId: characterizationData.companyId,
            recType: RecTypeEnum.ADM,
          })),
          ...risk.recommendedEngineeringMeasures.map((rec) => ({
            recName: rec,
            recType: RecTypeEnum.ENG,
            companyId: characterizationData.companyId,
          })),
        ],
      });

      // Mark risk as added
      setAddedRisks((prev) => new Set(prev).add(risk.id));
      console.log('Risk data created successfully with risk:', risk.name);

      // Collapse the accordion after successfully adding the risk
      setTimeout(() => {
        setExpandedAccordions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(risk.id);
          return newSet;
        });
      }, 500); // Small delay to show the success state
    } catch (error) {
      console.error('Error creating risk data:', error);
    }
  };

  const isDisabled = !characterizationData.id;

  return (
    <FormProvider {...methods}>
      <Box sx={{ px: 5, pb: 10 }}>
        <SFlex direction="column" gap={4}>
          <SText variant="h6" color="text.primary">
            Análise de IA da Caracterização
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
              <Box>
                <SFlex direction="column" gap={3}>
                  {isMaster && (
                    <SSearchSelectForm
                      label="Modelo de IA"
                      name="model"
                      options={AI_MODEL_OPTIONS}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                    />
                  )}

                  <SInputMultilineForm
                    label="Prompt Personalizado (Opcional)"
                    name="customPrompt"
                    placeholder="Digite instruções específicas para a análise de IA..."
                    inputProps={{
                      minRows: 4,
                      maxRows: 8,
                    }}
                  />

                  <SButton
                    text="Analisar com IA"
                    variant="contained"
                    color="primary"
                    loading={aiAnalyzeMutation.isPending}
                    onClick={handleSubmit(onSubmit)}
                    buttonProps={{
                      sx: { alignSelf: 'flex-start' },
                    }}
                  />
                </SFlex>
              </Box>

              {analysisResult && (
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
                    <SText variant="subtitle2" color="text.primary">
                      Resultado da Análise de IA
                    </SText>

                    {/* Description Section */}
                    {analysisResult.description && (
                      <Box>
                        <SFlex justify="space-between" align="center" mb={1}>
                          <SectionHeader
                            variant="primary"
                            icon={<AssessmentIcon sx={{ fontSize: 18 }} />}
                          >
                            Descrição Extraída
                          </SectionHeader>
                          <SButton
                            variant={
                              savedDescription ? 'contained' : 'outlined'
                            }
                            size="s"
                            onClick={handleSaveDescription}
                            disabled={savedDescription}
                            text={
                              savedDescription
                                ? '✓ Salvo na Caracterização'
                                : 'Salvar na Caracterização'
                            }
                          />
                        </SFlex>
                        <Box
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: isEditingDescription
                              ? 'primary.200'
                              : 'grey.200',
                            borderRadius: 1,
                            backgroundColor: isEditingDescription
                              ? 'primary.50'
                              : 'grey.50',
                            cursor: !isEditingDescription
                              ? 'pointer'
                              : 'default',
                            '&:hover': !isEditingDescription
                              ? {
                                  backgroundColor: 'grey.100',
                                  borderColor: 'grey.300',
                                }
                              : {},
                          }}
                          onClick={
                            !isEditingDescription
                              ? handleEditDescription
                              : undefined
                          }
                        >
                          {isEditingDescription ? (
                            <TextField
                              value={editedDescription}
                              onChange={(e) =>
                                setEditedDescription(e.target.value)
                              }
                              onBlur={handleSaveDescriptionEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  handleSaveDescriptionEdit();
                                } else if (e.key === 'Escape') {
                                  handleCancelDescriptionEdit();
                                }
                              }}
                              multiline
                              rows={4}
                              variant="standard"
                              fullWidth
                              autoFocus
                              sx={{
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
                              color="text.primary"
                              sx={{
                                '&:hover': {
                                  color: 'primary.main',
                                },
                              }}
                            >
                              {editedDescription || analysisResult.description}
                            </SText>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Work Process Section */}
                    {analysisResult.workProcess &&
                      analysisResult.workProcess.length > 0 && (
                        <Box>
                          <SFlex justify="space-between" align="center" mb={2}>
                            <SText variant="body1" color="text.primary">
                              <strong>Processo de Trabalho Extraído</strong>
                            </SText>
                            <SButton
                              variant={
                                savedWorkProcess ? 'contained' : 'outlined'
                              }
                              size="s"
                              onClick={handleSaveWorkProcess}
                              disabled={savedWorkProcess}
                              text={
                                savedWorkProcess
                                  ? '✓ Salvo nas Atividades'
                                  : 'Salvar nas Atividades'
                              }
                            />
                          </SFlex>
                          <SDisplaySimpleArray
                            values={workProcessItems.map((item) => ({
                              type: item.type,
                              name: item.desc,
                            }))}
                            valueField="name"
                            type={TypeInputModal.TEXT_AREA}
                            onEdit={(_, values) =>
                              onEditWorkProcessContent(values)
                            }
                            onAdd={(value, _, index) =>
                              onAddWorkProcess(value, _, index)
                            }
                            onDelete={(value, _, index) =>
                              onDeleteWorkProcess(value, _, index)
                            }
                            buttonLabel={'Adicionar Processo de Trabalho'}
                            placeholder="descreva o processo..."
                            modalLabel="Adicionar Processo de Trabalho"
                            onRenderStartElement={(value, index) => (
                              <ParagraphSelect
                                handleSelectMenu={(option) => {
                                  onEditWorkProcess(
                                    (value as any).name,
                                    option.value,
                                    'workProcess',
                                    index,
                                  );
                                }}
                                selected={
                                  (typeof value !== 'string' &&
                                    'type' in value &&
                                    Object.values(ParagraphEnum).includes(
                                      (value as any).type,
                                    ) &&
                                    (value as any).type) ||
                                  ParagraphEnum.BULLET_0
                                }
                                sx={{
                                  boxShadow: 'none',
                                  borderRightColor: 'grey.300',
                                  borderRadius: '4px 5px 5px 4px',
                                }}
                                paragraphOptions={[
                                  ParagraphEnum.PARAGRAPH,
                                  ParagraphEnum.BULLET_0,
                                  ParagraphEnum.BULLET_1,
                                  ParagraphEnum.BULLET_2,
                                ]}
                              />
                            )}
                          />
                        </Box>
                      )}

                    {/* Detailed Risks */}
                    {analysisResult.detailedRisks.length > 0 && (
                      <Box>
                        <SText variant="body1" color="text.primary" mb={2}>
                          <strong>Detalhes dos Riscos:</strong>
                        </SText>
                        <SFlex direction="column" gap={2}>
                          {analysisResult.detailedRisks.map((originalRisk) => {
                            const isAdded = addedRisks.has(originalRisk.id);
                            const risk =
                              getCurrentRisk(originalRisk.id) || originalRisk;
                            return (
                              <Accordion
                                key={risk.id}
                                expanded={expandedAccordions.has(risk.id)}
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
                        {analysisResult.characterization.name}
                      </SText>
                      <SText
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.5}
                      >
                        <strong>Tipo:</strong>{' '}
                        {analysisResult.characterization.type}
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
      </Box>
    </FormProvider>
  );
};
