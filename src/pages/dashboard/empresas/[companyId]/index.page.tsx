import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { EmployeesTable } from 'components/organisms/tables/EmployeesTable';
import { NextPage } from 'next';

import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const CompanyPage: NextPage = () => {
  const { data: company } = useQueryCompany();

  return (
    <SContainer>
      <SPageTitle icon={BusinessTwoToneIcon}>{company.name}</SPageTitle>
      <EmployeesTable />
    </SContainer>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
