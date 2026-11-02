import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { EsocialOverview } from '@v2/features/sst-operational/EsocialOverview';
import { Button, Box } from '@mui/material';
import Link from 'next/link';
export default function EsocialPage() {
  const { companyId } = useGetCompanyId();
  return (
    <>
      <SHeaderTag title="eSocial SST" />
      <SContainer>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '16px', p: 8 }}>
          <Button component={Link} href="/dashboard/esocial">Ver empresas atendidas</Button>
          <Button
            component={Link}
            href={`/dashboard/empresas/${companyId}/esocial/certificados`}
          >
            Gerenciar certificados
          </Button>
        </Box>
        {companyId && <EsocialOverview key={companyId} companyId={companyId} />}
      </SContainer>
    </>
  );
}
export const getServerSideProps = withSSRAuth(async () => ({ props: {} }));
