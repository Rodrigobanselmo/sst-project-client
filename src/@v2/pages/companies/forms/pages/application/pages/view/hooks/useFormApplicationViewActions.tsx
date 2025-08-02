import { useAppRouter } from '@v2/hooks/useAppRouter';
import { PageRoutes } from '@v2/constants/pages/routes';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';

export const useFormApplicationViewActions = () => {
  const router = useAppRouter();

  const onFormApplicationEdit = (formApplication: FormApplicationReadModel) => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.EDIT, {
      pathParams: {
        companyId: formApplication.companyId,
        id: formApplication.id,
      },
    });
  };

  return {
    onFormApplicationEdit,
  };
};
