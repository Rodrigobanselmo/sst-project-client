import { CombinedIdentificationFilters } from './components/CombinedIdentificationFilters';
import { intersectIdentificationFilters } from './helpers/intersectIdentificationFilters';
import { SectionIndicatorsRadar } from './components/SectionIndicatorsRadar/SectionIndicatorsRadar';
import {
  filterIndicatorAnswers,
  PARTIAL_RESULTS_MINIMUM,
} from './helpers/filterIndicatorAnswers';
import type { ReactNode } from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { formAccordionNavigationSx } from '../form-accordion-navigation.styles';
import RadarIcon from '@mui/icons-material/Radar';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import {
  type AccordionProps,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormQuestionGroupWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-group-with-answers-browse.model';
import { FormQuestionWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-with-answers-browse.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { HtmlContentRenderer } from '../../../../../public/answer/components/HtmlContentRenderer/FormAnswerFieldControlled';
import { FormQuestionPieChart } from './components/FormQuestionPieChart/FormQuestionPieChart';
import { FormChartTypeSelector } from './components/FormChartTypeSelector/FormChartTypeSelector';
import { ExecutiveIndicatorsDistributionSection } from './components/ExecutiveIndicatorsDistribution/ExecutiveIndicatorsDistribution';
import { ScaleIndicatorsRadar } from './components/ScaleIndicatorsRadar/ScaleIndicatorsRadar';
import { IndicatorsQualityLegend } from './components/IndicatorsQualityLegend/IndicatorsQualityLegend';
import { IndicatorPercentScale } from './components/IndicatorPercentScale/IndicatorPercentScale';
import { FormTextAnswers } from './components/FormTextAnswers/FormTextAnswers';
import { SectionHeader } from './components/SectionHeader/SectionHeader';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { FormRisksAnalysis } from './components/FormRisksAnalysis/FormRisksAnalysis';
import { FormParticipantsTable } from '../FormParticipantsTable/FormParticipantsTable';
import { FormHierarchyGroupManager } from './components/FormHierarchyGroupManager/FormHierarchyGroupManager';

import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { STabs } from '@v2/components/organisms/STabs/STabs';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { useFetchBrowseHierarchyGroups } from '@v2/services/forms/hierarchy-group/browse-hierarchy-groups/hooks/useFetchBrowseHierarchyGroups';
import { useFetchBrowseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/hooks/useFetchBrowseFormQuestionsAnswersRisks';
import { useFetchBrowseAllFormParticipantsForGrouping } from '@v2/services/forms/form-participants/browse-form-participants/hooks/useFetchBrowseAllFormParticipantsForGrouping';
import { useFetchBrowseFormParticipants } from '@v2/services/forms/form-participants/browse-form-participants/hooks/useFetchBrowseFormParticipants';
import {
  buildParticipantGroupsForIndicators,
  type ParticipantGroupForIndicators,
} from './helpers/buildParticipantGroupsForIndicators';
import {
  buildOrganizationalGroups,
  ORGANIZATIONAL_GROUPING_ID,
  ORGANIZATIONAL_GROUPING_LABEL,
  organizationalPath,
  organizationalPathIds,
} from './helpers/organizationalGrouping';
import { OrganizationalGroupingDialog } from './components/OrganizationalGroupingDialog';
import { resolveParticipantStructuresForGrouping } from './helpers/resolveParticipantStructuresForGrouping';
import { buildParticipantGroupingEnrichmentContext } from './helpers/buildParticipantGroupingEnrichmentContext';
import { exportFormChartsPdfInBrowser } from './helpers/exportFormChartsPdfInBrowser';
import { exportFormIndicatorsPdfInBrowser } from './helpers/exportFormIndicatorsPdfInBrowser';
import { exportFormRadarPdfInBrowser } from './helpers/exportFormRadarPdfInBrowser';
import { exportFormRiskAnalysisPdfInBrowser } from './helpers/exportFormRiskAnalysisPdfInBrowser';
import { exportFrpsExplainabilityTechnicalReportPdfInBrowser } from './helpers/exportFrpsExplainabilityTechnicalReportPdfInBrowser';
import { buildIndicatorsPresentation } from './helpers/buildIndicatorsPdfDataset';
import {
  buildCopsoqLongDimensionView,
  type IndicatorLevels,
} from './helpers/buildCopsoqLongDimensionView';
import {
  DEFAULT_FORM_CHART_TYPE,
  type FormChartType,
} from './helpers/form-chart-type.types';
import { getIndicatorColorFromScore } from './helpers/form-indicator-quality.util';
import { calculateFormIndicatorFromQuestions } from './helpers/calculate-form-indicator.util';
import { SPdfLoadingModal } from '@v2/components/organisms/SPdfLoadingModal/SPdfLoadingModal';
import { IndicatorsNarrativeDiagnosticSection } from './components/IndicatorsNarrativeDiagnosticSection/IndicatorsNarrativeDiagnosticSection';
import { buildIndicatorsNarrativeDiagnosticScope } from './helpers/buildIndicatorsNarrativeDiagnosticScope';
import { useAccess } from 'core/hooks/useAccess';
import { useHierarchyTypeLabels } from 'core/hooks/useHierarchyTypeLabels';

// Types for the restructured data
const graphHierarchyAccordionProps = {
  sx: {
    ...formAccordionNavigationSx,
    border: 0,
    boxShadow: 'none',
    backgroundColor: 'transparent',
    '&::before': { display: 'none' },
  },
};

const indicatorSectionAccordionProps: Partial<AccordionProps> = {
  sx: (theme) => ({
    ...graphHierarchyAccordionProps.sx,
    WebkitBoxShadow: 'none',
    '&&:not(.Mui-expanded)': { p: 0, overflow: 'visible' },
    '&& .MuiAccordionSummary-root:not(.Mui-expanded)': {
      minHeight: 76,
      px: 6,
      gap: 4,
      borderRadius: '24px',
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.045)'
          : 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      '&:hover': { backgroundColor: 'action.hover' },
      '& .MuiAccordionSummary-content': {
        my: 4,
        alignItems: 'center',
        minWidth: 0,
      },
    },
  }),
};

const IndicatorDetailsSection = ({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) =>
  enabled ? (
    <SAccordion
      defaultExpanded
      accordionProps={indicatorSectionAccordionProps}
      expandIcon={<ArrowRightIcon fontSize="small" />}
      color="text.primary"
      title="Detalhamento dos indicadores"
    >
      <SAccordionBody>
        <SFlex direction="column" gap={16} sx={{ pt: 8 }}>
          {children}
        </SFlex>
      </SAccordionBody>
    </SAccordion>
  ) : (
    <>{children}</>
  );

interface QuestionWithParticipantGroups {
  id: string;
  groupId: string;
  groupName: string;
  details: {
    id: string;
    text: string;
    type: FormQuestionTypeEnum;
  };
  options: {
    id: string;
    text: string;
    value?: number;
    order: number;
  }[];
  participantGroupData: ParticipantGroupData[];
}

interface ParticipantGroupData {
  groupId: string;
  groupName: string;
  participantCount: number;
  question: any; // This will be the filtered question with answers
}

interface FormGroupWithQuestions {
  groupName: string;
  questions: QuestionWithParticipantGroups[];
}

// Group-Level Dashboard Indicator Component
interface GroupDashboardIndicatorProps {
  groupData: FormGroupWithQuestions;
  selectedGroupingQuestion?: string | null;
}

const CompactGroupIndicator = ({
  score,
  percentage,
  questionCount,
  label,
  unavailable,
}: {
  score: number;
  percentage: number;
  questionCount: number;
  label?: string;
  unavailable?: string;
}) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      flex: '1 0 auto',
      alignItems: 'center',
      gap: 3,
      whiteSpace: 'nowrap',
      fontWeight: 400,
      fontSize: '0.8125rem',
    }}
  >
    {label && (
      <Box
        component="span"
        sx={{
          fontWeight: 600,
          flex: '0 0 var(--indicator-group-width, auto)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </Box>
    )}
    {unavailable ? (
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {unavailable}
      </Box>
    ) : (
      <>
        <LinearProgress
          aria-label={label ? `Indicador de ${label}` : 'Indicador da escala'}
          variant="determinate"
          value={percentage}
          sx={{
            flex: '1 1 100px',
            minWidth: 32,
            height: 8,
            borderRadius: 4,
            backgroundColor: 'action.disabledBackground',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getIndicatorColorFromScore(score),
              borderRadius: 4,
            },
          }}
        />
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            flex: '0 0 var(--indicator-percent-width, auto)',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {percentage}%
        </Box>
        <Box
          component="span"
          sx={{
            color: 'text.secondary',
            flex: '0 0 var(--indicator-score-width, auto)',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          Score: {score.toFixed(3)} · {questionCount}{' '}
          {questionCount === 1 ? 'pergunta' : 'perguntas'}
        </Box>
      </>
    )}
  </Box>
);

// Component for individual participant group indicator
interface ParticipantGroupIndicatorProps {
  groupData: FormGroupWithQuestions;
  participantGroupId: string;
  participantGroupName: string;
  participantCount: number;
  isShareableLink: boolean;
  compact?: boolean;
}

const ParticipantGroupIndicator = ({
  groupData,
  participantGroupId,
  participantGroupName,
  participantCount,
  isShareableLink,
  compact,
}: ParticipantGroupIndicatorProps) => {
  const questionsForCalculation = groupData.questions.flatMap(
    (questionData) => {
      const participantData = questionData.participantGroupData.find(
        (pg) => pg.groupId === participantGroupId,
      );

      if (!participantData) return [];

      return [
        {
          answers: participantData.question.answers,
          options: questionData.options,
        },
      ];
    },
  );

  const {
    score: indicatorValue,
    percentage,
    hasValidAnswers,
  } = calculateFormIndicatorFromQuestions(questionsForCalculation);

  const shouldHideData = !isShareableLink && participantCount < 3;
  if (compact) {
    return (
      <CompactGroupIndicator
        score={indicatorValue}
        percentage={percentage}
        questionCount={questionsForCalculation.length}
        label={participantGroupName}
        unavailable={
          shouldHideData
            ? 'Dados protegidos'
            : !hasValidAnswers
              ? 'Sem respostas válidas'
              : undefined
        }
      />
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: shouldHideData
          ? 'background.paper'
          : !hasValidAnswers
            ? 'background.paper'
            : 'background.paper',
        borderRadius: 2,
        border: '2px solid',
        borderColor: shouldHideData
          ? '#ffb74d'
          : !hasValidAnswers
            ? 'action.disabledBackground'
            : getIndicatorColorFromScore(indicatorValue),
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Typography
        variant="h6"
        textAlign="center"
        mb={2}
        fontWeight={600}
        color="primary.dark"
      >
        {participantGroupName}
      </Typography>

      <Box
        minHeight={120}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {shouldHideData ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            textAlign="center"
            px={2}
          >
            <Typography color="text.primary" variant="h5" sx={{ mb: 1 }}>
              🔒
            </Typography>
            <Typography
              variant="body2"
              color="warning.dark"
              fontWeight={600}
              mb={1}
            >
              Dados Protegidos
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Para preservar a privacidade, os indicadores de setores com menos
              de 3 respostas não são exibidos.
            </Typography>
          </Box>
        ) : !hasValidAnswers ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            color="text.secondary"
          >
            <Typography color="text.primary" variant="body2">
              Sem perguntas válidas
            </Typography>
          </Box>
        ) : (
          <Box width="100%">
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 14,
                borderRadius: 7,
                backgroundColor: 'action.disabledBackground',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getIndicatorColorFromScore(indicatorValue),
                  borderRadius: 7,
                },
              }}
            />
            <IndicatorPercentScale />
            <Typography
              variant="h3"
              textAlign="center"
              mt={2}
              fontWeight={700}
              color={getIndicatorColorFromScore(indicatorValue)}
            >
              {percentage}%
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
              mt={0.5}
            >
              Score: {indicatorValue.toFixed(3)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const GroupDashboardIndicator = ({
  groupData,
  selectedGroupingQuestion,
  isShareableLink,
  hideTitle,
  compact,
}: GroupDashboardIndicatorProps & {
  isShareableLink: boolean;
  compact?: boolean;
  hideTitle?: boolean;
}) => {
  // Check if demographic grouping is active
  const hasMultipleParticipantGroups =
    groupData.questions.length > 0 &&
    groupData.questions[0].participantGroupData.length > 1;

  // If demographic grouping is active, show separate indicators for each participant group
  if (selectedGroupingQuestion && hasMultipleParticipantGroups) {
    // Get unique participant groups from the first question (they should be the same across all questions)
    const participantGroups = groupData.questions[0].participantGroupData;

    if (compact) {
      return (
        <>
          {participantGroups.map((group) => (
            <ParticipantGroupIndicator
              key={group.groupId}
              groupData={groupData}
              participantGroupId={group.groupId}
              participantGroupName={group.groupName}
              participantCount={group.participantCount}
              isShareableLink={isShareableLink}
              compact
            />
          ))}
        </>
      );
    }

    return (
      <SPaper
        shadow={false}
        sx={{
          mb: 6,
          p: 6,
          pb: 4,
          borderRadius: 3,
          backgroundColor: 'transparent',
          border: 0,
          borderColor: 'primary.100',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            mb: 4,
            pb: 3,
            borderBottom: '2px solid',
            borderColor: 'primary.100',
          }}
        >
          {!hideTitle && (
            <Typography
              variant="h5"
              textAlign="center"
              fontWeight={600}
              color="primary.main"
            >
              Indicadores do Grupo: {groupData.groupName}
            </Typography>
          )}
        </Box>

        {/* Show indicators side by side for each participant group */}
        <SFlex
          gap={4}
          display="grid"
          px={2}
          gridTemplateColumns="repeat(auto-fit, minmax(320px, 1fr))"
        >
          {participantGroups.map((participantGroup) => (
            <ParticipantGroupIndicator
              key={participantGroup.groupId}
              groupData={groupData}
              participantGroupId={participantGroup.groupId}
              participantGroupName={participantGroup.groupName}
              participantCount={participantGroup.participantCount}
              isShareableLink={isShareableLink}
            />
          ))}
        </SFlex>
      </SPaper>
    );
  }

  const questionsForCalculation = groupData.questions.flatMap((questionData) =>
    questionData.participantGroupData.map((participantData) => ({
      answers: participantData.question.answers,
      options: questionData.options,
    })),
  );

  const {
    score: indicatorValue,
    percentage,
    hasValidAnswers,
  } = calculateFormIndicatorFromQuestions(questionsForCalculation);

  if (compact) {
    return (
      <CompactGroupIndicator
        score={indicatorValue}
        percentage={percentage}
        questionCount={groupData.questions.length}
        unavailable={hasValidAnswers ? undefined : 'Sem respostas válidas'}
      />
    );
  }

  return (
    <SPaper
      shadow={false}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        border: 0,
        backgroundColor: 'transparent',
        borderColor: getIndicatorColorFromScore(indicatorValue),
      }}
    >
      {!hideTitle && (
        <Typography variant="h5" textAlign="center" mb={2} color="primary.main">
          Indicador do Grupo: {groupData.groupName}
        </Typography>
      )}

      <Box
        height={140}
        maxWidth={700}
        mx="auto"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box width="100%" mb={2}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 20,
              borderRadius: 10,
              backgroundColor: 'action.disabledBackground',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getIndicatorColorFromScore(indicatorValue),
                borderRadius: 10,
              },
            }}
          />
          <IndicatorPercentScale />
          <Typography
            variant="h2"
            textAlign="center"
            mt={2}
            color={getIndicatorColorFromScore(indicatorValue)}
          >
            {percentage}%
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            mt={1}
          >
            Score: {indicatorValue.toFixed(3)} | {groupData.questions.length}{' '}
            perguntas
          </Typography>
        </Box>
      </Box>
    </SPaper>
  );
};

interface FormQuestionsDashboardProps {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel | null | undefined;
  formApplication: FormApplicationReadModel;
  accessCompanyId: string;
}

export const FormQuestionsDashboard = ({
  formQuestionsAnswers: campaignAnswers,
  formApplication,
  accessCompanyId,
}: FormQuestionsDashboardProps) => {
  const { isMaster } = useAccess();
  const typeLabels = useHierarchyTypeLabels();
  const { enqueueSnackbar } = useSnackbar();
  const [isExportingChartsPdf, setIsExportingChartsPdf] = useState(false);
  const [isExportingIndicatorsPdf, setIsExportingIndicatorsPdf] =
    useState(false);
  const [isExportingRisksAnalysisPdf, setIsExportingRisksAnalysisPdf] =
    useState(false);
  const [
    isExportingFrpsTechnicalReportPdf,
    setIsExportingFrpsTechnicalReportPdf,
  ] = useState(false);
  const [pdfLoadingMessage, setPdfLoadingMessage] = useState<string>('');

  const isCanceled =
    formApplication.status === FormApplicationStatusEnum.CANCELED;
  const isDone = formApplication.status === FormApplicationStatusEnum.DONE;
  const isPsychosocialForm =
    formApplication.form.type === FormTypeEnum.PSYCHOSOCIAL;
  const isShareableLink = formApplication.isShareableLink;
  const isPartialPsychosocialForm = isPsychosocialForm && !isDone;
  const formQuestionsAnswers = useMemo(() => {
    if (!isPartialPsychosocialForm || !campaignAnswers) return campaignAnswers;

    return new FormQuestionsAnswersBrowseModel({
      participantStructures: campaignAnswers.participantStructures,
      results: campaignAnswers.results.map((group) => {
        if (group.identifier) return group;

        return new FormQuestionGroupWithAnswersBrowseModel({
          ...group,
          questions: group.questions
            .filter((question) => question.options.length > 0)
            .map(
              (question) =>
                new FormQuestionWithAnswersBrowseModel({
                  ...question,
                  answers: filterIndicatorAnswers(
                    question.answers,
                    null,
                    new Set(question.options.map(({ id }) => id)),
                  ),
                }),
            ),
        });
      }),
    });
  }, [campaignAnswers, isPartialPsychosocialForm]);
  const canViewPartialResults =
    isPartialPsychosocialForm &&
    campaignAnswers?.allowPartialResults === true &&
    (formQuestionsAnswers?.results.some(
      (group) =>
        !group.identifier &&
        group.questions.some((question) => question.answers.length > 0),
    ) ??
      false);
  const reportApplication = canViewPartialResults
    ? new FormApplicationReadModel({
        ...formApplication,
        name: `${formApplication.name} — resultados parciais`,
      })
    : formApplication;
  const canViewParticipants =
    !isShareableLink || formApplication.totalParticipants > 0;
  const showParticipantSetup =
    canViewParticipants && formApplication.totalAnswers === 0;
  const canViewResults =
    !showParticipantSetup &&
    (isPartialPsychosocialForm
      ? canViewPartialResults
      : isShareableLink || isDone || isCanceled);
  const canAnalyzeRisks = isPsychosocialForm && isDone && canViewResults;

  const initialResultsTab = isCanceled || canViewPartialResults ? 2 : 1;
  const initialManagementTab = canViewParticipants ? 6 : 5;
  const initialTab = canViewResults ? initialResultsTab : initialManagementTab;
  const tabStorageKey = `form-application-tab:${accessCompanyId}:${formApplication.id}:${isShareableLink ? 'shared' : 'internal'}`;
  const [tabSelection, setTabSelection] = useState<{
    key: string;
    value: number;
  } | null>(null);
  const selectedTab =
    tabSelection?.key === tabStorageKey ? tabSelection.value : null;

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(tabStorageKey);
      const value = stored === null ? null : Number(stored);
      setTabSelection(
        value !== null && Number.isInteger(value) && value >= 1 && value <= 6
          ? { key: tabStorageKey, value }
          : null,
      );
    } catch {
      setTabSelection(null);
    }
  }, [tabStorageKey]);

  const setTabTableIndex = (value: number) => {
    setTabSelection({ key: tabStorageKey, value });
    try {
      window.sessionStorage.setItem(tabStorageKey, String(value));
    } catch {
      // Tab navigation remains available when browser storage is disabled.
    }
  };
  const tabTableIndex =
    selectedTab !== null &&
    (canViewResults || selectedTab >= 5) &&
    (!isPartialPsychosocialForm || selectedTab !== 3) &&
    (canAnalyzeRisks || selectedTab !== 4) &&
    (isPsychosocialForm || selectedTab !== 5) &&
    (selectedTab !== 6 || canViewParticipants)
      ? selectedTab
      : initialTab;
  const isIndicatorTab = tabTableIndex === 2;
  const isGraphsTab = tabTableIndex === 1;
  const [indicatorLevels, setIndicatorLevels] = useState<IndicatorLevels>({
    scales: true,
    dimensions: true,
  });
  const dimensionView = useMemo(
    () =>
      buildCopsoqLongDimensionView(
        formApplication.form.id,
        formQuestionsAnswers,
        formApplication.form.indicatorHierarchy,
      ),
    [
      formApplication.form.id,
      formApplication.form.indicatorHierarchy,
      formQuestionsAnswers,
    ],
  );
  const indicatorHierarchy = isIndicatorTab ? dimensionView : null;
  const questionDisplayHierarchy =
    indicatorHierarchy ??
    (isGraphsTab && isPsychosocialForm ? dimensionView : null);
  type IndicatorView = 'bars' | 'radar-scales' | 'radar-dimensions';
  const [consolidateRadar, setConsolidateRadar] = useState(false);
  const [indicatorView, setIndicatorView] = useState<IndicatorView>('bars');
  const canShowScaleRadar = !!indicatorHierarchy;
  const canShowDimensionRadar = !!indicatorHierarchy;
  const activeIndicatorView =
    (indicatorView === 'radar-scales' && canShowScaleRadar) ||
    (indicatorView === 'radar-dimensions' && canShowDimensionRadar)
      ? indicatorView
      : 'bars';
  const [identificationQuestionId, setIdentificationQuestionId] = useState<
    string | null
  >(null);
  const [organizationDialogOpen, setOrganizationDialogOpen] = useState(false);
  const [organizationGroupIds, setOrganizationGroupIds] = useState<string[]>(
    [],
  );
  const [showQuestionIndicators, setShowQuestionIndicators] = useState(true);
  // Keep the existing presentation/PDF contract; the control uses positive wording.
  const showOnlyGroupIndicators = !showQuestionIndicators;
  const [chartsChartType, setChartsChartType] = useState<FormChartType>(
    DEFAULT_FORM_CHART_TYPE,
  );
  const [executiveLevel, setExecutiveLevel] = useState<
    'scales' | 'dimensions' | 'questions'
  >('scales');
  const [executiveDistributionChartType, setExecutiveDistributionChartType] =
    useState<FormChartType>('bar');

  // Fetch hierarchy groups for sector grouping
  const { hierarchyGroups } = useFetchBrowseHierarchyGroups({
    companyId: accessCompanyId,
    applicationId: formApplication.id,
  });

  const { formQuestionsAnswersRisks } = useFetchBrowseFormQuestionsAnswersRisks(
    {
      companyId: accessCompanyId,
      applicationId: formApplication.id,
    },
  );

  const { formParticipants } = useFetchBrowseFormParticipants({
    companyId: accessCompanyId,
    applicationId: formApplication.id,
    pagination: { page: 1, limit: 10_000 },
  });

  const groupingEnrichment = useMemo(
    () =>
      buildParticipantGroupingEnrichmentContext({
        entityMap: formQuestionsAnswersRisks?.entityMap,
        participants: formParticipants?.results ?? [],
        applicationWorkspaces: formApplication.participants.workspaces,
      }),
    [
      formQuestionsAnswersRisks?.entityMap,
      formParticipants?.results,
      formApplication.participants.workspaces,
    ],
  );

  const questionGroups = formQuestionsAnswers?.results ?? [];
  const identifierGroup = questionGroups.find((group) => group.identifier);
  const generalGroups = questionGroups.filter((group) => !group.identifier);

  const availableGroupingQuestions = useMemo(() => {
    if (!identifierGroup?.questions) return [];

    return identifierGroup.questions.filter(
      (question) =>
        question.options.length > 0 &&
        [
          FormQuestionTypeEnum.RADIO,
          FormQuestionTypeEnum.CHECKBOX,
          FormQuestionTypeEnum.SELECT,
          FormQuestionTypeEnum.SYSTEM,
        ].includes(question.details.type),
    );
  }, [identifierGroup]);

  const participantStructuresForGrouping = useMemo(
    () => resolveParticipantStructuresForGrouping(formQuestionsAnswers),
    [formQuestionsAnswers],
  );

  const organizationalGroups = useMemo(
    () =>
      buildOrganizationalGroups(participantStructuresForGrouping, typeLabels),
    [participantStructuresForGrouping, typeLabels],
  );
  const organizationSelection = useMemo(() => {
    const available = new Set(organizationalGroups.map(({ id }) => id));
    return organizationGroupIds.filter((id) => available.has(id));
  }, [organizationGroupIds, organizationalGroups]);
  const isOrganizationalGrouping = organizationSelection.length > 0;
  const selectedGroupingQuestion = isOrganizationalGrouping
    ? ORGANIZATIONAL_GROUPING_ID
    : identificationQuestionId;
  const selectedIdentificationQuestion = availableGroupingQuestions.find(
    ({ id }) => id === identificationQuestionId,
  );
  const selectedGroupingLabel = isOrganizationalGrouping
    ? ORGANIZATIONAL_GROUPING_LABEL
    : (selectedIdentificationQuestion?.textWithoutHtml ?? null);

  const [identificationFilters, setIdentificationFilters] = useState<
    Record<string, string[]>
  >({});
  const identificationFilterIds = useMemo(
    () =>
      intersectIdentificationFilters(
        availableGroupingQuestions,
        identificationFilters,
      ),
    [availableGroupingQuestions, identificationFilters],
  );
  const baseParticipantGroups = useMemo(
    () =>
      isOrganizationalGrouping
        ? organizationalGroups
        : buildParticipantGroupsForIndicators({
            formQuestionsAnswers,
            selectedGroupingQuestionId: identificationQuestionId,
            hierarchyGroups,
            groupingEnrichment,
            companyLabels: typeLabels,
          }),
    [
      isOrganizationalGrouping,
      organizationalGroups,
      formQuestionsAnswers,
      identificationQuestionId,
      hierarchyGroups,
      groupingEnrichment,
      typeLabels,
    ],
  );

  const participantGroups = useMemo(
    () =>
      baseParticipantGroups.map((group) => ({
        ...group,
        participantIds:
          identificationFilterIds === null
            ? group.participantIds
            : new Set(
                [...group.participantIds].filter((id) =>
                  identificationFilterIds.has(id),
                ),
              ),
      })),
    [baseParticipantGroups, identificationFilterIds],
  );

  const { formParticipants: paginatedParticipants } =
    useFetchBrowseAllFormParticipantsForGrouping({
      companyId: accessCompanyId,
      applicationId: formApplication.id,
      enabled:
        (organizationDialogOpen || isOrganizationalGrouping) &&
        !!formParticipants &&
        formParticipants.results.length < formParticipants.pagination.total,
    });
  const campaignParticipants = paginatedParticipants ?? formParticipants;
  const campaignEmployeesByGroup = useMemo(() => {
    if (
      !campaignParticipants ||
      campaignParticipants.results.length <
        campaignParticipants.pagination.total
    ) {
      return null;
    }
    const counts = new Map<string, number>();
    for (const participant of campaignParticipants.results) {
      for (const id of organizationalPathIds(organizationalPath(participant))) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return counts;
  }, [campaignParticipants]);

  const participantGroupIdsKey = useMemo(
    () =>
      participantGroups
        .map((g) => g.id)
        .sort()
        .join('|'),
    [participantGroups],
  );

  const groupingSelectionKey = selectedGroupingQuestion
    ? `${selectedGroupingQuestion}|${participantGroupIdsKey}`
    : '';

  const [groupingSelectionState, setGroupingSelectionState] = useState<{
    key: string;
    ids: string[];
  }>({ key: '', ids: [] });

  const defaultParticipantGroupIds = useMemo(
    () =>
      (isPartialPsychosocialForm
        ? participantGroups
            .filter(
              (group) => group.participantIds.size >= PARTIAL_RESULTS_MINIMUM,
            )
            .slice(0, 1)
        : participantGroups
      ).map((group) => group.id),
    [isPartialPsychosocialForm, participantGroups],
  );

  useEffect(() => {
    if (!selectedGroupingQuestion) {
      setGroupingSelectionState({ key: '', ids: [] });
      return;
    }
    setGroupingSelectionState({
      key: groupingSelectionKey,
      ids: defaultParticipantGroupIds,
    });
  }, [
    selectedGroupingQuestion,
    groupingSelectionKey,
    defaultParticipantGroupIds,
  ]);

  const selectedParticipantGroupIdsForView = useMemo(() => {
    if (isOrganizationalGrouping) return organizationSelection;
    if (!selectedGroupingQuestion) return null;
    if (groupingSelectionState.key !== groupingSelectionKey) {
      return defaultParticipantGroupIds;
    }
    return groupingSelectionState.ids;
  }, [
    selectedGroupingQuestion,
    groupingSelectionKey,
    groupingSelectionState,
    defaultParticipantGroupIds,
    isOrganizationalGrouping,
    organizationSelection,
  ]);

  const visibleParticipantGroups = useMemo(() => {
    if (!selectedGroupingQuestion) return participantGroups;
    const idSet = new Set(selectedParticipantGroupIdsForView ?? []);
    return participantGroups.filter((g) => idSet.has(g.id));
  }, [
    selectedGroupingQuestion,
    participantGroups,
    selectedParticipantGroupIdsForView,
  ]);

  const indicatorsNarrativeScope = useMemo(
    () =>
      buildIndicatorsNarrativeDiagnosticScope({
        selectedGroupingQuestionId: selectedGroupingQuestion,
        visibleParticipantGroups,
        groupingLabel: selectedGroupingLabel,
        showOnlyGroupIndicators,
      }),
    [
      selectedGroupingQuestion,
      visibleParticipantGroups,
      selectedGroupingLabel,
      showOnlyGroupIndicators,
    ],
  );

  const participantGroupingOverride = useMemo(
    () =>
      selectedGroupingQuestion && selectedGroupingLabel
        ? {
            grouping: {
              active: true as const,
              questionId: selectedGroupingQuestion,
              questionLabel: selectedGroupingLabel,
            },
            participantGroups,
          }
        : undefined,
    [selectedGroupingQuestion, selectedGroupingLabel, participantGroups],
  );

  const indicatorsDatasetForView = useMemo(() => {
    if (!formQuestionsAnswers || !isIndicatorTab) return null;

    return buildIndicatorsPresentation(
      {
        formQuestionsAnswers,
        selectedGroupingQuestionId: selectedGroupingQuestion,
        showOnlyGroupIndicators: executiveLevel !== 'questions',
        executiveDistributionChartType,
        narrativeDiagnosticMarkdown: null,
        isShareableLink: isShareableLink && !isPartialPsychosocialForm,
        partialResults: isPartialPsychosocialForm,
        hierarchyGroups,
        participantGroupingOverride,
        ...(selectedGroupingQuestion && selectedParticipantGroupIdsForView
          ? { visibleParticipantGroupIds: selectedParticipantGroupIdsForView }
          : {}),
      },
      indicatorHierarchy,
      {
        scales: executiveLevel === 'scales',
        dimensions: executiveLevel === 'dimensions',
      },
    );
  }, [
    formQuestionsAnswers,
    indicatorHierarchy,
    executiveLevel,
    isIndicatorTab,
    selectedGroupingQuestion,

    executiveDistributionChartType,
    isShareableLink,
    isPartialPsychosocialForm,
    hierarchyGroups,
    participantGroupingOverride,
    selectedParticipantGroupIdsForView,
  ]);

  // Filter questions that can be displayed as pie charts (questions with options)
  const filterQuestionsWithOptions = useCallback(
    (
      groups: FormQuestionGroupWithAnswersBrowseModel[],
      filteredParticipantIds?: Set<string> | null,
    ) =>
      groups.flatMap((group) =>
        group.questions
          .filter(
            (question) =>
              question.options.length > 0 &&
              [
                FormQuestionTypeEnum.RADIO,
                FormQuestionTypeEnum.CHECKBOX,
                FormQuestionTypeEnum.SELECT,
              ].includes(question.details.type),
          )
          .map((question) => ({
            ...question,
            options: question.options.map((option) => ({
              ...option,
              value: option.value ? 6 - option.value : option.value,
              label: option.text,
            })),
            groupName: group.name,
            groupId: group.id,
            answers: filterIndicatorAnswers(
              question.answers,
              filteredParticipantIds,
              isPartialPsychosocialForm && !group.identifier
                ? new Set(question.options.map(({ id }) => id))
                : undefined,
            ),
          })),
      ),
    [isPartialPsychosocialForm],
  );

  const requireIndicatorLevel = !showQuestionIndicators;
  const usesDimensionSections = !!indicatorHierarchy?.scaleResults;
  const canShowNarrative =
    !isCanceled &&
    !isOrganizationalGrouping &&
    !isPartialPsychosocialForm &&
    (!indicatorHierarchy ||
      (usesDimensionSections
        ? indicatorLevels.dimensions && !indicatorLevels.scales
        : indicatorLevels.scales && !indicatorLevels.dimensions));
  const ensureIndicatorLevel = () => {
    setIndicatorLevels((levels) =>
      levels.scales || levels.dimensions
        ? levels
        : { scales: true, dimensions: false },
    );
  };

  const handleCreateGroupAnalysis = (questionId: string) => {
    if (questionId) ensureIndicatorLevel();
    setOrganizationGroupIds([]);
    setIdentificationQuestionId(questionId);
  };

  const identifierQuestions = identifierGroup
    ? filterQuestionsWithOptions([identifierGroup])
    : [];

  // Create array of arrays for general questions - one array per participant group
  const generalQuestionsArrays = useMemo(() => {
    const displayGroups =
      questionDisplayHierarchy?.scaleResults?.filter(
        (group) => !group.identifier,
      ) ?? generalGroups;
    return visibleParticipantGroups.map((group) => {
      const questionsForGroup = filterQuestionsWithOptions(
        displayGroups,
        group.participantIds,
      );
      return {
        groupId: group.id,
        groupName: group.name,
        participantCount: group.participantIds.size,
        questions: questionsForGroup,
      };
    });
  }, [
    visibleParticipantGroups,
    generalGroups,
    questionDisplayHierarchy,
    filterQuestionsWithOptions,
  ]);

  const radarGroups = useMemo(() => {
    if (!indicatorHierarchy || activeIndicatorView === 'bars') return [];

    const dimensionsByScale = new Map<
      string,
      FormQuestionGroupWithAnswersBrowseModel[]
    >();
    for (const dimension of indicatorHierarchy.results) {
      const scaleId = indicatorHierarchy.parentGroupIds[dimension.id];
      if (dimension.identifier || !scaleId) continue;
      const dimensions = dimensionsByScale.get(scaleId) ?? [];
      dimensions.push(dimension);
      dimensionsByScale.set(scaleId, dimensions);
    }

    let radarQuestions = generalQuestionsArrays;
    if (
      isPartialPsychosocialForm &&
      selectedGroupingQuestion &&
      consolidateRadar
    ) {
      const participantIds = new Set<string>();
      for (const group of visibleParticipantGroups) {
        for (const id of group.participantIds) participantIds.add(id);
      }
      const displayGroups =
        indicatorHierarchy.scaleResults?.filter((group) => !group.identifier) ??
        generalGroups;
      radarQuestions = [
        {
          groupId: 'radar-consolidated-selection',
          groupName: 'Consolidado dos grupos selecionados',
          participantCount: participantIds.size,
          questions: filterQuestionsWithOptions(displayGroups, participantIds),
        },
      ];
    }

    return radarQuestions.map(
      ({ groupId, groupName, participantCount, questions }) => {
        const isProtected =
          (!isShareableLink || isPartialPsychosocialForm) &&
          participantCount < 3;
        const questionsByScale = new Map<string, typeof questions>();
        for (const question of questions) {
          const scale = questionsByScale.get(question.groupId) ?? [];
          scale.push(question);
          questionsByScale.set(question.groupId, scale);
        }

        return {
          id: groupId,
          name: groupName,
          protected: isProtected,
          scales: Array.from(questionsByScale, ([id, scaleQuestions]) => {
            const summarize = (items: typeof questions) =>
              calculateFormIndicatorFromQuestions(isProtected ? [] : items);
            return {
              id,
              name: scaleQuestions[0].groupName.replace(
                /^Escala\s*[–—-]\s*/i,
                '',
              ),
              ...summarize(scaleQuestions),
              dimensions: (dimensionsByScale.get(id) ?? []).flatMap(
                (dimension) => {
                  const ids = new Set(dimension.questions.map(({ id }) => id));
                  const dimensionQuestions = scaleQuestions.filter(({ id }) =>
                    ids.has(id),
                  );
                  if (!dimensionQuestions.length) return [];

                  return [
                    {
                      id: dimension.id,
                      name: dimension.name.replace(/^Dimensão\s*[–—-]\s*/i, ''),
                      ...summarize(dimensionQuestions),
                    },
                  ];
                },
              ),
            };
          }),
        };
      },
    );
  }, [
    activeIndicatorView,
    consolidateRadar,
    filterQuestionsWithOptions,
    generalGroups,
    generalQuestionsArrays,
    selectedGroupingQuestion,
    visibleParticipantGroups,
    indicatorHierarchy,
    isPartialPsychosocialForm,
    isShareableLink,
  ]);

  const hasGeneralQuestionsForAnyParticipantGroup = useMemo(
    () =>
      participantGroups.some(
        (group) =>
          filterQuestionsWithOptions(generalGroups, group.participantIds)
            .length > 0,
      ),
    [participantGroups, generalGroups, filterQuestionsWithOptions],
  );

  // Participant setup uses its own queries and does not need answers.
  if (!formQuestionsAnswers && !showParticipantSetup) {
    return (
      <Box>
        <SSkeleton height={500} />
      </Box>
    );
  }

  if (
    isShareableLink &&
    !canViewParticipants &&
    identifierQuestions.length === 0 &&
    !hasGeneralQuestionsForAnyParticipantGroup &&
    !isCanceled
  ) {
    return (
      <SFlex
        direction="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
      >
        <SPaper
          className="polished-form-panel"
          sx={{
            p: 6,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            textAlign: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <InsertChartIcon
            sx={{
              fontSize: 64,
              color: 'text.secondary',
              mb: 3,
            }}
          />
          <SText
            sx={{
              fontSize: 18,
              fontWeight: 500,
              color: 'text.primary',
              mb: 2,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            Nenhuma resposta encontrada para exibir gráficos
          </SText>
          <SText
            sx={{
              fontSize: 14,
              color: 'text.secondary',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Para visualizar gráficos, certifique-se de que seu formulário tenha
            sido compartilhado com sua empresa.
          </SText>
        </SPaper>
      </SFlex>
    );
  }

  const isTextAnswersTab = tabTableIndex === 3;
  const isRisksAnalysisTab = canAnalyzeRisks && tabTableIndex === 4;
  const isHierarchyGroupsTab = tabTableIndex === 5;
  const isParticipantsTab = tabTableIndex === 6;

  return (
    <SFlex direction="column" gap={16}>
      {/* Identifier Section */}
      {canViewResults &&
        !isPartialPsychosocialForm &&
        identifierQuestions.length > 0 && (
          <Box
            sx={{
              p: 3,
              '&:has(> .MuiAccordion-root:not(.Mui-expanded))': { p: 0 },
            }}
          >
            <SAccordion
              defaultExpanded={false}
              icon={<PieChartIcon sx={{ fontSize: 30 }} />}
              title="Informações de Identificação"
              expandIcon={<ArrowRightIcon fontSize="small" />}
              color="text.primary"
              subtitle={`${identifierQuestions.length} gráfico${identifierQuestions.length === 1 ? '' : 's'}`}
              fontWeight="600"
              accordionProps={{
                TransitionProps: { unmountOnExit: false },
                sx: (theme) => ({
                  ...formAccordionNavigationSx,
                  border: 0,
                  backgroundColor: 'transparent',
                  WebkitBoxShadow: 'none',
                  boxShadow: 'none',
                  '&::before': { display: 'none' },
                  '&&:not(.Mui-expanded)': { p: 0, overflow: 'visible' },
                  '&& .MuiAccordionSummary-root:not(.Mui-expanded)': {
                    minHeight: 76,
                    px: 6,
                    gap: 4,
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.045)'
                        : 'rgba(255, 255, 255, 0.45)',
                    backdropFilter: 'blur(16px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                    '&:hover': { backgroundColor: 'action.hover' },
                    '& .MuiAccordionSummary-content': {
                      my: 4,
                      alignItems: 'center',
                      gap: 4,
                      minWidth: 0,
                    },
                    '& .MuiAccordionSummary-content > div:first-of-type': {
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      mr: 0,
                    },
                  },
                }),
              }}
            >
              <SAccordionBody>
                <Box sx={{ pt: 4 }}>
                  <SFlex
                    gap={4}
                    display="grid"
                    gridTemplateColumns="repeat(auto-fit, minmax(min(100%, 400px), 1fr))"
                  >
                    {identifierQuestions.map((question) => (
                      <Box
                        key={question.id}
                        p={4}
                        sx={{
                          minWidth: 0,
                          border: '1px solid',
                          borderColor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '#465267'
                              : '#CBD5E1',
                          borderRadius: 3,
                        }}
                      >
                        <FormQuestionPieChart
                          question={question}
                          colorScheme="identifier"
                          chartType={chartsChartType}
                          onCreateGroupAnalysis={handleCreateGroupAnalysis}
                          isShareableLink={isShareableLink}
                        />
                      </Box>
                    ))}
                  </SFlex>
                </Box>
              </SAccordionBody>
            </SAccordion>
          </Box>
        )}

      {canViewResults && (
        <Box sx={{ p: 3 }}>
          {/* Grouping Section */}
          {(availableGroupingQuestions.length > 0 ||
            organizationalGroups.length > 0) &&
            (hasGeneralQuestionsForAnyParticipantGroup ||
              Object.values(identificationFilters).some(
                (options) => options.length > 0,
              ) ||
              selectedGroupingQuestion) && (
              <SAccordion
                defaultExpanded={false}
                accordionProps={{
                  sx: (theme) => ({
                    ...(typeof indicatorSectionAccordionProps.sx === 'function'
                      ? indicatorSectionAccordionProps.sx(theme)
                      : {}),
                    '& > .MuiAccordionSummary-root > .MuiAccordionSummary-content':
                      { alignItems: 'center', gap: 4 },
                    '& > .MuiAccordionSummary-root > .MuiAccordionSummary-content > div:first-of-type':
                      { width: 36, height: 36, flexShrink: 0, mr: 0 },
                    '& .MuiAccordionSummary-content .MuiTypography-body2': {
                      color: 'text.secondary',
                    },
                  }),
                }}
                expandIcon={<ArrowRightIcon fontSize="small" />}
                icon={<FilterListIcon sx={{ fontSize: 30 }} />}
                color="text.primary"
                title="Filtros e comparações"
                subtitle={[
                  `${new Set(visibleParticipantGroups.flatMap((group) => Array.from(group.participantIds))).size} participantes`,
                  organizationSelection.length
                    ? `${organizationSelection.length} grupos organizacionais selecionados`
                    : '',
                  Object.values(identificationFilters).some(
                    (options) => options.length > 0,
                  )
                    ? `${Object.values(identificationFilters).filter((options) => options.length > 0).length} filtros de identificação ativos`
                    : '',
                  selectedGroupingQuestion
                    ? `Comparação: ${selectedGroupingLabel || 'grupos selecionados'}`
                    : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              >
                <SAccordionBody>
                  <Box sx={{ pt: 6, px: 6, pb: 2 }}>
                    <SFlex direction="column" gap={3}>
                      <SFlex gap={3} flexWrap="wrap" alignItems="center">
                        {organizationalGroups.length > 0 && (
                          <Button
                            variant="outlined"
                            sx={{
                              minHeight: 40,
                              color: 'text.secondary',
                              borderColor: 'divider',
                              bgcolor: 'background.paper',
                              '&:hover': {
                                borderColor: 'text.secondary',
                                bgcolor: 'action.hover',
                              },
                            }}
                            onClick={() => setOrganizationDialogOpen(true)}
                          >
                            Selecionar grupos da estrutura organizacional
                          </Button>
                        )}
                        <CombinedIdentificationFilters
                          questions={availableGroupingQuestions}
                          value={identificationFilters}
                          onChange={setIdentificationFilters}
                        />
                        <CombinedIdentificationFilters
                          questions={availableGroupingQuestions}
                          value={identificationFilters}
                          onChange={setIdentificationFilters}
                          grouping={{
                            questionId: identificationQuestionId,
                            groups: participantGroups,
                            selectedIds:
                              selectedParticipantGroupIdsForView ?? [],
                            onQuestionChange: (id) => {
                              if (id) handleCreateGroupAnalysis(id);
                              else setIdentificationQuestionId(null);
                            },
                            onGroupsChange: (ids) =>
                              setGroupingSelectionState({
                                key: groupingSelectionKey,
                                ids,
                              }),
                            onClear: () => setIdentificationQuestionId(null),
                          }}
                        />
                      </SFlex>
                      {organizationDialogOpen && (
                        <OrganizationalGroupingDialog
                          groups={organizationalGroups}
                          selectedIds={organizationSelection}
                          counts={campaignEmployeesByGroup}
                          onClose={() => setOrganizationDialogOpen(false)}
                          onApply={(ids) => {
                            if (ids.length) {
                              ensureIndicatorLevel();
                              setIdentificationQuestionId(null);
                            }
                            setOrganizationGroupIds(ids);
                            setOrganizationDialogOpen(false);
                          }}
                        />
                      )}

                      {/* Participant Count */}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {selectedGroupingQuestion
                            ? `Exibindo ${visibleParticipantGroups.length} de ${participantGroups.length} grupos`
                            : `Total de ${participantGroups[0]?.participantIds.size || 0} participantes`}
                        </Typography>
                      </Box>
                    </SFlex>
                  </Box>
                </SAccordionBody>
              </SAccordion>
            )}
        </Box>
      )}

      {/* General Questions Section */}
      {(hasGeneralQuestionsForAnyParticipantGroup ||
        canViewParticipants ||
        isCanceled) && (
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 4,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <STabs
              containerProps={{
                sx: { flex: '1 1 600px', minWidth: 0, borderBottom: 0 },
              }}
              options={[
                ...(canViewResults
                  ? [
                      {
                        label: 'Gráficos',
                        value: 1,
                      },
                      {
                        label: 'Indicadores',
                        value: 2,
                      },
                      ...(!isPartialPsychosocialForm
                        ? [{ label: 'Respostas de Texto', value: 3 }]
                        : []),
                    ]
                  : []),
                ...(canAnalyzeRisks
                  ? [
                      {
                        label: 'Análise de Riscos',
                        value: 4,
                      },
                    ]
                  : []),
                // Show Hierarchy Groups tab for psychosocial forms
                ...(isPsychosocialForm
                  ? [
                      {
                        label: 'Agrupamentos',
                        value: 5,
                      },
                    ]
                  : []),
                ...(canViewParticipants
                  ? [
                      {
                        label: 'Participantes',
                        value: 6,
                      },
                    ]
                  : []),
              ]}
              value={tabTableIndex}
              onChange={(_, value) => {
                setTabTableIndex(value);
                setShowQuestionIndicators(true);
              }}
            />
            {isRisksAnalysisTab && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 4,
                  ml: 'auto',
                  pb: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  sx={(theme) => ({
                    color: 'text.primary',
                    borderColor: 'divider',
                    background:
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
                    backdropFilter: 'blur(16px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                    transition:
                      'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
                    '&:hover': {
                      color:
                        theme.palette.mode === 'dark' ? '#F9D43B' : '#1565C0',
                      backgroundColor: 'action.hover',
                      borderColor: 'text.secondary',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'text.secondary',
                      outlineOffset: 2,
                    },
                  })}
                  variant="outlined"
                  disabled={
                    !formQuestionsAnswers ||
                    isExportingRisksAnalysisPdf ||
                    isExportingFrpsTechnicalReportPdf
                  }
                  startIcon={
                    isExportingRisksAnalysisPdf ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : undefined
                  }
                  onClick={async () => {
                    if (!formQuestionsAnswers) {
                      enqueueSnackbar(
                        'Dados do formulário ainda não carregados.',
                        { variant: 'warning' },
                      );
                      return;
                    }
                    setIsExportingRisksAnalysisPdf(true);
                    setPdfLoadingMessage('Iniciando geração do PDF...');
                    try {
                      await exportFormRiskAnalysisPdfInBrowser(
                        {
                          formApplication,
                          accessCompanyId,
                          formQuestionsAnswers,
                          selectedGroupingQuestionId: selectedGroupingQuestion,
                          selectedGroupingLabel,
                          hierarchyGroups,
                          ...(selectedGroupingQuestion &&
                          selectedParticipantGroupIdsForView
                            ? {
                                visibleParticipantGroupIds:
                                  selectedParticipantGroupIdsForView,
                              }
                            : {}),
                        },
                        (message) => setPdfLoadingMessage(message),
                      );
                      enqueueSnackbar('PDF gerado com sucesso!', {
                        variant: 'success',
                      });
                    } catch (e) {
                      enqueueSnackbar(
                        e instanceof Error
                          ? e.message
                          : 'Não foi possível gerar o PDF da análise de riscos.',
                        { variant: 'error' },
                      );
                    } finally {
                      setIsExportingRisksAnalysisPdf(false);
                      setPdfLoadingMessage('');
                    }
                  }}
                >
                  Exportar PDF (Análise de Riscos)
                </Button>
                <Button
                  sx={(theme) => ({
                    color: 'text.primary',
                    borderColor: 'divider',
                    background:
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
                    backdropFilter: 'blur(16px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                    transition:
                      'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
                    '&:hover': {
                      color:
                        theme.palette.mode === 'dark' ? '#F9D43B' : '#1565C0',
                      backgroundColor: 'action.hover',
                      borderColor: 'text.secondary',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'text.secondary',
                      outlineOffset: 2,
                    },
                  })}
                  variant="outlined"
                  title="Gera a fundamentação conceitual validada das fontes geradoras e medidas de prevenção utilizadas neste recorte."
                  disabled={
                    !formQuestionsAnswers ||
                    isExportingRisksAnalysisPdf ||
                    isExportingFrpsTechnicalReportPdf
                  }
                  startIcon={
                    isExportingFrpsTechnicalReportPdf ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : undefined
                  }
                  onClick={async () => {
                    if (!formQuestionsAnswers) {
                      enqueueSnackbar(
                        'Dados do formulário ainda não carregados.',
                        { variant: 'warning' },
                      );
                      return;
                    }
                    setIsExportingFrpsTechnicalReportPdf(true);
                    setPdfLoadingMessage('Gerando relatório técnico...');
                    try {
                      await exportFrpsExplainabilityTechnicalReportPdfInBrowser(
                        {
                          formApplication,
                          accessCompanyId,
                          formQuestionsAnswers,
                          selectedGroupingQuestionId: selectedGroupingQuestion,
                          selectedGroupingLabel,
                          hierarchyGroups,
                          ...(selectedGroupingQuestion &&
                          selectedParticipantGroupIdsForView
                            ? {
                                visibleParticipantGroupIds:
                                  selectedParticipantGroupIdsForView,
                              }
                            : {}),
                        },
                        (message) => setPdfLoadingMessage(message),
                      );
                      enqueueSnackbar('Relatório técnico gerado com sucesso.', {
                        variant: 'success',
                      });
                    } catch (e) {
                      enqueueSnackbar(
                        e instanceof Error
                          ? e.message
                          : 'Não foi possível gerar o relatório técnico.',
                        { variant: 'error' },
                      );
                    } finally {
                      setIsExportingFrpsTechnicalReportPdf(false);
                      setPdfLoadingMessage('');
                    }
                  }}
                >
                  Exportar Relatório Técnico
                </Button>
              </Box>
            )}
            {canViewResults && isIndicatorTab && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 2,
                  ml: 'auto',
                  pb: 2,
                }}
              >
                <Button
                  sx={(theme) => ({
                    color: 'text.primary',
                    borderColor: 'divider',
                    background:
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
                    backdropFilter: 'blur(16px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                    transition:
                      'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
                    '&:hover': {
                      color:
                        theme.palette.mode === 'dark' ? '#F9D43B' : '#1565C0',
                      backgroundColor: 'action.hover',
                      borderColor: 'text.secondary',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'text.secondary',
                      outlineOffset: 2,
                    },
                  })}
                  variant="outlined"
                  disabled={isExportingIndicatorsPdf || !formQuestionsAnswers}
                  onClick={async () => {
                    if (!formQuestionsAnswers) {
                      enqueueSnackbar(
                        'Dados do formulário ainda não carregados.',
                        {
                          variant: 'warning',
                        },
                      );
                      return;
                    }
                    setIsExportingIndicatorsPdf(true);
                    setPdfLoadingMessage('Iniciando geração do PDF...');
                    try {
                      if (activeIndicatorView === 'bars') {
                        await exportFormIndicatorsPdfInBrowser(
                          {
                            accessCompanyId,
                            formApplication: reportApplication,
                            partialResults: isPartialPsychosocialForm,
                            formQuestionsAnswers,
                            dimensionView: indicatorHierarchy,
                            levels: indicatorLevels,
                            includeNarrative: canShowNarrative,
                            selectedGroupingQuestionId:
                              selectedGroupingQuestion,
                            selectedGroupingLabel,
                            showOnlyGroupIndicators,
                            executiveDistributionChartType,
                            executiveDistribution:
                              indicatorsDatasetForView?.executiveDistribution,
                            hierarchyGroups,
                            participantGroupingOverride,
                            ...(selectedGroupingQuestion &&
                            selectedParticipantGroupIdsForView
                              ? {
                                  visibleParticipantGroupIds:
                                    selectedParticipantGroupIdsForView,
                                }
                              : {}),
                          },
                          (message) => setPdfLoadingMessage(message),
                        );
                      } else {
                        await exportFormRadarPdfInBrowser(
                          {
                            formName: formApplication.form.name,
                            applicationName: reportApplication.name,
                            groupingLabel: selectedGroupingLabel,
                            groups: radarGroups,
                            byDimension:
                              activeIndicatorView === 'radar-dimensions',
                          },
                          setPdfLoadingMessage,
                        );
                      }
                      enqueueSnackbar('PDF gerado com sucesso!', {
                        variant: 'success',
                      });
                    } catch (e) {
                      enqueueSnackbar(
                        e instanceof Error
                          ? e.message
                          : 'Não foi possível gerar o PDF dos indicadores.',
                        { variant: 'error' },
                      );
                    } finally {
                      setIsExportingIndicatorsPdf(false);
                      setPdfLoadingMessage('');
                    }
                  }}
                >
                  Exportar PDF (Indicadores)
                </Button>
              </Box>
            )}
            {canViewResults && isGraphsTab && (
              <Box
                sx={{
                  display: 'flex',
                  ml: 'auto',
                  pb: 2,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap',
                  gap: 4,
                }}
              >
                <FormChartTypeSelector
                  value={chartsChartType}
                  onChange={setChartsChartType}
                />
                <Button
                  variant="outlined"
                  sx={(theme) => ({
                    color: 'text.primary',
                    borderColor: 'divider',
                    background:
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
                    backdropFilter: 'blur(16px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                    transition:
                      'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
                    '&:hover': {
                      color:
                        theme.palette.mode === 'dark' ? '#F9D43B' : '#1565C0',
                      backgroundColor: 'action.hover',
                      borderColor: 'text.secondary',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'text.secondary',
                      outlineOffset: 2,
                    },
                  })}
                  disabled={!formQuestionsAnswers || isExportingChartsPdf}
                  startIcon={
                    isExportingChartsPdf ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : undefined
                  }
                  onClick={async () => {
                    if (!formQuestionsAnswers) {
                      enqueueSnackbar(
                        'Dados do formulário ainda não carregados.',
                        {
                          variant: 'warning',
                        },
                      );
                      return;
                    }
                    setIsExportingChartsPdf(true);
                    try {
                      await exportFormChartsPdfInBrowser({
                        formApplication: reportApplication,
                        partialResults: isPartialPsychosocialForm,
                        formQuestionsAnswers,
                        selectedGroupingQuestionId: selectedGroupingQuestion,
                        chartType: chartsChartType,
                        hierarchyGroups,
                        participantGroupingOverride,
                        ...(selectedGroupingQuestion &&
                        selectedParticipantGroupIdsForView
                          ? {
                              visibleParticipantGroupIds:
                                selectedParticipantGroupIdsForView,
                            }
                          : {}),
                      });
                    } catch (e) {
                      enqueueSnackbar(
                        e instanceof Error
                          ? e.message
                          : 'Não foi possível gerar o PDF dos gráficos.',
                        { variant: 'error' },
                      );
                    } finally {
                      setIsExportingChartsPdf(false);
                    }
                  }}
                >
                  Exportar PDF (Gráficos)
                </Button>
              </Box>
            )}
          </Box>

          <SPaper
            className={
              isGraphsTab || isIndicatorTab || isTextAnswersTab || isRisksAnalysisTab
                ? undefined
                : 'polished-form-panel'
            }
            sx={
              isParticipantsTab ||
              isTextAnswersTab ||
              isGraphsTab ||
              isIndicatorTab ||
              isHierarchyGroupsTab ||
              isRisksAnalysisTab
                ? {
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    WebkitBoxShadow: 'none',
                    outline: 'none',
                    p: 0,
                    mt:
                      isIndicatorTab || isGraphsTab || isTextAnswersTab
                        ? 4
                        : 10,
                  }
                : {}
            }
          >
            {isTextAnswersTab ? (
              <FormTextAnswers formGroups={generalGroups} />
            ) : isRisksAnalysisTab && formQuestionsAnswers ? (
              <FormRisksAnalysis
                formApplication={formApplication}
                accessCompanyId={accessCompanyId}
                formQuestionsAnswers={formQuestionsAnswers}
                visibleParticipantGroups={visibleParticipantGroups}
                selectedGroupingQuestionId={selectedGroupingQuestion}
                selectedGroupingLabel={selectedGroupingLabel}
              />
            ) : isHierarchyGroupsTab ? (
              <FormHierarchyGroupManager
                formApplication={formApplication}
                accessCompanyId={accessCompanyId}
                inline={true}
              />
            ) : isParticipantsTab ? (
              <FormParticipantsTable
                companyId={accessCompanyId}
                applicationId={formApplication.id}
                formApplication={formApplication}
              />
            ) : (
              <SFlex direction="column" gap={24} color="background.paper">
                {isIndicatorTab && !isPsychosocialForm && (
                  <SAccordion
                    defaultExpanded
                    color="text.primary"
                    title="Visão geral por seção"
                  >
                    <SAccordionBody>
                      <Box sx={{ '& h5': { display: 'none' } }}>
                        <SectionIndicatorsRadar
                          groups={generalQuestionsArrays}
                          isShareableLink={isShareableLink}
                        />
                      </Box>
                    </SAccordionBody>
                  </SAccordion>
                )}
                {isIndicatorTab && <IndicatorsQualityLegend />}
                {isIndicatorTab && indicatorsDatasetForView ? (
                  <SAccordion
                    defaultExpanded
                    accordionProps={indicatorSectionAccordionProps}
                    expandIcon={<ArrowRightIcon fontSize="small" />}
                    color="text.primary"
                    title="Distribuição geral dos indicadores"
                  >
                    <SAccordionBody>
                      <ExecutiveIndicatorsDistributionSection
                        distribution={
                          indicatorsDatasetForView.executiveDistribution
                        }
                        level={indicatorHierarchy ? executiveLevel : undefined}
                        onLevelChange={setExecutiveLevel}
                        chartType={executiveDistributionChartType}
                        onChartTypeChange={setExecutiveDistributionChartType}
                      />
                    </SAccordionBody>
                  </SAccordion>
                ) : null}
                {isIndicatorTab && canShowNarrative && (
                  <IndicatorsNarrativeDiagnosticSection
                    companyId={accessCompanyId}
                    formApplicationId={formApplication.id}
                    scope={indicatorsNarrativeScope}
                    isMaster={isMaster}
                  />
                )}
                <IndicatorDetailsSection enabled={isIndicatorTab}>
                  {isIndicatorTab && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        columnGap: 8,
                        rowGap: 4,
                        '&& .MuiToggleButton-root': {
                          height: 36,
                          px: 3,
                          py: 0,
                          fontSize: '14px',
                          lineHeight: 1.5,
                          textTransform: 'none',
                          gap: 0.75,
                          whiteSpace: 'nowrap',
                          '& .MuiSvgIcon-root': { fontSize: 20 },
                        },
                      }}
                    >
                      <ToggleButton
                        size="small"
                        value="bars"
                        selected={activeIndicatorView === 'bars'}
                        onClick={() => setIndicatorView('bars')}
                        sx={{ textTransform: 'none', gap: 0.75, flexShrink: 0 }}
                      >
                        <BarChartIcon
                          fontSize="small"
                          sx={{ transform: 'rotate(90deg)' }}
                        />
                        Barras horizontais
                      </ToggleButton>
                      {activeIndicatorView === 'bars' && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            columnGap: 6,
                            rowGap: 4,
                            '& .MuiFormControlLabel-root': { m: 0 },
                          }}
                        >
                          {dimensionView && (
                            <>
                              <SSwitch
                                label="Mostrar escalas"
                                color="text.primary"
                                value={indicatorLevels.scales}
                                disabled={
                                  requireIndicatorLevel &&
                                  !indicatorLevels.dimensions
                                }
                                onChange={(_, checked) =>
                                  setIndicatorLevels((levels) => ({
                                    ...levels,
                                    scales: checked,
                                  }))
                                }
                              />
                              <SSwitch
                                label="Mostrar dimensões"
                                color="text.primary"
                                value={indicatorLevels.dimensions}
                                disabled={
                                  requireIndicatorLevel &&
                                  !indicatorLevels.scales
                                }
                                onChange={(_, checked) =>
                                  setIndicatorLevels((levels) => ({
                                    ...levels,
                                    dimensions: checked,
                                  }))
                                }
                              />
                            </>
                          )}
                          <SSwitch
                            label="Mostrar perguntas"
                            color="text.primary"
                            value={showQuestionIndicators}
                            disabled={
                              Boolean(dimensionView) &&
                              !indicatorLevels.scales &&
                              !indicatorLevels.dimensions
                            }
                            onChange={(_, checked) =>
                              setShowQuestionIndicators(checked)
                            }
                            formControlProps={{
                              sx: {
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                              },
                            }}
                          />
                        </Box>
                      )}
                      {(canShowScaleRadar || canShowDimensionRadar) && (
                        <ToggleButtonGroup
                          exclusive
                          size="small"
                          value={activeIndicatorView}
                          aria-label="Visualização em radar"
                          onChange={(_, value: IndicatorView | null) => {
                            if (value) setIndicatorView(value);
                          }}
                          sx={{
                            ml: 'auto',
                            flexWrap: 'wrap',
                            '& .MuiToggleButton-root': {
                              textTransform: 'none',
                              gap: 0.75,
                            },
                          }}
                        >
                          {canShowScaleRadar && (
                            <ToggleButton value="radar-scales">
                              <RadarIcon fontSize="small" />
                              Radar por escalas
                            </ToggleButton>
                          )}
                          {canShowDimensionRadar && (
                            <ToggleButton value="radar-dimensions">
                              <RadarIcon fontSize="small" />
                              Radar por dimensões
                            </ToggleButton>
                          )}
                        </ToggleButtonGroup>
                      )}
                    </Box>
                  )}
                  {(() => {
                    if (activeIndicatorView !== 'bars') {
                      return (
                        <ScaleIndicatorsRadar
                          byDimension={
                            activeIndicatorView === 'radar-dimensions'
                          }
                          groups={radarGroups}
                          onConsolidationChange={
                            isPartialPsychosocialForm &&
                            selectedGroupingQuestion
                              ? setConsolidateRadar
                              : undefined
                          }
                          consolidated={consolidateRadar}
                        />
                      );
                    }

                    // Get all unique questions across all participant groups
                    const allQuestions = new Map<
                      string,
                      QuestionWithParticipantGroups
                    >();

                    generalQuestionsArrays.forEach((participantGroup) => {
                      participantGroup.questions.forEach((question) => {
                        const key = `${question.groupId}-${question.id}`;
                        const questionData = allQuestions.get(key) ?? {
                          id: question.id,
                          groupId: question.groupId,
                          groupName: question.groupName,
                          details: question.details,
                          options: question.options,
                          participantGroupData: [],
                        };
                        questionData.participantGroupData.push({
                          groupId: participantGroup.groupId,
                          groupName: participantGroup.groupName,
                          participantCount: participantGroup.participantCount,
                          question,
                        });
                        allQuestions.set(key, questionData);
                      });
                    });

                    // Group questions by their original form groups
                    const questionsByFormGroup = Array.from(
                      allQuestions.values(),
                    ).reduce(
                      (acc, questionData) => {
                        const groupKey = questionData.groupId;
                        if (!acc[groupKey]) {
                          acc[groupKey] = {
                            groupName: questionData.groupName,
                            questions: [],
                          };
                        }
                        acc[groupKey].questions.push(questionData);
                        return acc;
                      },
                      {} as Record<string, FormGroupWithQuestions>,
                    );

                    const renderIndicator = (
                      groupData: FormGroupWithQuestions,
                    ) =>
                      isIndicatorTab && (
                        <GroupDashboardIndicator
                          groupData={groupData}
                          selectedGroupingQuestion={selectedGroupingQuestion}
                          isShareableLink={isShareableLink}
                        />
                      );

                    const renderQuestions = (
                      groupData: FormGroupWithQuestions,
                    ) => (
                      <>
                        {/* Render each question with all its participant group variations side by side */}
                        {(isGraphsTab || !showOnlyGroupIndicators) &&
                          groupData.questions.map(
                            (questionData: QuestionWithParticipantGroups) => (
                              <SAccordion
                                key={questionData.id}
                                accordionProps={graphHierarchyAccordionProps}
                                expandIcon={<ArrowRightIcon fontSize="small" />}
                                defaultExpanded
                                color="text.primary"
                                title={
                                  <HtmlContentRenderer
                                    useThemeTextColor
                                    content={questionData.details.text}
                                  />
                                }
                              >
                                <SAccordionBody>
                                  {/* Show all participant groups for this question side by side */}
                                  <SFlex
                                    gap={4}
                                    display="grid"
                                    gridTemplateColumns="repeat(auto-fit, minmax(min(100%, 400px), 1fr))"
                                  >
                                    {questionData.participantGroupData.map(
                                      (
                                        participantData: ParticipantGroupData,
                                      ) => (
                                        <Box
                                          key={participantData.groupId}
                                          p={4}
                                          sx={
                                            isGraphsTab &&
                                            questionData.participantGroupData
                                              .length > 1
                                              ? {
                                                  minWidth: 0,
                                                  border: '1px solid',
                                                  borderColor: (theme) =>
                                                    theme.palette.mode ===
                                                    'dark'
                                                      ? '#465267'
                                                      : '#CBD5E1',
                                                  borderRadius: 3,
                                                }
                                              : { minWidth: 0 }
                                          }
                                        >
                                          <FormQuestionPieChart
                                            hideQuestionText
                                            groupName={
                                              participantData.groupName
                                            }
                                            question={participantData.question}
                                            colorScheme="general"
                                            chartType={
                                              isGraphsTab
                                                ? chartsChartType
                                                : DEFAULT_FORM_CHART_TYPE
                                            }
                                            indicators={isIndicatorTab}
                                            isShareableLink={isShareableLink}
                                            participantCount={
                                              participantData.participantCount
                                            }
                                          />
                                        </Box>
                                      ),
                                    )}
                                  </SFlex>
                                </SAccordionBody>
                              </SAccordion>
                            ),
                          )}
                      </>
                    );

                    const renderGroup = (
                      id: string,
                      groupData: FormGroupWithQuestions,
                    ) => (
                      <SAccordion
                        key={id}
                        accordionProps={graphHierarchyAccordionProps}
                        expandIcon={<ArrowRightIcon fontSize="small" />}
                        defaultExpanded
                        color="text.primary"
                        title={groupData.groupName}
                      >
                        <SAccordionBody>
                          {renderIndicator(groupData)}
                          {renderQuestions(groupData)}
                        </SAccordionBody>
                      </SAccordion>
                    );

                    const groups = Object.entries(questionsByFormGroup);
                    if (!questionDisplayHierarchy)
                      return groups.map(([id, group]) =>
                        renderGroup(id, group),
                      );

                    const dimensions = questionDisplayHierarchy.results.filter(
                      (group) => !group.identifier,
                    );
                    const getScaleDimensions = (
                      scaleId: string,
                      scale: FormGroupWithQuestions,
                    ) =>
                      dimensions
                        .filter(
                          (group) =>
                            questionDisplayHierarchy.parentGroupIds[
                              group.id
                            ] === scaleId,
                        )
                        .map((group) => {
                          const ids = new Set(
                            group.questions.map((question) => question.id),
                          );
                          return {
                            id: group.id,
                            groupName: group.name,
                            questions: scale.questions.filter((question) =>
                              ids.has(question.id),
                            ),
                          };
                        });

                    if (isGraphsTab) {
                      return groups.map(([id, scale]) => (
                        <SAccordion
                          key={`graphs-scale-${id}`}
                          accordionProps={graphHierarchyAccordionProps}
                          expandIcon={<ArrowRightIcon fontSize="small" />}
                          defaultExpanded
                          color="text.primary"
                          title={scale.groupName}
                        >
                          <SAccordionBody>
                            <Box sx={{ pl: { xs: 4, sm: 12 }, minWidth: 0 }}>
                              {getScaleDimensions(id, scale).map(
                                (dimension) => (
                                  <SAccordion
                                    key={`graphs-dimension-${dimension.id}`}
                                    accordionProps={
                                      graphHierarchyAccordionProps
                                    }
                                    expandIcon={
                                      <ArrowRightIcon fontSize="small" />
                                    }
                                    defaultExpanded
                                    color="text.primary"
                                    title={dimension.groupName}
                                  >
                                    <SAccordionBody>
                                      <Box
                                        sx={{
                                          pl: { xs: 4, sm: 12 },
                                          minWidth: 0,
                                        }}
                                      >
                                        {renderQuestions(dimension)}
                                      </Box>
                                    </SAccordionBody>
                                  </SAccordion>
                                ),
                              )}
                            </Box>
                          </SAccordionBody>
                        </SAccordion>
                      ));
                    }

                    const renderCompactGroup = (
                      id: string,
                      group: FormGroupWithQuestions,
                      children: ReactNode,
                      alignDimension = false,
                    ) => (
                      <Box
                        component={children ? 'details' : 'div'}
                        key={id}
                        {...(children ? { open: !alignDimension } : {})}
                        sx={{
                          mb: 6,
                          border: 0,
                          backgroundColor: 'transparent',
                          minWidth: 0,
                        }}
                      >
                        <Box
                          component={children ? 'summary' : 'div'}
                          sx={{
                            cursor: children ? 'pointer' : 'default',
                            p: 8,
                            fontWeight: 700,
                            color: 'text.primary',
                            backgroundColor: 'transparent',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            ...(alignDimension && {
                              '--indicator-group-width': '18ch',
                              '--indicator-percent-width': '5ch',
                              '--indicator-score-width': '28ch',
                            }),
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              width: children ? 'calc(100% - 1.1em)' : '100%',
                              verticalAlign: 'middle',
                              alignItems: 'center',
                              gap: 5,
                              minWidth: 0,
                            }}
                          >
                            <Box
                              component="span"
                              title={group.groupName}
                              sx={{
                                flex: alignDimension ? '0 0 auto' : '0 1 auto',
                                width: alignDimension
                                  ? 'clamp(6ch, 32%, 46ch)'
                                  : undefined,
                                minWidth: '6ch',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {group.groupName}
                            </Box>
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-flex',
                                flex: '1 1 0',
                                minWidth: 0,
                                alignItems: 'center',
                                overflowX: 'auto',
                                gap: 6,
                              }}
                            >
                              <GroupDashboardIndicator
                                groupData={group}
                                selectedGroupingQuestion={
                                  selectedGroupingQuestion
                                }
                                isShareableLink={isShareableLink}
                                compact
                              />
                            </Box>
                          </Box>
                        </Box>
                        {children}
                      </Box>
                    );

                    return groups.map(([id, scale]) => {
                      const children = indicatorLevels.dimensions
                        ? getScaleDimensions(id, scale).map((dimension) => {
                            return renderCompactGroup(
                              dimension.id,
                              dimension,
                              showOnlyGroupIndicators ? null : (
                                <Box sx={{ p: 4 }}>
                                  {renderQuestions(dimension)}
                                </Box>
                              ),
                              true,
                            );
                          })
                        : showOnlyGroupIndicators
                          ? null
                          : renderQuestions(scale);

                      if (!indicatorLevels.scales)
                        return <Box key={id}>{children}</Box>;

                      return renderCompactGroup(
                        id,
                        scale,
                        children && (
                          <Box
                            sx={{
                              p: 4,
                              pl: indicatorLevels.dimensions
                                ? { xs: 4, sm: 12 }
                                : 4,
                            }}
                          >
                            {children}
                          </Box>
                        ),
                      );
                    });
                  })()}
                </IndicatorDetailsSection>
              </SFlex>
            )}
          </SPaper>
        </Box>
      )}

      <SPdfLoadingModal
        open={
          isExportingIndicatorsPdf ||
          isExportingRisksAnalysisPdf ||
          isExportingFrpsTechnicalReportPdf
        }
        message={pdfLoadingMessage}
      />
    </SFlex>
  );
};
