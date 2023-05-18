import { useEffect } from 'react';

import { Box } from '@mui/material';
import { Document, Font } from '@react-pdf/renderer';
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
import LaudoPcdPage from '../laudoPcd/components/laudoPcdPage.pdf';
import PdfLaudoPcdDocument from '../laudoPcd/laudoPcd.pdf';
import PdfProntuarioPage from '../prontuario/components/prontuarioPage.pdf';

Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-500.ttf',
      fontWeight: 500, //medium
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
      fontWeight: 600, //semibold
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf',
      fontWeight: 700, //bold
    },
  ],
});

export const getKitFileName = (data: IPdfKitData[]) => {
  return `VIAS_KIT_MEDICO_${data?.[0]?.aso?.clinicExam?.id || ''}_${
    data?.length == 1 ? data?.[0]?.aso?.employee?.name : 'VISITA'
  }`;

  return `VIAS_KIT_MEDICO_${getCompanyName(
    data?.[0]?.aso?.consultantCompany,
  ).slice(0, 20)}_${getCompanyName(data?.[0]?.aso?.actualCompany).slice(
    0,
    20,
  )}_${data?.length == 1 ? data?.[0]?.aso?.employee?.name : 'VISITA'}`;
};

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
      title={getKitFileName(data)}
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
                {data.aso.employee.isPCD && (
                  <LaudoPcdPage data={data.aso.employee} />
                )}
              </>
            )}
          </>
        );
      })}
    </Document>
  );
}
