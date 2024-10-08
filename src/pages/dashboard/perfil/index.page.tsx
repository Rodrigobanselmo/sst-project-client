import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { UserForm } from 'components/organisms/forms/UserForm';
import { ModalAddCouncil } from 'components/organisms/modals/ModalAddCouncil';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { Box, Container, styled } from '@mui/material';

export const STContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: auto;
  margin-top: 50px;
`;

export const STSectionBox = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
  padding: 0 50px;

  @media (max-width: 1024px) {
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const Database: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Perfil'} />
      <STContainer>
        <STSectionBox component="section">
          <UserForm mb={20} passChange />
        </STSectionBox>
        <ModalSingleInput />
        <ModalAddCouncil />
      </STContainer>
    </>
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
