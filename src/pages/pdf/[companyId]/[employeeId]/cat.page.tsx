import { useEffect } from 'react';

import { Box } from '@mui/material';
import { Document, PDFViewer } from '@react-pdf/renderer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import PdfCatPage from 'components/pdfs/documents/cat/cat.pdf';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { setIsFetchingData } from 'store/reducers/routeLoad/routeLoadSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useQueryCat } from 'core/services/hooks/queries/useQueryCat/useQueryCat';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEmployee } from 'core/services/hooks/queries/useQueryEmployee/useQueryEmployee';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

const Kit: NextPage = () => {
  const { query } = useRouter();
  const employeeId = query.employeeId as string;
  const catId = query.catId as string;
  const companyId = query.companyId as string;
  const dispatch = useAppDispatch();

  const { data: company } = useQueryCompany(companyId);

  const { data: employee } = useQueryEmployee({
    id: Number(employeeId || 0),
    companyId,
  });

  const { data: cat } = useQueryCat({
    id: Number(catId || 0),
    companyId,
  });

  useEffect(() => {
    dispatch(setIsFetchingData(true));
  }, [dispatch]);

  return (
    <>
      <SHeaderTag hideInitial title={`PDF:CAT ${employee?.name || ''}`} />
      <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {cat && employee && company && !!Object.keys(cat).length && (
          <PDFViewer showToolbar width="100%" height="100%">
            <Document
              subject={'CAT'}
              onRender={() => dispatch(setIsFetchingData(false))}
              author={'simpleSST'}
              creator={'simpleSST'}
              producer={'simpleSST'}
              keywords={'CAT'}
              title={`CAT_${getCompanyName(company)}`}
            >
              <PdfCatPage data={{ cat, company, employee }} />
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
