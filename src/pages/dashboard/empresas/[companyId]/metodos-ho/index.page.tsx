import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';

import { HoMethodsPage } from '@v2/pages/companies/ho-methods/ho-methods.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const HoMethodsRoutePage: NextPage = () => {
  return (
    <>
      <SHeaderTag title="Cadastro de Métodos de HO — Agentes Químicos" />
      <SContainer>
        <HoMethodsPage />
      </SContainer>
    </>
  );
};

export default HoMethodsRoutePage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
