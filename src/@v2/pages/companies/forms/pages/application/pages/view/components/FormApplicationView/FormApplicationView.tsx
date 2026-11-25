import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useMemo } from 'react';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useFetchReadFormApplication } from '@v2/services/forms/form-application/read-form-application/hooks/useFetchReadFormApplication';
import { useFormApplicationViewActions } from '../../hooks/useFormApplicationViewActions';
import { FormApplicationInfo } from './components/FormApplicationInfo';
import { FormApplicationActionsBar } from './components/FormApplicationActionsBar';
import { useFetchBrowseFormQuestionsAnswers } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers/hooks/useFetchBrowseFormQuestionsAnswers';
import { FormQuestionsDashboard } from './components/FormQuestionsDashboard/FormQuestionsDashboard';
import { FormStatisticsCard } from './components/FormStatisticsCard/FormStatisticsCard';

export const FormApplicationView = ({
  companyId,
  formApplicationId,
}: {
  companyId: string;
  formApplicationId: string;
}) => {
  const { formQuestionsAnswers } = useFetchBrowseFormQuestionsAnswers({
    companyId,
    formApplicationId,
  });

  const { onFormApplicationEdit } = useFormApplicationViewActions();
  const { formApplication, isLoading } = useFetchReadFormApplication({
    companyId,
    applicationId: formApplicationId,
  });

  const modelQuestionCount = useMemo(() => {
    if (!formQuestionsAnswers?.results) return null;
    const count = formQuestionsAnswers.results
      .filter((group) => !group.identifier)
      .reduce((sum, group) => sum + group.questions.length, 0);
    return count > 0 ? count : null;
  }, [formQuestionsAnswers]);

  const handleEdit = () => {
    if (formApplication) onFormApplicationEdit(formApplication);
  };

  return (
    <SFlex
      direction="column"
      sx={{
        '&&&& .MuiAccordion-root': {
          borderRadius: '24px',
          boxShadow: 'none',
          overflow: 'hidden',
        },
        '&&&& .MuiAccordion-root:not(.Mui-expanded), &&&& .MuiAccordionSummary-root:not(.Mui-expanded)': {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
        },
        '&&&& .MuiAccordion-root:not(.Mui-expanded)': { overflow: 'visible' },
        '&&&& .MuiAccordionSummary-root:not(.Mui-expanded)': {
          transition: 'box-shadow 180ms ease, border-color 180ms ease',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        },
        '@media (hover: hover)': {
          '&&&& .MuiAccordionSummary-root:not(.Mui-expanded):hover': {
            backgroundColor: 'transparent',
            borderColor: 'text.secondary',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 3px 10px rgba(0, 0, 0, 0.16)'
              : '0 3px 10px rgba(15, 23, 42, 0.07)',
          },
        },
        '&&&& button': {
          borderRadius: '999px',
          boxShadow: 'none',
          textTransform: 'none',
        },
        '&&&& .polished-form-panel': {
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          WebkitBoxShadow: 'none',
        },
        '&&&& .MuiOutlinedInput-root': {
          borderRadius: '999px',
          boxShadow: 'none',
        },
        '&&&& .MuiOutlinedInput-notchedOutline': {
          borderRadius: '999px',
          borderWidth: '1px',
          borderColor: 'divider',
        },
        '&&&& .MuiSelect-select': {
          backgroundColor: 'transparent',
          borderRadius: 'inherit',
        },
      }}
    >
      <SFlex alignItems="center" flexWrap="wrap" gap={6} mb={8}>
        <SPageHeader mb={0} title="Formulários" />
        {!isLoading && formApplication && (
          <SFlex
            flex={1}
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={4}
          >
            <FormStatisticsCard
              totalAnswers={formApplication.totalAnswers}
              respondedParticipantsCount={
                formApplication.respondedParticipantsCount
              }
              totalParticipants={formApplication.totalParticipants}
              averageTimeSpent={formApplication.averageTimeSpent}
              participationGoal={formApplication.participationGoal}
              isShareableLink={formApplication.isShareableLink}
            />
            <FormApplicationActionsBar
              formApplication={formApplication}
              companyId={companyId}
              modelQuestionCount={modelQuestionCount}
            />
          </SFlex>
        )}
      </SFlex>
      <FormApplicationInfo
        mb={[20]}
        formApplication={formApplication}
        onEdit={handleEdit}
      />
      {!isLoading && formApplication && (
        <SFlex direction="column" gap={20}>
          <FormQuestionsDashboard
            formQuestionsAnswers={formQuestionsAnswers}
            formApplication={formApplication}
            accessCompanyId={companyId}
          />
        </SFlex>
      )}
    </SFlex>
  );
};
