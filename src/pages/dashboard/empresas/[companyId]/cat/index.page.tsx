import React from 'react';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { ModalAddCat } from 'components/organisms/modals/ModalAddCat/ModalAddCat';
import { CatsTable } from 'components/organisms/tables/CatTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'CAT'} />
      <SContainer>
        <CatsTable />
      </SContainer>
      <ModalAddCat />
    </>
  );
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
