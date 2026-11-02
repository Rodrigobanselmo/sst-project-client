import { Alert, Button, Typography } from '@mui/material';
import { CertificateManager } from '@v2/features/esocial-certificates/CertificateManager';
import { usePlatformCertificateAccess } from '@v2/features/esocial-certificates/usePlatformCertificateAccess';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { RoleEnum } from 'project/enum/roles.enums';

export default function PlatformCertificatePage() {
  const access = usePlatformCertificateAccess();
  return (
    <>
      <SHeaderTag title="Transmissão eSocial · SimpleSST" />
      <SContainer>
        {access.loading ? (
          <Typography sx={{ p: 3 }}>Carregando configuração…</Typography>
        ) : access.error ? (
          <Alert severity="error">
            Não foi possível verificar o acesso à configuração interna.
            <Button onClick={() => void access.retry()}>
              Tentar novamente
            </Button>
          </Alert>
        ) : access.allowed ? (
          <CertificateManager scope="PLATFORM" />
        ) : (
          <Alert severity="warning">
            Esta configuração está disponível somente para a administração da
            SimpleSST.
          </Alert>
        )}
      </SContainer>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }), {
  roles: [RoleEnum.MASTER],
});
