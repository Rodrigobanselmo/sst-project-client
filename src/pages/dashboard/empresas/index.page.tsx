import { SContainer } from 'components/atoms/SContainer';
import { ModalEditCompany } from 'components/organisms/modals/company/ModalEditCompany';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { CompaniesTable } from 'components/organisms/tables/CompaniesTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Companies: NextPage = () => {
  return (
    <SContainer>
      <CompaniesTable />
      <ModalEditCompany />
      <ModalUploadPhoto />
    </SContainer>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
