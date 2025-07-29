import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { validateFormOptions } from '@v2/pages/companies/forms/utils/validate-form-options';
import { useAddFormModel } from '@v2/services/forms/form/add-form-model/hooks/useAddFormModel';
import { useForm } from 'react-hook-form';
import { FormModelInfo } from '../../../../components/FormModelInfo/FormModelInfo';
import { FormModelButtons } from '../../../../../../components/FormModelQuestions/FormModelButtons/FormModelButtons';
import {
  formModelFormsInitialValues,
  IFormModelForms,
  schemaFormModelForms,
} from '../../../../schemas/form-model.schema';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { PageRoutes } from '@v2/constants/pages/routes';
import { FormModelGroup } from '../../../../../../components/FormModelQuestions/FormModelGroup/FormModelGroup';
import { transformFormDataToApiFormat } from '../../../../helpers/transform-form-model-data';

export const FormModelAddContent = ({ companyId }: { companyId: string }) => {
  const router = useAppRouter();
  const form = useForm<IFormModelForms>({
    resolver: yupResolver(schemaFormModelForms),
    defaultValues: formModelFormsInitialValues,
  });

  const addFormMutation = useAddFormModel();

  const onSubmit = async (data: IFormModelForms) => {
    form.clearErrors();

    const hasValidationErrors = validateFormOptions(data, form);

    if (hasValidationErrors) return;

    const apiData = transformFormDataToApiFormat(data, companyId);
    await addFormMutation.mutateAsync(apiData);

    router.push(PageRoutes.FORMS.FORMS_MODEL.LIST, {
      pathParams: { companyId },
    });
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  const onCancel = () => {
    router.push(PageRoutes.FORMS.FORMS_MODEL.LIST, {
      pathParams: { companyId },
    });
  };

  return (
    <SForm form={form}>
      <FormModelInfo containerProps={{ mb: 16 }} />
      <FormModelGroup companyId={companyId} />

      <FormModelButtons
        onCancel={onCancel}
        onSubmit={handleSubmit}
        errors={form.formState.errors}
        loading={addFormMutation.isPending}
      />
    </SForm>
  );
};
