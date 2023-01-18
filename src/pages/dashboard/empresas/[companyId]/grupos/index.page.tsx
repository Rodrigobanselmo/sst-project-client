import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { ModalAddCompanyGroup } from 'components/organisms/modals/ModalAddCompanyGroup/ModalAddCompanyGroup';
import { ModalSelectClinic } from 'components/organisms/modals/ModalSelectClinics';
import { CompanyGroupsTable } from 'components/organisms/tables/CompanyGroupsTable ';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const CompanyGroup: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Grupos Empresariais'} />
      <SContainer>
        <CompanyGroupsTable />
        <>
          <ModalAddCompanyGroup />
        </>
      </SContainer>
    </>
  );
};

export default CompanyGroup;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
