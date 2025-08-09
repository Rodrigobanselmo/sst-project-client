import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { validateFormOptions } from '@v2/pages/companies/forms/utils/validate-form-options';
import { useMutateEditFormModel } from '@v2/services/forms/form/edit-form-model/hooks/useMutateEditFormModel';
import { useForm } from 'react-hook-form';
import {
  IFormModelForms,
  schemaFormModelForms,
} from '../../../../schemas/form-model.schema';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { PageRoutes } from '@v2/constants/pages/routes';
import { FormTypeTranslate } from '@v2/models/form/translations/form-type.translation';
import { FormQuestionTypeEnumTranslate } from '@v2/models/form/translations/form-question-type.translation';
import { v4 } from 'uuid';
import { FormReadModel } from '@v2/models/form/models/form/form-read.model';
import { transformFormDataToApiFormat } from '../../../../helpers/transform-form-model-data';
import { FormModelInfo } from '@v2/pages/companies/forms/pages/model/components/FormModelInfo/FormModelInfo';
import { FormModelGroup } from '@v2/pages/companies/forms/components/FormModelQuestions/FormModelGroup/FormModelGroup';
import { FormQuestionsButtons } from '@v2/pages/companies/forms/components/FormQuestionsButtons/FormQuestionsButtons';

export const FormModelEditContent = ({
  companyId,
  form,
}: {
  companyId: string;
  form: FormReadModel;
}) => {
  const router = useAppRouter();

  const formHook = useForm<IFormModelForms>({
    resolver: yupResolver(schemaFormModelForms),
    defaultValues: {
      title: form.name,
      description: form.description || '',
      anonymous: form.anonymous,
      shareableLink: form.shareable_link,
      type: {
        value: form.type,
        label: FormTypeTranslate[form.type],
      },
      sections: form.questionGroups.map((group) => ({
        id: v4(),
        apiId: group.id,
        title: group.name,
        description: group.description || '',
        items: group.questions.map((question) => ({
          id: v4(),
          apiId: question.id,
          content: question.details.text,
          required: question.required || false,
          type: {
            value: question.details.type,
            label: FormQuestionTypeEnumTranslate[question.details.type],
          },
          options:
            question.options?.map((option) => ({
              id: v4(),
              apiId: option.id,
              value: option.value?.toString() || '',
              label: option.text,
            })) || [],
          minValue: undefined,
          maxValue: undefined,
        })),
      })),
    },
  });

  const editFormMutation = useMutateEditFormModel();

  const onSubmit = async (data: IFormModelForms) => {
    formHook.clearErrors();

    const hasValidationErrors = validateFormOptions(data, formHook);

    if (hasValidationErrors) return;

    const apiData = transformFormDataToApiFormat(data, companyId);
    await editFormMutation.mutateAsync({
      ...apiData,
      formId: form.id,
    });

    router.push(PageRoutes.FORMS.FORMS_MODEL.LIST, {
      pathParams: { companyId },
    });
  };

  const handleSubmit = formHook.handleSubmit(onSubmit);

  const onCancel = () => {
    router.push(PageRoutes.FORMS.FORMS_MODEL.LIST, {
      pathParams: { companyId },
    });
  };

  return (
    <SForm form={formHook}>
      <FormModelInfo containerProps={{ mb: 16 }} />
      <FormModelGroup companyId={companyId} />

      <FormQuestionsButtons
        onCancel={onCancel}
        onSubmit={handleSubmit}
        errors={formHook.formState.errors}
        loading={editFormMutation.isPending}
      />
    </SForm>
  );
};
