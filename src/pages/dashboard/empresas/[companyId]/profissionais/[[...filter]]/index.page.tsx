import { SContainer } from 'components/atoms/SContainer';
import { ProfessionalsTable } from 'components/organisms/tables/ProfessonalsTable/ProfessonalsTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ProfessionalsPage: NextPage = () => {
  return (
    <SContainer>
      <ProfessionalsTable />
    </SContainer>
  );
};

export default ProfessionalsPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
