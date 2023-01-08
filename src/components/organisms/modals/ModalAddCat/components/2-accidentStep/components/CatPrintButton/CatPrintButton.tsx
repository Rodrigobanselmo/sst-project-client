/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { Box } from '@mui/material';
import { STagButton } from 'components/atoms/STagButton';

import { RoutesEnum } from 'core/enums/routes.enums';

export const CatPrintButton = (props: any) => {
  const { catData, employee } = props;

  const onDownloadPdf = () => {
    if (!catData.employeeId || !catData.companyId) return;

    const path =
      RoutesEnum.PDF_CAT.replace(':employeeId', String(employee?.id)).replace(
        ':companyId',
        employee?.companyId || catData.companyId,
      ) + `?catId=${catData.id}`;

    window.open(path, '_blank');
  };

  return (
    <Box minWidth={120} mb={10}>
      <STagButton
        tooltipTitle="Imprimir CAT"
        large
        icon={LocalPrintshopIcon}
        text="Imprimir"
        iconProps={{ sx: { fontSize: 17 } }}
        onClick={onDownloadPdf}
      />
    </Box>
  );
};
