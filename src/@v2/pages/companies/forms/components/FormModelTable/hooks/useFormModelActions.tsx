import { PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { useModal } from '@v2/hooks/useModal';

export const useFormModelActions = ({ companyId }: { companyId: string }) => {
  const router = useAppRouter();

  const onFormModelAdd = () => {
    router.push(PageRoutes.FORMS.FORMS_MODEL.ADD, {
      pathParams: { companyId },
    });
  };

  const onFormModelClick = (id: string) => {
    router.push(PageRoutes.FORMS.FORMS_MODEL.EDIT, {
      pathParams: { companyId, id },
    });
  };

  return {
    onFormModelAdd,
    onFormModelClick,
  };
};
