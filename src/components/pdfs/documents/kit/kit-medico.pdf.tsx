import { useEffect } from 'react';

import { Box } from '@mui/material';
import { Document } from '@react-pdf/renderer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { setIsFetchingData } from 'store/reducers/routeLoad/routeLoadSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { IPdfKitData } from 'core/interfaces/api/IPdfKitData';
import { useQueryPdfKit } from 'core/services/hooks/queries/pdfs/useQueryPdfKit ';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

import PdfAsoPage from '../aso/components/asoPage.pdf';
import PdfProntuarioPage from '../prontuario/components/prontuarioPage.pdf';

export default function PdfKitDocument({
  data,
  documentProps,
  withDate,
}: {
  withDate?: boolean;
  data: IPdfKitData[];
  documentProps?: { onRender?: () => void };
}) {
  return (
    <Document
      subject={'Kit médico'}
      author={'simpleSST'}
      creator={'simpleSST'}
      producer={'simpleSST'}
      keywords={'Aso / prontuario'}
      title={`VIAS_ASO_E_PRONTUARIO_${getCompanyName(
        data?.[0]?.aso?.consultantCompany,
      )}_${getCompanyName(data?.[0]?.aso?.actualCompany)}_${
        data?.length == 1 ? data?.[0]?.aso?.employee?.name : 'VISITA'
      }`}
      {...documentProps}
    >
      {data?.map((data) => {
        return (
          <>
            {data.aso?.employee && (
              <>
                {Array.from({ length: data.aso.numAsos }, (v, i) => i).map(
                  (d) => (
                    <PdfAsoPage data={data.aso} key={d} withDate={withDate} />
                  ),
                )}
                <PdfProntuarioPage data={data.prontuario} withDate={withDate} />
              </>
            )}
          </>
        );
      })}
    </Document>
  );
}
