import React from 'react';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { StackModalRiskTool } from 'components/organisms/modals/ModalRiskTool';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskPage: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Riscos'} />
      <SContainer>
        <RiskCompanyTable />
      </SContainer>
      <StackModalRiskTool />
    </>
  );
};

export default RiskPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
