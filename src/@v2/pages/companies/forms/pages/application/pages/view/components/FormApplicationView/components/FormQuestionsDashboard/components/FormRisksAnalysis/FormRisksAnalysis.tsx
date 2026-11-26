import { ManualRiskContentSections } from './ManualRiskContentSections';
import { CatalogAnalysisItemButton } from './CatalogAnalysisItemButton';
import { RiskFactorDisclosure } from './RiskFactorDisclosure';
import { SectorBulkRiskAdd } from './SectorBulkRiskAdd';
import { SectorBulkRiskRemove } from './SectorBulkRiskRemove';
import { api } from 'core/services/apiClient';
import type { BulkRiskAddTask } from './bulk-risk-add.runner';
import { FrpsSectorView } from './FrpsSectorView';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FRPS_GENERATION_DEFAULT_MODEL, FRPS_GENERATION_MODEL_OPTIONS } from './frps-generation-model-options';
import { FrpsAiProgress } from './FrpsAiProgress';
import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { resolveSystemOccupationalChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { FrpsAiGenerationPermissions } from './FrpsAiGenerationPermissions';
import { useQueryFrpsPrivacySettings } from 'core/services/hooks/queries/useQueryFrpsPrivacySettings/useQueryFrpsPrivacySettings';
import { OccupationalRiskAnalysisSection } from './OccupationalRiskAnalysisSection';
import { RiskAiAnalysisSection } from './RiskAiAnalysisSection';
import {
  AnalysisDisclosureHeader,
  AnalysisItemsSection,
  renderAnalysisOriginGroups,
} from './AnalysisDisclosure';
import Tooltip from '@mui/material/Tooltip';
import { acceptFormQuestionsAnswersAnalysisItem } from '@v2/services/forms/form-questions-answers-analysis/review-form-questions-answers-analysis-item/service/review-form-questions-answers-analysis-item.service';
import {
  analysisItemPillSchema,
  analysisItemPillSx,
} from './analysis-item-pill.styles';
import { AnalysisItemStatusBadges } from './AnalysisItemStatusBadges';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Menu, MenuItem, Skeleton, Typography } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { formAccordionNavigationSx } from '../../../form-accordion-navigation.styles';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import type { ParticipantGroupForIndicators } from '../../helpers/buildParticipantGroupsForIndicators';
import {
  buildRiskAnalysisViewContext,
  sortRiskIdsForAnalysis,
} from '../../helpers/buildRiskAnalysisViewContext';
import { expandRiskAnalysisEntitiesForHierarchyGroups } from '../../helpers/expandRiskAnalysisEntitiesForHierarchyGroups';
import {
  buildRiskAnalysisDisplayPartitions,
  formatRiskAnalysisMemberLabel,
} from '../../helpers/buildRiskAnalysisDisplayPartitions';
import { pickCanonicalGroupMemberId } from '../../helpers/group-risk-analysis-display.utils';
import { buildEnrichedInventoryStatusByKey } from '../../helpers/buildEnrichedInventoryStatusByKey';
import { buildInventoryStatusKey } from '../../helpers/buildInventoryStatusKey';
import {
  buildLocalAppliedAnalysisItemKey,
  countPendingTargetAnalysisItems,
  resolveTargetAnalysisItemStatus,
} from '../../helpers/resolveTargetAnalysisItemStatus';
import {
  buildTargetAiAnalysisViewModel,
  resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback,
} from '../../helpers/resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback';
import { getKeyBrowseFormApplicationRiskLog, useFetchBrowseFormApplicationRiskLog } from '@v2/services/forms/form-application/form-application-risk-log/hooks/useFetchBrowseFormApplicationRiskLog';
import { fetchFullRiskDataForHierarchy } from '../../helpers/fetchFullRiskDataForHierarchy';
import { QueryEnum } from 'core/enums/query.enums';
import { buildHierarchyIdToWorkspaceNameFromParticipants } from '../../helpers/buildHierarchyIdToWorkspaceNameFromParticipants';
import { buildRiskNarrativeDiagnosticScope } from '../../helpers/buildRiskNarrativeDiagnosticScope';
import {
  isEntityInEstablishmentCompanyScope,
  resolveOperationalCompanyIdFromSelectedEstablishmentGroup,
  shouldRestrictRiskAnalysisToEstablishmentCompany,
} from '../../helpers/riskAnalysisEstablishmentCompanyScope';
import { resolveParticipantStructuresForGrouping } from '../../helpers/resolveParticipantStructuresForGrouping';
import { RiskNarrativeDiagnosticSection } from './RiskNarrativeDiagnosticSection';
import {
  riskFactorAccordionSummarySx,
  riskFactorNameRowSx,
  riskFactorNameTypographySx,
} from './form-risks-analysis-risk-name.styles';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { useMutateAiAnalyzeFormQuestionsRisks } from '@v2/services/forms/ai-analyze-risks/hooks/useMutateAiAnalyzeFormQuestionsRisks';
import { AiAnalyzeFormQuestionsRisksModeEnum } from '@v2/services/forms/ai-analyze-risks/service/ai-analyze-risks.types';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useMutateApplyAiAnalysisAsRiskData } from '@v2/services/forms/form-application/apply-ai-analysis-as-risk-data/hooks/useMutateApplyAiAnalysisAsRiskData';
import { applyAiAnalysisAsRiskData } from '@v2/services/forms/form-application/apply-ai-analysis-as-risk-data/service/apply-ai-analysis-as-risk-data.service';
import { useMutateAssignRisksFormApplication } from '@v2/services/forms/form-application/assign-risks-form-application/hooks/useMutateAssignRisksFormApplication';
import { assignRisksFormApplication } from '@v2/services/forms/form-application/assign-risks-form-application/service/assign-risks-form-application.service';
import { refetchFormRisksInventoryStatus } from '@v2/services/forms/form-application/shared/refetch-form-risks-inventory-status';
import { useFetchBrowseFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/browse-form-questions-answers-analysis/hooks/useFetchBrowseFormQuestionsAnswersAnalysis';
import {
  hasRecentProcessingAnalyses,
  hasStaleProcessingAnalyses,
  isRecentlyProcessingAnalysis,
  isStaleProcessingAnalysis,
} from '@v2/services/forms/form-questions-answers-analysis/shared/form-ai-analysis-processing.utils';

import { useMutateEditFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/edit-form-questions-answers-analysis/hooks/useMutateEditFormQuestionsAnswersAnalysis';
import { useFetchBrowseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/hooks/useFetchBrowseFormQuestionsAnswersRisks';
import { useFetchBrowseFormParticipants } from '@v2/services/forms/form-participants/browse-form-participants/hooks/useFetchBrowseFormParticipants';
import { useSnackbar } from 'notistack';
import { SIconDelete } from '@v2/assets/icons/SIconDelete/SIconDelete';
import { TextField } from '@mui/material';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useAccess } from 'core/hooks/useAccess';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import { AiActionButtonGroup } from '@v2/components/molecules/AiActionButtonGroup/AiActionButtonGroup';
import { buildMasterAiRequestOverrides } from '@v2/components/molecules/AiActionButtonGroup/build-master-ai-request-overrides.util';
import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { SystemAiPromptConfigDialog } from '@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog';
import type { AnalysisItemInventoryEntry } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse.model';
import {
  getFormAiAnalysisErrorMessage,
  getRecentFormAiAnalysisBatchSummary,
  isOccupationalRiskEligibleForAiAnalysis,
} from './form-ai-analysis.utils';
import {
  FrpsExplainabilityProvider,
  ExplainFrpsItemButton,
  FrpsExplainabilityBridge,
  buildCatalogFrpsItemKey,
  mapAnalysisListItemTypeToExplanationItemType,
  type FrpsExplainabilityApi,
} from './frps-explainability';
import { ClearFormAiAnalysisModal } from './ClearFormAiAnalysisModal';
import { RecoverFormAiAnalysisModal } from './RecoverFormAiAnalysisModal';
import { FrpsMatrixEquation } from './FrpsMatrixEquation';
import { FrpsOccupationalLevelDots } from './FrpsOccupationalLevelDots';
import { FrpsOccupationalDistributionSummary } from './FrpsOccupationalDistributionSummary';
import { aggregateFrpsOccupationalDistribution } from './frps-occupational-distribution.util';
import { FrpsOccupationalRiskFilter } from './FrpsOccupationalRiskFilter';
import { HierarchyGroupRiskAnalysisCard } from './HierarchyGroupRiskAnalysisCard';
import {
  collectDistinctFrpsOccupationalLevels,
  FRPS_OCCUPATIONAL_FILTER_LEVELS,
  frpsPassesOccupationalFilter,
} from './frps-occupational-summary.util';
import {
  FrpsAnalysisItemReviewActions,
  useCanEditFrpsAnalysisContent,
} from './FrpsAnalysisItemReviewActions';
import { buildAnalysisItemCodeRegistry } from '../../helpers/analysis-item-codes.utils';
import type { AnalysisItemCodeEntry } from '../../helpers/analysis-item-codes.utils';
import { extractApiError } from '@v2/utils/extract-api-error';

import { getMatrizRisk } from 'core/utils/helpers/matriz';
import {
  entityMatchesMassAddFilter,
  MassAddOccupationalRiskFilter,
  resolveOccupationalRiskLevel,
} from 'core/utils/helpers/occupational-risk-level.util';

const INHERITED_ANALYSIS_ITEM_EDIT_CONFIRMATION = {
  title: 'Editar item da análise do agrupamento',
  message:
    'Este setor está usando uma análise aplicada pelo agrupamento de setores. Ao editar esta fonte/recomendação, a alteração será aplicada para todos os setores que herdam esta análise. Deseja continuar?',
  confirmText: 'Continuar',
  cancelText: 'Cancelar',
  variant: 'warning' as const,
};

const INHERITED_ANALYSIS_ITEM_REMOVE_CONFIRMATION = {
  title: 'Excluir item da análise do agrupamento',
  message:
    'Este setor está usando uma análise aplicada pelo agrupamento de setores. Ao excluir esta fonte/recomendação, ela será removida para todos os setores que herdam esta análise. Deseja continuar?',
  confirmText: 'Continuar',
  cancelText: 'Cancelar',
  variant: 'warning' as const,
};

const REANALYSIS_CONFIRMATION = {
  title: 'Analisar com IA novamente',
  message:
    'A análise será executada novamente, mas o sistema tentará complementar apenas fontes geradoras e recomendações faltantes. Itens já existentes não serão duplicados.',
  confirmText: 'Continuar',
  cancelText: 'Cancelar',
  variant: 'warning' as const,
};

const TARGET_REANALYSIS_CONFIRMATION = {
  title: 'Analisar IA novamente deste setor',
  message:
    'A análise deste risco/setor será executada novamente, complementando apenas fontes geradoras e recomendações faltantes. Itens já existentes não serão duplicados.',
  confirmText: 'Continuar',
  cancelText: 'Cancelar',
  variant: 'warning' as const,
};

const GROUP_TARGET_REANALYSIS_CONFIRMATION = {
  title: 'Analisar IA novamente do agrupamento',
  message:
    'A análise deste risco será executada novamente para o agrupamento de setores, complementando apenas fontes geradoras e recomendações faltantes. Itens já existentes não serão duplicados.',
  confirmText: 'Continuar',
  cancelText: 'Cancelar',
  variant: 'warning' as const,
};

type AnalysisItemType =
  | 'fontesGeradoras'
  | 'medidasEngenhariaRecomendadas'
  | 'medidasAdministrativasRecomendadas';

interface FormRisksAnalysisProps {
  formApplication: FormApplicationReadModel;
  accessCompanyId: string;
  formQuestionsAnswers?: FormQuestionsAnswersBrowseModel | null;
  visibleParticipantGroups?: ParticipantGroupForIndicators[];
  selectedGroupingQuestionId?: string | null;
  selectedGroupingLabel?: string | null;
}

const isMatrixAxisValue = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 5;

export const FormRisksAnalysis = ({
  formApplication,
  accessCompanyId,
  formQuestionsAnswers = null,
  visibleParticipantGroups = [],
  selectedGroupingQuestionId = null,
  selectedGroupingLabel = null,
}: FormRisksAnalysisProps) => {
  const { isMaster } = useAccess();
  const generationMatrixPresentation = useSystemRiskMatrixPresentation();
  const { data: generationSettings, isLoading: loadingGenerationSettings, isError: generationSettingsError } = useQueryFrpsPrivacySettings(accessCompanyId);
  const { showConfirmation } = useConfirmationModal();
  const [selectedOccupationalLevels, setSelectedOccupationalLevels] = useState<
    Set<number>
  >(() => new Set(FRPS_OCCUPATIONAL_FILTER_LEVELS));

  const [expandedAnalysis, setExpandedAnalysis] = useState<
    Record<string, boolean>
  >({});

  const [addedRisks, setAddedRisks] = useState<Set<string>>(new Set());
  const [locallyAppliedInventoryKeys, setLocallyAppliedInventoryKeys] =
    useState<Set<string>>(() => new Set());
  const [locallyAppliedItemKeys, setLocallyAppliedItemKeys] = useState<
    Set<string>
  >(() => new Set());
  const [applyingItemKey, setApplyingItemKey] = useState<string | null>(null);
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const frpsExplainabilityApiRef = useRef<FrpsExplainabilityApi | null>(null);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>(
    {},
  );
  const [organization, setOrganization] = useState<'risk' | 'sector'>('risk');
  const [showClearAiDialog, setShowClearAiDialog] = useState(false);
  const [showRecoverAiDialog, setShowRecoverAiDialog] = useState(false);
  const [addRiskMenu, setAddRiskMenu] = useState<{
    anchorEl: HTMLElement;
    riskId: string;
  } | null>(null);

  const { mutate: mutateAssignRisksFormApplication } =
    useMutateAssignRisksFormApplication();

  const { mutate: mutateAiAnalyzeFormQuestionsRisks, isPending: isAnalyzing } =
    useMutateAiAnalyzeFormQuestionsRisks();

  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const editAnalysisMutation = useMutateEditFormQuestionsAnswersAnalysis();
  const applyAiAnalysisAsRiskDataMutation =
    useMutateApplyAiAnalysisAsRiskData();

  const { formQuestionsAnswersRisks, isLoading } =
    useFetchBrowseFormQuestionsAnswersRisks({
      companyId: accessCompanyId,
      applicationId: formApplication.id,
    });

  const { riskLogs } = useFetchBrowseFormApplicationRiskLog({
    companyId: accessCompanyId,
    applicationId: formApplication.id,
  });

  const { formParticipants } = useFetchBrowseFormParticipants({
    companyId: accessCompanyId,
    applicationId: formApplication.id,
    pagination: { page: 1, limit: 10_000 },
  });

  const hierarchyIdToWorkspaceName = useMemo(
    () =>
      buildHierarchyIdToWorkspaceNameFromParticipants(
        formParticipants?.results ?? [],
      ),
    [formParticipants?.results],
  );

  const applicationWorkspaceNames = useMemo(
    () =>
      formApplication.participants.workspaces.map(
        (workspace) => workspace.name,
      ),
    [formApplication.participants.workspaces],
  );

  const {
    formQuestionsAnswersAnalysis,

    refetch,
    isFetching: fetchingAnalysisStatus,
    isError: analysisStatusError,
  } = useFetchBrowseFormQuestionsAnswersAnalysis({
    companyId: accessCompanyId,
    applicationId: formApplication.id,
  });

  // Check if there are any analyses being processed (created within last 10 minutes)
  const hasProcessingAnalyses = useMemo(() => {
    return hasRecentProcessingAnalyses(formQuestionsAnswersAnalysis?.results);
  }, [formQuestionsAnswersAnalysis]);

  const hasStaleAnalyses = useMemo(() => {
    return hasStaleProcessingAnalyses(formQuestionsAnswersAnalysis?.results);
  }, [formQuestionsAnswersAnalysis]);

  const hasPreviousAiRun = useMemo(
    () =>
      (formQuestionsAnswersAnalysis?.results ?? []).some(
        (result) =>
          result.status === FormAiAnalysisStatusEnum.DONE ||
          result.status === FormAiAnalysisStatusEnum.FAILED,
      ),
    [formQuestionsAnswersAnalysis?.results],
  );

  const isTargetAnalysisProcessing = useCallback(
    (riskId: string, hierarchyId: string) =>
      (formQuestionsAnswersAnalysis?.results ?? []).some(
        (result) =>
          result.riskId === riskId &&
          result.hierarchyId === hierarchyId &&
          isRecentlyProcessingAnalysis(result),
      ),
    [formQuestionsAnswersAnalysis?.results],
  );

  const isTargetAnalysisStale = useCallback(
    (riskId: string, hierarchyId: string) =>
      (formQuestionsAnswersAnalysis?.results ?? []).some(
        (result) =>
          result.riskId === riskId &&
          result.hierarchyId === hierarchyId &&
          isStaleProcessingAnalysis(result),
      ),
    [formQuestionsAnswersAnalysis?.results],
  );

  const hasOwnAnalysisForPair = useCallback(
    (riskId: string, hierarchyId: string) =>
      (formQuestionsAnswersAnalysis?.results ?? []).some(
        (result) =>
          result.riskId === riskId &&
          result.hierarchyId === hierarchyId &&
          (result.status === FormAiAnalysisStatusEnum.DONE ||
            result.status === FormAiAnalysisStatusEnum.FAILED ||
            result.status === FormAiAnalysisStatusEnum.PROCESSING),
      ),
    [formQuestionsAnswersAnalysis?.results],
  );

  const wasProcessingAnalysesRef = useRef(false);
  const batchFailureNotifiedRef = useRef(false);

  useEffect(() => {
    if (hasProcessingAnalyses) {
      wasProcessingAnalysesRef.current = true;
      batchFailureNotifiedRef.current = false;
      return;
    }

    if (!wasProcessingAnalysesRef.current || batchFailureNotifiedRef.current)
      return;

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
  }, [
    enqueueSnackbar,
    formQuestionsAnswersAnalysis?.results,
    hasProcessingAnalyses,
  ]);

  const inventoryStatusByKey = useMemo(
    () => formQuestionsAnswersRisks?.inventoryStatusByKey ?? {},
    [formQuestionsAnswersRisks?.inventoryStatusByKey],
  );

  const analysisInventoryStatus = useMemo(
    () => formQuestionsAnswersAnalysis?.analysisInventoryStatus ?? {},
    [formQuestionsAnswersAnalysis?.analysisInventoryStatus],
  );

  const getAnalysisItemStatus = useCallback(
    (
      analysisId: string,
      itemType: AnalysisItemType,
      itemIndex: number,
    ): AnalysisItemInventoryEntry | undefined => {
      const status = analysisInventoryStatus[analysisId];
      if (!status) return undefined;
      const entry = status[itemType]?.[itemIndex];
      if (entry == null || typeof entry !== 'object') return undefined;
      if (
        typeof entry.existsInInventory !== 'boolean' ||
        typeof entry.existsInCatalog !== 'boolean'
      ) {
        return undefined;
      }
      return entry;
    },
    [analysisInventoryStatus],
  );

  const countPendingAnalysisItems = useCallback(
    (analysis: { id: string; analysis?: Record<string, unknown> | null }) => {
      const status = analysisInventoryStatus[analysis.id];
      if (!status || !analysis.analysis) return null;

      let pending = 0;
      const countPendingInArray = (
        items: unknown[] | undefined,
        entries: AnalysisItemInventoryEntry[] | undefined,
      ) => {
        if (!items?.length) return;
        items.forEach((_, index) => {
          if (entries?.[index]?.existsInInventory !== true) pending += 1;
        });
      };

      countPendingInArray(
        analysis.analysis.fontesGeradoras as unknown[] | undefined,
        status.fontesGeradoras,
      );
      countPendingInArray(
        analysis.analysis.medidasEngenhariaRecomendadas as
          | unknown[]
          | undefined,
        status.medidasEngenhariaRecomendadas,
      );
      countPendingInArray(
        analysis.analysis.medidasAdministrativasRecomendadas as
          | unknown[]
          | undefined,
        status.medidasAdministrativasRecomendadas,
      );

      return pending;
    },
    [analysisInventoryStatus],
  );

  const handleAnalysisToggle = (analysisKey: string) => {
    setExpandedAnalysis((prev) => ({
      ...prev,
      [analysisKey]: !(prev[analysisKey] ?? true),
    }));
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
      frpsExplainabilityApiRef.current?.invalidateByAnalysisId(analysisId);
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
      const removedName = analysis.analysis?.[itemType]?.[itemIndex]?.nome as
        | string
        | undefined;
      const updatedAnalysis = { ...analysis.analysis };
      updatedAnalysis[itemType].splice(itemIndex, 1);

      await editAnalysisMutation.mutateAsync({
        companyId: accessCompanyId,
        applicationId: formApplication.id,
        analysisId,
        analysis: updatedAnalysis,
      });
      if (removedName) {
        frpsExplainabilityApiRef.current?.notifyItemRemoved({
          analysisId,
          listItemType: itemType,
          itemName: removedName,
        });
      }
      frpsExplainabilityApiRef.current?.invalidateByAnalysisId(analysisId);
    } catch (error) {
      console.error('Error removing analysis item:', error);
    }
  };

  const createInheritedAnalysisItemEditHandler =
    (
      sourceAnalysis: {
        id: string;
        analysis?: Record<string, unknown> | null;
      },
      itemType: AnalysisItemType,
      itemIndex: number,
    ) =>
    async (newName: string): Promise<boolean> => {
      const confirmed = await showConfirmation(
        INHERITED_ANALYSIS_ITEM_EDIT_CONFIRMATION,
      );
      if (!confirmed) return false;

      await handleEditAnalysisItem(
        sourceAnalysis.id,
        itemType,
        itemIndex,
        newName,
        sourceAnalysis,
      );
      return true;
    };

  const createInheritedAnalysisItemRemoveHandler =
    (
      sourceAnalysis: {
        id: string;
        analysis?: Record<string, unknown> | null;
      },
      itemType: AnalysisItemType,
      itemIndex: number,
    ) =>
    async (): Promise<void> => {
      const confirmed = await showConfirmation(
        INHERITED_ANALYSIS_ITEM_REMOVE_CONFIRMATION,
      );
      if (!confirmed) return;

      await handleRemoveAnalysisItem(
        sourceAnalysis.id,
        itemType,
        itemIndex,
        sourceAnalysis,
      );
    };

  const buildApplyingItemKey = (
    analysisId: string,
    itemType: AnalysisItemType,
    itemIndex: number,
  ) => `${analysisId}:${itemType}:${itemIndex}`;

  const applyAnalysisItemsToInventory = useCallback(
    async (
      analysis: {
        id: string;
        hierarchyId: string;
        riskId: string;
        probability?: number;
        analysis?: Record<string, unknown> | null;
      },
      items: {
        fontesGeradoras?: { nome: string }[];
        medidasEngenharia?: { nome: string }[];
        medidasAdministrativas?: { nome: string }[];
      },
      options?: {
        skipMarkAnalysisApplied?: boolean;
        suppressMutationFeedback?: boolean;
      },
    ) => {
      const hasItems =
        !!items.fontesGeradoras?.length ||
        !!items.medidasEngenharia?.length ||
        !!items.medidasAdministrativas?.length;

      if (!hasItems) return false;

      const requestPayload = {
        companyId: accessCompanyId,
        applicationId: formApplication.id,
        hierarchyId: analysis.hierarchyId,
        riskId: analysis.riskId,
        probability: analysis.probability,
        generateSourcesAddOnly: items.fontesGeradoras?.map((fonte) => ({
          name: fonte.nome,
        })),
        recAddOnly: [
          ...(items.medidasAdministrativas?.map((medida) => ({
            recName: medida.nome,
            recType: RecTypeEnum.ADM,
          })) ?? []),
          ...(items.medidasEngenharia?.map((medida) => ({
            recName: medida.nome,
            recType: RecTypeEnum.ENG,
          })) ?? []),
        ],
      };

      if (options?.suppressMutationFeedback) {
        await applyAiAnalysisAsRiskData(requestPayload);
      } else {
        await applyAiAnalysisAsRiskDataMutation.mutateAsync(requestPayload);
      }

      if (!options?.skipMarkAnalysisApplied) {
        await editAnalysisMutation.mutateAsync({
          companyId: accessCompanyId,
          applicationId: formApplication.id,
          analysisId: analysis.id,
          analysis: {
            ...analysis.analysis,
            isAddedAsRiskData: true,
          } as never,
        });

        setAddedRisks((prev) => new Set(prev).add(analysis.id));
      }

      setLocallyAppliedInventoryKeys((prev) => {
        const next = new Set(prev);
        next.add(
          buildInventoryStatusKey(analysis.riskId, analysis.hierarchyId),
        );
        return next;
      });
      setLocallyAppliedItemKeys((prev) => {
        const next = new Set(prev);
        items.fontesGeradoras?.forEach((item) => {
          next.add(
            buildLocalAppliedAnalysisItemKey({
              riskId: analysis.riskId,
              targetHierarchyId: analysis.hierarchyId,
              itemType: 'fontesGeradoras',
              itemName: item.nome,
            }),
          );
        });
        items.medidasEngenharia?.forEach((item) => {
          next.add(
            buildLocalAppliedAnalysisItemKey({
              riskId: analysis.riskId,
              targetHierarchyId: analysis.hierarchyId,
              itemType: 'medidasEngenhariaRecomendadas',
              itemName: item.nome,
            }),
          );
        });
        items.medidasAdministrativas?.forEach((item) => {
          next.add(
            buildLocalAppliedAnalysisItemKey({
              riskId: analysis.riskId,
              targetHierarchyId: analysis.hierarchyId,
              itemType: 'medidasAdministrativasRecomendadas',
              itemName: item.nome,
            }),
          );
        });
        return next;
      });

      return true;
    },
    [
      accessCompanyId,
      applyAiAnalysisAsRiskDataMutation,
      editAnalysisMutation,
      formApplication.id,
    ],
  );

  const handleAddSingleAnalysisItem = useCallback(
    async (
      analysis: any,
      itemType: AnalysisItemType,
      itemIndex: number,
      item: { nome: string },
      options?: { skipMarkAnalysisApplied?: boolean },
    ) => {
      if (!analysis.hierarchyId || !analysis.riskId) {
        enqueueSnackbar('Dados da análise incompletos', { variant: 'error' });
        return;
      }

      const key = buildApplyingItemKey(analysis.id, itemType, itemIndex);
      setApplyingItemKey(key);
      try {
        await applyAnalysisItemsToInventory(
          analysis,
          {
            fontesGeradoras:
              itemType === 'fontesGeradoras' ? [item] : undefined,
            medidasEngenharia:
              itemType === 'medidasEngenhariaRecomendadas' ? [item] : undefined,
            medidasAdministrativas:
              itemType === 'medidasAdministrativasRecomendadas'
                ? [item]
                : undefined,
          },
          options,
        );
        try {
          await acceptFormQuestionsAnswersAnalysisItem({
            companyId: accessCompanyId,
            applicationId: formApplication.id,
            analysisId: analysis.id,
            itemType,
            itemIndex,
          });
        } catch {
          enqueueSnackbar(
            'Item incluído no inventário, mas não foi possível registrar o aceite.',
            { variant: 'warning' },
          );
        }
        void refetch();
      } catch {
        // Erros exibidos pelos hooks de mutação
      } finally {
        setApplyingItemKey(null);
      }
    },
    [
      applyAnalysisItemsToInventory,
      enqueueSnackbar,
      accessCompanyId,
      formApplication.id,
      refetch,
    ],
  );

  // Component for editable analysis items
  const EditableAnalysisItem = ({
    item,
    itemIndex,
    analysisId,
    itemType,
    analysis,
    backgroundColor,
    borderColor,
    itemStatus,
    onAddItem,
    isAddingItem,
    itemCode,
    readOnly = false,
    onEditItem,
    onRemoveItem,
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
    itemStatus?: AnalysisItemInventoryEntry;
    onAddItem?: () => void;
    isAddingItem?: boolean;
    itemCode?: string;
    readOnly?: boolean;
    onEditItem?: (newName: string) => void | Promise<boolean | void>;
    onRemoveItem?: () => void | Promise<void>;
  }) => {
    const canEditAnalysisContent = useCanEditFrpsAnalysisContent();
    const allowContentEdit = !readOnly && canEditAnalysisContent;
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(item.nome);

    useEffect(() => {
      if (!isEditing) {
        setEditValue(item.nome);
      }
    }, [isEditing, item.nome]);

    const handleSave = async () => {
      if (editValue.trim() && editValue !== item.nome) {
        if (onEditItem) {
          const saved = await onEditItem(editValue.trim());
          if (saved === false) return;
        } else {
          await handleEditAnalysisItem(
            analysisId,
            itemType,
            itemIndex,
            editValue.trim(),
            analysis,
          );
        }
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
          backgroundColor: 'transparent',
          color: 'text.primary',
          borderRadius: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
            '.analysis-item-edit-actions': {
              opacity: 1,
            },
          },
          '.analysis-item-add-action': {
            opacity: 1,
            visibility: 'visible',
          },
          '.analysis-item-edit-actions': {
            opacity: 1,
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
              <SFlex alignItems="center" justifyContent="space-between" gap={1}>
                <Box
                  flex={1}
                  minWidth={0}
                  sx={{
                    cursor: allowContentEdit ? 'pointer' : 'default',
                    '&:hover': allowContentEdit
                      ? {
                          '& .item-name': {
                            color: (theme) => theme.palette.mode === 'light' ? '#1565C0' : theme.palette.text.primary,
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                          },
                        }
                      : undefined,
                  }}
                >
                  <SFlex alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                    <Tooltip
                      arrow
                      title={
                        <Box>
                          {allowContentEdit && (
                            <Box sx={{ fontWeight: 600, mb: 1 }}>
                              Clique para editar
                            </Box>
                          )}
                          {item.justificativa && (
                            <Box sx={{ mt: allowContentEdit ? 4 : 0, lineHeight: 1.6 }}>
                              <Box sx={{ fontWeight: 700, mb: 1 }}>Justificativa:</Box>
                              <Box>{item.justificativa}</Box>
                            </Box>
                          )}
                        </Box>
                      }
                    >
                      <SText
                        className="item-name"
                        onClick={
                          allowContentEdit
                            ? () => setIsEditing(true)
                            : undefined
                        }
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (
                            allowContentEdit &&
                            (event.key === 'Enter' || event.key === ' ')
                          ) {
                            event.preventDefault();
                            setIsEditing(true);
                          }
                        }}
                        variant="body2"
                        fontWeight="medium"
                        fontSize={13}
                        sx={{
                          transition: 'color 0.2s ease-in-out',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.nome}
                      </SText>
                    </Tooltip>
                    <AnalysisItemStatusBadges itemStatus={itemStatus} />
                    <ExplainFrpsItemButton
                      analysisId={analysisId}
                      listItemType={itemType}
                      itemName={item.nome}
                      itemKey={
                        item.catalogId || itemStatus?.catalogId
                          ? buildCatalogFrpsItemKey(
                              mapAnalysisListItemTypeToExplanationItemType(
                                itemType,
                              ),
                              (item.catalogId ||
                                itemStatus?.catalogId) as string,
                            )
                          : undefined
                      }
                      riskFactorName={analysis?.analysis?.frps}
                    />
                  </SFlex>
                </Box>
                <SFlex
                  alignItems="center"
                  justifyContent="flex-end"
                  gap={0.5}
                  flexShrink={0}
                  flexWrap="wrap"
                  onClick={(event) => event.stopPropagation()}
                >
                  <FrpsAnalysisItemReviewActions
                    companyId={accessCompanyId}
                    applicationId={formApplication.id}
                    analysisId={analysisId}
                    itemType={itemType}
                    itemIndex={itemIndex}
                    item={item}
                    reviews={analysis?.itemReviews}
                  />
                  {allowContentEdit && (
                    <SFlex
                      className="analysis-item-edit-actions"
                      gap={0.5}
                      alignItems="center"
                      flexShrink={0}
                    >
                      <SIconButton
                        iconButtonProps={{
                          'aria-label': 'Editar item',
                          sx: {
                            p: 0.5,
                            borderRadius: 1,
                            color: 'text.secondary',
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
                      <CatalogAnalysisItemButton analysis={analysis} itemType={itemType} itemIndex={itemIndex} companyId={accessCompanyId} inherited={Boolean(onEditItem)} />
                      <SIconButton
                        iconButtonProps={{
                          'aria-label': 'Excluir item',
                          sx: {
                            p: 0.5,
                            borderRadius: 1,
                            color: 'text.secondary',
                            '&:hover': {
                              backgroundColor: 'error.light',
                              color: 'error.contrastText',
                            },
                          },
                        }}
                        onClick={async () => {
                          if (onRemoveItem) {
                            await onRemoveItem();
                            return;
                          }
                          await handleRemoveAnalysisItem(
                            analysisId,
                            itemType,
                            itemIndex,
                            analysis,
                          );
                        }}
                      >
                        <SIconDelete fontSize="16px" />
                      </SIconButton>
                    </SFlex>
                  )}
                  {onAddItem && !itemStatus?.existsInInventory && (
                    <Box className="analysis-item-add-action">
                      <SButton
                        variant="contained"
                        color="success"
                        size="s"
                        schema={analysisItemPillSchema}
                        textProps={{ fontSize: 11, fontWeight: 500 }}
                        text={
                          isAddingItem
                            ? 'Adicionando...'
                            : 'Aceitar e adicionar'
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          onAddItem();
                        }}
                        buttonProps={{
                          disabled: isAddingItem,
                          title: itemCode
                            ? `Adicionar este item ao inventário (${itemCode})`
                            : 'Adicionar este item ao inventário',
                          sx: analysisItemPillSx,
                        }}
                      />
                    </Box>
                  )}
                </SFlex>
              </SFlex>
            </SFlex>
          )}
        </SFlex>
      </Box>
    );
  };

  const filterPendingAnalysisItems = <T extends { nome: string }>(
    items: T[] | undefined,
    entries: AnalysisItemInventoryEntry[] | undefined,
  ): T[] | undefined => {
    if (!items?.length) return undefined;
    if (!entries?.length) return items;
    const pending = items.filter(
      (_, index) => entries[index]?.existsInInventory !== true,
    );
    return pending.length > 0 ? pending : undefined;
  };

  const handleAddAnalysisAsRiskData = async (
    analysis: any,
    options?: {
      skipItemStatus?: boolean;
      skipMarkAnalysisApplied?: boolean;
      isHierarchyGroupFallback?: boolean;
      sourceAnalysisId?: string;
      riskDataForHierarchy?: import('core/interfaces/api/IRiskData').IRiskData[];
    },
  ) => {
    if (!analysis.hierarchyId || !analysis.riskId) {
      enqueueSnackbar('Dados da análise incompletos', { variant: 'error' });
      return;
    }

    const filterPendingForTarget = <T extends { nome: string }>(
      items: T[] | undefined,
      itemType: AnalysisItemType,
    ): T[] | undefined => {
      if (!items?.length || !options?.sourceAnalysisId) return undefined;

      const pending = items.filter((item, index) => {
        const status = resolveTargetAnalysisItemStatus({
          riskId: analysis.riskId,
          targetHierarchyId: analysis.hierarchyId,
          itemType,
          itemName: item.nome,
          itemIndex: index,
          sourceAnalysisId: options.sourceAnalysisId!,
          results: formQuestionsAnswersAnalysis?.results ?? [],
          analysisInventoryStatus,
          riskDataForHierarchy: options.riskDataForHierarchy,
          locallyAppliedItemKeys,
        });
        return status?.existsInInventory !== true;
      });
      return pending.length > 0 ? pending : undefined;
    };

    const itemStatus = options?.skipItemStatus
      ? undefined
      : analysisInventoryStatus[analysis.id];
    const useItemStatus =
      !options?.isHierarchyGroupFallback && itemStatus != null;
    const useTargetItemStatus = options?.isHierarchyGroupFallback === true;

    const fontesGeradoras = useTargetItemStatus
      ? filterPendingForTarget(
          analysis.analysis?.fontesGeradoras,
          'fontesGeradoras',
        )
      : useItemStatus
        ? filterPendingAnalysisItems(
            analysis.analysis?.fontesGeradoras,
            itemStatus.fontesGeradoras,
          )
        : analysis.analysis?.fontesGeradoras;

    const medidasEngenharia = useTargetItemStatus
      ? filterPendingForTarget(
          analysis.analysis?.medidasEngenhariaRecomendadas,
          'medidasEngenhariaRecomendadas',
        )
      : useItemStatus
        ? filterPendingAnalysisItems(
            analysis.analysis?.medidasEngenhariaRecomendadas,
            itemStatus.medidasEngenhariaRecomendadas,
          )
        : analysis.analysis?.medidasEngenhariaRecomendadas;

    const medidasAdministrativas = useTargetItemStatus
      ? filterPendingForTarget(
          analysis.analysis?.medidasAdministrativasRecomendadas,
          'medidasAdministrativasRecomendadas',
        )
      : useItemStatus
        ? filterPendingAnalysisItems(
            analysis.analysis?.medidasAdministrativasRecomendadas,
            itemStatus.medidasAdministrativasRecomendadas,
          )
        : analysis.analysis?.medidasAdministrativasRecomendadas;

    if (
      (useItemStatus || useTargetItemStatus) &&
      !fontesGeradoras?.length &&
      !medidasEngenharia?.length &&
      !medidasAdministrativas?.length
    ) {
      enqueueSnackbar('Todos os itens já estão no inventário', {
        variant: 'info',
      });
      return;
    }

    try {
      await applyAnalysisItemsToInventory(
        analysis,
        {
          fontesGeradoras,
          medidasEngenharia,
          medidasAdministrativas,
        },
        { skipMarkAnalysisApplied: options?.skipMarkAnalysisApplied },
      );
      const itemLists: Array<[AnalysisItemType, Array<{ nome: string }> | undefined]> = [
        ['fontesGeradoras', fontesGeradoras],
        ['medidasEngenhariaRecomendadas', medidasEngenharia],
        ['medidasAdministrativasRecomendadas', medidasAdministrativas],
      ];
      let failedAcceptances = 0;
      for (const [itemType, includedItems] of itemLists) {
        if (!includedItems?.length) continue;
        const originalItems: Array<{ nome: string }> = analysis.analysis?.[itemType] ?? [];
        for (const [itemIndex, item] of originalItems.entries()) {
          if (!includedItems.includes(item)) continue;
          try {
            await acceptFormQuestionsAnswersAnalysisItem({
              companyId: accessCompanyId,
              applicationId: formApplication.id,
              analysisId: options?.sourceAnalysisId || analysis.id,
              itemType,
              itemIndex,
            });
          } catch {
            failedAcceptances += 1;
          }
        }
      }
      if (failedAcceptances > 0) {
        enqueueSnackbar(`Itens incluídos no inventário, mas ${failedAcceptances} aceite(s) não puderam ser registrados.`, { variant: 'warning' });
      }
      void refetch();
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
        hierarchyIdToWorkspaceName,
        applicationWorkspaceNames,
      }),
    [
      formQuestionsAnswers,
      visibleParticipantGroups,
      selectedGroupingQuestionId,
      entityMap,
      formQuestionsAnswersRisks?.entityEstablishmentMap,
      hierarchyIdToWorkspaceName,
      applicationWorkspaceNames,
    ],
  );

  const establishmentCompanyScope = useMemo(() => {
    const restrict = shouldRestrictRiskAnalysisToEstablishmentCompany({
      selectedGroupingQuestionId,
      selectedGroupingLabel,
      allowedEntityIds,
      visibleEstablishmentGroupCount: visibleParticipantGroups.length,
    });
    if (!restrict || allowedEntityIds == null) {
      return { restrict: false, scopeCompanyId: null as string | null };
    }
    return {
      restrict: true,
      scopeCompanyId: resolveOperationalCompanyIdFromSelectedEstablishmentGroup(
        {
          visibleParticipantGroups,
          participantStructures:
            resolveParticipantStructuresForGrouping(formQuestionsAnswers),
        },
      ),
    };
  }, [
    selectedGroupingQuestionId,
    selectedGroupingLabel,
    allowedEntityIds,
    visibleParticipantGroups,
    formQuestionsAnswers,
  ]);

  const isEntityVisible = useCallback(
    (entityId: string) => {
      if (allowedEntityIds !== null && !allowedEntityIds.has(entityId)) {
        return false;
      }
      return isEntityInEstablishmentCompanyScope({
        entityId,
        entityMap,
        scopeCompanyId: establishmentCompanyScope.scopeCompanyId,
        restrict: establishmentCompanyScope.restrict,
      });
    },
    [allowedEntityIds, entityMap, establishmentCompanyScope],
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
      expandRiskAnalysisEntitiesForHierarchyGroups({
        riskId,
        entityRiskMap,
        groupedEntityRiskMap,
        entityMap,
        hierarchyGroups,
        isEntityVisible,
      }),
    [
      entityRiskMap,
      groupedEntityRiskMap,
      entityMap,
      hierarchyGroups,
      isEntityVisible,
    ],
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

  const occupationalLevelsByRiskId = useMemo(() => {
    const levelsByRiskId = new Map<
      string,
      ReturnType<typeof collectDistinctFrpsOccupationalLevels>
    >();
    for (const riskId of risksWithData) {
      const partitions = buildRiskAnalysisDisplayPartitions({
        entityIds: getEntitiesWithRisk(riskId),
        hierarchyGroups,
        entityMap,
      });
      levelsByRiskId.set(
        riskId,
        collectDistinctFrpsOccupationalLevels({
          severity: riskMap[riskId]?.severity,
          groupProbabilities: partitions.groups.flatMap((entry) => {
            const entityId = entry.memberEntityIds[0];
            return entityId ? [getEffectiveProbability(entityId, riskId)] : [];
          }),
          ungroupedProbabilities: partitions.ungrouped.map((entityId) =>
            getEffectiveProbability(entityId, riskId),
          ),
        }),
      );
    }
    return levelsByRiskId;
  }, [
    risksWithData,
    getEntitiesWithRisk,
    hierarchyGroups,
    entityMap,
    riskMap,
    getEffectiveProbability,
  ]);

  const occupationalDistribution = useMemo(
    () =>
      aggregateFrpsOccupationalDistribution({
        risks: risksWithData.map((riskId) => {
          const partitions = buildRiskAnalysisDisplayPartitions({
            entityIds: getEntitiesWithRisk(riskId),
            hierarchyGroups,
            entityMap,
          });
          return {
            riskId,
            severity: riskMap[riskId]?.severity,
            groups: partitions.groups.map((group) => ({
              memberEntityIds: group.memberEntityIds,
            })),
            ungroupedEntityIds: partitions.ungrouped,
          };
        }),
        analysisResults: formQuestionsAnswersAnalysis?.results ?? [],
        getEffectiveProbability,
      }),
    [
      entityMap,
      formQuestionsAnswersAnalysis?.results,
      getEffectiveProbability,
      getEntitiesWithRisk,
      hierarchyGroups,
      riskMap,
      risksWithData,
    ],
  );

  const visibleRiskIds = useMemo(
    () =>
      risksWithData.filter((riskId) =>
        frpsPassesOccupationalFilter({
          levels: occupationalLevelsByRiskId.get(riskId) ?? [],
          selectedLevels: selectedOccupationalLevels,
        }),
      ),
    [risksWithData, occupationalLevelsByRiskId, selectedOccupationalLevels],
  );

  const clearAiRiskOptions = useMemo(
    () =>
      risksWithData.map((riskId) => ({
        id: riskId,
        label: riskMap[riskId]?.name ?? riskId,
      })),
    [risksWithData, riskMap],
  );

  const clearAiHierarchyOptions = useMemo(() => {
    return Object.keys(entityMap)
      .filter((entityId) => isEntityVisible(entityId))
      .map((entityId) => ({
        id: entityId,
        label: entityMap[entityId]?.name ?? entityId,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }),
      );
  }, [entityMap, isEntityVisible]);

  const clearAiHierarchyGroupOptions = useMemo(
    () =>
      hierarchyGroups.map((group) => ({
        id: group.id,
        label: group.name,
      })),
    [hierarchyGroups],
  );

  const fallbackHierarchyTargets = useMemo(() => {
    if (!formQuestionsAnswersAnalysis?.results?.length) return [];

    const targets = new Map<string, string>();
    for (const riskId of risksWithData) {
      for (const entityId of getEntitiesWithRisk(riskId)) {
        const resolved =
          resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback({
            riskId,
            entityId,
            results: formQuestionsAnswersAnalysis.results,
            hierarchyGroups,
          });
        if (resolved.source !== 'hierarchy_group_fallback') continue;

        const companyId = entityMap[entityId]?.companyId;
        if (companyId) targets.set(entityId, companyId);
      }
    }

    return Array.from(targets.entries()).map(([hierarchyId, companyId]) => ({
      hierarchyId,
      companyId,
    }));
  }, [
    entityMap,
    formQuestionsAnswersAnalysis?.results,
    getEntitiesWithRisk,
    hierarchyGroups,
    risksWithData,
  ]);

  const fallbackRiskDataQueries = useQueries({
    queries: fallbackHierarchyTargets.map(({ hierarchyId, companyId }) => ({
      queryKey: [
        QueryEnum.RISK_DATA,
        companyId,
        hierarchyId,
        QueryEnum.HIERARCHY,
        'form-risk-analysis-inherited-target',
      ],
      queryFn: () => fetchFullRiskDataForHierarchy(companyId, hierarchyId),
      enabled: Boolean(companyId && hierarchyId),
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
    })),
  });

  const riskDataByHierarchyId = useMemo(() => {
    const map = new Map<
      string,
      import('core/interfaces/api/IRiskData').IRiskData[]
    >();
    fallbackHierarchyTargets.forEach(({ hierarchyId }, index) => {
      const data = fallbackRiskDataQueries[index]?.data;
      if (data) map.set(hierarchyId, data);
    });
    return map;
  }, [fallbackHierarchyTargets, fallbackRiskDataQueries]);

  const enrichedInventoryStatusByKey = useMemo(
    () =>
      buildEnrichedInventoryStatusByKey({
        inventoryStatusByKey,
        riskLogEntries: riskLogs,
        riskDataByHierarchyId,
        locallyAppliedRiskKeys: locallyAppliedInventoryKeys,
      }),
    [
      inventoryStatusByKey,
      locallyAppliedInventoryKeys,
      riskDataByHierarchyId,
      riskLogs,
    ],
  );

  const isRiskInInventory = useCallback(
    (riskId: string, entityId: string) =>
      enrichedInventoryStatusByKey[
        buildInventoryStatusKey(riskId, entityId)
      ] === true,
    [enrichedInventoryStatusByKey],
  );

  const isAnalysisApplied = useCallback(
    (analysis: {
      id: string;
      riskId: string;
      hierarchyId: string;
      analysis?: Record<string, unknown> | null;
    }) => {
      const markedApplied =
        (analysis.analysis as { isAddedAsRiskData?: boolean } | undefined)
          ?.isAddedAsRiskData === true || addedRisks.has(analysis.id);
      if (!markedApplied) return false;
      return isRiskInInventory(analysis.riskId, analysis.hierarchyId);
    },
    [addedRisks, isRiskInInventory],
  );

  const getApplyAnalysisButtonProps = useCallback(
    (
      analysis: {
        id: string;
        riskId: string;
        hierarchyId: string;
        analysis?: Record<string, unknown> | null;
      },
      options?: {
        isHierarchyGroupFallback?: boolean;
        sourceAnalysisId?: string;
        riskDataForHierarchy?: import('core/interfaces/api/IRiskData').IRiskData[];
      },
    ) => {
      const riskInInventory = isRiskInInventory(
        analysis.riskId,
        analysis.hierarchyId,
      );
      const pendingCount =
        options?.isHierarchyGroupFallback &&
        options.sourceAnalysisId &&
        analysis.analysis
          ? countPendingTargetAnalysisItems({
              analysisContent: analysis.analysis as {
                fontesGeradoras?: Array<{ nome: string }>;
                medidasEngenhariaRecomendadas?: Array<{ nome: string }>;
                medidasAdministrativasRecomendadas?: Array<{ nome: string }>;
              },
              riskId: analysis.riskId,
              targetHierarchyId: analysis.hierarchyId,
              sourceAnalysisId: options.sourceAnalysisId,
              results: formQuestionsAnswersAnalysis?.results ?? [],
              analysisInventoryStatus,
              riskDataForHierarchy: options.riskDataForHierarchy,
              locallyAppliedItemKeys,
            })
          : countPendingAnalysisItems(analysis);

      if (pendingCount === null) {
        const applied = options?.isHierarchyGroupFallback
          ? riskInInventory
          : isAnalysisApplied(analysis);
        return {
          text: applied ? 'Adicionar novamente' : 'Adicionar',
          color: applied ? ('paper' as const) : ('success' as const),
        };
      }

      if (!riskInInventory) {
        return { text: 'Adicionar', color: 'success' as const };
      }

      if (pendingCount > 0) {
        return {
          text: `Adicionar pendentes (${pendingCount})`,
          color: 'success' as const,
        };
      }

      if (options?.isHierarchyGroupFallback || isAnalysisApplied(analysis)) {
        return { text: 'Adicionar novamente', color: 'paper' as const };
      }

      return { text: 'Todos no inventário', color: 'paper' as const };
    },
    [
      analysisInventoryStatus,
      countPendingAnalysisItems,
      formQuestionsAnswersAnalysis?.results,
      isAnalysisApplied,
      isRiskInInventory,
      locallyAppliedItemKeys,
    ],
  );

  const handleAddAnalysisItemToAllGroupMembers = useCallback(
    async (
      riskId: string,
      memberEntityIds: string[],
      itemType: AnalysisItemType,
      itemIndex: number,
      item: { nome: string },
    ) => {
      const analysisResults = formQuestionsAnswersAnalysis?.results ?? [];
      const successes: string[] = [];
      const failures: Array<{ label: string; reason: string }> = [];

      const resolveMemberItemStatusForGroup = (entityId: string) => {
        const memberResolved =
          resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback({
            riskId,
            entityId,
            results: analysisResults,
            hierarchyGroups,
          });

        if (!memberResolved.analysis) return undefined;

        const memberIsFallback =
          memberResolved.source === 'hierarchy_group_fallback';

        return memberIsFallback
          ? resolveTargetAnalysisItemStatus({
              riskId,
              targetHierarchyId: entityId,
              itemType,
              itemName: item.nome,
              itemIndex,
              sourceAnalysisId: memberResolved.analysis.id,
              results: analysisResults,
              analysisInventoryStatus,
              riskDataForHierarchy: riskDataByHierarchyId.get(entityId),
              locallyAppliedItemKeys,
            })
          : getAnalysisItemStatus(
              memberResolved.analysis.id,
              itemType,
              itemIndex,
            );
      };

      const membersNeedingItem = memberEntityIds.filter((entityId) => {
        const status = resolveMemberItemStatusForGroup(entityId);
        return status?.existsInInventory !== true;
      });

      if (membersNeedingItem.length === 0) {
        enqueueSnackbar(
          'Este item já está aplicado em todos os setores do agrupamento',
          { variant: 'info' },
        );
        return;
      }

      const baseRiskAssignedLocally = new Set<string>();

      for (const entityId of membersNeedingItem) {
        const memberLabel = formatRiskAnalysisMemberLabel({
          entityId,
          entityMap,
          entityEstablishmentMap,
        });

        const hasBaseRisk =
          isRiskInInventory(riskId, entityId) ||
          baseRiskAssignedLocally.has(entityId);

        if (!hasBaseRisk) {
          try {
            await assignRisksFormApplication({
              companyId: accessCompanyId,
              applicationId: formApplication.id,
              risks: [
                {
                  riskId,
                  hierarchyId: entityId,
                  probability: getEffectiveProbability(entityId, riskId),
                },
              ],
            });
            setLocallyAppliedInventoryKeys((prev) => {
              const next = new Set(prev);
              next.add(buildInventoryStatusKey(riskId, entityId));
              return next;
            });
            baseRiskAssignedLocally.add(entityId);
          } catch (error) {
            failures.push({
              label: memberLabel,
              reason:
                extractApiError(error as never) || 'Falha ao criar risco base',
            });
            continue;
          }
        }

        const memberResolved =
          resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback({
            riskId,
            entityId,
            results: analysisResults,
            hierarchyGroups,
          });

        if (!memberResolved.analysis) {
          failures.push({
            label: memberLabel,
            reason: 'Análise não encontrada para o setor',
          });
          continue;
        }

        const memberAnalysis = buildTargetAiAnalysisViewModel({
          resolved: memberResolved,
          targetHierarchyId: entityId,
          targetProbability: getEffectiveProbability(entityId, riskId),
        });

        if (!memberAnalysis) {
          failures.push({
            label: memberLabel,
            reason: 'Não foi possível preparar a análise do setor',
          });
          continue;
        }

        const memberIsFallback =
          memberResolved.source === 'hierarchy_group_fallback';

        try {
          await applyAnalysisItemsToInventory(
            memberAnalysis,
            {
              fontesGeradoras:
                itemType === 'fontesGeradoras' ? [item] : undefined,
              medidasEngenharia:
                itemType === 'medidasEngenhariaRecomendadas'
                  ? [item]
                  : undefined,
              medidasAdministrativas:
                itemType === 'medidasAdministrativasRecomendadas'
                  ? [item]
                  : undefined,
            },
            {
              skipMarkAnalysisApplied: memberIsFallback ? true : undefined,
              suppressMutationFeedback: true,
            },
          );
          try {
            await acceptFormQuestionsAnswersAnalysisItem({
              companyId: accessCompanyId,
              applicationId: formApplication.id,
              analysisId: memberResolved.analysis.id,
              itemType,
              itemIndex,
            });
          } catch {
            enqueueSnackbar(
              `Item incluído em ${memberLabel}, mas não foi possível registrar o aceite.`,
              { variant: 'warning' },
            );
          }
          successes.push(memberLabel);
        } catch (error) {
          failures.push({
            label: memberLabel,
            reason: extractApiError(error as never) || 'Falha ao aplicar item',
          });
        }
      }

      await refetchFormRisksInventoryStatus(queryClient, {
        companyId: accessCompanyId,
        applicationId: formApplication.id,
      });
      void refetch();

      if (failures.length === 0) {
        enqueueSnackbar(
          `Item aplicado em ${successes.length} setor(es) do agrupamento`,
          { variant: 'success' },
        );
        return;
      }

      if (successes.length > 0) {
        const failedLabels = failures
          .map((failure) => failure.label)
          .join(', ');
        enqueueSnackbar(
          `Item aplicado em ${successes.length}/${membersNeedingItem.length} setores. Falharam: ${failedLabels}`,
          { variant: 'warning' },
        );
        return;
      }

      enqueueSnackbar(
        `Não foi possível aplicar o item nos setores pendentes: ${failures.map((failure) => failure.label).join(', ')}`,
        { variant: 'error' },
      );
    },
    [
      accessCompanyId,
      analysisInventoryStatus,
      applyAnalysisItemsToInventory,
      entityEstablishmentMap,
      entityMap,
      formApplication.id,
      formQuestionsAnswersAnalysis?.results,
      getAnalysisItemStatus,
      getEffectiveProbability,
      hierarchyGroups,
      isRiskInInventory,
      locallyAppliedItemKeys,
      queryClient,
      refetch,
      riskDataByHierarchyId,
      enqueueSnackbar,
    ],
  );

  const handleAddMemberAnalysisItem = useCallback(
    async (riskId: string, entityId: string, entry: AnalysisItemCodeEntry) => {
      if (!isRiskInInventory(riskId, entityId)) return;

      const analysisResults = formQuestionsAnswersAnalysis?.results ?? [];

      const memberResolved =
        resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback({
          riskId,
          entityId,
          results: analysisResults,
          hierarchyGroups,
        });

      if (!memberResolved.analysis) {
        enqueueSnackbar('Análise não encontrada para o setor', {
          variant: 'error',
        });
        return;
      }

      const memberIsFallback =
        memberResolved.source === 'hierarchy_group_fallback';

      const itemStatus = memberIsFallback
        ? resolveTargetAnalysisItemStatus({
            riskId,
            targetHierarchyId: entityId,
            itemType: entry.itemType,
            itemName: entry.nome,
            itemIndex: entry.itemIndex,
            sourceAnalysisId: memberResolved.analysis.id,
            results: analysisResults,
            analysisInventoryStatus,
            riskDataForHierarchy: riskDataByHierarchyId.get(entityId),
            locallyAppliedItemKeys,
          })
        : getAnalysisItemStatus(
            memberResolved.analysis.id,
            entry.itemType,
            entry.itemIndex,
          );

      if (itemStatus?.existsInInventory === true) {
        enqueueSnackbar(
          `Item ${entry.code} já está no inventário deste setor`,
          {
            variant: 'info',
          },
        );
        return;
      }

      const memberAnalysis = buildTargetAiAnalysisViewModel({
        resolved: memberResolved,
        targetHierarchyId: entityId,
        targetProbability: getEffectiveProbability(entityId, riskId),
      });

      if (!memberAnalysis) {
        enqueueSnackbar('Não foi possível preparar a análise do setor', {
          variant: 'error',
        });
        return;
      }

      const memberLabel = formatRiskAnalysisMemberLabel({
        entityId,
        entityMap,
        entityEstablishmentMap,
      });

      try {
        await applyAnalysisItemsToInventory(
          memberAnalysis,
          {
            fontesGeradoras:
              entry.itemType === 'fontesGeradoras'
                ? [{ nome: entry.nome }]
                : undefined,
            medidasEngenharia:
              entry.itemType === 'medidasEngenhariaRecomendadas'
                ? [{ nome: entry.nome }]
                : undefined,
            medidasAdministrativas:
              entry.itemType === 'medidasAdministrativasRecomendadas'
                ? [{ nome: entry.nome }]
                : undefined,
          },
          {
            skipMarkAnalysisApplied: memberIsFallback ? true : undefined,
            suppressMutationFeedback: true,
          },
        );

        await refetchFormRisksInventoryStatus(queryClient, {
          companyId: accessCompanyId,
          applicationId: formApplication.id,
        });
        void refetch();

        enqueueSnackbar(`Item ${entry.code} aplicado em ${memberLabel}`, {
          variant: 'success',
        });
      } catch (error) {
        enqueueSnackbar(
          extractApiError(error as never) || `Falha ao aplicar ${entry.code}`,
          { variant: 'error' },
        );
      }
    },
    [
      accessCompanyId,
      analysisInventoryStatus,
      applyAnalysisItemsToInventory,
      entityEstablishmentMap,
      entityMap,
      formApplication.id,
      formQuestionsAnswersAnalysis?.results,
      getAnalysisItemStatus,
      getEffectiveProbability,
      hierarchyGroups,
      isRiskInInventory,
      locallyAppliedItemKeys,
      queryClient,
      refetch,
      riskDataByHierarchyId,
      enqueueSnackbar,
    ],
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
        if (isRiskInInventory(riskId, entityId)) {
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
      isRiskInInventory,
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

  const handleAddRiskToGroupMembers = (
    riskId: string,
    memberEntityIds: string[],
  ) => {
    const risksToAdd = memberEntityIds
      .filter((entityId) => !isRiskInInventory(riskId, entityId))
      .map((entityId) => ({
        riskId,
        probability: getEffectiveProbability(entityId, riskId),
        hierarchyId: entityId,
      }));

    if (risksToAdd.length === 0) return;

    mutateAssignRisksFormApplication({
      companyId: accessCompanyId,
      applicationId: formApplication.id,
      risks: risksToAdd,
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

  const handleAnalyzeRisks = (options?: {
    riskBand?: 'PRIORITY' | 'HIGH' | 'VERY_HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
    mode?: AiAnalyzeFormQuestionsRisksModeEnum;
    riskId?: string;
    hierarchyId?: string;
    successMessage?: string;
  }) => {
    batchFailureNotifiedRef.current = false;
    const masterOverrides = buildMasterAiRequestOverrides(
      isMaster,
      aiMasterConfig,
    );

    mutateAiAnalyzeFormQuestionsRisks(
      {
        companyId: accessCompanyId,
        formApplicationId: formApplication.id,
        mode:
          options?.mode ?? AiAnalyzeFormQuestionsRisksModeEnum.FULL_INCREMENTAL,
        riskBand: options?.riskBand ?? 'PRIORITY',
        riskId: options?.riskId,
        hierarchyId: options?.hierarchyId,
        ...masterOverrides,
      },
      {
        onSuccess: () => {
          enqueueSnackbar(
            options?.successMessage ?? 'Análise de IA iniciada.',
            { variant: 'success' },
          );
          void refetch();
          setTimeout(() => void refetch(), 3000);
        },
      },
    );
  };

  const handleAnalyzeButtonClick = async (riskBand: 'PRIORITY' | 'HIGH' | 'VERY_HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW') => {
    if (hasPreviousAiRun) {
      const confirmed = await showConfirmation(REANALYSIS_CONFIRMATION);
      if (!confirmed) return;
    }

    handleAnalyzeRisks({
      mode: AiAnalyzeFormQuestionsRisksModeEnum.FULL_INCREMENTAL,
      riskBand,
    });
  };

  const riskBandForTarget = (riskId: string, hierarchyId: string): 'PRIORITY' | 'HIGH' | 'VERY_HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW' => {
    const level = getMatrizRisk(riskMap[riskId]?.severity, getEffectiveProbability(hierarchyId, riskId))?.level;
    return level === 1 ? 'VERY_LOW' : level === 2 ? 'LOW' : level === 3 ? 'MODERATE' : level === 4 ? 'HIGH' : 'VERY_HIGH';
  };
  const handleTargetAnalyze = async (riskId: string, hierarchyId: string) => {
    const hasOwnAnalysis = hasOwnAnalysisForPair(riskId, hierarchyId);

    if (hasOwnAnalysis) {
      const confirmed = await showConfirmation(TARGET_REANALYSIS_CONFIRMATION);
      if (!confirmed) return;
    }

    handleAnalyzeRisks({
      mode: AiAnalyzeFormQuestionsRisksModeEnum.TARGET,
      riskBand: riskBandForTarget(riskId, hierarchyId),
      riskId,
      hierarchyId,
      successMessage: hasOwnAnalysis
        ? 'Análise de IA deste setor reiniciada.'
        : 'Análise de IA deste setor iniciada.',
    });
  };

  const handleGroupTargetAnalyze = async (
    riskId: string,
    memberEntityIds: string[],
  ) => {
    const canonicalHierarchyId = pickCanonicalGroupMemberId({
      memberEntityIds,
      riskId,
      results: formQuestionsAnswersAnalysis?.results ?? [],
    });

    const hasGroupAnalysis = memberEntityIds.some((hierarchyId) =>
      hasOwnAnalysisForPair(riskId, hierarchyId),
    );

    if (hasGroupAnalysis) {
      const confirmed = await showConfirmation(
        GROUP_TARGET_REANALYSIS_CONFIRMATION,
      );
      if (!confirmed) return;
    }

    handleAnalyzeRisks({
      mode: AiAnalyzeFormQuestionsRisksModeEnum.TARGET,
      riskId,
      hierarchyId: canonicalHierarchyId,
      riskBand: riskBandForTarget(riskId, canonicalHierarchyId),
      successMessage: hasGroupAnalysis
        ? 'Análise de IA do agrupamento reiniciada.'
        : 'Análise de IA do agrupamento iniciada.',
    });
  };


  const buildBulkRiskTasks = (ids: string[], riskIds: string[], includeAi: boolean): BulkRiskAddTask[] => {
    const tasks: BulkRiskAddTask[] = [];
    const entitiesByRisk = new Map([...new Set(riskIds)].map(riskId => [riskId, new Set(getEntitiesWithRisk(riskId))]));
    for (const hierarchyId of [...new Set(ids)]) {
      for (const riskId of entitiesByRisk.keys()) {
        if (!entitiesByRisk.get(riskId)?.has(hierarchyId)) continue;
        const probability = getEffectiveProbability(hierarchyId, riskId);
        const eligibility = formQuestionsAnswersRisks.aiEligibilityByEntity?.[hierarchyId]?.[riskId];
        const resolved = resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback({ riskId, entityId: hierarchyId, results: formQuestionsAnswersAnalysis?.results ?? [], hierarchyGroups });
        const source = resolved.analysis;
        const target = buildTargetAiAnalysisViewModel({ resolved, targetHierarchyId: hierarchyId, targetProbability: probability });
        const available = source?.metadata?.protectedData !== true && target?.analysis != null;
        const lists = available ? [
          { type: 'fontesGeradoras' as const, items: target.analysis?.fontesGeradoras ?? [] },
          { type: 'medidasEngenhariaRecomendadas' as const, items: target.analysis?.medidasEngenhariaRecomendadas ?? [] },
          { type: 'medidasAdministrativasRecomendadas' as const, items: target.analysis?.medidasAdministrativasRecomendadas ?? [] },
        ] : [];
        const pending = (type: AnalysisItemType, items: Array<{ nome: string }>) => items.filter((item, itemIndex) => resolveTargetAnalysisItemStatus({
          riskId, targetHierarchyId: hierarchyId, itemType: type, itemName: item.nome, itemIndex,
          sourceAnalysisId: source!.id, results: formQuestionsAnswersAnalysis?.results ?? [], analysisInventoryStatus,
          riskDataForHierarchy: riskDataByHierarchyId.get(hierarchyId), locallyAppliedItemKeys,
        })?.existsInInventory !== true);
        const sourceItems = lists.find(list => list.type === 'fontesGeradoras')?.items ?? [];
        const engineering = lists.find(list => list.type === 'medidasEngenhariaRecomendadas')?.items ?? [];
        const administrative = lists.find(list => list.type === 'medidasAdministrativasRecomendadas')?.items ?? [];
        const pendingItems = available && target && source ? { fontesGeradoras: pending('fontesGeradoras', sourceItems), medidasEngenharia: pending('medidasEngenhariaRecomendadas', engineering), medidasAdministrativas: pending('medidasAdministrativasRecomendadas', administrative) } : { fontesGeradoras: [], medidasEngenharia: [], medidasAdministrativas: [] };
        const alreadyInInventory = isRiskInInventory(riskId, hierarchyId);
        const steps: BulkRiskAddTask['steps'] = [];
        const stepLabels: string[] = [];
        if (!alreadyInInventory) stepLabels.push('Adicionar o risco ao inventário');
        if (!alreadyInInventory) steps.push(async () => {
          await assignRisksFormApplication({ companyId: accessCompanyId, applicationId: formApplication.id, risks: [{ hierarchyId, riskId, probability }] });
          setLocallyAppliedInventoryKeys(previous => new Set(previous).add(buildInventoryStatusKey(riskId, hierarchyId)));
        });
        if (includeAi && available && target && source) {
          const items = pendingItems;
          if (Object.values(items).some(list => list.length)) {
            stepLabels.push('Incluir fontes geradoras e recomendações');
            steps.push(() => applyAnalysisItemsToInventory(target, items, { skipMarkAnalysisApplied: true, suppressMutationFeedback: true }));
          }
          for (const list of lists) for (const itemIndex of list.items.keys()) {
            stepLabels.push(`Registrar aceite de ${list.type === 'fontesGeradoras' ? 'fonte geradora' : 'recomendação'} ${itemIndex + 1}`);
            steps.push(() => acceptFormQuestionsAnswersAnalysisItem({ companyId: accessCompanyId, applicationId: formApplication.id, analysisId: source.id, itemType: list.type, itemIndex }));
          }
        }
        tasks.push({ id: `${hierarchyId}:${riskId}`, riskId, label: `${entityMap[hierarchyId]?.name} — ${riskMap[riskId]?.name}`,
          level: eligibility?.eligible === false ? null : resolveOccupationalRiskLevel(riskMap[riskId]?.severity, probability) ?? null,
          alreadyInInventory, sources: sourceItems.length, recommendations: engineering.length + administrative.length,
          sourcesToAdd: pendingItems.fontesGeradoras.length, recommendationsToAdd: pendingItems.medidasEngenharia.length + pendingItems.medidasAdministrativas.length,
          hasAnalysis: lists.some(list => list.items.length > 0), steps, stepLabels });
      }
    }
    return tasks;
  };

  const buildBulkRemoveTasks = (ids: string[], riskIds: string[]): BulkRiskAddTask[] => {
    const tasks: BulkRiskAddTask[] = [];
    const entitiesByRisk = new Map([...new Set(riskIds)].map(riskId => [riskId, new Set(getEntitiesWithRisk(riskId))]));
    for (const hierarchyId of new Set(ids)) for (const riskId of entitiesByRisk.keys()) {
      if (!entitiesByRisk.get(riskId)?.has(hierarchyId) || !isRiskInInventory(riskId, hierarchyId)) continue;
      const probability = getEffectiveProbability(hierarchyId, riskId);
      const protectedData = formQuestionsAnswersRisks.aiEligibilityByEntity?.[hierarchyId]?.[riskId]?.eligible === false;
      tasks.push({ id: `${hierarchyId}:${riskId}`, riskId, label: `${entityMap[hierarchyId]?.name} — ${riskMap[riskId]?.name}`,
        level: protectedData ? null : resolveOccupationalRiskLevel(riskMap[riskId]?.severity, probability) ?? null,
        alreadyInInventory: true, sources: 0, recommendations: 0, hasAnalysis: false,
        stepLabels: ['Remover risco e todos os vínculos do inventário'], steps: [async () => {
          await api.post(`/v2/companies/${accessCompanyId}/forms/applications/${formApplication.id}/remove-risk`, { hierarchyId, riskId });
          const key = buildInventoryStatusKey(riskId, hierarchyId);
          setLocallyAppliedInventoryKeys(previous => new Set([...previous].filter(value => value !== key)));
          setLocallyAppliedItemKeys(previous => new Set([...previous].filter(value => !value.startsWith(`${riskId}:${hierarchyId}:`))));
        }] });
    }
    return tasks;
  };

  const refreshBulkRiskStatus = async () => {
    await Promise.all([refetch(), refetchFormRisksInventoryStatus(queryClient, { companyId: accessCompanyId, applicationId: formApplication.id }), queryClient.refetchQueries({ queryKey: [QueryEnum.RISK_DATA] }), queryClient.refetchQueries({ queryKey: getKeyBrowseFormApplicationRiskLog({ companyId: accessCompanyId, applicationId: formApplication.id }) })]);
  };

  const renderSectorRisk = (entityId: string, riskId: string, sectorFirst = false) => {
    const risk = riskMap[riskId];

                                const entity = entityMap[entityId];
                                const eligibility = formQuestionsAnswersRisks?.aiEligibilityByEntity?.[entityId]?.[riskId];
                                const ineligible = eligibility?.eligible === false;

                                const severity = risk?.severity;
                                const probability = getEffectiveProbability(
                                  entityId,
                                  riskId,
                                );
                                const hasValidSeverity =
                                  isMatrixAxisValue(severity);
                                const hasValidProbability =
                                  isMatrixAxisValue(probability);
                                const matriz =
                                  hasValidSeverity && hasValidProbability
                                    ? getMatrizRisk(severity, probability)
                                    : null;
                                const occupationalLevel =
                                  resolveOccupationalRiskLevel(
                                    severity,
                                    probability,
                                  );

                                return (
                                  <Box component="details"
                                    key={`${riskId}-${entityId}`}
                                    sx={{
                                      p: 4,
                                      backgroundColor: 'transparent',
                                      color: 'text.primary',
                                      borderRadius: 0,
                                      border: 0,
                                      borderColor: 'divider',
 '& > summary::-webkit-details-marker': { display: 'none' },
 '&[open] > summary .sector-disclosure-arrow': { transform: 'rotate(90deg)' },
                                    }}
                                  >
                                    <SFlex component="summary"
                                      sx={{ cursor: 'pointer', listStyle: 'none', borderBottom: '1px solid', borderColor: 'divider', pb: 3 }}
                                      onClick={(event) => { if ((event.target as HTMLElement).closest('button')) event.preventDefault(); }}
                                      alignItems="center"
                                      gap={2}
                                      mb={2}
                                      flexWrap="wrap"
                                    >
                                      <SFlex
                                        alignItems="center"
                                        gap={2}
                                        flex={1}
                                        minWidth={0}
                                        flexWrap="wrap"
                                      >
                                        <ChevronRightIcon className="sector-disclosure-arrow" sx={{ fontSize: 18, flexShrink: 0 }} />
                                        <Typography
                                          variant="body1"
                                          color="text.primary"
                                          fontWeight="medium"
                                          sx={{ minWidth: 0 }}
                                        >
                                          {sectorFirst ? risk.name : `${hierarchyTypeTranslation[entity.type].toUpperCase()} — ${entity.name}`}
                                        </Typography>

{isRiskInInventory(riskId, entityId) ? (
                                          <SFlex alignItems="center" gap={0.5}>
                                            <CheckIcon
                                              sx={{
                                                fontSize: 14,
                                                color: 'text.secondary',
                                              }}
                                            />
                                            <SText
                                              color="text.secondary"
                                              fontSize={12}
                                            >
                                              Risco adicionado
                                            </SText>
                                          </SFlex>
                                        ) : (
                                          <SButton
                                            variant="shade"
                                            schema={analysisItemPillSchema}
 textProps={{ fontSize: 12 }}
 buttonProps={{ sx: { ...analysisItemPillSx, height: 24 } }}
                                            size="s"
                                            text="Adicionar risco a este setor"
                                            onClick={() =>
                                              handleAddRiskToEntity(
                                                riskId,
                                                entityId,
                                              )
                                            }
                                          />
                                        )}
<AiActionButtonGroup
                                          variant="s-button-shade"
                                          configureIconOnly
                                          executeIconOnly
                                          label={
                                            isTargetAnalysisProcessing(
                                              riskId,
                                              entityId,
                                            )
                                              ? 'Analisando IA...'
                                              : isTargetAnalysisStale(
                                                    riskId,
                                                    entityId,
                                                  )
                                                ? 'Processamento interrompido'
                                                : hasOwnAnalysisForPair(
                                                      riskId,
                                                      entityId,
                                                    )
                                                  ? 'Analisar IA novamente somente deste setor'
                                                  : 'Analisar IA somente deste setor'
                                          }
                                          loading={isTargetAnalysisProcessing(
                                            riskId,
                                            entityId,
                                          )}
                                          disabled={isTargetAnalysisProcessing(
                                            riskId,
                                            entityId,
                                          )}
                                          onExecute={() =>
                                            void handleTargetAnalyze(
                                              riskId,
                                              entityId,
                                            )
                                          }
                                          onConfigure={() =>
                                            setAiConfigDialogOpen(true)
                                          }
                                          isMaster={isMaster}
                                          sButtonProps={{ color: 'primary' }}
                                        />
                                      </SFlex>
                                      <SFlex
                                        alignItems="center"
                                        gap={1}
                                        flexWrap="wrap"
                                      >


                                        <FrpsMatrixEquation
                                          protectedData={ineligible}
                                          minParticipants={eligibility?.minParticipants}
                                          probability={probability}
                                          severity={severity}
                                          resultLevel={occupationalLevel}
                                          riskType={risk?.type}
                                          riskSubTypes={risk?.subTypes}
                                        />
                                      </SFlex>
                                    </SFlex>
                                    {/* AI Analysis Results for this specific risk-entity combination */}
                                    {formQuestionsAnswersAnalysis?.results &&
                                      (() => {
                                        const resolved =
                                          resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback(
                                            {
                                              riskId,
                                              entityId,
                                              results:
                                                formQuestionsAnswersAnalysis.results,
                                              hierarchyGroups,
                                            },
                                          );

                                        if (
                                          !resolved.analysis &&
                                          !resolved.failedAnalysis
                                        ) {
                                          return <ManualRiskContentSections companyId={accessCompanyId} applicationId={formApplication.id} hierarchyId={entityId} riskId={riskId} riskName={risk?.name || ''} />;
                                        }

                                        if (!resolved.analysis) {
                                          if (
                                            resolved.failedAnalysis &&
                                            isOccupationalRiskEligibleForAiAnalysis(
                                              matriz,
                                            )
                                          ) {
                                            return (
                                              <Box mt={3}>
                                                <ManualRiskContentSections companyId={accessCompanyId} applicationId={formApplication.id} hierarchyId={entityId} riskId={riskId} riskName={risk?.name || ''} />
                                                <Typography
                                                  variant="body2"
                                                  color="error.main"
                                                  sx={{ fontStyle: 'italic' }}
                                                >
                                                  Análise de IA falhou:{' '}
                                                  {getFormAiAnalysisErrorMessage(
                                                    resolved.failedAnalysis
                                                      .metadata as
                                                      | Record<string, unknown>
                                                      | undefined,
                                                  )}
                                                </Typography>
                                              </Box>
                                            );
                                          }

                                          return <ManualRiskContentSections companyId={accessCompanyId} applicationId={formApplication.id} hierarchyId={entityId} riskId={riskId} riskName={risk?.name || ''} />;
                                        }

                                        const isHierarchyGroupFallback =
                                          resolved.source ===
                                          'hierarchy_group_fallback';
                                        const sourceAnalysis =
                                          resolved.analysis!;
                                        const analysis =
                                          buildTargetAiAnalysisViewModel({
                                            resolved,
                                            targetHierarchyId: entityId,
                                            targetProbability:
                                              getEffectiveProbability(
                                                entityId,
                                                riskId,
                                              ),
                                          })!;
                                        const fallbackApplyOptions =
                                          isHierarchyGroupFallback
                                            ? {
                                                skipMarkAnalysisApplied:
                                                  true as const,
                                              }
                                            : undefined;
                                        const riskDataForHierarchy =
                                          riskDataByHierarchyId.get(entityId);
                                        const fallbackUiOptions =
                                          isHierarchyGroupFallback
                                            ? {
                                                isHierarchyGroupFallback:
                                                  true as const,
                                                sourceAnalysisId:
                                                  sourceAnalysis.id,
                                                riskDataForHierarchy,
                                              }
                                            : undefined;
                                        const displayAnalysisContent =
                                          sourceAnalysis.analysis;
                                        const isAnalysisProtected =
                                          sourceAnalysis.metadata
                                            ?.protectedData === true;
                                        const protectedAnalysisLabel =
                                          (typeof sourceAnalysis.metadata
                                            ?.protectedDataLabel === 'string' &&
                                            sourceAnalysis.metadata
                                              .protectedDataLabel) ||
                                          'Dados Protegidos';
                                        const itemCodeRegistry =
                                          buildAnalysisItemCodeRegistry(
                                            displayAnalysisContent,
                                          );
                                        const resolveDisplayedItemStatus = (
                                          itemType: AnalysisItemType,
                                          itemName: string,
                                          itemIndex: number,
                                        ) =>
                                          isHierarchyGroupFallback
                                            ? resolveTargetAnalysisItemStatus({
                                                riskId,
                                                targetHierarchyId: entityId,
                                                itemType,
                                                itemName,
                                                itemIndex,
                                                sourceAnalysisId:
                                                  sourceAnalysis.id,
                                                results:
                                                  formQuestionsAnswersAnalysis.results,
                                                analysisInventoryStatus,
                                                riskDataForHierarchy,
                                                locallyAppliedItemKeys,
                                              })
                                            : getAnalysisItemStatus(
                                                sourceAnalysis.id,
                                                itemType,
                                                itemIndex,
                                              );
                                        const applyAnalysisButtonProps =
                                          getApplyAnalysisButtonProps(
                                            analysis,
                                            fallbackUiOptions,
                                          );
                                        const analysisKey = `${riskId}-${entityId}`;
                                        const isAnalysisExpanded =
                                          expandedAnalysis[analysisKey] ?? true;

                                        return (
                                          <Box sx={{ position: 'relative', mt: 0, ml: { xs: '16px', sm: '24px' }, '& [data-analysis-section="Fontes Geradoras"] > summary': { pr: { md: '380px' } } }}>
                                            <AnalysisDisclosureHeader
                                              expanded={isAnalysisExpanded}
                                              onToggle={() =>
                                                handleAnalysisToggle(
                                                  analysisKey,
                                                )
                                              }
                                              confidence={
                                                sourceAnalysis.confidence
                                              }
                                              action={
                                                <SButton
                                                  variant="shade"
                                                  schema={
                                                    analysisItemPillSchema
                                                  }
                                                  textProps={{ fontSize: 11 }}
                                                  size="s"
                                                  text={
                                                    'Aceitar e adicionar todos deste risco/setor'
                                                  }
                                                  tooltip="Aceitar e adicionar todas as fontes e recomendações deste risco, somente neste setor"
                                                  onClick={() =>
                                                    handleAddAnalysisAsRiskData(
                                                      analysis,
                                                      isHierarchyGroupFallback
                                                        ? {
                                                            ...fallbackUiOptions,
                                                            skipMarkAnalysisApplied: true,
                                                          }
                                                        : undefined,
                                                    )
                                                  }
                                                  buttonProps={{
                                                    sx: analysisItemPillSx,
                                                  }}
                                                />
                                              }
                                            />
                                            {true && (
                                              <SFlex direction="column" gap={2}>
                                                <Box
                                                  key={sourceAnalysis.id}
                                                  sx={{
                                                    p: 0,
                                                    backgroundColor:
                                                      'transparent',
                                                  }}
                                                >
                                                  {isHierarchyGroupFallback && (
                                                    <Typography
                                                      variant="body2"
                                                      color="text.secondary"
                                                      sx={{
                                                        mb: 2,
                                                        fontStyle: 'italic',
                                                        fontSize: 12,
                                                      }}
                                                    >
                                                      Análise aplicada pelo
                                                      agrupamento de setores.
                                                    </Typography>
                                                  )}

                                                  {isAnalysisProtected && (
                                                    <Box
                                                      mb={2}
                                                      mt={3}
                                                      p={2}
                                                      sx={{
                                                        borderRadius: 1,
                                                        backgroundColor:
                                                          'action.hover',
                                                        border: '1px solid',
                                                        borderColor:
                                                          'warning.light',
                                                      }}
                                                    >
                                                      <SText
                                                        variant="body1"
                                                        fontWeight="bold"
                                                        fontSize={14}
                                                        mb={1}
                                                      >
                                                        {protectedAnalysisLabel}
                                                      </SText>
                                                      <SText
                                                        variant="body2"
                                                        color="text.secondary"
                                                        fontSize={13}
                                                      >
                                                        O grupo não atinge o
                                                        mínimo atual de
                                                        participantes da Análise
                                                        de Riscos. Fontes,
                                                        recomendações e
                                                        narrativa da IA ficam
                                                        ocultas até o recorte
                                                        voltar a atender o
                                                        limiar.
                                                      </SText>
                                                    </Box>
                                                  )}

                                                  {/* Fontes Geradoras */}
                                                  {!isAnalysisProtected && displayAnalysisContent && (
                                                      <AnalysisItemsSection title="Fontes Geradoras" action={<CatalogAnalysisItemButton analysis={sourceAnalysis} itemType="fontesGeradoras" companyId={accessCompanyId} inherited={isHierarchyGroupFallback} />}>
                                                        <SFlex
                                                          direction="column"
                                                          gap={4}
                                                        >
                                                          {renderAnalysisOriginGroups(displayAnalysisContent.fontesGeradoras,
                                                            (fonte, index) => {
                                                              const itemStatus =
                                                                resolveDisplayedItemStatus(
                                                                  'fontesGeradoras',
                                                                  fonte.nome,
                                                                  index,
                                                                );
                                                              const canEditItem =
                                                                itemStatus?.existsInInventory !==
                                                                true;

                                                              return (
                                                                <EditableAnalysisItem
                                                                  key={`fontesGeradoras-${index}`}
                                                                  item={fonte}
                                                                  itemIndex={
                                                                    index
                                                                  }
                                                                  analysisId={
                                                                    sourceAnalysis.id
                                                                  }
                                                                  itemType="fontesGeradoras"
                                                                  itemCode={itemCodeRegistry.getCode(
                                                                    'fontesGeradoras',
                                                                    index,
                                                                  )}
                                                                  analysis={
                                                                    sourceAnalysis
                                                                  }
                                                                  backgroundColor="background.paper"
                                                                  borderColor="divider"
                                                                  itemStatus={
                                                                    itemStatus
                                                                  }
                                                                  readOnly={
                                                                    !canEditItem
                                                                  }
                                                                  onEditItem={
                                                                    isHierarchyGroupFallback &&
                                                                    canEditItem
                                                                      ? createInheritedAnalysisItemEditHandler(
                                                                          sourceAnalysis,
                                                                          'fontesGeradoras',
                                                                          index,
                                                                        )
                                                                      : undefined
                                                                  }
                                                                  onRemoveItem={
                                                                    isHierarchyGroupFallback &&
                                                                    canEditItem
                                                                      ? createInheritedAnalysisItemRemoveHandler(
                                                                          sourceAnalysis,
                                                                          'fontesGeradoras',
                                                                          index,
                                                                        )
                                                                      : undefined
                                                                  }
                                                                  onAddItem={
                                                                    canEditItem
                                                                      ? () =>
                                                                          handleAddSingleAnalysisItem(
                                                                            analysis,
                                                                            'fontesGeradoras',
                                                                            index,
                                                                            fonte,
                                                                            fallbackApplyOptions,
                                                                          )
                                                                      : undefined
                                                                  }
                                                                  isAddingItem={
                                                                    applyingItemKey ===
                                                                    buildApplyingItemKey(
                                                                      sourceAnalysis.id,
                                                                      'fontesGeradoras',
                                                                      index,
                                                                    )
                                                                  }
                                                                />
                                                              );
                                                            },
                                                          )}
                                                        </SFlex>
                                                      </AnalysisItemsSection>
                                                    )}

                                                  {/* Medidas de Engenharia */}
                                                  {displayAnalysisContent?.medidasEngenhariaRecomendadas &&
                                                    displayAnalysisContent
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
                                                            Recomendações
                                                            (Medidas de
                                                            Engenharia)
                                                          </SText>
                                                        </SFlex>
                                                        <SFlex
                                                          direction="column"
                                                          gap={1}
                                                        >
                                                          {renderAnalysisOriginGroups(displayAnalysisContent.medidasEngenhariaRecomendadas,
                                                            (medida, index) => {
                                                              const itemStatus =
                                                                resolveDisplayedItemStatus(
                                                                  'medidasEngenhariaRecomendadas',
                                                                  medida.nome,
                                                                  index,
                                                                );
                                                              const canEditItem =
                                                                itemStatus?.existsInInventory !==
                                                                true;

                                                              return (
                                                                <EditableAnalysisItem
                                                                  key={`medidasEngenhariaRecomendadas-${index}`}
                                                                  item={medida}
                                                                  itemIndex={
                                                                    index
                                                                  }
                                                                  analysisId={
                                                                    sourceAnalysis.id
                                                                  }
                                                                  itemType="medidasEngenhariaRecomendadas"
                                                                  itemCode={itemCodeRegistry.getCode(
                                                                    'medidasEngenhariaRecomendadas',
                                                                    index,
                                                                  )}
                                                                  analysis={
                                                                    sourceAnalysis
                                                                  }
                                                                  backgroundColor="background.paper"
                                                                  borderColor="divider"
                                                                  itemStatus={
                                                                    itemStatus
                                                                  }
                                                                  readOnly={
                                                                    !canEditItem
                                                                  }
                                                                  onEditItem={
                                                                    isHierarchyGroupFallback &&
                                                                    canEditItem
                                                                      ? createInheritedAnalysisItemEditHandler(
                                                                          sourceAnalysis,
                                                                          'medidasEngenhariaRecomendadas',
                                                                          index,
                                                                        )
                                                                      : undefined
                                                                  }
                                                                  onRemoveItem={
                                                                    isHierarchyGroupFallback &&
                                                                    canEditItem
                                                                      ? createInheritedAnalysisItemRemoveHandler(
                                                                          sourceAnalysis,
                                                                          'medidasEngenhariaRecomendadas',
                                                                          index,
                                                                        )
                                                                      : undefined
                                                                  }
                                                                  onAddItem={
                                                                    canEditItem
                                                                      ? () =>
                                                                          handleAddSingleAnalysisItem(
                                                                            analysis,
                                                                            'medidasEngenhariaRecomendadas',
                                                                            index,
                                                                            medida,
                                                                            fallbackApplyOptions,
                                                                          )
                                                                      : undefined
                                                                  }
                                                                  isAddingItem={
                                                                    applyingItemKey ===
                                                                    buildApplyingItemKey(
                                                                      sourceAnalysis.id,
                                                                      'medidasEngenhariaRecomendadas',
                                                                      index,
                                                                    )
                                                                  }
                                                                />
                                                              );
                                                            },
                                                          )}
                                                        </SFlex>
                                                      </Box>
                                                    )}

                                                  {/* Medidas Administrativas */}
                                                  {displayAnalysisContent?.medidasAdministrativasRecomendadas &&
                                                    displayAnalysisContent
                                                      .medidasAdministrativasRecomendadas
                                                      .length > 0 && (
                                                      <AnalysisItemsSection title="Recomendações (Medidas Administrativas)" action={<CatalogAnalysisItemButton analysis={sourceAnalysis} itemType="medidasAdministrativasRecomendadas" companyId={accessCompanyId} inherited={isHierarchyGroupFallback} />}>

                                                        <SFlex
                                                          direction="column"
                                                          gap={1}
                                                        >
                                                          {renderAnalysisOriginGroups(displayAnalysisContent.medidasAdministrativasRecomendadas,
                                                            (medida, index) => {
                                                              const itemStatus =
                                                                resolveDisplayedItemStatus(
                                                                  'medidasAdministrativasRecomendadas',
                                                                  medida.nome,
                                                                  index,
                                                                );
                                                              const canEditItem =
                                                                itemStatus?.existsInInventory !==
                                                                true;

                                                              return (
                                                                <EditableAnalysisItem
                                                                  key={`medidasAdministrativasRecomendadas-${index}`}
                                                                  item={medida}
                                                                  itemIndex={
                                                                    index
                                                                  }
                                                                  analysisId={
                                                                    sourceAnalysis.id
                                                                  }
                                                                  itemType="medidasAdministrativasRecomendadas"
                                                                  itemCode={itemCodeRegistry.getCode(
                                                                    'medidasAdministrativasRecomendadas',
                                                                    index,
                                                                  )}
                                                                  analysis={
                                                                    sourceAnalysis
                                                                  }
                                                                  backgroundColor="background.paper"
                                                                  borderColor="divider"
                                                                  itemStatus={
                                                                    itemStatus
                                                                  }
                                                                  readOnly={
                                                                    !canEditItem
                                                                  }
                                                                  onEditItem={
                                                                    isHierarchyGroupFallback &&
                                                                    canEditItem
                                                                      ? createInheritedAnalysisItemEditHandler(
                                                                          sourceAnalysis,
                                                                          'medidasAdministrativasRecomendadas',
                                                                          index,
                                                                        )
                                                                      : undefined
                                                                  }
                                                                  onRemoveItem={
                                                                    isHierarchyGroupFallback &&
                                                                    canEditItem
                                                                      ? createInheritedAnalysisItemRemoveHandler(
                                                                          sourceAnalysis,
                                                                          'medidasAdministrativasRecomendadas',
                                                                          index,
                                                                        )
                                                                      : undefined
                                                                  }
                                                                  onAddItem={
                                                                    canEditItem
                                                                      ? () =>
                                                                          handleAddSingleAnalysisItem(
                                                                            analysis,
                                                                            'medidasAdministrativasRecomendadas',
                                                                            index,
                                                                            medida,
                                                                            fallbackApplyOptions,
                                                                          )
                                                                      : undefined
                                                                  }
                                                                  isAddingItem={
                                                                    applyingItemKey ===
                                                                    buildApplyingItemKey(
                                                                      sourceAnalysis.id,
                                                                      'medidasAdministrativasRecomendadas',
                                                                      index,
                                                                    )
                                                                  }
                                                                />
                                                              );
                                                            },
                                                          )}
                                                        </SFlex>
                                                      </AnalysisItemsSection>
                                                    )}
                                                </Box>
                                              </SFlex>
                                            )}
                                          </Box>
                                        );
                                      })()}
                                  </Box>
                                );

  };

            const renderGroupRisk = ({ group, memberEntityIds }: ReturnType<typeof buildRiskAnalysisDisplayPartitions>['groups'][number], riskId: string, intercompany: boolean, sectorFirst = false) => (
                          <HierarchyGroupRiskAnalysisCard
                            key={`${riskId}-group-${group.id}`}
                            riskId={riskId}
                            risk={riskMap[riskId]}
                            headingLabel={sectorFirst ? riskMap[riskId].name : undefined}
                            group={group}
                            memberEntityIds={memberEntityIds}
                            showMemberEstablishment={intercompany}
                            entityMap={entityMap}
                            entityEstablishmentMap={entityEstablishmentMap}
                            hierarchyGroups={hierarchyGroups}
                            analysisResults={
                              formQuestionsAnswersAnalysis?.results ?? []
                            }
                            getEffectiveProbability={getEffectiveProbability}
                            isRiskInInventory={isRiskInInventory}
                            analysisKey={`${riskId}-group-${group.id}`}
                            isAnalysisExpanded={
                              expandedAnalysis[`${riskId}-group-${group.id}`] ??
                              true
                            }
                            onAnalysisToggle={handleAnalysisToggle}
                            onAnalyzeGroup={handleGroupTargetAnalyze}
                            onConfigureAi={() => setAiConfigDialogOpen(true)}
                            isMaster={isMaster}
                            reviewCompanyId={accessCompanyId}
                            onAddRiskToEntity={handleAddRiskToEntity}
                            onAddRiskToAllGroupMembers={
                              handleAddRiskToGroupMembers
                            }
                            onAddAnalysisAsRiskData={
                              handleAddAnalysisAsRiskData
                            }
                            getApplyAnalysisButtonProps={
                              getApplyAnalysisButtonProps
                            }
                            riskDataByHierarchyId={riskDataByHierarchyId}
                            analysisInventoryStatus={analysisInventoryStatus}
                            locallyAppliedItemKeys={locallyAppliedItemKeys}
                            applyingItemKey={applyingItemKey}
                            buildApplyingItemKey={buildApplyingItemKey}
                            handleAddSingleAnalysisItem={
                              handleAddSingleAnalysisItem
                            }
                            handleEditAnalysisItem={handleEditAnalysisItem}
                            handleRemoveAnalysisItem={handleRemoveAnalysisItem}
                            createInheritedAnalysisItemEditHandler={
                              createInheritedAnalysisItemEditHandler
                            }
                            createInheritedAnalysisItemRemoveHandler={
                              createInheritedAnalysisItemRemoveHandler
                            }
                            getAnalysisItemStatus={getAnalysisItemStatus}
                            onAddAnalysisItemToAllGroupMembers={(
                              itemType,
                              itemIndex,
                              item,
                              memberEntityIds,
                            ) =>
                              handleAddAnalysisItemToAllGroupMembers(
                                riskId,
                                memberEntityIds,
                                itemType,
                                itemIndex,
                                item,
                              )
                            }
                            onAddMemberAnalysisItem={(entityId, entry) =>
                              handleAddMemberAnalysisItem(
                                riskId,
                                entityId,
                                entry,
                              )
                            }
                          />
            );
  return (
    <FrpsExplainabilityProvider
      companyId={accessCompanyId}
      applicationId={formApplication.id}
      isMaster={isMaster}
    >
      <Box sx={{ mb: 12 }}>
        <RiskNarrativeDiagnosticSection
          companyId={accessCompanyId}
          formApplicationId={formApplication.id}
          scope={riskNarrativeDiagnosticScope}
          isMaster={isMaster}
        />
      </Box>
      <Box sx={{ mb: 12 }}>
        <FrpsOccupationalDistributionSummary distribution={occupationalDistribution} />
      </Box>
      <RiskAiAnalysisSection>
            <FrpsAiProgress results={formQuestionsAnswersAnalysis?.results ?? []} fetching={fetchingAnalysisStatus} fetchError={analysisStatusError} starting={isAnalyzing} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: `${isMaster ? '40px ' : ''}repeat(5, minmax(0, 1fr))` }, gap: '12px', width: '100%', mb: 6, alignItems: 'start', '& > .ai-generation-control > span': { display: 'block', width: '100%' } }}>
              {isMaster && <Box sx={{ gridColumn: { xs: '1 / -1', lg: '1' }, gridRow: { lg: 1 } }}><SIconButton tooltip="Configurar análise de IA e liberar faixas de risco" onClick={() => setAiConfigDialogOpen(true)} iconButtonProps={{ 'aria-label': 'Configurar análise de IA e liberar faixas de risco', sx: { color: 'text.primary' } }}><SettingsOutlinedIcon /></SIconButton></Box>}
              {([
                { band: 'VERY_HIGH', level: 5, label: 'Gerar análise de FRPS — Muito Alto' },
                { band: 'HIGH', level: 4, label: 'Gerar análise de FRPS — Alto' },
                { band: 'MODERATE', level: 3, label: 'Gerar análise de FRPS — Moderado' },
                { band: 'LOW', level: 2, label: 'Gerar análise de FRPS — Baixo' },
                { band: 'VERY_LOW', level: 1, label: 'Gerar análise de FRPS — Muito Baixo' },
              ] as const).map(({band, level, label}, index) => {
                const allowed = level >= 4 || isMaster || (!loadingGenerationSettings && !generationSettingsError && generationSettings.aiGenerationAdditionalLevels?.includes(level));
                return <Box className="ai-generation-control" key={band} sx={{ minWidth: 0, gridColumn: { lg: index + (isMaster ? 2 : 1) }, gridRow: { lg: 1 } }}><SButton variant="outlined" text={label}
                  icon={<Box component="span" aria-hidden="true" sx={{ display: 'block', width: '12px', height: '12px', m: '4px', borderRadius: '50%', flexShrink: 0, backgroundColor: resolveSystemOccupationalChipColors(level, generationMatrixPresentation).bgcolor }} />} textProps={{ color: 'inherit', fontSize: 14 }}
                  disabled={!allowed || isAnalyzing || hasProcessingAnalyses}
                  tooltip={!allowed ? 'Quer ampliar sua análise? O pacote padrão concentra a análise por IA nos riscos Altos e Muito Altos, priorizando as situações que demandam maior atenção técnica. A análise de riscos Moderados, Baixos e Muito Baixos é um recurso complementar, que pode ser útil conforme os objetivos da sua avaliação. Para conhecer as possibilidades de ampliação e solicitar a liberação para sua empresa, entre em contato com a administração do SimpleSST ou com nossa equipe comercial.' : 'Gera somente análises da faixa indicada, preservando as demais faixas.'}
                  onClick={() => void handleAnalyzeButtonClick(band)}
                  buttonProps={{ sx: { width: '100%', minHeight: 48, height: 'auto', px: 8, py: 5, color: 'text.primary', borderColor: 'divider', borderRadius: '24px', whiteSpace: 'normal' } }} /></Box>;
              })}
            <Box className="ai-generation-control" sx={{ gridColumn: { sm: 1, lg: isMaster ? 2 : 1 }, gridRow: { lg: 2 } }}>
            <SButton
              variant="shade"
              buttonProps={{ sx: { width: '100%', minHeight: 44, height: 'auto', py: 5, borderRadius: '24px', whiteSpace: 'normal' } }}
              text="Limpar análises de IA"
              schema={{ color: 'error.main', borderColor: 'error.main', backgroundColor: 'transparent' }}
              textProps={{ color: 'inherit', fontSize: 15, fontWeight: 600 }}
              tooltip="Abre as opções para escolher o escopo e confirmar a remoção permanente das análises de IA salvas, incluindo fontes geradoras, recomendações sugeridas e edições feitas nelas. Os riscos do inventário, os itens já aplicados ao PGR e as respostas do formulário são preservados."
              color="danger"
              onClick={() => setShowClearAiDialog(true)}
              disabled={!(formQuestionsAnswersAnalysis?.results.length)}
            />
            </Box>
            <Box className="ai-generation-control" sx={{ gridColumn: { sm: 2, lg: isMaster ? 3 : 2 }, gridRow: { lg: 2 } }}>
            <SButton
              variant="shade"
              text="Recuperar análises travadas"
              color="normal"
              textProps={{ color: 'inherit', fontSize: 15, fontWeight: 600 }}
              schema={{ color: 'info.main', borderColor: 'info.main', backgroundColor: 'transparent' }}
              buttonProps={{ sx: {
                width: '100%', minHeight: 44, height: 'auto', py: 5,
                borderRadius: '24px', whiteSpace: 'normal', fontWeight: 600,
                '&&.Mui-disabled': { color: 'text.disabled', borderColor: 'divider', backgroundColor: 'transparent', opacity: 0.35 },
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.08)',
                '&:hover': { backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.23)' : 'rgba(2, 132, 199, 0.15)' },
              } }}
              onClick={() => setShowRecoverAiDialog(true)}
              disabled={!hasStaleAnalyses}
              tooltip={
                !hasStaleAnalyses
                  ? 'Nenhuma análise travada encontrada.'
                  : undefined
              }
            />
            </Box>
            </Box>
      </RiskAiAnalysisSection>
      <OccupationalRiskAnalysisSection
        action={
            <SButton
              variant="shade"
              text="Adicionar todos os riscos a todos os setores"
              color="normal"
              textProps={{ color: 'inherit' }}
              buttonProps={{ sx: {
                color: 'text.primary',
                borderRadius: '999px',
                borderColor: 'divider',
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
                backdropFilter: 'blur(16px) saturate(140%)',
                WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                '&:hover': { color: 'text.primary', backgroundColor: 'action.hover', borderColor: 'text.secondary' },
                '&:active': { backgroundColor: 'action.hover' },
              } }}
              onClick={() => {
                handleAddAllRisk();
              }}
            />
        }
      >


        <SFlex direction="column" gap={2} mb={2}>
          <FrpsOccupationalRiskFilter
            selectedLevels={selectedOccupationalLevels}
            onChange={setSelectedOccupationalLevels}
            actions={<ToggleButtonGroup exclusive size="small" value={organization} aria-label="Organizar análise"
              onChange={(_, value) => { if (value) setOrganization(value); }}
              sx={{ '& .MuiToggleButton-root': { color: 'text.primary', textTransform: 'none', px: 6, borderColor: 'divider' }, '& .Mui-selected': { color: 'primary.main' } }}>
              <ToggleButton value="risk">Organizar por fator de risco</ToggleButton>
              <ToggleButton value="sector">Organizar por setor</ToggleButton>
            </ToggleButtonGroup>}
          />
        </SFlex>

        <SFlex direction="column" gap={2}>
          {visibleRiskIds.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhum FRPS com os níveis de risco ocupacional selecionados.
            </Typography>
          )}
          {organization === 'sector' && <FrpsSectorView
            isRiskProtected={(riskId, id) => formQuestionsAnswersRisks.aiEligibilityByEntity?.[id]?.[riskId]?.eligible === false}
            riskIds={visibleRiskIds}
            getEntitiesWithRisk={getEntitiesWithRisk}
            entityMap={entityMap}
            hierarchyGroups={hierarchyGroups}
            establishmentMap={entityEstablishmentMap}
            renderSectorRisk={(id, riskId) => renderSectorRisk(id, riskId, true)}
            renderGroupRisk={(entry, riskId, intercompany) => renderGroupRisk(entry, riskId, intercompany, true)}
            buildBulkRiskTasks={buildBulkRiskTasks}
            buildBulkRemoveTasks={buildBulkRemoveTasks}
            isRiskInInventory={isRiskInInventory}
            onBulkComplete={refreshBulkRiskStatus}
          />}
          {organization === 'risk' && visibleRiskIds.map((riskId) => <RiskFactorDisclosure key={riskId}>{(isExpanded, toggleExpanded) => {
            const risk = riskMap[riskId];
            const collapsedLevels =
              occupationalLevelsByRiskId.get(riskId) ?? [];

            const entitiesWithRisk = getEntitiesWithRisk(riskId);
            const riskPartitions = buildRiskAnalysisDisplayPartitions({
              entityIds: entitiesWithRisk,
              hierarchyGroups,
              entityMap,
            });
            const sectionMap = new Map<string, { establishment: string; entityIds: string[]; groups: typeof riskPartitions.groups; intercompany: boolean }>();
            const establishmentFor = (id: string) => entityEstablishmentMap.get(id) || 'Empresa não identificada';
            for (const entry of riskPartitions.groups) {
              const establishments = [...new Set(entry.group.hierarchyIds.map(establishmentFor))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
              const intercompany = establishments.length > 1;
              const key = JSON.stringify(establishments);
              const section = sectionMap.get(key) ?? { establishment: intercompany ? `AGRUPAMENTO DE ESTABELECIMENTOS — ${establishments.join(' + ')}` : establishments[0], entityIds: [], groups: [], intercompany };
              section.groups.push(entry);
              sectionMap.set(key, section);
            }
            for (const id of riskPartitions.ungrouped) {
              const establishment = establishmentFor(id);
              const key = JSON.stringify([establishment]);
              const section = sectionMap.get(key) ?? { establishment, entityIds: [], groups: [], intercompany: false };
              section.entityIds.push(id);
              sectionMap.set(key, section);
            }
            const ungroupedEntityDisplayGroups = [...sectionMap.values()].sort((a, b) => Number(b.intercompany) - Number(a.intercompany) || a.establishment.localeCompare(b.establishment, 'pt-BR'));
            const renderHierarchyGroup = (entry: (typeof riskPartitions.groups)[number], intercompany: boolean) => renderGroupRisk(entry, riskId, intercompany);

            return (
              <SAccordion
                key={riskId}
                expanded={isExpanded}
                onChange={toggleExpanded}
                expandIcon={<ChevronRightIcon />}
                accordionProps={{ TransitionProps: { timeout: 0, unmountOnExit: true }, sx: { ...riskFactorAccordionSummarySx, ...formAccordionNavigationSx, '&.Mui-expanded + .MuiAccordion-root': { marginTop: '32px !important' }, border: 0, borderRadius: 0, boxShadow: 'none', backgroundColor: 'transparent', '&::before': { display: 'none' }, '& > .MuiAccordionSummary-root': { borderBottom: '2px solid', borderColor: 'divider' }, '& > .MuiCollapse-root .MuiAccordionDetails-root > .MuiDivider-root:first-child': { display: 'none' } } }}
                endComponent={
                  <Box onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap', ml: 'auto', flex: '0 0 auto' }}>
                    {!isExpanded && <FrpsOccupationalLevelDots levels={collapsedLevels} />}
                    <SectorBulkRiskAdd scope="risk" title={`FATOR DE RISCO — ${risk.name}`}
                      buildTasks={includeAi => buildBulkRiskTasks(entitiesWithRisk, [riskId], includeAi)} onComplete={refreshBulkRiskStatus} />
                    <SectorBulkRiskRemove canRemove={entitiesWithRisk.some(entityId => isRiskInInventory(riskId, entityId))} scope="risk" title={`FATOR DE RISCO — ${risk.name}`}
                      buildTasks={() => buildBulkRemoveTasks(entitiesWithRisk, [riskId])} onComplete={refreshBulkRiskStatus} />
                  </Box>
                }
                title={
                  <SFlex alignItems="center" gap={2} sx={riskFactorNameRowSx}>

                    <Typography
                      fontWeight={700}
                      color="text.primary"
                      title={risk.name}
                      sx={{ ...riskFactorNameTypographySx, flex: '0 1 auto', fontSize: { xs: 22, sm: 24 }, lineHeight: 1.35 }}
                    >
                      {risk.name}
                    </Typography>
                  </SFlex>
                }
              >
                {isExpanded && <SAccordionBody>
                  <SFlex direction="column" gap={3} mt={8}>


                    <SFlex direction="column" gap={4}>

                      {ungroupedEntityDisplayGroups.map(
                        ({ establishment, entityIds: ungroupedEntityIds, groups: sectionGroups, intercompany }) => (
                          <Box component="details" open key={establishment || 'ungrouped-all'}
                            sx={{
                              ml: { xs: 4, sm: 10 }, minWidth: 0,
                              '& > summary::-webkit-details-marker': { display: 'none' },
                              '&[open] > summary .company-disclosure-arrow': { transform: 'rotate(90deg)' },
                            }}
                          >
                            <SFlex component="summary" alignItems="center" gap={3}
                              sx={{ cursor: 'pointer', listStyle: 'none', py: 6, borderBottom: '1px solid', borderColor: 'divider' }}>
                              <ChevronRightIcon className="company-disclosure-arrow" sx={{ fontSize: 22, flexShrink: 0, color: 'text.primary' }} />
                              <Typography component="span" fontWeight={700} color="text.primary"
                                sx={{ fontSize: { xs: 18, sm: 20 }, lineHeight: 1.4, overflowWrap: 'anywhere' }}>
                                {intercompany ? establishment : `ESTABELECIMENTO — ${establishment}`}
                              </Typography>
                            </SFlex>
                            <SFlex direction="column" gap={4} sx={{ pl: { xs: 6, sm: 12 }, pt: 4, minWidth: 0 }}>
                              {sectionGroups.map((entry) => renderHierarchyGroup(entry, intercompany))}
                              {ungroupedEntityIds.map((entityId) => renderSectorRisk(entityId, riskId))}
                            </SFlex>
                          </Box>
                        ),
                      )}
                    </SFlex>
                  </SFlex>
                </SAccordionBody>}
              </SAccordion>
            );
          }}</RiskFactorDisclosure>)}
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
              const count = getEntityIdsToAdd(
                addRiskMenu.riskId,
                option.filter,
              ).length;
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
          <SystemAiPromptConfigDialog
            open={aiConfigDialogOpen}
            onClose={() => setAiConfigDialogOpen(false)}
            onApply={setAiMasterConfig}
            promptKey={SystemAiPromptKeyEnum.RISK_SOURCES_RECOMMENDATIONS}
            title="Configurar Análise de IA"
            defaultModelValue={FRPS_GENERATION_DEFAULT_MODEL}
            modelOptions={FRPS_GENERATION_MODEL_OPTIONS}
            initialConfig={aiMasterConfig}
            additionalSettings={<FrpsAiGenerationPermissions companyId={accessCompanyId} />}
            promptLabel="Prompt da análise"
            saveDefaultConfirmMessage="O conteúdo atual do prompt será salvo como padrão do sistema para análises de Fontes Geradoras e Recomendações. Deseja continuar?"
            maxWidth="xl"
            promptMinRows={4}
            promptMaxRows={30}
          />
        )}

        <ClearFormAiAnalysisModal
          open={showClearAiDialog}
          onClose={() => setShowClearAiDialog(false)}
          companyId={accessCompanyId}
          applicationId={formApplication.id}
          riskOptions={clearAiRiskOptions}
          hierarchyOptions={clearAiHierarchyOptions}
          hierarchyGroupOptions={clearAiHierarchyGroupOptions}
          hasProcessingAnalyses={hasProcessingAnalyses}
        />

        <RecoverFormAiAnalysisModal
          open={showRecoverAiDialog}
          onClose={() => setShowRecoverAiDialog(false)}
          companyId={accessCompanyId}
          applicationId={formApplication.id}
          riskOptions={clearAiRiskOptions}
          hierarchyOptions={clearAiHierarchyOptions}
          hierarchyGroupOptions={clearAiHierarchyGroupOptions}
        />
        <FrpsExplainabilityBridge apiRef={frpsExplainabilityApiRef} />
      </OccupationalRiskAnalysisSection>
    </FrpsExplainabilityProvider>
  );
};
