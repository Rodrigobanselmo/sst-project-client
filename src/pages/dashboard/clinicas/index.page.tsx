import { SContainer } from 'components/atoms/SContainer';
import { ClinicsTable } from 'components/organisms/tables/ClinicsTable/ClinicsTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ClinicsPage: NextPage = () => {
  return (
    <SContainer>
      <ClinicsTable />
    </SContainer>
  );
};

export default ClinicsPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
