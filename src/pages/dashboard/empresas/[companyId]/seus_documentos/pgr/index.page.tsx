import { SContainer } from 'components/atoms/SContainer';
import { RiskGroupDataTable } from 'components/organisms/tables/RiskGroupDataTable ';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

//! deletar pagina, isso agora é sistema de gestao sst e esta em outra pagina
const RiskGroup: NextPage = () => {
  return (
    <SContainer>
      <RiskGroupDataTable />
    </SContainer>
  );
};

export default RiskGroup;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
