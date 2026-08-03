import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { CharacterizationAiProfilesPage } from '@v2/pages/companies/characterization-ai-profiles/characterization-ai-profiles.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const CharacterizationAiProfilesRoutePage: NextPage = () => {
  const router = useRouter();
  const companyId = String(router.query.companyId || '');

  return (
    <>
      <SHeaderTag title="Especialistas de IA — Caracterização" />
      <SContainer>
        {companyId ? (
          <CharacterizationAiProfilesPage companyId={companyId} />
        ) : null}
      </SContainer>
    </>
  );
};

export default CharacterizationAiProfilesRoutePage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
