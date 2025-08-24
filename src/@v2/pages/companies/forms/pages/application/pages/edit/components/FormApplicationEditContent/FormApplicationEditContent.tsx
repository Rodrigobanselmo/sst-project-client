import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';
import { FormQuestionsButtons } from '@v2/pages/companies/forms/components/FormQuestionsButtons/FormQuestionsButtons';
import { SFormQuestionSection } from '@v2/pages/companies/forms/components/SFormSection/SFormSection';
import { useMutateEditFormApplication } from '@v2/services/forms/form-application/edit-form-application/hooks/useMutateEditFormApplication';
import { useForm } from 'react-hook-form';
import { getFormModelInitialValues } from '../../../../../model/schemas/form-model.schema';
import { transformFormApplicationDataToApiFormat } from '../../../../helpers/transform-form-application-data';
import {
  formApplicationFormInitialValues,
  IFormApplicationFormFields,
  schemaFormApplicationForm,
} from '../../../../schema/form-application.schema';
import {
  FormIdentifierTypeList,
  getDisbleCreateFormIdentifierQuestion,
  getFormIdentifierTypeList,
} from '../../../../components/FormApplicationForms/constants/form-Identifier-type.map';
import { FormFormApplication } from '../../../../components/FormApplicationForms/components/FormFormApplication';

export const FormApplicationEditContent = ({
  companyId,
  formApplication,
}: {
  companyId: string;
  formApplication: FormApplicationReadModel;
}) => {
  const router = useAppRouter();

  const form = useForm<IFormApplicationFormFields>({
    resolver: yupResolver(schemaFormApplicationForm),
    defaultValues: {
      ...formApplicationFormInitialValues,
      name: formApplication.name,
      description: formApplication.description || '',
      form: {
        id: formApplication.form.id,
        name: formApplication.form.name,
        type: formApplication.form.type,
      },
      workspaceIds: formApplication.participants.workspaces.map(
        (workspace) => ({
          id: workspace.id,
          name: workspace.name,
        }),
      ),
      // Transform questionIdentifierGroup data to sections format
      sections: formApplication.questionIdentifierGroup
        ? [
            {
              id: formApplication.questionIdentifierGroup.id,
              title: formApplication.questionIdentifierGroup.name,
              description:
                formApplication.questionIdentifierGroup.description || '',
              items: formApplication.questionIdentifierGroup.questions.map(
                (question) => ({
                  id: question.id,
                  content: question.details.text || '',
                  required: question.required,
                  type: {
                    value: question.details.identifierType,
                    label:
                      FormIdentifierTypeTranslate[
                        question.details.identifierType
                      ],
                  },
                  options: question.options.map((option) => ({
                    value: option.value?.toString() || '',
                    label: option.text,
                  })),
                }),
              ),
            },
          ]
        : [],
    },
  });

  const editFormMutation = useMutateEditFormApplication();

  const onSubmit = async (data: IFormApplicationFormFields) => {
    form.clearErrors();

    if (data.sections.length === 0) {
      form.setError('sections', {
        message: 'Não há seções para aplicar o questionário',
      });
      return;
    }

    const identifier = transformFormApplicationDataToApiFormat(data);

    await editFormMutation.mutateAsync({
      companyId,
      applicationId: formApplication.id,
      name: data.name,
      description: data.description,
      formId: data.form.id,
      hierarchyIds: [],
      workspaceIds: data.workspaceIds.map((workspace) => workspace.id),
      identifier,
    });

    router.push(PageRoutes.FORMS.FORMS_APPLICATION.VIEW, {
      pathParams: { companyId, id: formApplication.id },
    });
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  const onCancel = () => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
      pathParams: { companyId, formTab: FORM_TAB_ENUM.APPLIED },
    });
  };

  const disableCreateFormIdentifierQuestion =
    getDisbleCreateFormIdentifierQuestion(formApplication.form.type);

  const questionsTypeOptions = getFormIdentifierTypeList(
    formApplication.form.type,
  );

  return (
    <SForm form={form}>
      <SFormSection mb={8}>
        <FormFormApplication companyId={companyId} disabled={true} />
      </SFormSection>

      <SFormQuestionSection
        questionTypeOptions={questionsTypeOptions}
        sectionIndex={0}
        sectionNumber={1}
        isMinimized={false}
        hideInputTitle={true}
        title={() => 'Dados Gerais'}
        descriptionPlaceholder="Instruções do questionário (opcional)"
        initialValues={getFormModelInitialValues()}
        disableQuestionDuplication={disableCreateFormIdentifierQuestion}
        disableQuestionCreation={disableCreateFormIdentifierQuestion}
        disableRequiredSwitch={disableCreateFormIdentifierQuestion}
      />

      <FormQuestionsButtons
        onSubmit={handleSubmit}
        onCancel={onCancel}
        errors={form.formState.errors}
        loading={editFormMutation.isPending}
      />
    </SForm>
  );
};
