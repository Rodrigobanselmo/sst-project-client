import { Box } from '@mui/material';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';

import { withSSRGuest } from 'core/utils/auth/withSSRGuest';

import { LoginAuthBrand } from './components/LoginAuthBrand/LoginAuthBrand';
import { LoginAuthCard } from './components/LoginAuthCard/LoginAuthCard';
import {
  LoginHeadline,
  LoginInstitutionalPanel,
} from './components/LoginInstitutionalPanel/LoginInstitutionalPanel';
import { LoginForm } from './components/LoginForm';
import { LoginSkinProvider } from './components/LoginSkinProvider/LoginSkinProvider';
import { LoginThemeToggle } from './components/LoginThemeToggle/LoginThemeToggle';
import { PrivacyAndTerms } from './components/PrivacyAndTerms';
import { STAuthColumn, STInstitutional, STMain, STPage } from './index.styles';

function LoginPageContent() {
  return (
    <STPage>
      <LoginThemeToggle />
      <STMain>
        <STAuthColumn component="section" aria-label="Autenticação">
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 6 }}>
            <LoginAuthBrand />
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <LoginHeadline compact />
            </Box>
          </Box>
          <LoginAuthCard>
            <LoginForm />
          </LoginAuthCard>
        </STAuthColumn>
        <STInstitutional>
          <LoginInstitutionalPanel />
        </STInstitutional>
      </STMain>
      <PrivacyAndTerms />
    </STPage>
  );
}

const Home: NextPage = () => {
  return (
    <>
      <SHeaderTag hideInitial title={'Login - SIMPLESST'} />
      <LoginSkinProvider>
        <LoginPageContent />
      </LoginSkinProvider>
    </>
  );
};

export default Home;

export const getServerSideProps = withSSRGuest(async () => {
  return {
    props: {},
  };
});
