import { SContainer } from 'components/atoms/SContainer';
import { UserForm } from 'components/organisms/forms/UserForm';
import { ModalAddCouncil } from 'components/organisms/modals/ModalAddCouncil';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Database: NextPage = () => {
  return (
    <SContainer>
      <UserForm />
      <ModalSingleInput />
      <ModalAddCouncil />
    </SContainer>
  );
};

export default Database;

export const getServerSideProps = withSSRAuth(
  async () => {
    return {
      props: {},
    };
  },
  { skipCompanyCheck: true },
);
