import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { FormModelButtons } from '@v2/pages/companies/forms/components/FormModelQuestions/FormModelButtons/FormModelButtons';
import { SFormSection } from '@v2/pages/companies/forms/components/FormModelQuestions/FormModelGroup/components/SFormSection/SFormSection';
import { useMutateAddFormApplication } from '@v2/services/forms/form-application/add-form-application/hooks/useMutateAddFormApplication';
import { useForm } from 'react-hook-form';
import {
  addFormApplicationFormInitialValues,
  IAddFormApplicationFormFields,
  schemaAddFormApplicationForm,
} from '../../../../../components/FormApplicationForms/implementations/AddFormApplicationForms/AddFormApplicationForms.schema';
import { FormAddFormApplication } from '../../../../../components/FormApplicationForms/implementations/AddFormApplicationForms/components/FormAddFormApplication';
import { FormIdentifierTypeList } from '@v2/pages/companies/forms/components/FormApplicationForms/constants/form-Identifier-type.map';
import { getFormModelInitialValues } from '../../../../model/schemas/form-model.schema';

export const FormApplicationAddContent = ({
  companyId,
}: {
  companyId: string;
}) => {
  const router = useAppRouter();
  const form = useForm<IAddFormApplicationFormFields>({
    resolver: yupResolver(schemaAddFormApplicationForm),
    defaultValues: addFormApplicationFormInitialValues,
  });

  const addFormMutation = useMutateAddFormApplication();

  const onSubmit = async (data: IAddFormApplicationFormFields) => {
    form.clearErrors();

    await addFormMutation.mutateAsync({
      companyId,
      name: data.name,
      description: data.description,
      formId: data.form.id,
      hierarchyIds: [],
      workspaceIds: data.workspaceIds.map((workspace) => workspace.id),
      // identifierGroup: data.identifierGroup,
    });

    router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
      pathParams: { companyId, formTab: FORM_TAB_ENUM.APPLIED },
    });
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  const onCancel = () => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
      pathParams: { companyId, formTab: FORM_TAB_ENUM.APPLIED },
    });
  };

  return (
    <SForm form={form}>
      <FormAddFormApplication companyId={companyId} mb={8} />

      <SFormSection
        questionTypeOptions={FormIdentifierTypeList}
        sectionIndex={0}
        sectionNumber={1}
        isMinimized={false}
        hideInputTitle={true}
        title={() => 'Dados Gerais'}
        descriptionPlaceholder="Instruções do questionário (opcional)"
        initialValues={getFormModelInitialValues()}
      />

      <FormModelButtons
        onSubmit={handleSubmit}
        onCancel={onCancel}
        errors={form.formState.errors}
        loading={addFormMutation.isPending}
      />
    </SForm>
  );
};
