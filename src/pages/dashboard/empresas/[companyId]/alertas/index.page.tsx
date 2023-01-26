import React from 'react';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { AlertForm } from 'components/organisms/forms/AlertForm ';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { ModalSelectUsers } from 'components/organisms/modals/ModalSelectUsers';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { ModalViewUsers } from 'components/organisms/modals/ModalViewUsers/ModalViewUsers';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Alertas'} />
      <SContainer>
        <AlertForm />
      </SContainer>
      <ModalSingleInput />
      <ModalSelectUsers />
      <ModalSelectAccessGroups />
    </>
  );
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
