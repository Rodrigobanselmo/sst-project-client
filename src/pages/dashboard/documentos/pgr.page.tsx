import { SContainer } from 'components/atoms/SContainer';
import { RiskGroupDataTable } from 'components/tables/RiskGroupDataTable ';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Companies: NextPage = () => {
  return (
    <SContainer>
      <RiskGroupDataTable />
    </SContainer>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
