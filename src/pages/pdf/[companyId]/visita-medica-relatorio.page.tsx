import { useEffect } from 'react';

import { Box } from '@mui/material';
import { Document, PDFViewer } from '@react-pdf/renderer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import PdfAsoPage from 'components/pdfs/documents/aso/aso.pdf';
import PdfProntuarioPage from 'components/pdfs/documents/prontuario/prontuario.pdf';
import PdfVisitReportPage from 'components/pdfs/documents/visitReport/visitReport.pdf';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { setIsFetchingData } from 'store/reducers/routeLoad/routeLoadSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useQueryPdfKit } from 'core/services/hooks/queries/pdfs/useQueryPdfKit ';
import { useQueryPdfVisitReport } from 'core/services/hooks/queries/pdfs/useQueryPdfVisitReport/useQueryPdfVisitReport';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

const Kit: NextPage = () => {
  const { query } = useRouter();
  const scheduleMedicalVisitId = query.scheduleMedicalVisitId as string;
  const withDate = Boolean(query.withDate as string);
  const dispatch = useAppDispatch();

  const { data: visitReportData } = useQueryPdfVisitReport({
    scheduleMedicalVisitId: scheduleMedicalVisitId
      ? Number(scheduleMedicalVisitId)
      : undefined,
  });

  useEffect(() => {
    dispatch(setIsFetchingData(true));
  }, [dispatch]);

  const showpdf =
    !!visitReportData && !!Object.keys(visitReportData || {}).length;

  return (
    <>
      <SHeaderTag hideInitial title={'PDF: Relatório Visita Médica'} />
      <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {showpdf && (
          <PDFViewer showToolbar width="100%" height="100%">
            <Document
              subject={'Aso e prontuario'}
              author={'simpleSST'}
              creator={'simpleSST'}
              producer={'simpleSST'}
              onRender={() => dispatch(setIsFetchingData(false))}
              keywords={'Aso / prontuario'}
              title={`Relatório_Visíta_Médica_${getCompanyName(
                visitReportData?.consultantCompany,
              )}_${getCompanyName(visitReportData.actualCompany)}`}
            >
              <PdfVisitReportPage data={visitReportData} withDate={withDate} />
            </Document>
          </PDFViewer>
        )}
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
