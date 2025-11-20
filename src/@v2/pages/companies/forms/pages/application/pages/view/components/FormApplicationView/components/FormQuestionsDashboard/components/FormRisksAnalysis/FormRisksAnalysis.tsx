import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Skeleton, Typography } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { useMutateAiAnalyzeFormQuestionsRisks } from '@v2/services/forms/ai-analyze-risks/hooks/useMutateAiAnalyzeFormQuestionsRisks';
import { useMutateAssignRisksFormApplication } from '@v2/services/forms/form-application/assign-risks-form-application/hooks/useMutateAssignRisksFormApplication';
import { useFetchBrowseFormApplicationRiskLog } from '@v2/services/forms/form-application/form-application-risk-log/hooks/useFetchBrowseFormApplicationRiskLog';
import {
  useFetchBrowseFormQuestionsAnswersAnalysis,
  hasRecentProcessingAnalyses,
} from '@v2/services/forms/form-questions-answers-analysis/browse-form-questions-answers-analysis/hooks/useFetchBrowseFormQuestionsAnswersAnalysis';

import { useMutateEditFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/edit-form-questions-answers-analysis/hooks/useMutateEditFormQuestionsAnswersAnalysis';
import { useFetchBrowseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/hooks/useFetchBrowseFormQuestionsAnswersRisks';
import { useMutUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { SIconDelete } from '@v2/assets/icons/SIconDelete/SIconDelete';
import { TextField } from '@mui/material';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { useMemo, useState } from 'react';
import { useAccess } from 'core/hooks/useAccess';
import { useForm, FormProvider } from 'react-hook-form';

import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { formRiskCustomPrompt } from './custim-prompt';
import { HomoTypeEnum } from '@v2/models/security/enums/homo-type.enum';

interface FormRisksAnalysisProps {
  formApplication: FormApplicationReadModel;
}

// AI Model options (same as ModalAiAnalysisContent)
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
];

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

export const FormRisksAnalysis = ({
  formApplication,
}: FormRisksAnalysisProps) => {
  const { isMaster } = useAccess();
  const [expandedRisks, setExpandedRisks] = useState<Record<string, boolean>>(
    {},
  );

  const [expandedAnalysis, setExpandedAnalysis] = useState<
    Record<string, boolean>
  >({});

  const [addedRisks, setAddedRisks] = useState<Set<string>>(new Set());
  const [showAiDialog, setShowAiDialog] = useState(false);

  // Form for AI analysis configuration
  const methods = useForm<AiAnalysisFormData>({
    defaultValues: {
      customPrompt: formRiskCustomPrompt,
    },
  });
  const { handleSubmit } = methods;

  const { mutate: mutateAssignRisksFormApplication } =
    useMutateAssignRisksFormApplication();

  const { mutate: mutateAiAnalyzeFormQuestionsRisks, isPending: isAnalyzing } =
    useMutateAiAnalyzeFormQuestionsRisks();

  const { data: riskGroupData } = useQueryRiskGroupData();

  const editAnalysisMutation = useMutateEditFormQuestionsAnswersAnalysis();
  const upsertRiskDataMutation = useMutUpsertRiskData();

  const { riskLogs } = useFetchBrowseFormApplicationRiskLog({
    companyId: formApplication.companyId,
    applicationId: formApplication.id,
  });

  const { formQuestionsAnswersRisks, isLoading } =
    useFetchBrowseFormQuestionsAnswersRisks({
      companyId: formApplication.companyId,
      applicationId: formApplication.id,
    });

  const {
    formQuestionsAnswersAnalysis,

    refetch,
  } = useFetchBrowseFormQuestionsAnswersAnalysis({
    companyId: formApplication.companyId,
    applicationId: formApplication.id,
  });

  // Check if there are any analyses being processed (created within last 10 minutes)
  const hasProcessingAnalyses = useMemo(() => {
    return hasRecentProcessingAnalyses(formQuestionsAnswersAnalysis?.results);
  }, [formQuestionsAnswersAnalysis]);

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
        companyId: formApplication.companyId,
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
        companyId: formApplication.companyId,
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

  // Helper function to add AI analysis as risk data
  const handleAddAnalysisAsRiskData = async (analysis: any) => {
    try {
      // Get the first available risk group
      const riskGroupId = riskGroupData?.[0]?.id;

      if (!riskGroupId) {
        console.error('No risk group found');
        return;
      }

      await upsertRiskDataMutation.mutateAsync({
        riskFactorGroupDataId: riskGroupId,
        riskId: analysis.riskId,
        hierarchyId: analysis.hierarchyId,
        homogeneousGroupId: analysis.hierarchyId,
        type: HomoTypeEnum.HIERARCHY,
        keepEmpty: true,
        companyId: formApplication.companyId,
        probability: analysis.probability,
        generateSourcesAddOnly: analysis.analysis.fontesGeradoras.map(
          (fonte: any) => ({
            name: fonte.nome,
            companyId: formApplication.companyId,
          }),
        ),
        engsAddOnly: analysis.analysis.medidasEngenhariaRecomendadas.map(
          (medida: any) => ({
            medName: medida.nome,
            type: MedTypeEnum.ENG,
            companyId: formApplication.companyId,
          }),
        ),
        recAddOnly: [
          ...analysis.analysis.medidasAdministrativasRecomendadas.map(
            (medida: any) => ({
              recName: medida.nome,
              companyId: formApplication.companyId,
              type: RecTypeEnum.ADM,
            }),
          ),
          ...analysis.analysis.medidasEngenhariaRecomendadas.map(
            (medida: any) => ({
              recName: medida.nome,
              type: RecTypeEnum.ENG,
              companyId: formApplication.companyId,
            }),
          ),
        ],
      });

      // Mark this analysis as added by updating the analysis with a new field
      await editAnalysisMutation.mutateAsync({
        companyId: formApplication.companyId,
        applicationId: formApplication.id,
        analysisId: analysis.id,
        analysis: {
          ...analysis.analysis,
          isAddedAsRiskData: true,
        },
      });

      // Mark analysis as added in local state
      setAddedRisks((prev) => new Set(prev).add(analysis.id));
      console.log(
        'Risk data created successfully from AI analysis:',
        analysis.riskName,
      );
    } catch (error) {
      console.error('Error creating risk data from AI analysis:', error);
    }
  };

  if (isLoading || !formQuestionsAnswersRisks) {
    return (
      <SPaper sx={{ p: 4 }}>
        <Skeleton height={400} />
      </SPaper>
    );
  }

  const { entityMap, riskMap, entityRiskMap } = formQuestionsAnswersRisks;

  // Get all risks that have data
  const risksWithData = Object.keys(riskMap).filter((riskId) =>
    Object.values(entityRiskMap).some((entityRisks) => entityRisks[riskId]),
  );

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
      companyId: formApplication.companyId,
      applicationId: formApplication.id,
      risks: entityIds.map((entityId) => ({
        riskId,
        probability: entityRiskMap[entityId][riskId].probability,
        hierarchyId: entityId,
      })),
    });
  };

  const handleAddRiskToEntity = (riskId: string, entityId: string) => {
    mutateAssignRisksFormApplication({
      companyId: formApplication.companyId,
      applicationId: formApplication.id,
      risks: [
        {
          riskId,
          probability: entityRiskMap[entityId][riskId].probability,
          hierarchyId: entityId,
        },
      ],
    });
  };

  const handleAddAllRisk = () => {
    const risks = Object.entries(entityRiskMap)
      .map(([entityId, riskMap]) => {
        return Object.entries(riskMap).map(([riskId, risk]) => {
          return {
            hierarchyId: entityId,
            riskId,
            probability: risk.probability,
          };
        });
      })
      .flat();

    mutateAssignRisksFormApplication({
      companyId: formApplication.companyId,
      applicationId: formApplication.id,
      risks,
    });
  };

  const handleAnalyzeRisks = (data?: AiAnalysisFormData) => {
    // Just trigger the analysis - the results will be polled automatically
    // by useFetchBrowseFormQuestionsAnswersAnalysis when there are PROCESSING analyses
    mutateAiAnalyzeFormQuestionsRisks({
      companyId: formApplication.companyId,
      formApplicationId: formApplication.id,
      customPrompt: data?.customPrompt,
      model: data?.model?.value,
    });

    // Close the dialog if it was open
    setShowAiDialog(false);

    setTimeout(() => {
      refetch();
    }, 10000);
  };

  const handleAnalyzeButtonClick = () => {
    setShowAiDialog(true);

    // if (isMaster) {
    //   setShowAiDialog(true);
    //   // Master users get the configuration dialog
    // } else {
    //   // Regular users get direct analysis with default settings
    //   handleAnalyzeRisks({});
    // }
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

      <SFlex direction="column" gap={2}>
        {risksWithData.map((riskId) => {
          const risk = riskMap[riskId];
          const isExpanded = expandedRisks[riskId] || false;

          // Get all entities that have this risk
          const entitiesWithRisk = Object.keys(entityRiskMap).filter(
            (entityId) => entityRiskMap[entityId][riskId],
          );

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
                      entityRiskMap[entityId][riskId].probability,
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
                  <Typography color="text.secondary">
                    Setores Identificados:
                  </Typography>

                  <SFlex direction="column" gap={4}>
                    {entitiesWithRisk.map((entityId) => {
                      const entity = entityMap[entityId];
                      const riskData = entityRiskMap[entityId][riskId];

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
                              riskData.probability,
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
                                minWidth: 200,
                                backgroundColor:
                                  probabilityMap[riskData.probability || 0]
                                    .color,
                                padding: '4px 8px',
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.main"
                                mb={1}
                              >
                                Probabilidade: {riskData.probability} (
                                {
                                  probabilityMap[riskData.probability || 0]
                                    .label
                                }
                                )
                              </Typography>
                            </SFlex>
                          </SFlex>
                          {/* AI Analysis Results for this specific risk-entity combination */}
                          {formQuestionsAnswersAnalysis?.results &&
                            (() => {
                              // Filter analysis results for this specific risk and entity
                              const relevantAnalysis =
                                formQuestionsAnswersAnalysis.results.filter(
                                  (analysis) =>
                                    analysis.riskId === riskId &&
                                    analysis.hierarchyId === entityId &&
                                    analysis.analysis &&
                                    analysis.status === 'DONE',
                                );

                              if (relevantAnalysis.length === 0) return null;

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

                    {/* Only show "Add to all entities" button if not all entities have the risk added */}
                    {!entitiesWithRisk.every((entityId) =>
                      isRiskAddedToEntity(
                        riskId,
                        entityId,
                        entityRiskMap[entityId][riskId].probability,
                      ),
                    ) && (
                      <SButton
                        variant="text"
                        buttonProps={{
                          sx: {
                            width: 'fit-content',
                            textDecoration: 'underline',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          },
                        }}
                        text="Adicionar risco a todos os setores"
                        onClick={() =>
                          handleAddRiskToAllEntities(
                            riskId,
                            entitiesWithRisk.filter(
                              (entityId) =>
                                !isRiskAddedToEntity(
                                  riskId,
                                  entityId,
                                  entityRiskMap[entityId][riskId].probability,
                                ),
                            ),
                          )
                        }
                      />
                    )}
                  </SFlex>
                </SFlex>
              </SAccordionBody>
            </SAccordion>
          );
        })}
      </SFlex>

      {/* AI Analysis Configuration Dialog - Only for Master Users */}
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
              {isMaster && (
                <SSearchSelectForm
                  name="model"
                  label="Modelo de IA"
                  placeholder="Selecione o modelo de IA"
                  options={AI_MODEL_OPTIONS}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  boxProps={{ sx: { mb: 8 } }}
                />
              )}
              <SInputMultilineForm
                name="customPrompt"
                label="Prompt Personalizado (Opcional)"
                placeholder="Digite instruções específicas para a análise..."
                fullWidth
                inputProps={{ minRows: 4, maxRows: 30 }}
              />
            </DialogContent>
            <DialogActions>
              <SButton
                variant="outlined"
                text="Cancelar"
                onClick={() => setShowAiDialog(false)}
              />
              <SButton
                variant="contained"
                text="Iniciar Análise"
                loading={isAnalyzing}
                onClick={handleSubmit(handleAnalyzeRisks)}
              />
            </DialogActions>
          </form>
        </FormProvider>
      </Dialog>
    </SPaper>
  );
};
