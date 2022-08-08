import { SContainer } from 'components/atoms/SContainer';
import { ModalAddExam } from 'components/organisms/modals/ModalAddExam/ModalAddExam';
import { ExamsTable } from 'components/organisms/tables/ExamsTable/ExamsTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ExamsPage: NextPage = () => {
  return (
    <SContainer>
      <ExamsTable />
      <ModalAddExam />
    </SContainer>
  );
};

export default ExamsPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
