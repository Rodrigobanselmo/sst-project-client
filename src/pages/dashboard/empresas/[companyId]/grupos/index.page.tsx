import { SContainer } from 'components/atoms/SContainer';
import { ModalAddCompanyGroup } from 'components/organisms/modals/ModalAddCompanyGroup';
import { CompanyGroupsTable } from 'components/organisms/tables/CompanyGroupsTable ';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const CompanyGroup: NextPage = () => {
  return (
    <SContainer>
      <CompanyGroupsTable />
      <ModalAddCompanyGroup />
    </SContainer>
  );
};

export default CompanyGroup;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
