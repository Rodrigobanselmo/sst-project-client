import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { useFetchReadFormApplication } from '@v2/services/forms/form-application/read-form-application/hooks/useFetchReadFormApplication';
import { useFormApplicationViewActions } from '../../hooks/useFormApplicationViewActions';

export const FormApplicationView = ({
  companyId,
  formApplicationId,
}: {
  companyId: string;
  formApplicationId: string;
}) => {
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
      {isLoading || !formApplication ? (
        <SSkeleton height={200} />
      ) : (
        <SFlex direction="column" gap={20}>
          {/* <FormApplicationCard
            formApplication={formApplication}
            onEdit={handleEdit}
          />
          <FormApplicationFileTable
            onAdd={() => onFormApplicationFileAdd(formApplication)}
            onEdit={onFormApplicationFileEdit}
            files={formApplication.files}
          /> */}
        </SFlex>
      )}
    </>
  );
};
