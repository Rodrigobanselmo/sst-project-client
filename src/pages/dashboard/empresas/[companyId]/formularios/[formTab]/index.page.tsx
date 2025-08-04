import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { FormsPage } from '@v2/pages/companies/forms/forms.page';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { useEffect } from 'react';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';

const Page: NextPage = () => {
  const router = useAppRouter();
  const { companyId, formTab } = router.params;

  useEffect(() => {
    const formTabDifferentFromEnum =
      Object.values(FORM_TAB_ENUM).includes(formTab);

    if (!formTabDifferentFromEnum) {
      router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
        pathParams: { companyId, formTab: FORM_TAB_ENUM.APPLIED },
      });
    }
  }, [companyId, formTab]);

  return <FormsPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
