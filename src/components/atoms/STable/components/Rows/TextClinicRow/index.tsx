import { FC } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';

import { getAddressCity, getAddressMain } from 'core/utils/helpers/getAddress';

import TextIconRow from '../TextIconRow';
import { TextCompanyRowProps } from './types';

export const TextClinicRow: FC<{ children?: any } & TextCompanyRowProps> = ({
  clinic,
  fontSize,
  ...props
}) => {
  return (
    <TextIconRow
      {...props}
      tooltipTitle={
        <Box>
          <SText fontSize={13} color="common.white" fontWeight="500">
            {clinic?.fantasy}
          </SText>
          <SText fontSize={12} color="common.white">
            {getAddressCity(clinic?.address)}
          </SText>
          <SText fontSize={12} color="common.white">
            {getAddressMain(clinic?.address)}{' '}
          </SText>
        </Box>
      }
      text={<SText fontSize={fontSize}>{clinic?.fantasy || '-'}</SText>}
    />
  );
};
