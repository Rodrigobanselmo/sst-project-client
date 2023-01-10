import React from 'react';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { ModalAddCat } from 'components/organisms/modals/ModalAddCat/ModalAddCat';
import { ModalAddScheduleBlock } from 'components/organisms/modals/ModalAddScheduleBlock/ModalAddScheduleBlock';
import { CatsTable } from 'components/organisms/tables/CatTable';
import { ScheduleBlockTable } from 'components/organisms/tables/ScheduleBlockTable/ScheduleBlockTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Bloqueio de Agenda'} />
      <SContainer>
        <ScheduleBlockTable />
      </SContainer>
      <ModalAddScheduleBlock />
    </>
  );
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
