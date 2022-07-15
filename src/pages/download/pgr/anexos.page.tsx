import { useEffect } from 'react';

import { CircularProgress } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import SCheckIcon from 'assets/icons/SCheckIcon';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useMutDownloadFile } from 'core/services/hooks/mutations/useMutDownloadFile';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Attachments: NextPage = () => {
  const downloadMutation = useMutDownloadFile();
  const { query } = useRouter();
  const { companyId } = useGetCompanyId();

  const docId = query.ref1 as string;
  const attachmentId = query.ref2 as string;
  const companyIdRef = query.ref3 as string;

  useEffect(() => {
    if (docId && attachmentId) {
      downloadMutation
        .mutateAsync(
          `${ApiRoutesEnum.DOCUMENTS_PGR_ATTACHMENTS.replace(
            ':docId',
            docId,
          )}/${attachmentId}/${companyIdRef || companyId}`,
        )
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SContainer>
      {downloadMutation.isLoading && (
        <SFlex align="center">
          <SText mr={3}>Baixando</SText>
          <CircularProgress size={17} />
        </SFlex>
      )}
      {downloadMutation.isError && (
        <p>Nenhum arquivo para download encontrado</p>
      )}
      {downloadMutation.isSuccess && (
        <SFlex align="center">
          <SText mr={3}>Arquivo baixado com sucesso</SText>
          <SCheckIcon color="success" />
        </SFlex>
      )}
      {!(docId && attachmentId) && 'Nenhum arquivo para download encontrado'}
    </SContainer>
  );
};

export default Attachments;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
