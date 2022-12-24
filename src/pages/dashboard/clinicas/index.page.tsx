import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { ModalEditClinic } from 'components/organisms/modals/company/ModalEditClinic/ModalEditClinic';
import { ClinicsTable } from 'components/organisms/tables/ClinicsTable/ClinicsTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ClinicsPage: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Clínicas'} />
      <SContainer>
        <ClinicsTable />
        <ModalEditClinic />
      </SContainer>
    </>
  );
};

export default ClinicsPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
