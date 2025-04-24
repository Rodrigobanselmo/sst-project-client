import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { ModalAddAbsenteeism } from 'components/organisms/modals/ModalAddAbsenteeism/ModalAddAbsenteeism';
import { AbsenteeismsTable } from 'components/organisms/tables/AbsenteeismTable';
import { NextPage } from 'next';

import { ModalEditEmployee } from 'components/organisms/modals/ModalEditEmployee/ModalEditEmployee';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Absenteismo'} />
      <SContainer>
        <AbsenteeismsTable />
      </SContainer>
      <ModalAddAbsenteeism />
      <ModalEditEmployee />
    </>
  );
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
