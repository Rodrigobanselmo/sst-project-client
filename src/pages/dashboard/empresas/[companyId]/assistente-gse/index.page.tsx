import { StackModalAddGho } from 'components/organisms/modals/ModalAddGHO';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { ExposureGroupAssistantPage } from '@v2/pages/companies/exposure-group-assistant/exposure-group-assistant.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ExposureGroupAssistantRoutePage: NextPage = () => {
  const router = useRouter();
  const companyId = String(router.query.companyId || '');

  return (
    <>
      <SHeaderTag title="Assistente de Grupos Similares de Exposição" />
      <SContainer>
        {companyId ? (
          <ExposureGroupAssistantPage companyId={companyId} />
        ) : null}
        {/* Canonical GSE editor modal — same stack used by /grupos-homogenios */}
        <StackModalAddGho />
      </SContainer>
    </>
  );
};

export default ExposureGroupAssistantRoutePage;

export const getServerSideProps = withSSRAuth(async () => {
  return { props: {} };
});
