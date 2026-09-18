import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { RiskMatricesPage } from '@v2/pages/companies/risk-matrices/risk-matrices.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskMatricesRoutePage: NextPage = () => {
  const { query } = useRouter();
  const companyId = String(query.companyId || '');

  return (
    <>
      <SHeaderTag title="Matrizes de Risco" />
      <SContainer>
        <RiskMatricesPage companyId={companyId} />
      </SContainer>
    </>
  );
};

export default RiskMatricesRoutePage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
