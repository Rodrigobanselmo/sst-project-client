import React from 'react';

import { SContainer } from 'components/atoms/SContainer';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { OsForm } from 'components/organisms/forms/OsForm';
import { ModalAddAbsenteeism } from 'components/organisms/modals/ModalAddAbsenteeism/ModalAddAbsenteeism';
import { AbsenteeismsTable } from 'components/organisms/tables/AbsenteeismTable';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return (
    <>
      <SContainer>
        <OsForm />
      </SContainer>
    </>
  );
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
