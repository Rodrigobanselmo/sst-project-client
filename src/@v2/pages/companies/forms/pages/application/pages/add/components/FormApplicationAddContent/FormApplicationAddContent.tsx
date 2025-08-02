import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { FormFormApplication } from '@v2/pages/companies/forms/components/FormApplicationForms/components/FormFormApplication';
import { FormIdentifierTypeList } from '@v2/pages/companies/forms/components/FormApplicationForms/constants/form-Identifier-type.map';
import { FormModelButtons } from '@v2/pages/companies/forms/components/FormModelQuestions/FormModelButtons/FormModelButtons';
import { SFormQuestionSection } from '@v2/pages/companies/forms/components/FormModelQuestions/FormModelGroup/components/SFormSection/SFormSection';
import { useMutateAddFormApplication } from '@v2/services/forms/form-application/add-form-application/hooks/useMutateAddFormApplication';
import { useForm } from 'react-hook-form';
import { getFormModelInitialValues } from '../../../../../model/schemas/form-model.schema';
import {
  formApplicationFormInitialValues,
  IFormApplicationFormFields,
  schemaFormApplicationForm,
} from '../../../../schema/form-application.schema';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { transformFormApplicationDataToApiFormat } from '../../../../helpers/transform-form-application-data';

export const FormApplicationAddContent = ({
  companyId,
}: {
  companyId: string;
}) => {
  const router = useAppRouter();
  const form = useForm<IFormApplicationFormFields>({
    resolver: yupResolver(schemaFormApplicationForm),
    defaultValues: formApplicationFormInitialValues,
  });

  const addFormMutation = useMutateAddFormApplication();

  const onSubmit = async (data: IFormApplicationFormFields) => {
    form.clearErrors();

    if (data.sections.length === 0) {
      form.setError('sections', {
        message: 'Não há seções para aplicar o questionário',
      });
      return;
    }

    const identifier = transformFormApplicationDataToApiFormat(data);

    await addFormMutation.mutateAsync({
      companyId,
      name: data.name,
      description: data.description,
      formId: data.form.id,
      hierarchyIds: [],
      workspaceIds: data.workspaceIds.map((workspace) => workspace.id),
      identifier,
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
      <SFormSection mb={8}>
        <FormFormApplication companyId={companyId} />
      </SFormSection>

      <SFormQuestionSection
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
