import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { RiskGroupDataTable } from 'components/organisms/tables/RiskGroupDataTable ';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskGroup: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Gestão SST'} />
      <SContainer>
        <RiskGroupDataTable />
      </SContainer>
    </>
  );
};

export default RiskGroup;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
