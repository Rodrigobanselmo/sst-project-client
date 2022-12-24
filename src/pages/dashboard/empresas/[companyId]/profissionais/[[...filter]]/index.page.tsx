import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { ProfessionalsTable } from 'components/organisms/tables/ProfessonalsTable/ProfessonalsTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ProfessionalsPage: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Profissionais'} />
      <SContainer>
        <ProfessionalsTable />
      </SContainer>
    </>
  );
};

export default ProfessionalsPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
