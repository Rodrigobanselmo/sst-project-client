import { SContainer } from 'components/atoms/SContainer';
import { StackModalAddGho } from 'components/organisms/modals/ModalAddGHO';
import { GhosTable } from 'components/organisms/tables/GhosTable/GhosTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskPage: NextPage = () => {
  return (
    <SContainer>
      <GhosTable />
      <StackModalAddGho />
    </SContainer>
  );
};

export default RiskPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
