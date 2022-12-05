import React from 'react';

import { SContainer } from 'components/atoms/SContainer';
import { ModalAddCat } from 'components/organisms/modals/ModalAddCat/ModalAddCat';
import { CatsTable } from 'components/organisms/tables/CatTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return (
    <>
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
