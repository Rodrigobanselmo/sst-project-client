import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { Document, PDFViewer, usePDF } from '@react-pdf/renderer';
import { SButton } from 'components/atoms/SButton';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import PdfGuidePage from 'components/pdfs/documents/guide/guide.pdf';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { setIsFetchingData } from 'store/reducers/routeLoad/routeLoadSlice';

import { EmailsTemplatesEnum } from 'core/enums/emails-templates';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { IPdfGuideData } from 'core/interfaces/api/IPdfGuideData';
import { useMutSendEmail } from 'core/services/hooks/mutations/notification/useMutSendEmail/useMutSendEmail';
import { useQueryPdfGuide } from 'core/services/hooks/queries/pdfs/useQueryPdfGuide';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
export function ButtonSendEmail({ data }: { data: IPdfGuideData }) {
  const { enqueueSnackbar } = useSnackbar();

  const sendEmailMutation = useMutSendEmail();
  const [instance] = usePDF({
    document: PdfGuidePage({ data }),
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
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setIsFetchingData(true));
  }, [dispatch]);

  return (
    <>
      <SHeaderTag hideInitial title={`PDF:Guia ${guideData?.name || ''}`} />
      <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <>
          {guideData && guideData?.company && !!Object.keys(guideData).length && (
            <>
              <PDFViewer showToolbar width="100%" height="100%">
                <Document onRender={() => dispatch(setIsFetchingData(false))}>
                  <PdfGuidePage data={guideData} />
                </Document>
              </PDFViewer>
              <ButtonSendEmail data={guideData} />
            </>
          )}
        </>
      </Box>
    </>
  );
};

export default Guide;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
