import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { EsocialPortfolio } from '@v2/features/sst-operational/EsocialPortfolio';

export default function EsocialPortfolioPage() {
  return (
    <>
      <SHeaderTag title="eSocial · Empresas atendidas" />
      <SContainer>
        <EsocialPortfolio />
      </SContainer>
    </>
  );
}
export const getServerSideProps = withSSRAuth(async () => ({ props: {} }));
