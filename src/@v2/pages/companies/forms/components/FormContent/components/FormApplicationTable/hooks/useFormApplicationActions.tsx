import { PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';

export const useFormApplicationActions = ({
  companyId,
}: {
  companyId: string;
}) => {
  const router = useAppRouter();

  const onFormApplicationAdd = () => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.ADD, {
      pathParams: { companyId },
    });
  };

  const onFormApplicationClick = (id: string) => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.VIEW, {
      pathParams: { companyId, id },
    });
  };

  return {
    onFormApplicationAdd,
    onFormApplicationClick,
  };
};
