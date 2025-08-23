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
      />
      {!isLoading && formApplication && (
        <SFlex direction="column" gap={20}>
          <FormStatisticsCard
            totalAnswers={formApplication.totalAnswers}
            totalParticipants={formApplication.totalParticipants}
            averageTimeSpent={formApplication.averageTimeSpent}
          />
          <FormQuestionsDashboard
            formQuestionsAnswers={formQuestionsAnswers}
            formApplication={formApplication}
          />
        </SFlex>
      )}
    </>
  );
};
