import { Box } from '@mui/material';
import { Document, PDFViewer } from '@react-pdf/renderer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import PdfAsoPage from 'components/pdfs/documents/aso/aso.pdf';
import PdfAtestadoPage from 'components/pdfs/documents/atestado/atestado.pdf';
import PdfEvaluationPage from 'components/pdfs/documents/evaluation/evaluation.pdf';
import PdfProntuarioPage from 'components/pdfs/documents/prontuario/prontuario.pdf';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { useQueryPdfEvaluation } from 'core/services/hooks/queries/pdfs/useQueryPdfEvaluation';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

const Evaluation: NextPage = () => {
  const { query } = useRouter();
  const employeeId = query.employeeId as string;
  const asoId = query.asoId as string;

  const { data: evaluationData } = useQueryPdfEvaluation(employeeId);
  return (
    <>
      <SHeaderTag
        hideInitial
        title={`PDF:Evaluation Med ${evaluationData?.employee?.name || ''}`}
      />
      <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {evaluationData && !!Object.keys(evaluationData).length && (
          <PDFViewer showToolbar width="100%" height="100%">
            <Document
              subject={'Aso e prontuario'}
              author={'simpleSST'}
              creator={'simpleSST'}
              producer={'simpleSST'}
              keywords={'Aso / prontuario'}
              title={`VIAS_ASO_E_PRONTUARIO_${getCompanyName(
                evaluationData?.consultantCompany,
              )}_${getCompanyName(evaluationData?.actualCompany)}_${
                evaluationData?.employee?.name
              }`}
            >
              {evaluationData && evaluationData?.employee && (
                <>
                  <PdfEvaluationPage data={evaluationData} />
                  <PdfAtestadoPage data={evaluationData} />
                </>
              )}
            </Document>
          </PDFViewer>
        )}
      </Box>
    </>
  );
};

export default Evaluation;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
