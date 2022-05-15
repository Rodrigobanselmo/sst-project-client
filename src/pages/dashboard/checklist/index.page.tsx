import { SContainer } from 'components/atoms/SContainer';
import { ChecklistTable } from 'components/organisms/tables/ChecklistTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Checklist: NextPage = () => {
  return (
    <SContainer>
      <ChecklistTable />
    </SContainer>
  );
};

export default Checklist;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
