import { useEffect } from 'react';

import { Box } from '@mui/material';
import { Document, PDFViewer } from '@react-pdf/renderer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import PdfAsoPage from 'components/pdfs/documents/aso/aso.pdf';
import PdfKitDocument from 'components/pdfs/documents/kit/kit-medico.pdf';
import PdfProntuarioPage from 'components/pdfs/documents/prontuario/prontuario.pdf';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { setIsFetchingData } from 'store/reducers/routeLoad/routeLoadSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useQueryPdfKit } from 'core/services/hooks/queries/pdfs/useQueryPdfKit ';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

const Kit: NextPage = () => {
  const { query } = useRouter();
  const employeeId = query.employeeId as string;
  const asoId = query.asoId as string;
  const scheduleMedicalVisitId = query.scheduleMedicalVisitId as string;
  const withDate = Boolean(query.withDate as string);
  const dispatch = useAppDispatch();

  const { data: kitData } = useQueryPdfKit({
    asoId: asoId ? Number(asoId) : undefined,
    employeeId: employeeId ? Number(employeeId) : undefined,
    scheduleMedicalVisitId: scheduleMedicalVisitId
      ? Number(scheduleMedicalVisitId)
      : undefined,
  });

  useEffect(() => {
    dispatch(setIsFetchingData(true));
  }, [dispatch]);

  const showpdf = !!kitData?.length && !!Object.keys(kitData?.[0] || {}).length;

  return (
    <>
      <SHeaderTag
        hideInitial
        title={`PDF:Kit Med ${
          kitData?.length == 1
            ? 'Visita Médica'
            : kitData?.[0]?.aso?.employee?.name || ''
        }`}
      />
      <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {showpdf && (
          <PDFViewer showToolbar width="100%" height="100%">
            <PdfKitDocument
              data={kitData}
              withDate={withDate}
              documentProps={{
                onRender: () => dispatch(setIsFetchingData(false)),
              }}
            />
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
