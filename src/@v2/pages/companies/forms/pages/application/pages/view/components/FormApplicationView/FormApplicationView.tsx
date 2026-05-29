import { useMemo } from 'react';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useFetchReadFormApplication } from '@v2/services/forms/form-application/read-form-application/hooks/useFetchReadFormApplication';
import { useFormApplicationViewActions } from '../../hooks/useFormApplicationViewActions';
import { FormApplicationInfo } from './components/FormApplicationInfo';
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
    <>
      <FormApplicationInfo
        mb={[20]}
        formApplication={formApplication}
        onEdit={handleEdit}
        companyId={companyId}
        modelQuestionCount={modelQuestionCount}
      />
      {!isLoading && formApplication && (
        <SFlex direction="column" gap={20}>
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
          <FormQuestionsDashboard
            formQuestionsAnswers={formQuestionsAnswers}
            formApplication={formApplication}
            accessCompanyId={companyId}
          />
        </SFlex>
      )}
    </>
  );
};
