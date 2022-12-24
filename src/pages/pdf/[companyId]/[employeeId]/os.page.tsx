import { Box } from '@mui/material';
import { Document, PDFViewer } from '@react-pdf/renderer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import PdfOSPage from 'components/pdfs/documents/os/os.pdf';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { useQueryPdfOS } from 'core/services/hooks/queries/pdfs/useQueryPdfOS/useQueryPdfOS';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

const Kit: NextPage = () => {
  const { query } = useRouter();
  const employeeId = query.employeeId as string;

  const { data: osData } = useQueryPdfOS(employeeId);
  return (
    <>
      <SHeaderTag
        hideInitial
        title={`PDF:OS ${osData?.employee?.name || ''}`}
      />
      <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <PDFViewer showToolbar width="100%" height="100%">
          <Document
            subject={'Ordem de serviço'}
            author={'simpleSST'}
            creator={'simpleSST'}
            producer={'simpleSST'}
            keywords={'Ordem de serviço'}
            title={`OS_${getCompanyName(
              osData?.consultantCompany,
            )}_${getCompanyName(osData?.actualCompany)}_${
              osData?.employee?.name
            }`}
          >
            {osData && osData?.employee && (
              <>
                <PdfOSPage data={osData} />
              </>
            )}
          </Document>
        </PDFViewer>
      </Box>
    </>
  );
};

export default Kit;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
