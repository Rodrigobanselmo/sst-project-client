import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { PDFViewer, usePDF } from '@react-pdf/renderer';
import PDFTest from 'components/pdfs/documents/test/test.pdf';

import { EmailsTemplatesEnum } from 'core/enums/emails-templates';
import { useModal } from 'core/hooks/useModal';
import { useMutSendEmail } from 'core/services/hooks/mutations/notification/useMutSendEmail/useMutSendEmail';

// const PDFTest = dynamic(
//   () => import('../../components/pdfs/documents/test/test.pdf'),
//   {
//     ssr: false,
//   },
// );

const PageTest = () => {
  const { onStackOpenModal } = useModal();
  const [instance] = usePDF({ document: PDFTest() });

  const sendEmailMutation = useMutSendEmail();

  const senEmail = () => {
    console.log(1);
    if (instance.blob) {
      console.log(99);
      const file = new File([instance.blob], 'guia.pdf', {
        type: 'application/pdf',
      });

      sendEmailMutation.mutateAsync({
        files: [file],
        template: EmailsTemplatesEnum.REFERRAL_GUIDE,
      });
    }
  };

  return (
    <Box>
      <button onClick={senEmail}>Send Email</button>
      <PDFViewer showToolbar width="100%" height="400px">
        <PDFTest />
      </PDFViewer>
    </Box>
  );
};

export default PageTest;
