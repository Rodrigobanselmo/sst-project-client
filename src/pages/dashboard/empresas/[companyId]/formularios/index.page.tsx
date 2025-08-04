import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { getPathname, useAppRouter } from '@v2/hooks/useAppRouter';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Page: NextPage = () => {
  const router = useAppRouter();
  const { companyId } = router.params;

  useEffect(() => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
      pathParams: { companyId },
    });
  }, [companyId]);

  return <div>Formulários</div>;
};

export default Page;
