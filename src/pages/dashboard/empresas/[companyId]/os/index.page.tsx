import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { OsForm } from 'components/organisms/forms/OsForm';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { COMPANY_HOME_PATHNAME } from 'core/constants/company-breadcrumb.constants';
import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const tabWorkspaceId = router.query.tabWorkspaceId as string | undefined;
  const active = Number(router.query.active ?? 0);

  const onBackToProgramasLaudos = useCallback(() => {
    if (!companyId) {
      void router.back();
      return;
    }

    void router.push({
      pathname: COMPANY_HOME_PATHNAME,
      query: {
        companyId,
        stage: CompanyActionEnum.DOCUMENTS_GROUP_PAGE,
        ...(active > 0 ? { active: String(active) } : {}),
        ...(tabWorkspaceId ? { tabWorkspaceId } : {}),
      },
    });
  }, [active, companyId, router, tabWorkspaceId]);

  return (
    <>
      <SHeaderTag title={'Ordem de Serviço'} />
      <SContainer>
        <SPageHeader
          mb={8}
          title="Ordem de Serviço (OS)"
          onBack={onBackToProgramasLaudos}
        />
        <OsForm />
      </SContainer>
    </>
  );
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
