import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { ChemicalProductsPage } from '@v2/pages/companies/chemical-products/chemical-products.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ChemicalProductsRoutePage: NextPage = () => {
  const router = useRouter();
  const companyId = String(router.query.companyId || '');

  return (
    <>
      <SHeaderTag title="Inventário e Triagem de Produtos Químicos" />
      <SContainer>
        {companyId ? <ChemicalProductsPage companyId={companyId} /> : null}
      </SContainer>
    </>
  );
};

export default ChemicalProductsRoutePage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
