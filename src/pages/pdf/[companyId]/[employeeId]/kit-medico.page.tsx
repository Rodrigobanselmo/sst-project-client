import { Box } from '@mui/material';
import { Document, PDFViewer } from '@react-pdf/renderer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import PdfAsoPage from 'components/pdfs/documents/aso/aso.pdf';
import PdfProntuarioPage from 'components/pdfs/documents/prontuario/prontuario.pdf';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { useQueryPdfKit } from 'core/services/hooks/queries/pdfs/useQueryPdfKit ';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

const Kit: NextPage = () => {
  const { query } = useRouter();
  const employeeId = query.employeeId as string;
  const asoId = query.aso as string;

  const { data: kitData } = useQueryPdfKit(asoId, employeeId);
  return (
    <>
      <SHeaderTag
        hideInitial
        title={`PDF:Kit Med ${kitData?.aso?.employee?.name || ''}`}
      />
      <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <PDFViewer showToolbar width="100%" height="100%">
          <Document
            subject={'Aso e prontuario'}
            author={'simpleSST'}
            creator={'simpleSST'}
            producer={'simpleSST'}
            keywords={'Aso / prontuario'}
            title={`VIAS_ASO_E_PRONTUARIO_${getCompanyName(
              kitData?.aso?.consultantCompany,
            )}_${getCompanyName(kitData?.aso?.actualCompany)}_${
              kitData?.aso?.employee?.name
            }`}
          >
            {kitData && kitData.aso?.employee && (
              <>
                {Array.from({ length: kitData.aso.numAsos }, (v, i) => i).map(
                  (d) => (
                    <PdfAsoPage data={kitData.aso} key={d} />
                  ),
                )}
                <PdfProntuarioPage data={kitData.prontuario} />
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
