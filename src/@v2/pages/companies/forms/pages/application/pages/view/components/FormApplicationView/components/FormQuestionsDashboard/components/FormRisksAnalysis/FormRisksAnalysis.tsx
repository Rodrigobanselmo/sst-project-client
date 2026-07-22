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
import { expandRiskAnalysisEntitiesForHierarchyGroups } from '../../helpers/expandRiskAnalysisEntitiesForHierarchyGroups';
import { buildRiskAnalysisDisplayPartitions, formatRiskAnalysisMemberLabel } from '../../helpers/buildRiskAnalysisDisplayPartitions';
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
import { useFetchBrowseFormApplicationRiskLog } from '@v2/services/forms/form-application/form-application-risk-log/hooks/useFetchBrowseFormApplicationRiskLog';
import { fetchFullRiskDataForHierarchy } from '../../helpers/fetchFullRiskDataForHierarchy';
import { QueryEnum } from 'core/enums/query.enums';
import { buildHierarchyIdToWorkspaceNameFromParticipants } from '../../helpers/buildHierarchyIdToWorkspaceNameFromParticipants';
import { buildRiskNarrativeDiagnosticScope } from '../../helpers/buildRiskNarrativeDiagnosticScope';
import { RiskNarrativeDiagnosticSection } from './RiskNarrativeDiagnosticSection';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { useMutateAiAnalyzeFormQuestionsRisks } from '@v2/services/forms/ai-analyze-risks/hooks/useMutateAiAnalyzeFormQuestionsRisks';
import { AiAnalyzeFormQuestionsRisksModeEnum } from '@v2/services/forms/ai-analyze-risks/service/ai-analyze-risks.types';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useMutateApplyAiAnalysisAsRiskData } from '@v2/services/forms/form-application/apply-ai-analysis-as-risk-data/hooks/useMutateApplyAiAnalysisAsRiskData';
import { applyAiAnalysisAsRiskData } from '@v2/services/forms/form-application/apply-ai-analysis-as-risk-data/service/apply-ai-analysis-as-risk-data.service';
import { useMutateAssignRisksFormApplication } from '@v2/services/forms/form-application/assign-risks-form-application/hooks/useMutateAssignRisksFormApplication';
import { assignRisksFormApplication } from '@v2/services/forms/form-application/assign-risks-form-application/service/assign-risks-form-application.service';
import { refetchFormRisksInventoryStatus } from '@v2/services/forms/form-application/shared/refetch-form-risks-inventory-status';
import {
  useFetchBrowseFormQuestionsAnswersAnalysis,
} from '@v2/services/forms/form-questions-answers-analysis/browse-form-questions-answers-analysis/hooks/useFetchBrowseFormQuestionsAnswersAnalysis';
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
import { HierarchyGroupRiskAnalysisCard } from './HierarchyGroupRiskAnalysisCard';
import { AnalysisItemCodeBadge } from './AnalysisItemCodeBadge';
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

type AnalysisItemBadgeVariant =
  | 'inventory-in'
  | 'inventory-pending'
  | 'catalog-in'
  | 'catalog-new';

const analysisItemBadgeSx = (variant: AnalysisItemBadgeVariant) => {
  const palette: Record<AnalysisItemBadgeVariant, { bgcolor: string; color: string }> =
    {
      'inventory-in': { bgcolor: 'success.dark', color: '#fff' },
      'inventory-pending': { bgcolor: 'warning.dark', color: '#fff' },
      'catalog-in': { bgcolor: 'info.dark', color: '#fff' },
      'catalog-new': { bgcolor: 'grey.800', color: '#fff' },
    };

  return {
    display: 'inline-block',
    px: 1,
    py: 0.25,
    borderRadius: 0.5,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.2,
    ...palette[variant],
  };
};

const AnalysisItemStatusBadges = ({
  itemStatus,
}: {
  itemStatus?: AnalysisItemInventoryEntry;
}) => {
  if (!itemStatus) return null;

  return (
    <SFlex alignItems="center" gap={0.5} flexWrap="wrap">
      <Box
        component="span"
        sx={analysisItemBadgeSx(
          itemStatus.existsInInventory ? 'inventory-in' : 'inventory-pending',
        )}
      >
        {itemStatus.existsInInventory ? 'No inventário' : 'Pendente'}
      </Box>
      {typeof itemStatus.existsInCatalog === 'boolean' && (
        <Box
          component="span"
          sx={analysisItemBadgeSx(
            itemStatus.existsInCatalog ? 'catalog-in' : 'catalog-new',
          )}
        >
          {itemStatus.existsInCatalog ? 'Cadastrado' : 'Novo cadastro'}
        </Box>
      )}
    </SFlex>
  );
};

interface FormRisksAnalysisProps {
  formApplication: FormApplicationReadModel;
  accessCompanyId: string;
  formQuestionsAnswers?: FormQuestionsAnswersBrowseModel | null;
  visibleParticipantGroups?: ParticipantGroupForIndicators[];
  selectedGroupingQuestionId?: string | null;
  selectedGroupingLabel?: string | null;
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

const CLASSIFICATION_BADGE_WIDTH_SCALE = 0.76;
const SECTOR_ROW_WIDTH_REDUCTION = 0.83;
const SECTOR_ROW_WIDTH_ADJUSTMENT = 1.59;

const SECTOR_ROW_ELEMENT_LABELS = [
  'Adicionar risco a este setor',
  'Analisar IA novamente deste setor',
  'Analisar IA deste setor',
  'Analisando IA...',
  'Processamento interrompido',
  'Probabilidade: 04 Significativa',
  'Severidade: 05 Excessiva',
  'Risco Ocupacional: Não informado',
];

const buildSectorRowElementWidth = () => {
  const longestBadgeLabelLength = Math.max(
    'Probabilidade: 04 Significativa'.length,
    'Severidade: 05 Excessiva'.length,
    'Risco Ocupacional: Não informado'.length,
  );
  const currentMaxBadgeWidthCh = Math.ceil(
    longestBadgeLabelLength * CLASSIFICATION_BADGE_WIDTH_SCALE,
  );
  const reducedBadgeWidthCh = Math.ceil(
    currentMaxBadgeWidthCh * SECTOR_ROW_WIDTH_REDUCTION,
  );
  const longestLabelLength = Math.max(
    ...SECTOR_ROW_ELEMENT_LABELS.map((label) => label.length),
  );
  const widthForCompactControlsCh = Math.ceil(longestLabelLength * 0.62);
  const baseWidthCh = Math.max(
    reducedBadgeWidthCh,
    widthForCompactControlsCh,
  );

  return `${Math.ceil(baseWidthCh * SECTOR_ROW_WIDTH_ADJUSTMENT)}ch`;
};

const SECTOR_ROW_ELEMENT_WIDTH = buildSectorRowElementWidth();
const SECTOR_ROW_ELEMENT_HEIGHT = 32;
const SECTOR_ROW_STACK_GAP = 4;
const SECTOR_ROW_OCCUPATIONAL_BADGE_HEIGHT =
  SECTOR_ROW_ELEMENT_HEIGHT * 2 + SECTOR_ROW_STACK_GAP;

const sectorRowStackSx = {
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: `${SECTOR_ROW_STACK_GAP}px`,
};

const sectorRowElementBaseSx = {
  boxSizing: 'border-box' as const,
  flexShrink: 0,
  width: SECTOR_ROW_ELEMENT_WIDTH,
  minWidth: SECTOR_ROW_ELEMENT_WIDTH,
  maxWidth: SECTOR_ROW_ELEMENT_WIDTH,
  minHeight: SECTOR_ROW_ELEMENT_HEIGHT,
  height: SECTOR_ROW_ELEMENT_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center' as const,
  whiteSpace: 'nowrap' as const,
  px: 0.5,
  fontSize: '0.7rem',
  lineHeight: 1.2,
};

const sectorActionButtonSx = {
  ...sectorRowElementBaseSx,
  py: 0,
  fontWeight: 600,
};

const badgeSx = (bg: string) => ({
  ...sectorRowElementBaseSx,
  backgroundColor: bg,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'grey.200',
});

const occupationalRiskBadgeSx = (bg: string) => ({
  ...badgeSx(bg),
  position: 'relative' as const,
  height: SECTOR_ROW_OCCUPATIONAL_BADGE_HEIGHT,
  minHeight: SECTOR_ROW_OCCUPATIONAL_BADGE_HEIGHT,
  borderColor: 'grey.400',
});

const sectorRowClassificationDotsSx = {
  position: 'absolute' as const,
  top: 4,
  left: 4,
  display: 'flex',
  gap: '3px',
  pointerEvents: 'none' as const,
};

const sectorRowClassificationDotSx = (color: string) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: color,
  border: '1px solid #fff',
  flexShrink: 0,
});

const sectorRowBadgeTextSx = {
  fontSize: '0.7rem',
  lineHeight: 1.2,
  textAlign: 'center',
  width: '100%',
};

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
  const [locallyAppliedInventoryKeys, setLocallyAppliedInventoryKeys] =
    useState<Set<string>>(() => new Set());
  const [locallyAppliedItemKeys, setLocallyAppliedItemKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [applyingItemKey, setApplyingItemKey] = useState<string | null>(null);
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const frpsExplainabilityApiRef = useRef<FrpsExplainabilityApi | null>(null);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});
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
    () => formApplication.participants.workspaces.map((workspace) => workspace.name),
    [formApplication.participants.workspaces],
  );

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
        analysis.analysis.medidasEngenhariaRecomendadas as unknown[] | undefined,
        status.medidasEngenhariaRecomendadas,
      );
      countPendingInArray(
        analysis.analysis
          .medidasAdministrativasRecomendadas as unknown[] | undefined,
        status.medidasAdministrativasRecomendadas,
      );

      return pending;
    },
    [analysisInventoryStatus],
  );

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

  const createInheritedAnalysisItemEditHandler = (
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

  const createInheritedAnalysisItemRemoveHandler = (
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
        next.add(buildInventoryStatusKey(analysis.riskId, analysis.hierarchyId));
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
      } catch {
        // Erros exibidos pelos hooks de mutação
      } finally {
        setApplyingItemKey(null);
      }
    },
    [applyAnalysisItemsToInventory, enqueueSnackbar],
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
          backgroundColor,
          borderRadius: 1,
          border: '1px solid',
          borderColor,
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '.analysis-item-edit-actions': {
              opacity: 1,
            },
          },
          '.analysis-item-add-action': {
            opacity: 1,
            visibility: 'visible',
          },
          '.analysis-item-edit-actions': {
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
              <SFlex alignItems="center" justifyContent="space-between" gap={1}>
                <Box
                  flex={1}
                  minWidth={0}
                  onClick={readOnly ? undefined : () => setIsEditing(true)}
                  sx={{
                    cursor: readOnly ? 'default' : 'pointer',
                    '&:hover': readOnly
                      ? undefined
                      : {
                          '& .item-name': {
                            color: 'primary.main',
                          },
                        },
                  }}
                >
                  <SFlex alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                    {itemCode && <AnalysisItemCodeBadge code={itemCode} />}
                    <SText
                      className="item-name"
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
                    <AnalysisItemStatusBadges itemStatus={itemStatus} />
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
                  {!readOnly && (
                    <SFlex
                      className="analysis-item-edit-actions"
                      gap={0.5}
                      alignItems="center"
                      flexShrink={0}
                    >
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
                  {onAddItem && (
                    <Box className="analysis-item-add-action">
                      <SButton
                        variant="contained"
                        color="success"
                        size="s"
                        text={isAddingItem ? 'Adicionando...' : 'Adicionar'}
                        onClick={(event) => {
                          event.stopPropagation();
                          onAddItem();
                        }}
                        buttonProps={{
                          disabled: isAddingItem,
                          title: itemCode
                            ? `Adicionar este item ao inventário (${itemCode})`
                            : 'Adicionar este item ao inventário',
                          sx: {
                            minWidth: 'auto',
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            boxShadow: 'none',
                            opacity: 1,
                            visibility: 'visible',
                          },
                        }}
                      />
                    </Box>
                  )}
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
              <ExplainFrpsItemButton
                analysisId={analysisId}
                listItemType={itemType}
                itemName={item.nome}
                itemKey={
                  itemStatus?.catalogId
                    ? buildCatalogFrpsItemKey(
                        mapAnalysisListItemTypeToExplanationItemType(itemType),
                        itemStatus.catalogId,
                      )
                    : undefined
                }
                riskFactorName={analysis?.analysis?.frps}
              />
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
    const useItemStatus = !options?.isHierarchyGroupFallback && itemStatus != null;
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
      expandRiskAnalysisEntitiesForHierarchyGroups({
        riskId,
        entityRiskMap,
        groupedEntityRiskMap,
        entityMap,
        hierarchyGroups,
        isEntityVisible,
      }),
    [entityRiskMap, groupedEntityRiskMap, entityMap, hierarchyGroups, isEntityVisible],
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
        const resolved = resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback(
          {
            riskId,
            entityId,
            results: formQuestionsAnswersAnalysis.results,
            hierarchyGroups,
          },
        );
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
    const map = new Map<string, import('core/interfaces/api/IRiskData').IRiskData[]>();
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
                itemType === 'medidasEngenhariaRecomendadas' ? [item] : undefined,
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
        const failedLabels = failures.map((failure) => failure.label).join(', ');
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
    async (
      riskId: string,
      entityId: string,
      entry: AnalysisItemCodeEntry,
    ) => {
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
        enqueueSnackbar('Análise não encontrada para o setor', { variant: 'error' });
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
        enqueueSnackbar(`Item ${entry.code} já está no inventário deste setor`, {
          variant: 'info',
        });
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
    mode?: AiAnalyzeFormQuestionsRisksModeEnum;
    riskId?: string;
    hierarchyId?: string;
    successMessage?: string;
  }) => {
    batchFailureNotifiedRef.current = false;
    const masterOverrides = buildMasterAiRequestOverrides(isMaster, aiMasterConfig);

    mutateAiAnalyzeFormQuestionsRisks(
      {
        companyId: accessCompanyId,
        formApplicationId: formApplication.id,
        mode: options?.mode ?? AiAnalyzeFormQuestionsRisksModeEnum.FULL_INCREMENTAL,
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

  const handleAnalyzeButtonClick = async () => {
    if (hasPreviousAiRun) {
      const confirmed = await showConfirmation(REANALYSIS_CONFIRMATION);
      if (!confirmed) return;
    }

    handleAnalyzeRisks({
      mode: AiAnalyzeFormQuestionsRisksModeEnum.FULL_INCREMENTAL,
    });
  };

  const handleTargetAnalyze = async (riskId: string, hierarchyId: string) => {
    const hasOwnAnalysis = hasOwnAnalysisForPair(riskId, hierarchyId);

    if (hasOwnAnalysis) {
      const confirmed = await showConfirmation(TARGET_REANALYSIS_CONFIRMATION);
      if (!confirmed) return;
    }

    handleAnalyzeRisks({
      mode: AiAnalyzeFormQuestionsRisksModeEnum.TARGET,
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
      const confirmed = await showConfirmation(GROUP_TARGET_REANALYSIS_CONFIRMATION);
      if (!confirmed) return;
    }

    handleAnalyzeRisks({
      mode: AiAnalyzeFormQuestionsRisksModeEnum.TARGET,
      riskId,
      hierarchyId: canonicalHierarchyId,
      successMessage: hasGroupAnalysis
        ? 'Análise de IA do agrupamento reiniciada.'
        : 'Análise de IA do agrupamento iniciada.',
    });
  };

  const generalAnalyzeButtonLabel =
    hasProcessingAnalyses
      ? 'Processando análise...'
      : hasPreviousAiRun
        ? 'Analisar com IA novamente'
        : 'Analisar com IA';

  return (
    <FrpsExplainabilityProvider
      companyId={accessCompanyId}
      applicationId={formApplication.id}
      isMaster={isMaster}
    >
    <SPaper sx={{ p: 4 }}>
      <SFlex justifyContent="space-between" my={4} mx={8} mb={16}>
        <SText fontSize={18} fontWeight="bold">
          Análise de Riscos
        </SText>
        <SFlex gap={2}>
          <AiActionButtonGroup
            variant="s-button-shade"
            label={generalAnalyzeButtonLabel}
            loading={isAnalyzing || hasProcessingAnalyses}
            disabled={hasProcessingAnalyses}
            onExecute={() => void handleAnalyzeButtonClick()}
            onConfigure={() => setAiConfigDialogOpen(true)}
            isMaster={isMaster}
            sButtonProps={{ color: 'primary' }}
          />
          <SButton
            variant="shade"
            text="Recuperar análises travadas"
            color="info"
            onClick={() => setShowRecoverAiDialog(true)}
            disabled={!hasStaleAnalyses}
            tooltip={
              !hasStaleAnalyses
                ? 'Nenhuma análise travada encontrada.'
                : undefined
            }
          />
          <SButton
            variant="shade"
            text="Limpar análises de IA"
            color="danger"
            onClick={() => setShowClearAiDialog(true)}
            disabled={!hasPreviousAiRun && !hasProcessingAnalyses}
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
          const riskPartitions = buildRiskAnalysisDisplayPartitions({
            entityIds: entitiesWithRisk,
            hierarchyGroups,
            entityMap,
          });
          const groupByEstablishment = shouldGroupEntitiesByEstablishment(
            riskPartitions.ungrouped,
            entityMap,
            entityEstablishmentMap,
          );
          const ungroupedEntityDisplayGroups = groupByEstablishment
            ? groupEntityIdsByEstablishment(
                riskPartitions.ungrouped,
                entityMap,
                entityEstablishmentMap,
              )
            : [{ establishment: '', entityIds: riskPartitions.ungrouped }];

          return (
            <SAccordion
              key={riskId}
              expanded={isExpanded}
              onChange={() => handleAccordionChange(riskId)}
              endComponent={
                <>
                  {entitiesWithRisk.every((entityId) =>
                    isRiskInInventory(riskId, entityId),
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
                    {riskPartitions.groups.map(({ group, memberEntityIds }) => (
                      <HierarchyGroupRiskAnalysisCard
                        key={`${riskId}-group-${group.id}`}
                        riskId={riskId}
                        risk={risk}
                        group={group}
                        memberEntityIds={memberEntityIds}
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
                          false
                        }
                        onAnalysisToggle={handleAnalysisToggle}
                        onAnalyzeGroup={handleGroupTargetAnalyze}
                        onConfigureAi={() => setAiConfigDialogOpen(true)}
                        isMaster={isMaster}
                        onAddRiskToEntity={handleAddRiskToEntity}
                        onAddRiskToAllGroupMembers={handleAddRiskToGroupMembers}
                        onAddAnalysisAsRiskData={handleAddAnalysisAsRiskData}
                        getApplyAnalysisButtonProps={getApplyAnalysisButtonProps}
                        riskDataByHierarchyId={riskDataByHierarchyId}
                        analysisInventoryStatus={analysisInventoryStatus}
                        locallyAppliedItemKeys={locallyAppliedItemKeys}
                        applyingItemKey={applyingItemKey}
                        buildApplyingItemKey={buildApplyingItemKey}
                        handleAddSingleAnalysisItem={handleAddSingleAnalysisItem}
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
                          handleAddMemberAnalysisItem(riskId, entityId, entry)
                        }
                      />
                    ))}

                    {ungroupedEntityDisplayGroups.map(
                      ({ establishment, entityIds: ungroupedEntityIds }) => (
                        <Box key={establishment || 'ungrouped-all'}>
                          {groupByEstablishment && establishment && (
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {establishment}
                            </Typography>
                          )}
                          <SFlex direction="column" gap={4}>
                            {ungroupedEntityIds.map((entityId) => {
                      const entity = entityMap[entityId];
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
                          <SFlex
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
                            >
                              <Box
                                sx={{
                                  backgroundColor: 'grey.100',
                                  padding: '2px 4px',
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'grey.200',
                                  flexShrink: 0,
                                }}
                              >
                                <Typography fontSize={12} color="text.secondary">
                                  {hierarchyTypeTranslation[entity.type]}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body1"
                                fontWeight="medium"
                                sx={{ minWidth: 0 }}
                              >
                                {entity.name}
                              </Typography>
                            </SFlex>
                            <SFlex sx={sectorRowStackSx}>
                              {isRiskInInventory(riskId, entityId) ? (
                                <Box
                                  sx={{
                                    ...sectorRowElementBaseSx,
                                    border: '1px solid',
                                    borderColor: 'grey.200',
                                    borderRadius: 1,
                                    color: 'success.main',
                                    gap: 0.5,
                                  }}
                                >
                                  <CheckIcon sx={{ fontSize: 14 }} />
                                  <SText
                                    color="success.main"
                                    fontSize={11}
                                    sx={{ lineHeight: 1.2 }}
                                  >
                                    Risco adicionado
                                  </SText>
                                </Box>
                              ) : (
                                <SButton
                                  variant="shade"
                                  color="paper"
                                  text="Adicionar risco a este setor"
                                  onClick={() =>
                                    handleAddRiskToEntity(riskId, entityId)
                                  }
                                  buttonProps={{
                                    sx: sectorActionButtonSx,
                                  }}
                                />
                              )}
                              <AiActionButtonGroup
                                variant="s-button-shade"
                                label={
                                  isTargetAnalysisProcessing(riskId, entityId)
                                    ? 'Analisando IA...'
                                    : isTargetAnalysisStale(riskId, entityId)
                                      ? 'Processamento interrompido'
                                      : hasOwnAnalysisForPair(riskId, entityId)
                                        ? 'Analisar IA novamente deste setor'
                                        : 'Analisar IA deste setor'
                                }
                                loading={isTargetAnalysisProcessing(riskId, entityId)}
                                disabled={isTargetAnalysisProcessing(riskId, entityId)}
                                onExecute={() =>
                                  void handleTargetAnalyze(riskId, entityId)
                                }
                                onConfigure={() => setAiConfigDialogOpen(true)}
                                isMaster={isMaster}
                                sButtonProps={{
                                  color: 'primary',
                                  buttonProps: { sx: sectorActionButtonSx },
                                }}
                              />
                            </SFlex>
                            <SFlex sx={sectorRowStackSx}>
                              <Box
                                sx={badgeSx(
                                  probabilityMap[probability || 0].color,
                                )}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.main"
                                  sx={sectorRowBadgeTextSx}
                                >
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
                                <Typography
                                  variant="body2"
                                  color="text.main"
                                  sx={sectorRowBadgeTextSx}
                                >
                                  Severidade:{' '}
                                  {hasValidSeverity
                                    ? `${formatTwoDigits(severity)} ${severityMap[severity].label}`
                                    : 'Não informado'}
                                </Typography>
                              </Box>
                            </SFlex>

                            <Box
                              sx={occupationalRiskBadgeSx(
                                occupationalRiskColorMap[occupationalRiskLabel] ??
                                  occupationalRiskColorMap['Não informado'],
                              )}
                            >
                              <Box sx={sectorRowClassificationDotsSx}>
                                <Box
                                  sx={sectorRowClassificationDotSx(
                                    probabilityMap[probability || 0].color,
                                  )}
                                />
                                <Box
                                  sx={sectorRowClassificationDotSx(
                                    hasValidSeverity
                                      ? severityMap[severity].color
                                      : severityMap[0].color,
                                  )}
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.main"
                                fontWeight={600}
                                sx={sectorRowBadgeTextSx}
                              >
                                Risco Ocupacional: {occupationalRiskLabel}
                              </Typography>
                            </Box>
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
                                return null;
                              }

                              if (!resolved.analysis) {
                                if (
                                  resolved.failedAnalysis &&
                                  isOccupationalRiskEligibleForAiAnalysis(matriz)
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
                                          resolved.failedAnalysis.metadata as
                                            | Record<string, unknown>
                                            | undefined,
                                        )}
                                      </Typography>
                                    </Box>
                                  );
                                }

                                return null;
                              }

                              const isHierarchyGroupFallback =
                                resolved.source === 'hierarchy_group_fallback';
                              const sourceAnalysis = resolved.analysis!;
                              const analysis = buildTargetAiAnalysisViewModel({
                                resolved,
                                targetHierarchyId: entityId,
                                targetProbability: getEffectiveProbability(
                                  entityId,
                                  riskId,
                                ),
                              })!;
                              const fallbackApplyOptions = isHierarchyGroupFallback
                                ? {
                                    skipMarkAnalysisApplied: true as const,
                                  }
                                : undefined;
                              const riskDataForHierarchy =
                                riskDataByHierarchyId.get(entityId);
                              const fallbackUiOptions = isHierarchyGroupFallback
                                ? {
                                    isHierarchyGroupFallback: true as const,
                                    sourceAnalysisId: sourceAnalysis.id,
                                    riskDataForHierarchy,
                                  }
                                : undefined;
                              const displayAnalysisContent = sourceAnalysis.analysis;
                              const itemCodeRegistry =
                                buildAnalysisItemCodeRegistry(displayAnalysisContent);
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
                                      sourceAnalysisId: sourceAnalysis.id,
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
                                      <Box
                                        key={sourceAnalysis.id}
                                        sx={{
                                          p: 3,
                                          backgroundColor: 'primary.50',
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
                                            Análise aplicada pelo agrupamento de
                                            setores.
                                          </Typography>
                                        )}
                                        <SFlex
                                          alignItems="center"
                                          gap={2}
                                          mb={2}
                                        >
                                          <SText
                                            variant="body2"
                                            color="text.main"
                                          >
                                            Análise de IA para este risco/setor:{' '}
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
                                              (sourceAnalysis.confidence ?? 0) *
                                                100,
                                            )}
                                            %
                                          </SText>
                                          <SButton
                                            variant="shade"
                                            color={applyAnalysisButtonProps.color}
                                            size="s"
                                            text={applyAnalysisButtonProps.text}
                                            onClick={() =>
                                              handleAddAnalysisAsRiskData(
                                                analysis,
                                                isHierarchyGroupFallback
                                                  ? {
                                                      ...fallbackUiOptions,
                                                      skipMarkAnalysisApplied:
                                                        true,
                                                    }
                                                  : undefined,
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
                                        {displayAnalysisContent?.fontesGeradoras &&
                                          displayAnalysisContent.fontesGeradoras
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
                                              <SFlex direction="column" gap={4}>
                                                {displayAnalysisContent.fontesGeradoras.map(
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
                                                        itemIndex={index}
                                                        analysisId={
                                                          sourceAnalysis.id
                                                        }
                                                        itemType="fontesGeradoras"
                                                        itemCode={itemCodeRegistry.getCode(
                                                          'fontesGeradoras',
                                                          index,
                                                        )}
                                                        analysis={sourceAnalysis}
                                                        backgroundColor="grey.50"
                                                        borderColor="grey.200"
                                                        itemStatus={itemStatus}
                                                        readOnly={!canEditItem}
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
                                            </Box>
                                          )}

                                        {/* Medidas de Engenharia */}
                                        {displayAnalysisContent
                                          ?.medidasEngenhariaRecomendadas &&
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
                                                    backgroundColor: 'blue.400',
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
                                              <SFlex direction="column" gap={1}>
                                                {displayAnalysisContent.medidasEngenhariaRecomendadas.map(
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
                                                        itemIndex={index}
                                                        analysisId={
                                                          sourceAnalysis.id
                                                        }
                                                        itemType="medidasEngenhariaRecomendadas"
                                                        itemCode={itemCodeRegistry.getCode(
                                                          'medidasEngenhariaRecomendadas',
                                                          index,
                                                        )}
                                                        analysis={sourceAnalysis}
                                                        backgroundColor="grey.50"
                                                        borderColor="grey.200"
                                                        itemStatus={itemStatus}
                                                        readOnly={!canEditItem}
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
                                        {displayAnalysisContent
                                          ?.medidasAdministrativasRecomendadas &&
                                          displayAnalysisContent
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
                                              <SFlex direction="column" gap={1}>
                                                {displayAnalysisContent.medidasAdministrativasRecomendadas.map(
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
                                                        itemIndex={index}
                                                        analysisId={
                                                          sourceAnalysis.id
                                                        }
                                                        itemType="medidasAdministrativasRecomendadas"
                                                        itemCode={itemCodeRegistry.getCode(
                                                          'medidasAdministrativasRecomendadas',
                                                          index,
                                                        )}
                                                        analysis={sourceAnalysis}
                                                        backgroundColor="grey.50"
                                                        borderColor="grey.200"
                                                        itemStatus={itemStatus}
                                                        readOnly={!canEditItem}
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
                                            </Box>
                                          )}
                                      </Box>
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
        <SystemAiPromptConfigDialog
          open={aiConfigDialogOpen}
          onClose={() => setAiConfigDialogOpen(false)}
          onApply={setAiMasterConfig}
          promptKey={SystemAiPromptKeyEnum.RISK_SOURCES_RECOMMENDATIONS}
          title="Configurar Análise de IA"
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
    </SPaper>
    </FrpsExplainabilityProvider>
  );
};
