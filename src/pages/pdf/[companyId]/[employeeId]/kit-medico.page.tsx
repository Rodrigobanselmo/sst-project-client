import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { PDFViewer, usePDF } from '@react-pdf/renderer';
import { SButton } from 'components/atoms/SButton';
import { SContainer } from 'components/atoms/SContainer';
import PdfGuide from 'components/pdfs/documents/guide/guide.pdf';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

import { EmailsTemplatesEnum } from 'core/enums/emails-templates';
import { IGuideData } from 'core/interfaces/api/IGuideData';
import { useMutSendEmail } from 'core/services/hooks/mutations/notification/useMutSendEmail/useMutSendEmail';
import { useQueryPdfGuide } from 'core/services/hooks/queries/pdfs/useQueryPdfGuide';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

export function ButtonSendEmail({ data }: { data: IGuideData }) {
  const { enqueueSnackbar } = useSnackbar();

  const sendEmailMutation = useMutSendEmail();
  const [instance] = usePDF({
    document: PdfGuide({ data }),
  });

  const senEmail = () => {
    if (instance.blob) {
      const file = new File([instance.blob], 'guia-de-encaminhamento.pdf', {
        type: 'application/pdf',
      });

      if (data?.email)
        sendEmailMutation.mutateAsync({
          files: [file],
          template: EmailsTemplatesEnum.REFERRAL_GUIDE,
          emails: [data.email],
        });
      else {
        return enqueueSnackbar('Email do funcionário não informado', {
          variant: 'error',
          autoHideDuration: 1500,
        });
      }
    }
  };

  return (
    <Box position="absolute" bottom={20} right={20}>
      <SButton loading={sendEmailMutation.isLoading} onClick={senEmail}>
        Enviar por Email ao funcionário
      </SButton>
    </Box>
  );
}

const Guide: NextPage = () => {
  const { query } = useRouter();
  const employeeId = query.employeeId as string;
  const { data: guideData } = useQueryPdfGuide(employeeId);

  return (
    <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {guideData && guideData?.company && (
        <>
          <PDFViewer showToolbar width="100%" height="100%">
            <PdfGuide data={guideData} />
          </PDFViewer>
          <ButtonSendEmail data={guideData} />
        </>
      )}
    </Box>
  );
};

export default Guide;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
