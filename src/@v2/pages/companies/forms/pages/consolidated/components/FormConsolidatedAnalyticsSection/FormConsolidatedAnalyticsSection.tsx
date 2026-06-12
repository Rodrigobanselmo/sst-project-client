import { useMemo, useState } from 'react';

import { useAccess } from 'core/hooks/useAccess';

import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import {
  buildConsolidatedAnalyticsParticipantGroups,
  buildConsolidatedAnalyticsRecorteSnapshot,
  buildConsolidatedChartQuestions,
  ConsolidatedAnalyticsFilters,
  ConsolidatedAnalyticsGroupingMode,
  getConsolidatedDemographicQuestions,
  getConsolidatedMeasurableGroups,
  getConsolidatedStructuralGroupingOptions,
  shouldProtectConsolidatedAnalyticsGroup,
} from '@v2/models/enterprise/company-group/consolidated-view-analytics.helpers';
import { CONSOLIDATED_PARTICIPANTS_PRIVACY_MIN_SIZE } from '@v2/models/enterprise/company-group/consolidated-view-participants.helpers';
import { FormParticipantsFilterSummary } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormParticipantsTable/components/FormParticipantsFilterSummary';
import { FormQuestionPieChart } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormQuestionPieChart/FormQuestionPieChart';
import { IndicatorsQualityLegend } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/IndicatorsQualityLegend/IndicatorsQualityLegend';
import { SectionHeader } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/SectionHeader/SectionHeader';
import { HtmlContentRenderer } from '@v2/pages/companies/forms/pages/application/pages/public/answer/components/HtmlContentRenderer/FormAnswerFieldControlled';
import { useFetchConsolidatedViewQuestionsAnswers } from '@v2/services/enterprise/company-group/consolidated-view/hooks/useFetchConsolidatedViewQuestionsAnswers';
import { normalizeConsolidatedIndicatorsNarrativeScope } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-narrative.scope';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';

import { FormConsolidatedNarrativeSection } from '../FormConsolidatedNarrativeSection/FormConsolidatedNarrativeSection';

type Props = {
  companyGroupId: number;
  applicationIds: string[];
  mode: 'charts' | 'indicators';
};

type GroupingSelectOption = {
  id: ConsolidatedAnalyticsGroupingMode;
  label: string;
};

export function FormConsolidatedAnalyticsSection({
  companyGroupId,
  applicationIds,
  mode,
}: Props) {
  const { isMaster } = useAccess();
  const [groupingMode, setGroupingMode] =
    useState<ConsolidatedAnalyticsGroupingMode>('overview');
  const { questionsAnswersData, isLoading, isError } =
    useFetchConsolidatedViewQuestionsAnswers(
      { companyGroupId, applicationIds },
      { enabled: companyGroupId > 0 && applicationIds.length >= 2 },
    );

  const filters = useMemo<ConsolidatedAnalyticsFilters>(
    () => ({ groupingMode }),
    [groupingMode],
  );

  const formQuestionsAnswers = questionsAnswersData?.formQuestionsAnswers;

  const demographicQuestions = useMemo(
    () =>
      formQuestionsAnswers
        ? getConsolidatedDemographicQuestions(formQuestionsAnswers)
        : [],
    [formQuestionsAnswers],
  );

  const groupingOptions = useMemo<GroupingSelectOption[]>(() => {
    const structural = getConsolidatedStructuralGroupingOptions().map(
      (option) => ({
        id: option.id as ConsolidatedAnalyticsGroupingMode,
        label: option.label,
      }),
    );
    const demographic = demographicQuestions.map((question) => ({
      id: `question:${question.id}` as ConsolidatedAnalyticsGroupingMode,
      label: question.textWithoutHtml,
    }));

    return [...structural, ...demographic];
  }, [demographicQuestions]);

  const participantGroups = useMemo(() => {
    if (!formQuestionsAnswers) return [];

    return buildConsolidatedAnalyticsParticipantGroups({
      formQuestionsAnswers,
      groupingMode,
    });
  }, [formQuestionsAnswers, groupingMode]);

  const protectedGroupIds = useMemo(
    () =>
      participantGroups
        .filter((group) =>
          shouldProtectConsolidatedAnalyticsGroup(group.participantIds.size),
        )
        .map((group) => group.id),
    [participantGroups],
  );

  const identifierQuestions = useMemo(() => {
    if (!formQuestionsAnswers || mode !== 'charts') return [];
    const [identifierGroup] = formQuestionsAnswers.results;
    if (!identifierGroup) return [];
    return buildConsolidatedChartQuestions([identifierGroup]);
  }, [formQuestionsAnswers, mode]);

  const generalGroups = useMemo(
    () =>
      formQuestionsAnswers
        ? getConsolidatedMeasurableGroups(formQuestionsAnswers)
        : [],
    [formQuestionsAnswers],
  );

  const generalQuestionsByGroup = useMemo(() => {
    return participantGroups.map((group) => ({
      groupId: group.id,
      groupName: group.name,
      participantCount: group.participantIds.size,
      isProtected: shouldProtectConsolidatedAnalyticsGroup(
        group.participantIds.size,
      ),
      questions: buildConsolidatedChartQuestions(
        generalGroups,
        group.participantIds,
      ),
    }));
  }, [generalGroups, participantGroups]);

  const filterSummary = useMemo(
    () => ({
      totalParticipants: questionsAnswersData?.totals.totalParticipants ?? 0,
      respondedCount: questionsAnswersData?.totals.totalResponded ?? 0,
      notRespondedCount: questionsAnswersData?.totals.totalNotResponded ?? 0,
      responseRatePercent: questionsAnswersData?.totals.completionPercent ?? 0,
    }),
    [questionsAnswersData?.totals],
  );

  const selectedGroupingLabel =
    groupingOptions.find((option) => option.id === groupingMode)?.label ??
    'Visão geral';

  const indicatorsNarrativeScope = useMemo(
    () =>
      normalizeConsolidatedIndicatorsNarrativeScope({
        groupingMode,
        groupingLabel: selectedGroupingLabel,
        showOnlyGroupIndicators: false,
      }),
    [groupingMode, selectedGroupingLabel],
  );

  const recorteSnapshot = useMemo(
    () =>
      questionsAnswersData
        ? buildConsolidatedAnalyticsRecorteSnapshot({
            mode,
            filters,
            participantGroups,
            protectedGroupIds,
            totals: questionsAnswersData.totals,
          })
        : null,
    [filters, mode, participantGroups, protectedGroupIds, questionsAnswersData],
  );

  if (isLoading) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError || !questionsAnswersData || !formQuestionsAnswers) {
    return (
      <Alert severity="error">
        Não foi possível carregar os dados analíticos consolidados.
      </Alert>
    );
  }

  const hasGeneralData = generalQuestionsByGroup.some(
    (group) => group.questions.length > 0,
  );

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FormParticipantsFilterSummary summary={filterSummary} />

      <Alert severity="info" variant="outlined">
        Visão analítica read-only. Grupos com menos de{' '}
        {CONSOLIDATED_PARTICIPANTS_PRIVACY_MIN_SIZE} participantes exibem
        &quot;Dados Protegidos&quot; para preservar o sigilo.
      </Alert>

      <SPaper shadow={false} sx={{ p: 2 }}>
        <SectionHeader
          icon={<FilterListIcon sx={{ fontSize: 30 }} />}
          title="Agrupamento da visualização"
        />
        <FormControl fullWidth size="small" sx={{ maxWidth: 480, mt: 2 }}>
          <InputLabel id="consolidated-analytics-grouping">
            Agrupar visualização
          </InputLabel>
          <Select
            labelId="consolidated-analytics-grouping"
            label="Agrupar visualização"
            value={groupingMode}
            onChange={(event) =>
              setGroupingMode(event.target.value as ConsolidatedAnalyticsGroupingMode)
            }
          >
            {groupingOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

      </SPaper>

      {mode === 'indicators' && <IndicatorsQualityLegend />}

      {mode === 'indicators' && (
        <FormConsolidatedNarrativeSection
          companyGroupId={companyGroupId}
          applicationIds={applicationIds}
          scope={indicatorsNarrativeScope}
          isMaster={isMaster}
        />
      )}

      {mode === 'charts' && identifierQuestions.length > 0 && (
        <Box>
          <SectionHeader
            icon={<PersonIcon sx={{ fontSize: 30 }} />}
            title="Informações de Identificação"
          />
          <SPaper sx={{ p: 3 }}>
            <SFlex
              gap={4}
              display="grid"
              gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))"
            >
              {identifierQuestions.map((question) => (
                <Box key={question.id} p={4}>
                  <FormQuestionPieChart
                    question={question}
                    colorScheme="identifier"
                    isShareableLink={false}
                  />
                </Box>
              ))}
            </SFlex>
          </SPaper>
        </Box>
      )}

      {hasGeneralData ? (
        generalQuestionsByGroup.map((participantGroup) => {
          if (participantGroup.isProtected) {
            return (
              <SPaper key={participantGroup.groupId} sx={{ p: 3, mb: 2 }}>
                <SText fontWeight={600} mb={1}>
                  {participantGroup.groupName}
                </SText>
                <Typography color="text.secondary">
                  🔒 Dados Protegidos — menos de{' '}
                  {CONSOLIDATED_PARTICIPANTS_PRIVACY_MIN_SIZE} participantes no
                  agrupamento.
                </Typography>
              </SPaper>
            );
          }

          const questionsByFormGroup = participantGroup.questions.reduce(
            (acc, question) => {
              if (!acc[question.groupId]) {
                acc[question.groupId] = {
                  groupName: question.groupName,
                  questions: [],
                };
              }
              acc[question.groupId].questions.push(question);
              return acc;
            },
            {} as Record<
              string,
              {
                groupName: string;
                questions: typeof participantGroup.questions;
              }
            >,
          );

          return (
            <Box key={participantGroup.groupId} mb={3}>
              <SText fontSize={16} fontWeight={700} mb={2}>
                {participantGroup.groupName} ({participantGroup.participantCount}{' '}
                participantes)
              </SText>

              {Object.entries(questionsByFormGroup).map(
                ([groupId, groupData]) => (
                  <Box key={`${participantGroup.groupId}:${groupId}`} mb={4}>
                    <SPaper>
                      <SText
                        sx={{
                          p: 3,
                          color: '#424242',
                          borderRadius: 1,
                          fontWeight: 600,
                          backgroundColor: 'grey.100',
                          fontSize: 18,
                          mb: 2,
                        }}
                      >
                        {groupData.groupName}
                      </SText>
                    </SPaper>

                    {groupData.questions.map((question) => (
                        <SPaper key={question.id} mb={3} px={4} py={4}>
                          <HtmlContentRenderer content={question.details.text} />
                          <SDivider sx={{ mt: 3, mb: 3 }} />
                          <Box p={2}>
                            <FormQuestionPieChart
                              hideQuestionText
                              question={question}
                              colorScheme="general"
                              indicators={mode === 'indicators'}
                              isShareableLink={false}
                              participantCount={participantGroup.participantCount}
                            />
                          </Box>
                        </SPaper>
                    ))}
                  </Box>
                ),
              )}
            </Box>
          );
        })
      ) : (
        <Alert severity="warning">
          Nenhuma pergunta mensurável com opções encontrada para o agrupamento
          selecionado.
        </Alert>
      )}

      <Box
        aria-hidden
        sx={{ display: 'none' }}
        data-consolidated-analytics-recorte={
          recorteSnapshot ? JSON.stringify(recorteSnapshot) : undefined
        }
      />

      <Typography variant="caption" color="text.secondary">
        Sem e-mail, reforço, banner, edição, análise operacional de riscos ou
        envio para inventário/PGR.
      </Typography>
    </Box>
  );
}
