import { PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { NextPage } from 'next';
import { useEffect } from 'react';

const Page: NextPage = () => {
  const router = useAppRouter();
  const { companyId } = router.params;

  useEffect(() => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
      pathParams: { companyId },
    });
  }, [companyId, router]);

  return <div>Formulários</div>;
};

export default Page;
