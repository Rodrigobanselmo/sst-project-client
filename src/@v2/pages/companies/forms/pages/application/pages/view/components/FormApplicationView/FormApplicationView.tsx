import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useFetchReadFormApplication } from '@v2/services/forms/form-application/read-form-application/hooks/useFetchReadFormApplication';
import { useFormApplicationViewActions } from '../../hooks/useFormApplicationViewActions';
import { FormApplicationInfo } from './components/FormApplicationInfo';

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
      <FormApplicationInfo
        mb={[20]}
        formApplication={formApplication}
        onEdit={handleEdit}
      />
      {!isLoading && formApplication && (
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
