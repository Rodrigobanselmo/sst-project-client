import { SContainer } from 'components/atoms/SContainer';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RiskGroupDataTable } from 'components/organisms/tables/RiskGroupDataTable ';
import { NextPage } from 'next';
import { RoleEnum } from 'project/enum/roles.enums';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskGroup: NextPage = () => {
  return (
    <SContainer>
      <SAuthShow roles={[RoleEnum.MASTER]}>
        <RiskGroupDataTable />
      </SAuthShow>
    </SContainer>
  );
};

export default RiskGroup;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
