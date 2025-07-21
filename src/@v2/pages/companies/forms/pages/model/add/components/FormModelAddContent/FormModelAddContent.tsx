import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { validateFormOptions } from '@v2/pages/companies/forms/utils/validate-form-options';
import { useAddFormModel } from '@v2/services/forms/form/add-form-model/hooks/useAddFormModel';
import { transformFormDataToApiFormat } from '@v2/services/forms/form/add-form-model/service/transform-form-model-data';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { FormModelGroup } from '../FormModelGroup/FormModelGroup';
import { FormModelInfo } from '../FormModelInfo/FormModelInfo';
import { FormModelButtons } from './components/FormModelButtons/FormModelButtons';
import {
  addFormModelFormsInitialValues,
  IAddFormModelFormsFields,
  schemaAddFormModelForms,
} from './FormModelAddContent.schema';

export const FormModelAddContent = ({ companyId }: { companyId: string }) => {
  const router = useRouter();
  const form = useForm<IAddFormModelFormsFields>({
    resolver: yupResolver(schemaAddFormModelForms),
    defaultValues: addFormModelFormsInitialValues,
  });

  const addFormMutation = useAddFormModel();

  const onSubmit = async (data: IAddFormModelFormsFields) => {
    form.clearErrors();

    const hasValidationErrors = validateFormOptions(data, form);

    if (hasValidationErrors) return;

    const apiData = transformFormDataToApiFormat(data, companyId);
    await addFormMutation.mutateAsync(apiData);

    router.push(FormRoutes.FORM.PATH);
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <SForm form={form}>
      <FormModelInfo containerProps={{ mb: 16 }} />
      <FormModelGroup companyId={companyId} />

      <FormModelButtons
        onSubmit={handleSubmit}
        errors={form.formState.errors}
        loading={addFormMutation.isPending}
      />
    </SForm>
  );
};
