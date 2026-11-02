import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { CertificateManager } from '@v2/features/esocial-certificates/CertificateManager';
export default function CertificateSettingsPage() {
  return (
    <>
      <SHeaderTag title="Certificados do eSocial" />
      <SContainer>
        <CertificateManager />
      </SContainer>
    </>
  );
}
export const getServerSideProps = withSSRAuth(async () => ({ props: {} }));
