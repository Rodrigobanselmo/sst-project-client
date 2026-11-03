import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { CertificateManager } from '@v2/features/esocial-certificates/CertificateManager';
import { Box, Button } from '@mui/material';
import Link from 'next/link';
export default function CompanyCertificatePage() {
  const { companyId } = useGetCompanyId();
  return (
    <>
      <SHeaderTag title="Certificados do eSocial" />
      <SContainer>
        <Box sx={{ px: { xs: 8, md: 12 }, pt: 8 }}>
          <Button
            component={Link}
            href={`/dashboard/empresas/${companyId}/esocial`}
          >
            Voltar ao eSocial
          </Button>
        </Box>
        {companyId && (
          <CertificateManager key={companyId} employerId={companyId} />
        )}
      </SContainer>
    </>
  );
}
export const getServerSideProps = withSSRAuth(async () => ({ props: {} }));
